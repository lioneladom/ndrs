import { Router } from 'express';
import { users } from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact the administrator.' });
    }

    const valid = await users.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup  (citizen self-registration)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await users.create({ name, email, password, role: 'citizen', phone });
    const fullUser = users.findByEmail(email);
    const token = generateToken(fullUser);

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('already registered')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const user = users.findById(req.user.id);
    const valid = await users.verifyPassword(user, currentPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await users.changePassword(req.user.id, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
