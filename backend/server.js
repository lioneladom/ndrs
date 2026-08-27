import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { incidents, resources, dispatches, seedSuperAdmin } from './db.js';
import { authenticate, requireRole } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import adminUsersRouter from './routes/adminUsers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3005',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true }
});

// Create uploads directory
// In production (Render), set UPLOADS_DIR=/var/data/uploads to persist across deploys
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '30d',
  immutable: true,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/admin/users', adminUsersRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// ─── Incidents (public read, auth write) ──────────────────────────────────────
app.get('/api/incidents', (req, res) => {
  res.json(incidents.getAll());
});

app.post('/api/incidents', upload.array('media', 10), async (req, res) => {
  try {
    const { type, severity, description, location, reporterName } = req.body;
    if (!type || !location) return res.status(400).json({ error: 'type and location required' });

    const locationData = typeof location === 'string' ? JSON.parse(location) : location;

    // Process media files
    const media = req.files.map(file => ({
      id: file.filename,
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
      filename: file.originalname
    }));

    // Extract reporter from JWT if provided
    let reportedBy = 'anonymous';
    let name = reporterName || 'Anonymous';
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const payload = jwt.default.verify(
          authHeader.slice(7),
          process.env.JWT_SECRET || 'ndrs_jwt_secret_change_in_production'
        );
        reportedBy = payload.id;
        name = payload.name;
      } catch {}
    }

    const incident = incidents.create({ type, severity, description, location: locationData, reportedBy, reporterName: name, media });
    io.emit('new_incident', incident);
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/incidents/:id', authenticate, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updated = incidents.update(req.params.id, req.body);
    io.emit('incident_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// ─── Resources ────────────────────────────────────────────────────────────────
app.get('/api/resources', (req, res) => {
  res.json(resources.getAll());
});

app.patch('/api/resources/:id', authenticate, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updated = resources.update(req.params.id, req.body);
    io.emit('resource_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// ─── Dispatch ─────────────────────────────────────────────────────────────────
app.post('/api/dispatch', authenticate, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { incidentId, resourceId, eta } = req.body;
    if (!incidentId || !resourceId) return res.status(400).json({ error: 'incidentId and resourceId required' });

    const dispatch = dispatches.create({ incidentId, resourceId, eta, dispatchedBy: req.user.id });

    // Update resource and incident statuses
    const resource = resources.update(resourceId, { availability: 'Dispatched', assignedTo: incidentId });
    const incident = incidents.update(incidentId, { status: 'Dispatched' });

    io.emit('dispatch_created', { dispatch, resource, incident });
    res.status(201).json({ dispatch, resource, incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/resolve', authenticate, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const incident = incidents.update(req.params.id, { status: 'Resolved', resolvedAt: new Date().toISOString() });

    // Free all resources assigned to this incident
    const allResources = resources.getAll();
    allResources.forEach(r => {
      if (r.assignedTo === req.params.id) {
        resources.update(r.id, { availability: 'Available', assignedTo: null });
      }
    });

    io.emit('incident_resolved', incident);
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('init_data', { incidents: incidents.getAll(), resources: resources.getAll() });
  socket.on('disconnect', () => {});
});

// ─── Vehicle simulation (responders move toward incidents) ───────────────────
setInterval(() => {
  const allResources = resources.getAll();
  const allIncidents = incidents.getAll();
  let moved = false;

  allResources.forEach(res => {
    if (res.assignedTo && res.availability === 'Dispatched') {
      const inc = allIncidents.find(i => i.id === res.assignedTo);
      if (!inc) return;
      const dLat = (inc.location.lat - res.location.lat) * 0.15;
      const dLng = (inc.location.lng - res.location.lng) * 0.15;
      const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
      if (dist > 0.0001) {
        resources.update(res.id, { location: { lat: res.location.lat + dLat, lng: res.location.lng + dLng } });
        moved = true;
      } else {
        resources.update(res.id, { availability: 'On-Scene' });
        incidents.update(res.assignedTo, { status: 'On-Scene' });
        moved = true;
      }
    }
  });

  if (moved) {
    io.emit('resources_update', resources.getAll());
    io.emit('incidents_update', incidents.getAll());
  }
}, 3000);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

seedSuperAdmin().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[NDRS] Backend v2 running on port ${PORT}`);
  });
});
