import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectToMongo } from './db.js';
import { Visit, User, SignInLog, Section, GatePass, Attendance } from './models/index.js';

// Explicitly load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

const SKIP_DB = process.env.SKIP_DB === 'true';
const MONGO_URI = process.env.MONGO_URI;

// In-memory fallback for when SKIP_DB=true so the frontend can function
// without a MongoDB instance. This keeps a minimal set of demo users and
// sign-in logs in memory and is intended for local UI-only testing.
const IN_MEMORY_USERS = new Map();
const IN_MEMORY_SIGNINS = [];
if (SKIP_DB) {
  // Demo users (same as the seed list used elsewhere)
  const demoUsers = [
    { email: 'clinic@klh.edu.in', role: 'clinic', name: 'Clinic Staff', password: 'clinic123' },
    { email: 'faculty@klh.edu.in', role: 'faculty', name: 'Faculty', password: 'faculty123' },
    { email: 'student@klh.edu.in', role: 'student', name: 'Student', password: 'student123' },
    { email: 'hod@klh.edu.in', role: 'hod', name: 'HOD', password: 'hod123' }
  ];
  (async () => {
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      IN_MEMORY_USERS.set(u.email, { email: u.email, passwordHash: hash, role: u.role, name: u.name });
    }
    console.log('In-memory demo users populated (SKIP_DB=true)');
  })();
}

// Start server only after DB is connected (unless SKIP_DB=true). This ensures
// the app models and routes operate against a ready MongoDB connection.
async function startServer() {
  try {
    await connectToMongo();
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5500;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

// Models are defined in ./models/*.js and imported above. They will attach
// to Mongoose when the connection is established.

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// DB health probe
app.get('/api/health/db', async (req, res) => {
  try {
    if (process.env.SKIP_DB === 'true') return res.json({ ok: true, connected: false, skip_db: true });
    const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
    let ping = null;
    if (state === 1) {
      try {
        // Use a lightweight ping to check server responsiveness
        await mongoose.connection.db.admin().ping();
        ping = true;
      } catch (e) {
        ping = false;
      }
    }
    res.json({ ok: true, connected: state === 1, readyState: state, ping });
  } catch (e) {
    res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) });
  }
});

// Helpful GET so opening a POST-only login URL on the backend doesn't show the Whitelabel 405
app.get('/api/auth/login', (req, res) => {
  res.json({
    message: 'This endpoint accepts POST requests with JSON body: { "email":..., "password":..., "role":... }',
    note: 'If you opened a POST URL in a browser you may see a 405; use POST via fetch/curl/Postman or use /test-login.html on the frontend.'
  });
});

