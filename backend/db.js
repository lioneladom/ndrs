import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Resolve DB path with writable fallback ───────────────────────────────────
function resolveDbPath() {
  const configured = process.env.DATABASE_FILE
    ? path.resolve(process.env.DATABASE_FILE)
    : path.join(__dirname, 'database.json');

  // Check if the parent directory is writable (or can be created)
  const dir = path.dirname(configured);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return configured;
  } catch {
    const fallback = path.join(__dirname, 'database.json');
    console.warn(
      `⚠️  Cannot write to ${configured} (disk not mounted or permission denied).\n` +
      `   Falling back to ${fallback}.\n` +
      `   Data will NOT persist across deploys unless you add a Render persistent disk.`
    );
    return fallback;
  }
}

const DB_PATH = resolveDbPath();

const INITIAL_RESOURCES = [
  { id: uuidv4(), name: 'Fire Engine Alpha', type: 'Fire', availability: 'Available', location: { lat: 5.6150, lng: -0.2057 }, assignedTo: null },
  { id: uuidv4(), name: 'Ambulance Unit 1', type: 'Medical', availability: 'Available', location: { lat: 5.6037, lng: -0.1870 }, assignedTo: null },
  { id: uuidv4(), name: 'Police Patrol Bravo', type: 'Police', availability: 'Available', location: { lat: 5.5920, lng: -0.1750 }, assignedTo: null },
  { id: uuidv4(), name: 'Rescue Unit Charlie', type: 'Rescue', availability: 'Available', location: { lat: 5.6200, lng: -0.2100 }, assignedTo: null },
  { id: uuidv4(), name: 'Ambulance Unit 2', type: 'Medical', availability: 'Available', location: { lat: 5.5800, lng: -0.1650 }, assignedTo: null },
];

// ─── Load or initialize ───────────────────────────────────────────────────────
let db;
try {
  db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (!db.incidents) db.incidents = [];
  if (!db.resources) db.resources = INITIAL_RESOURCES;
  if (!db.dispatches) db.dispatches = [];
  if (!db.users) db.users = [];
} catch {
  db = { incidents: [], resources: INITIAL_RESOURCES, dispatches: [], users: [] };
}

function save() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('DB save error:', e);
  }
}

// ─── Super Admin Seeding ──────────────────────────────────────────────────────
export async function seedSuperAdmin() {
  const existingSuper = db.users.find(u => u.role === 'super_admin');
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@ndrs.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin';

  if (existingSuper) {
    const legacyEmail = existingSuper.email === 'superadmin@ndrs.gov.gh';
    if (legacyEmail || process.env.RESET_SUPER_ADMIN_PASSWORD === 'true') {
      existingSuper.email = email;
      existingSuper.passwordHash = await bcrypt.hash(password, 12);
      existingSuper.updatedAt = new Date().toISOString();
      save();
      console.log(`✅ Super admin credentials updated: ${email}`);
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    db.users.push({
      id: uuidv4(),
      name: 'Super Administrator',
      email,
      passwordHash,
      role: 'super_admin',
      status: 'active',
      phone: '',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    });
    save();
    console.log(`✅ Super admin seeded: ${email}`);
  }
}

// ─── User Methods ─────────────────────────────────────────────────────────────
export const users = {
  findByEmail: (email) => db.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findById: (id) => db.users.find(u => u.id === id),
  getAll: () => db.users.map(({ passwordHash, ...u }) => u),
  getAdmins: () => db.users.filter(u => u.role === 'admin' || u.role === 'super_admin').map(({ passwordHash, ...u }) => u),

  create: async ({ name, email, password, role = 'citizen', phone = '', createdBy = 'system' }) => {
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      role,
      status: 'active',
      phone,
      createdAt: new Date().toISOString(),
      createdBy
    };
    db.users.push(user);
    save();
    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  update: (id, updates) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    // Never allow updating super_admin role through this method
    const { passwordHash, role: _r, ...allowed } = updates;
    db.users[idx] = { ...db.users[idx], ...allowed, updatedAt: new Date().toISOString() };
    save();
    const { passwordHash: __, ...safe } = db.users[idx];
    return safe;
  },

  changePassword: async (id, newPassword) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    db.users[idx].passwordHash = await bcrypt.hash(newPassword, 12);
    db.users[idx].updatedAt = new Date().toISOString();
    save();
  },

  resetPassword: async (id, newPassword) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    db.users[idx].passwordHash = await bcrypt.hash(newPassword, 12);
    db.users[idx].updatedAt = new Date().toISOString();
    save();
  },

  setSuspended: (id, suspended) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    if (db.users[idx].role === 'super_admin') throw new Error('Cannot suspend super admin');
    db.users[idx].status = suspended ? 'suspended' : 'active';
    db.users[idx].updatedAt = new Date().toISOString();
    save();
    const { passwordHash, ...safe } = db.users[idx];
    return safe;
  },

  delete: (id) => {
    const user = db.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') throw new Error('Cannot delete super admin');
    db.users = db.users.filter(u => u.id !== id);
    save();
  },

  verifyPassword: async (user, password) => {
    return bcrypt.compare(password, user.passwordHash);
  }
};

// ─── Incident Methods ─────────────────────────────────────────────────────────
export const incidents = {
  getAll: () => [...db.incidents].reverse(),
  getById: (id) => db.incidents.find(i => i.id === id),

  create: ({ type, severity, description, location, reportedBy, reporterName, media }) => {
    const incident = {
      id: uuidv4(),
      type, severity, description, location,
      reportedBy: reportedBy || 'anonymous',
      reporterName: reporterName || 'Anonymous',
      status: 'New',
      media: media || [],
      timestamp: new Date().toISOString()
    };
    db.incidents.push(incident);
    save();
    return incident;
  },

  update: (id, updates) => {
    const idx = db.incidents.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Incident not found');
    db.incidents[idx] = { ...db.incidents[idx], ...updates };
    save();
    return db.incidents[idx];
  }
};

// ─── Resource Methods ─────────────────────────────────────────────────────────
export const resources = {
  getAll: () => [...db.resources],
  getById: (id) => db.resources.find(r => r.id === id),
  update: (id, updates) => {
    const idx = db.resources.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Resource not found');
    db.resources[idx] = { ...db.resources[idx], ...updates };
    save();
    return db.resources[idx];
  }
};

// ─── Dispatch Methods ─────────────────────────────────────────────────────────
export const dispatches = {
  getAll: () => [...db.dispatches].reverse(),
  create: ({ incidentId, resourceId, eta, dispatchedBy }) => {
    const dispatch = {
      id: uuidv4(),
      incidentId, resourceId, eta,
      dispatchedBy: dispatchedBy || 'system',
      status: 'Active',
      timestamp: new Date().toISOString()
    };
    db.dispatches.push(dispatch);
    save();
    return dispatch;
  }
};

export { db, save };
