import { Router } from 'express';
import { users } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// All routes require authentication + super_admin role
router.use(authenticate, requireRole('super_admin'));

// GET /api/admin/users — list all admin accounts
router.get('/', (req, res) => {
  try {
    const admins = users.getAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users — create new admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await users.create({
      name, email, password, role: 'admin', phone,
      createdBy: req.user.id
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.message.includes('already registered')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id — update name, email, phone
router.patch('/:id', (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updated = users.update(req.params.id, { name, email, phone });
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/suspend — suspend an admin
router.post('/:id/suspend', (req, res) => {
  try {
    const updated = users.setSuspended(req.params.id, true);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 400).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/activate — reactivate a suspended admin
router.post('/:id/activate', (req, res) => {
  try {
    const updated = users.setSuspended(req.params.id, false);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 400).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/reset-password — force-reset an admin's password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    await users.resetPassword(req.params.id, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id — delete an admin account
router.delete('/:id', (req, res) => {
  try {
    users.delete(req.params.id);
    res.json({ message: 'Admin account deleted' });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 400).json({ error: err.message });
  }
});

export default router;