// ===== Auth: Register/Login and Sign-in logs =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body || {};
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role are required' });
    if (SKIP_DB) {
      if (IN_MEMORY_USERS.has(email)) return res.status(409).json({ error: 'User already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const u = { email, passwordHash, role, name: name || '' };
      IN_MEMORY_USERS.set(email, u);
      const { passwordHash: _, ...safe } = u;
      return res.status(201).json(safe);
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, name: name || '' });
    const { passwordHash: _, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (e) {
    console.error('POST /api/auth/register error', e);
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const startedAt = Date.now();
  try {
    const { email, password } = req.body || {};
    const roleTried = req.headers['x-role'] || undefined;
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    if (!email || !password) {
      if (SKIP_DB) IN_MEMORY_SIGNINS.push({ email: email || '', roleTried, success: false, ip, userAgent, createdAt: new Date() });
      else await SignInLog.create({ email: email || '', roleTried, success: false, ip, userAgent });
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (SKIP_DB) {
      const user = IN_MEMORY_USERS.get(email);
      if (!user) {
        IN_MEMORY_SIGNINS.push({ email, roleTried, success: false, ip, userAgent, createdAt: new Date() });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      IN_MEMORY_SIGNINS.push({ email, roleTried: roleTried || user.role, success: !!ok, ip, userAgent, createdAt: new Date() });
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const { passwordHash: _, ...safe } = user;
      return res.json({ user: safe });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await SignInLog.create({ email, roleTried, success: false, ip, userAgent });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    await SignInLog.create({ email, roleTried: roleTried || user.role, success: !!ok, ip, userAgent });
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const { passwordHash: _, ...safe } = user.toObject();
    res.json({ user: safe });
  } catch (e) {
    console.error('POST /api/auth/login error', e);
    try { await SignInLog.create({ email: req.body?.email || '', roleTried: req.headers['x-role'], success: false }); } catch {}
    res.status(500).json({ error: 'Failed to login' });
  } finally {
    if (Date.now() - startedAt < 350) await new Promise(r => setTimeout(r, 350));
  }
});

// List recent sign-in attempts
app.get('/api/auth/signins', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
    if (SKIP_DB) {
      return res.json(IN_MEMORY_SIGNINS.slice(-limit).reverse());
    }
    const logs = await SignInLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json(logs);
  } catch (e) {
    console.error('GET /api/auth/signins error', e);
    res.status(500).json({ error: 'Failed to fetch sign-ins' });
  }
});

// List users (without password hashes)
app.get('/api/users', async (req, res) => {
  try {
    if (SKIP_DB) {
      const result = Array.from(IN_MEMORY_USERS.values()).map(u => ({ email: u.email, role: u.role, name: u.name }));
      return res.json(result);
    }
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    console.error('GET /api/users error', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Dev helper to seed demo users for each role (only in non-production)
app.post('/api/dev/seed-demo-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed in production' });
    const demo = [
      { email: 'clinic@klh.edu.in', role: 'clinic', name: 'Clinic Staff', password: 'clinic123' },
      { email: 'faculty@klh.edu.in', role: 'faculty', name: 'Faculty', password: 'faculty123' },
      { email: 'student@klh.edu.in', role: 'student', name: 'Student', password: 'student123' },
      { email: 'hod@klh.edu.in', role: 'hod', name: 'HOD', password: 'hod123' }
    ];
    const created = [];
    for (const u of demo) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        created.push(await User.create({ email: u.email, role: u.role, name: u.name, passwordHash }));
      }
    }
    res.json({ created: created.map(u => ({ email: u.email, role: u.role })) });
  } catch (e) {
    console.error('POST /api/dev/seed-demo-users error', e);
    res.status(500).json({ error: 'Failed to seed users' });
  }
});
// Dev helper: migrate documents that have plain `password` fields to use
// `passwordHash`. This is intended for development only and will not run in
// production.
app.post('/api/dev/migrate-plain-passwords', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed in production' });

    // Find user docs that still have a plain `password` field
    const docs = await User.find({ password: { $exists: true } }).lean();
    let migrated = 0;
    for (const d of docs) {
      if (!d.password) continue;
      const hash = await bcrypt.hash(d.password, 10);
      await User.updateOne({ _id: d._id }, { $set: { passwordHash: hash }, $unset: { password: "" } });
      migrated++;
    }
    res.json({ migrated, totalFound: docs.length });
  } catch (e) {
    console.error('POST /api/dev/migrate-plain-passwords error', e);
    res.status(500).json({ error: 'Migration failed' });
  }
});
// Create a visit
app.post('/api/visits', async (req, res) => {
  try {
    const { name, id, symptoms, loggedBy } = req.body;
    if (!name || !id) return res.status(400).json({ error: 'name and id are required' });
    const entryTime = new Date();
    const visit = await Visit.create({ name, id, symptoms: symptoms || '', entryTime, loggedBy: loggedBy || 'Unknown' });
    res.status(201).json(visit);
  } catch (e) {
    console.error('POST /api/visits error', e);
    res.status(500).json({ error: 'Failed to create visit' });
  }
});


// === Attendance endpoints ===
// Persist attendance (upsert by date+section)
app.post('/api/attendance', async (req, res) => {
  try {
    let { date, section, records, by } = req.body || {};
    // default date to today (YYYY-MM-DD) when not provided
    const today = new Date().toISOString().slice(0, 10);
    date = date || today;
    if (!section || !records) return res.status(400).json({ error: 'section and records are required' });
    // Upsert: one document per date+section
    const updated = await Attendance.findOneAndUpdate(
      { date, section },
      { $set: { records, by } },
      { upsert: true, new: true }
    ).lean();
    res.status(201).json(updated);
  } catch (e) {
    console.error('POST /api/attendance error', e);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// Get attendance for a specific section+date (HOD view)
app.get('/api/attendance/section/:section/date/:date', async (req, res) => {
  try {
    const { section, date } = req.params;
    if (!section || !date) return res.status(400).json({ error: 'section and date are required' });
    const doc = await Attendance.findOne({ section, date }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    console.error('GET /api/attendance/section/:section/date/:date error', e);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get latest attendance for a section (no date) - HOD wants section-wise latest
app.get('/api/attendance/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    if (!section) return res.status(400).json({ error: 'section is required' });
    if (SKIP_DB) return res.status(404).json({ error: 'Not found' });
    const doc = await Attendance.findOne({ section }).sort({ date: -1, updatedAt: -1 }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    console.error('GET /api/attendance/section/:section error', e);
    res.status(500).json({ error: 'Failed to fetch latest attendance' });
  }
});
// Mark exit for the latest active visit of a student ID
app.patch('/api/visits/exit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await Visit.findOne({ id, exitTime: null }).sort({ entryTime: -1 });
    if (!visit) return res.status(404).json({ error: 'No active visit found' });
    visit.exitTime = new Date();
    await visit.save();
    res.json(visit);
  } catch (e) {
    console.error('PATCH /api/visits/exit/:id error', e);
    res.status(500).json({ error: 'Failed to mark exit' });
  }
});

// Recent visits
app.get('/api/visits/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '5', 10), 100);
    const visits = await Visit.find({}).sort({ entryTime: -1 }).limit(limit).lean();
    res.json(visits);
  } catch (e) {
    console.error('GET /api/visits/recent error', e);
    res.status(500).json({ error: 'Failed to fetch recent visits' });
  }
});

// Visits by student
app.get('/api/visits/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const visits = await Visit.find({ id }).sort({ entryTime: -1 }).lean();
    res.json(visits);
  } catch (e) {
    console.error('GET /api/visits/student/:id error', e);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Active student IDs (no exit yet)
app.get('/api/visits/active-ids', async (req, res) => {
  try {
    const active = await Visit.find({ exitTime: null }).select('id').lean();
    const ids = [...new Set(active.map((v) => v.id))];
    res.json(ids);
  } catch (e) {
    console.error('GET /api/visits/active-ids error', e);
    res.status(500).json({ error: 'Failed to fetch active IDs' });
  }
});

// Active visits with names (unique by student id) - used by frontend to show active patients
app.get('/api/visits/active', async (req, res) => {
  try {
    // Find visits with no exit time, most recent first
    const active = await Visit.find({ exitTime: null }).sort({ entryTime: -1 }).lean();
    // Deduplicate by student id keeping the most recent entry per id
    const map = new Map();
    for (const v of active) {
      if (!map.has(v.id)) map.set(v.id, v);
    }
    const result = Array.from(map.values());
    res.json(result);
  } catch (e) {
    console.error('GET /api/visits/active error', e);
    res.status(500).json({ error: 'Failed to fetch active visits' });
  }
});

// Sections API
app.get('/api/sections', async (req, res) => {
  try {
    const list = await Section.find({}).sort({ name: 1 }).lean();
    res.json(list.map(s => ({ name: s.name, rolls: s.rolls || [] })));
  } catch (e) {
    console.error('GET /api/sections error', e);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Compact mapping endpoint: roll -> student name (email localpart -> name)
app.get('/api/rolls/names', async (req, res) => {
  try {
    if (SKIP_DB) {
      const map = {};
      for (const [email, u] of IN_MEMORY_USERS.entries()) {
        const roll = (email || '').split('@')[0];
        if (roll) map[roll] = u.name || '';
      }
      return res.json(map);
    }
    const users = await User.find({ role: 'student' }).lean();
    const map = {};
    (users || []).forEach(u => {
      const email = (u?.email || '') + '';
      const roll = email.split('@')[0];
      if (roll) map[roll] = u?.name || '';
    });
    res.json(map);
  } catch (e) {
    console.error('GET /api/rolls/names error', e);
    res.status(500).json({ error: 'Failed to fetch roll names' });
  }
});

app.post('/api/sections', async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const existing = await Section.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Section exists' });
    const s = await Section.create({ name, rolls: [] });
    res.status(201).json({ name: s.name, rolls: s.rolls });
  } catch (e) {
    console.error('POST /api/sections error', e);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

app.post('/api/sections/:name/rolls', async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name || '');
    const { roll } = req.body || {};
    if (!name || !roll) return res.status(400).json({ error: 'section name and roll are required' });
    const updated = await Section.findOneAndUpdate({ name }, { $addToSet: { rolls: roll } }, { new: true, upsert: true }).lean();
    res.json({ name: updated.name, rolls: updated.rolls || [] });
  } catch (e) {
    console.error('POST /api/sections/:name/rolls error', e);
    res.status(500).json({ error: 'Failed to add roll' });
  }
});

// GatePass endpoints
// Create a gatepass request
app.post('/api/gatepasses', async (req, res) => {
  try {
    const body = req.body || {};
    const gp = await GatePass.create(body);
    res.status(201).json(gp);
  } catch (e) {
    console.error('POST /api/gatepasses error', e);
    res.status(500).json({ error: 'Failed to create gate pass' });
  }
});

// List all gatepasses (HOD view)
app.get('/api/gatepasses', async (req, res) => {
  try {
    const list = await GatePass.find({}).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    console.error('GET /api/gatepasses error', e);
    res.status(500).json({ error: 'Failed to fetch gate passes' });
  }
});

// Get gatepass by id
app.get('/api/gatepasses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gp = await GatePass.findById(id).lean();
    if (!gp) return res.status(404).json({ error: 'Not found' });
    res.json(gp);
  } catch (e) {
    console.error('GET /api/gatepasses/:id error', e);
    res.status(500).json({ error: 'Failed to fetch gate pass' });
  }
});

// Get gatepasses for a user (by userId or email)
app.get('/api/gatepasses/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await GatePass.find({ $or: [{ userId }, { studentEmail: userId }] }).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    console.error('GET /api/gatepasses/user/:userId error', e);
    res.status(500).json({ error: 'Failed to fetch user gate passes' });
  }
});

// Approve a gatepass
app.patch('/api/gatepasses/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const gp = await GatePass.findById(id);
    if (!gp) return res.status(404).json({ error: 'Not found' });
    // If another gatepass for the same studentRoll is already approved,
    // automatically mark that earlier one as declined/superseded so the
    // new approval can proceed (prevents 409 conflict and keeps an audit trail).
    const roll = gp.studentRoll;
    if (roll) {
      const already = await GatePass.findOne({ studentRoll: roll, status: 'approved', _id: { $ne: gp._id } });
      if (already) {
        try {
          already.status = 'declined';
          already.declinedAt = new Date();
          already.declineReason = 'Superseded by a newer approval';
          await already.save();
          console.log('Auto-declined previous approved gatepass', already._id, 'for roll', roll);
        } catch (innerAuto) {
          console.warn('Failed to auto-decline existing approved gatepass', innerAuto.message || innerAuto);
        }
      }
    }

    gp.status = 'approved';
    gp.approvedAt = new Date();
    // Optionally record HOD user id/email if passed in body
    if (req.body && req.body.hodUserId) gp.hodUserId = req.body.hodUserId;
    await gp.save();

    // If the gatepass contains hodSectionId and studentRoll, add roll to Section
    try {
      const roll = gp.studentRoll;
      const secName = gp.hodSectionId || gp.department || null;
      if (roll && secName) {
        await Section.findOneAndUpdate({ name: secName }, { $addToSet: { rolls: roll } }, { new: true, upsert: true });
        console.log('Added roll to section on approval:', roll, secName);
      }
    } catch (inner) {
      console.warn('Failed to add roll to section on approval', inner.message || inner);
    }

    res.json(gp);
  } catch (e) {
    console.error('PATCH /api/gatepasses/:id/approve error', e);
    res.status(500).json({ error: 'Failed to approve gate pass' });
  }
});

// Decline a gatepass
app.patch('/api/gatepasses/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.query.reason || req.body?.reason || '';
    const gp = await GatePass.findById(id);
    if (!gp) return res.status(404).json({ error: 'Not found' });
    gp.status = 'declined';
    gp.declinedAt = new Date();
    if (reason) gp.declineReason = reason;
    if (req.body && req.body.hodUserId) gp.hodUserId = req.body.hodUserId;
    await gp.save();
    res.json(gp);
  } catch (e) {
    console.error('PATCH /api/gatepasses/:id/decline error', e);
    res.status(500).json({ error: 'Failed to decline gate pass' });
  }
});

// Update (PUT) partial gatepass
app.put('/api/gatepasses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const gp = await GatePass.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!gp) return res.status(404).json({ error: 'Not found' });
    res.json(gp);
  } catch (e) {
    console.error('PUT /api/gatepasses/:id error', e);
    res.status(500).json({ error: 'Failed to update gate pass' });
  }
});

// Delete gatepass
app.delete('/api/gatepasses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await GatePass.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/gatepasses/:id error', e);
    res.status(500).json({ error: 'Failed to delete gate pass' });
  }
});

// Initialize server (connect to DB then start listening)
startServer().catch(err => {
  console.error('Failed to start server:', err && err.message ? err.message : err);
  process.exit(1);
});
