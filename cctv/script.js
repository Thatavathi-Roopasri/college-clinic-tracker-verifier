// Forgot password flow: if email exists in DB, allow entering a new password and update
async function handleForgotPassword() {
  if (selectedRole !== 'student') {
    showError('Password reset is available for Students at the moment.');
    return;
  }
  const email = (document.getElementById('loginEmail').value || '').trim();
  if (!email.endsWith('@klh.edu.in')) {
    showError('Enter your @klh.edu.in email to reset.');
    return;
  }
  const newPass = prompt('Enter new password (min 6 chars):');
  if (!newPass || newPass.length < 6) {
    showError('Password must be at least 6 characters.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword: newPass })
    });
    if (res.ok) {
      showToast('Password updated. You can sign in now.');
    } else {
      const data = await res.json().catch(() => ({}));
      showError(data && data.error ? data.error : 'Reset failed');
    }
  } catch (e) {
    showError('Unable to reach server. Please try again.');
  }
}

// Global error UI to help when script fails (prevents blank screen)
function showFatalError(message, details) {
  try {
    console.error('FATAL ERROR:', message, details);
    const existing = document.getElementById('fatalErrorOverlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'fatalErrorOverlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'linear-gradient(180deg, rgba(255,245,245,0.98), rgba(255,250,250,0.96))';
    overlay.style.color = '#600';
    overlay.style.zIndex = '2147483647';
    overlay.style.padding = '40px';
    overlay.style.overflow = 'auto';
    overlay.innerHTML = `
      <div style="max-width:900px; margin:48px auto; background:#fff; border:2px solid #f2dede; padding:24px; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
        <h2 style="margin-top:0; color:#a94442;">Application error — something failed</h2>
        <p style="color:#333;">${escapeHtml(String(message || 'Unknown error'))}</p>
        <pre style="white-space:pre-wrap; color:#444; background:#f9f9f9; padding:12px; border-radius:6px; border:1px solid #eee;">${escapeHtml(String(details || 'No details available'))}</pre>
        <p style="color:#555">Open DevTools & check the console for a stack trace. Reload the page after fixing.</p>
        <div style="text-align:right;"><button id="fatalReloadBtn" style="padding:8px 12px; background:#a94442; color:white; border:none; border-radius:6px;">Reload</button></div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('fatalReloadBtn').addEventListener('click', () => location.reload());
  } catch (e) {
    // last resort: log
    console.error('Failed to render fatal overlay', e);
  }
}

// Global error handlers
window.addEventListener('error', function (ev) {
  try { showFatalError(ev.message || 'Script error', ev.error ? ev.error.stack : ev.filename + ':' + ev.lineno); } catch(_) {}
});
window.addEventListener('unhandledrejection', function (ev) {
  try { showFatalError('Unhandled promise rejection', ev.reason && ev.reason.stack ? ev.reason.stack : JSON.stringify(ev.reason)); } catch(_) {}
});

// Render active patients row in Clinic Staff portal
async function renderActivePatients() {
  const list = document.getElementById('activePatientsList');
  const pageList = document.getElementById('activePatientsPageList');
  // Prefer API: fetch active visits with names; but also merge any localStorage active entries
  // This makes the Active Patients view show local/demo entries even when backend is reachable.
  let activeVisits = [];
  let apiUsed = false;
  try {
    activeVisits = await apiGet('/visits/active');
    apiUsed = true;
  } catch (e) {
    // API unavailable -> fallback to localStorage only
    try {
      const logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      activeVisits = logs.filter(l => !l.exitTime).map(l => ({ id: l.id, name: l.name, entryTime: l.entryTime, symptoms: l.symptoms }));
    } catch (_) {
      activeVisits = [];
    }
  }

  // If API returned results, also include any localStorage active records that the server doesn't know about
  if (apiUsed) {
    try {
      const logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      const localActive = logs.filter(l => !l.exitTime).map(l => ({ id: l.id, name: l.name, entryTime: l.entryTime, symptoms: l.symptoms }));
      const known = new Set((activeVisits || []).map(v => v.id));
      for (const la of localActive) {
        if (!known.has(la.id)) activeVisits.push(la);
      }
    } catch (_) {
      // ignore local merge failures
    }
  }

  // Deduplicate by student id and keep the most recent entry
  const byId = new Map();
  (activeVisits || []).forEach(v => {
    if (!v || !v.id) return;
    const existing = byId.get(v.id);
    if (!existing) byId.set(v.id, v);
    else {
      const a = new Date(existing.entryTime || 0).getTime();
      const b = new Date(v.entryTime || 0).getTime();
      if (b > a) byId.set(v.id, v);
    }
  });

  const visits = Array.from(byId.values());
  let html;
  if (!visits || visits.length === 0) {
    html = '<span style="color:#666">No active patients</span>';
  } else {
    html = visits.map(v => {
      const name = v.name || v.id || 'Unknown';
      const sid = v.id || '';
      const entry = v.entryTime ? new Date(v.entryTime).toLocaleString() : 'Unknown';
      const exit = v.exitTime ? new Date(v.exitTime).toLocaleString() : null;
      const duration = calculateDuration(v.entryTime, v.exitTime);
      const status = exit ? 'Completed' : 'Active';
      const statusColor = exit ? '#28a745' : '#ffc107';
      return `
        <div class="log-entry" style="min-width:320px; padding:10px; border-radius:8px; border:1px solid #f0f0f0; background:#fff; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div class="log-name">${name}</div>
              <div class="log-id">ID: ${sid}</div>
            </div>
            <div style="text-align:right; font-size:13px; color:#666;">
              <div><strong>Entry:</strong> ${entry}</div>
              ${exit ? `<div><strong>Exit:</strong> ${exit}</div>` : ''}
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:13px; color:#444;">
              <div><strong>Status:</strong> <span style="color:${statusColor}; font-weight:700;">${status}</span></div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${v.symptoms || 'Not specified'}</div>
            </div>
            <div>
              ${!exit ? `<button class="secondary-btn mini-logout" data-id="${sid}" style="padding:6px 10px;">Logout</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  if (list) list.innerHTML = html;
  if (pageList) pageList.innerHTML = html;

  // Wire buttons in page containers
  [list, pageList].forEach(container => {
    if (!container) return;
    container.querySelectorAll('.mini-logout').forEach(btn => {
      // Remove any existing handler (avoid double attach)
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', () => exitActivePatient(clone.dataset.id));
    });
  });
  
}

async function exitActivePatient(id) {
  if (!id) return;
  try {
    const res = await apiPatch(`/visits/exit/${encodeURIComponent(id)}`);
    // Server returns updated visit; show success and refresh UI
    showToast(`Marked exit for ${id}`);
  } catch (e) {
    // Fallback to local mirror if API unavailable
    let logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].id === id && !logs[i].exitTime) { logs[i].exitTime = new Date().toISOString(); break; }
    }
    localStorage.setItem('clinicLogs', JSON.stringify(logs));
    showToast(`Marked exit locally for ${id} (server offline)`);
  }
  renderActivePatients();
  renderAttendanceList();
  loadRecentVisits();
}

// Seed demo active patients into localStorage for quick testing when backend is offline
function seedDemoPatients() {
  const existing = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
  const now = new Date();
  const demo = [
    { name: 'Roopa Sri', id: '2410030033', entryTime: now.toISOString(), exitTime: '', symptoms: 'Headache', loggedBy: 'clinic@klh.edu.in' },
    { name: 'Vishanu', id: '2410030000', entryTime: new Date(now.getTime()-30*60000).toISOString(), exitTime: '', symptoms: 'Dizziness', loggedBy: 'clinic@klh.edu.in' },
    { name: 'Swathi', id: '2410030278', entryTime: new Date(now.getTime()-5*60000).toISOString(), exitTime: '', symptoms: 'Injury', loggedBy: 'clinic@klh.edu.in' }
  ];
  // Merge but avoid duplicates by id
  const byId = new Map();
  existing.concat(demo).forEach(v => { if (!v || !v.id) return; if (!byId.has(v.id)) byId.set(v.id, v); });
  const merged = Array.from(byId.values());
  localStorage.setItem('clinicLogs', JSON.stringify(merged));
  try { renderActivePatients(); } catch (e) {}
  try { loadRecentVisits(); } catch (e) {}
  try { renderAttendanceList(); } catch (e) {}
  showToast('Demo active patients added (local only)');
}
// Global variables
let currentUser = null;
let selectedRole = null;
let html5QrcodeScanner = null;
let activePatientsTimer = null;
// scroll lock state
let __lockedScroll = null;

function lockBodyScroll() {
  try {
    if (__lockedScroll !== null) return; // already locked
    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    __lockedScroll = scrollY;
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.top = `-${scrollY}px`;
    document.documentElement.style.left = '0';
    document.documentElement.style.right = '0';
    // also hide overflow as backup
    document.documentElement.style.overflow = 'hidden';
  } catch (e) {
    // fallback: add no-scroll class
    try { document.documentElement.classList.add('no-scroll'); document.body.classList.add('no-scroll'); } catch(_) {}
  }
}

function unlockBodyScroll() {
  try {
    if (__lockedScroll === null) {
      // remove class fallback
      document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll');
      document.documentElement.style.overflow = '';
      return;
    }
    const scrollY = __lockedScroll;
    document.documentElement.style.position = '';
    document.documentElement.style.top = '';
    document.documentElement.style.left = '';
    document.documentElement.style.right = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, scrollY);
    __lockedScroll = null;
  } catch (e) {
    try { document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll'); } catch(_) {}
  }
}

// Extra scroll-blocker to prevent wheel/touchmove from reaching underlying page while overlay is visible
let __scrollBlockerAttached = false;
function preventScrollEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}
function attachScrollBlocker() {
  if (__scrollBlockerAttached) return;
  try {
    window.addEventListener('wheel', preventScrollEvent, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScrollEvent, { passive: false, capture: true });
    __scrollBlockerAttached = true;
  } catch (e) {
    // ignore
  }
}
function detachScrollBlocker() {
  if (!__scrollBlockerAttached) return;
  try {
    window.removeEventListener('wheel', preventScrollEvent, { passive: false, capture: true });
    window.removeEventListener('touchmove', preventScrollEvent, { passive: false, capture: true });
  } catch (e) {}
  __scrollBlockerAttached = false;
}

// Test credentials for each role
// Credentials are now stored in MongoDB backend, no hardcoded credentials needed

// Global: animate target views on nav button clicks for smoother UX
try {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-target');
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      el.classList.remove('animate-in');
      // force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('animate-in');
      setTimeout(() => el.classList.remove('animate-in'), 400);
    });
  });
} catch(_) {}

// Sections and Attendance storage keys
const SECTIONS_KEY = 'facultySections'; // { sectionName: [roll1, roll2, ...] }
const ATTENDANCE_KEY = 'attendanceRecords'; // { "YYYY-MM-DD|Section": { absent: [roll], sick: [roll], by: email } }
const GATEPASS_KEY = 'gatePassRequests'; // [ {id, studentEmail, name, year, branch, roll, reason, timeOut, date, status} ]


// Helper to check if a gatepass belongs to the currently logged-in student
function isOwnGatePass(r) {
  try {
    const email = (currentUser?.email || '').toLowerCase();
    const roll = (currentUser?.roll || (currentUser?.email || '').split('@')[0] || '').toLowerCase();
    const se = ((r.studentEmail || r.userId || '') + '').toLowerCase();
    const rroll = ((r.roll || r.studentRoll || '') + '').toLowerCase();
    if (email && se === email) return true;
    if (roll && (rroll === roll)) return true;
    return false;
  } catch (e) { return false; }
}
// Small HTML escape utility for injected values
function escapeHtml(input) {
  try {
    if (input === null || input === undefined) return '';
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  } catch (e) { return '' + input; }
}
const TIPS_KEY = 'celebrationTips'; // [ { text, category, emoji } ]
const CELEBRATED_IDS_KEY = 'celebratedGatePassIds'; // [ 'GP-...' ]

// Sample student database (used for QR lookup demos)
const STUDENT_DATABASE = {
  'KLU001': { name: 'Rahul Kumar', year: '2nd Year BTech' },
  'KLU002': { name: 'Priya Sharma', year: '3rd Year BTech' },
  'KLU003': { name: 'Amit Singh', year: '1st Year BTech' },
  'KLU004': { name: 'Sneha Reddy', year: '4th Year BTech' },
  'KLU005': { name: 'Vikram Patel', year: '2nd Year MBA' }
};

// API base for backend persistence.
// Use the local backend when running on localhost during development. When
// deployed to Vercel (or any static host) the frontend will call the
// relative '/api' path which the platform should rewrite/proxy to your
// hosted backend (see vercel.json and cctv/VERCEL.md for instructions).
const API_BASE = (function(){
  try {
    const host = (location && location.hostname) ? location.hostname : '';
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:7070/api';
  } catch (e) {}
  return '/api';
})();

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed ${res.status}`);
  return res.json();
}

async function apiPatch(path, body) {
  const fetchOptions = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
  if (!res.ok) throw new Error(`PATCH ${path} failed ${res.status}`);
  return res.json();
}

// Small helper to call PUT on the API (used to update resources)
async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} failed ${res.status}`);
  return res.json();
}

// Cached map of roll -> student name (derived from users' email localpart)
let USER_ROLL_NAME_MAP = null;
async function fetchUserRollMap() {
  if (USER_ROLL_NAME_MAP) return USER_ROLL_NAME_MAP;
  try {
    const users = await apiGet('/users');
    const map = {};
    (users || []).forEach(u => {
      const email = (u?.email || '') + '';
      const roll = email.split('@')[0];
      if (roll) map[roll] = u?.name || '';
    });
    USER_ROLL_NAME_MAP = map;
    return map;
  } catch (e) {
    USER_ROLL_NAME_MAP = {};
    return {};
  }
}

// helper for DELETE
async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} failed ${res.status}`);
  return res;
}

// ===== Diagnostic Utilities =====
// Run testBackend() in browser console to diagnose server connectivity
async function testBackend() {
  console.log('🔍 Testing backend connectivity...');
  console.log('API_BASE:', API_BASE);
  
  try {
    console.log('📡 Attempting GET /api/health...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Backend is ALIVE:', healthData);
    return true;
  } catch (e) {
    console.error('❌ Backend is DOWN or unreachable:', e.message);
    console.error('Common causes:');
    console.error('  1. Backend server not running on the expected port');
    console.error('  2. MONGO_URI environment variable not set or DB unreachable');
    console.error('  3. Firewall or network blocking connections');
    console.error('  4. Build/runtime issues on the backend');
    // Redirect to frontend page on port 7000 when backend is unreachable.
    // This will navigate away from the current page to the front-end landing page.
    try {
      const redirectUrl = 'http://localhost:7000';
      console.warn(`Redirecting to frontend at ${redirectUrl} because backend is unreachable.`);
      window.location.href = redirectUrl;
    } catch (redirectErr) {
      console.error('Redirect failed:', redirectErr);
    }
    return false;
  }
}
console.log('💡 Tip: Run testBackend() in console to check if backend server is running.');

// ===== Faculty: Sections & Attendance =====
function initFacultyData() {
  // Ensure storage exists
  const sections = getSections();
  // Try to sync sections from server if available, otherwise use localStorage
  (async () => {
    try {
      const remote = await apiGet('/sections');
      if (remote && Array.isArray(remote)) {
        const map = {};
        remote.forEach(s => { map[s.name] = s.rolls || []; });
        setSections(map);
      }
    } catch (e) {
      // ignore - keep local sections
    }
    const current = getSections();
    // Populate selects and lists
    populateSectionSelects(Object.keys(current));
    renderSectionsList();
    renderSectionRolls();
    // renderAttendanceList is async (it will fetch active IDs); call but don't await here
    try { renderAttendanceList(); } catch(_) {}
  })();
}

function initHodData() {
  // Initialize HOD dashboard
  (async () => {
    try {
      // Populate date selector with today's date
      const hodDateSelect = document.getElementById('hodDateSelect');
      if (hodDateSelect) {
        const today = new Date().toISOString().split('T')[0];
        hodDateSelect.value = today;
      }
      
      // Render gate pass requests
      console.log('Initializing HOD data - rendering gate pass list');
      try { await renderHodGatePassList(); } catch(e) { console.error('Error rendering gate pass list:', e); }
      
      // Render attendance overview if needed
      try {
        // Hide date input in HOD view (HOD wants section-wise latest attendance only)
        try {
          if (hodDateSelect) {
            // hide the input itself
            hodDateSelect.style.display = 'none';
            // hide a label that targets it if present
            const lbl = document.querySelector("label[for='hodDateSelect']");
            if (lbl) lbl.style.display = 'none';
            // also attempt to hide a surrounding container up to 3 levels
            let el = hodDateSelect;
            for (let i = 0; i < 3 && el; i++) { el = el.parentElement; if (el) el.style.display = 'none'; }
          }
        } catch (_) {}

        // Ensure HOD section select has a value (pick first option when available)
        const hodSectionSelect = document.getElementById('hodSectionSelect');
        if (hodSectionSelect && !hodSectionSelect.value && hodSectionSelect.options.length) {
          hodSectionSelect.value = hodSectionSelect.options[0].value;
        }

        await renderHodAttendance();
      } catch(e) { console.error('Error rendering attendance:', e); }
    } catch (e) {
      console.error('Error initializing HOD data:', e);
    }
  })();
}

function getSections() {
  return JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}');
}

function setSections(obj) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(obj));
}

function addSection() {
  const input = document.getElementById('newSectionName');
  const name = (input?.value || '').trim();
  if (!name) return showToast('Enter a section name', 'error');
  const sections = getSections();
  if (sections[name]) return showToast('Section already exists', 'error');
  // Try to persist to backend first; fallback to localStorage when server is unavailable
  (async () => {
    try {
      await apiPost('/sections', { name });
      // Refresh sections from server to keep local mirror in sync
      const remote = await apiGet('/sections');
      const map = {};
      (remote || []).forEach(s => { map[s.name] = s.rolls || []; });
      setSections(map);
      input.value = '';
      populateSectionSelects(Object.keys(map));
      renderSectionsList();
      renderSectionRolls();
      showToast('Section added (server)');
    } catch (e) {
      // Server unavailable - store locally
      sections[name] = [];
      setSections(sections);
      input.value = '';
      populateSectionSelects(Object.keys(sections));
      renderSectionsList();
      renderSectionRolls();
      showToast('Section added (local only)');
    }
  })();
}

function addRollToSection() {
  const select = document.getElementById('manageSectionSelect');
  const rollInput = document.getElementById('newRollNumber');
  const section = select?.value;
  const roll = (rollInput?.value || '').trim();
  if (!section) return showToast('Select a section', 'error');
  if (!roll) return showToast('Enter a roll number', 'error');
  const sections = getSections();
  // Try to persist to backend; if server fails, fallback to localStorage
  (async () => {
    try {
      const res = await apiPost(`/sections/${encodeURIComponent(section)}/rolls`, { roll });
      // res should be the updated section; sync local mirror
      const remote = await apiGet('/sections');
      const map = {};
      (remote || []).forEach(s => { map[s.name] = s.rolls || []; });
      setSections(map);
      rollInput.value = '';
      renderSectionRolls();
      showToast('Roll added (server)');
    } catch (e) {
      sections[section] = sections[section] || [];
      if (!sections[section].includes(roll)) {
        sections[section].push(roll);
        setSections(sections);
        rollInput.value = '';
        renderSectionRolls();
        showToast('Roll added (local only)');
      } else {
        showToast('Roll already present in this section', 'error');
      }
    }
  })();
}

function renderSectionsList() {
  const container = document.getElementById('sectionsList');
  if (!container) return;
  const sections = getSections();
  const entries = Object.entries(sections);
  if (entries.length === 0) {
    container.innerHTML = '<p style="color:#666">No sections yet.</p>';
    return;
  }
  container.innerHTML = entries.map(([name, rolls]) => `
    <div class="log-entry">
      <div class="log-header">
        <div class="log-name">${name}</div>
        <div class="log-id">${rolls.length} students</div>
      </div>
      <div class="log-details" style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px;">
        ${rolls && rolls.length ? rolls.map(r => `<span class="log-id" style="padding:4px 8px; border:1px solid #e5e5e5; border-radius:16px; background:#fafafa;">${r}</span>`).join('') : '<span style="color:#666">No roll numbers added yet.</span>'}
      </div>
    </div>
  `).join('');
}

function populateSectionSelects(sectionNames) {
  const manageSelect = document.getElementById('manageSectionSelect');
  const attendSelect = document.getElementById('attendanceSectionSelect');
  const opts = sectionNames.map(n => `<option value="${n}">${n}</option>`).join('');
  if (manageSelect) manageSelect.innerHTML = opts;
  if (attendSelect) attendSelect.innerHTML = opts;
  // Also populate HOD section select so HOD can pick a section to view attendance
  const hodSectionSelect = document.getElementById('hodSectionSelect');
  if (hodSectionSelect) hodSectionSelect.innerHTML = opts;
}

function renderSectionRolls() {
  const select = document.getElementById('manageSectionSelect');
  const container = document.getElementById('sectionRolls');
  if (!select || !container) return;
  const section = select.value;
  const sections = getSections();
  const rolls = sections[section] || [];
  if (rolls.length === 0) {
    container.innerHTML = '<p style="color:#666">No roll numbers in this section yet.</p>';
    return;
  }
  container.innerHTML = `
    <div class="log-entry">
      ${rolls.map(r => `<span class="log-id" style="margin-right:6px; display:inline-block;">${r}</span>`).join('')}
    </div>
  `;
}

// Return a Set of active student IDs currently in clinic (sick room)
async function fetchActiveSickSet() {
  // Try server API first
  try {
    const ids = await apiGet('/visits/active-ids');
    if (ids && Array.isArray(ids)) return new Set(ids.map(String));
  } catch (e) {
    // API unavailable -> fallback to localStorage
  }
  try {
    const logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
    const active = new Set();
    logs.forEach(l => { if (!l.exitTime && l.id) active.add(String(l.id)); });
    return active;
  } catch (e) {
    return new Set();
  }
}

async function renderAttendanceList() {
  const select = document.getElementById('attendanceSectionSelect');
  const container = document.getElementById('attendanceList');
  if (!select || !container) return;
  const section = select.value;
  const sections = getSections();
  const rolls = sections[section] || [];
  const sickSet = await fetchActiveSickSet();

  if (rolls.length === 0) {
    container.innerHTML = '<p style="color:#666">Add roll numbers to this section to take attendance.</p>';
    return;
  }

  const todayKey = getAttendanceKey(section);
  const records = getAttendanceRecords();
  const existing = records[todayKey] || { absent: [], sick: [] };
  // Try to fetch roll->name map to display student names next to rolls (best-effort)
  let nameMap = {};
  try { nameMap = await fetchUserRollMap(); } catch (e) { nameMap = {}; }

  container.innerHTML = rolls.map(r => {
    const sick = sickSet.has(String(r));
    const absent = existing.absent.includes(r);
    const label = nameMap && nameMap[r] ? `${escapeHtml(r)} — ${escapeHtml(nameMap[r])}` : escapeHtml(r);
    return `
      <div class="log-entry" style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div class="log-name" style="margin-bottom:4px;">${label}</div>
          ${sick ? '<span class="frequent-visitor" style="background:#468A9A;">Sick Room</span>' : ''}
        </div>
        <label style="display:flex; align-items:center; gap:8px; font-size:14px;">
          <input type="checkbox" data-roll="${r}" class="absent-checkbox" ${absent ? 'checked' : ''} ${sick ? '' : ''}>
          Absent
        </label>
      </div>`;
  }).join('');
}

function getAttendanceRecords() {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
}

function setAttendanceRecords(obj) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(obj));
}

function getAttendanceKey(section) {
  const d = new Date().toISOString().slice(0,10);
  return `${d}|${section}`;
}

function saveAttendance() {
  (async () => {
  // Track whether we used/persisted to server (best-effort). Default false to avoid undefined reference.
  let postedToServer = false;
  const records = getAttendanceRecords();
  const dateSel = document.getElementById('hodDateSelect');
  const secSel = document.getElementById('hodSectionSelect');
  const section = secSel?.value;
  const summaryEl = document.getElementById('hodAttendanceSummary');
  const detailsEl = document.getElementById('hodAttendanceDetails');
  if (!section) return;

  // Build current attendance from UI controls and post to server immediately.
  // Determine sick set (active patients) first
  const sickSet = await fetchActiveSickSet();
  const sections = getSections();
  const rolls = sections[section] || [];
  const recordsObj = {};
  // Read checkboxes for absent state
  const checkboxEls = Array.from(document.querySelectorAll('#attendanceList .absent-checkbox'));
  const absentSet = new Set(checkboxEls.filter(cb => cb.checked).map(cb => cb.dataset.roll));
  rolls.forEach(r => {
    if (sickSet.has(String(r))) recordsObj[r] = 'sick';
    else if (absentSet.has(String(r))) recordsObj[r] = 'absent';
    else recordsObj[r] = 'present';
  });

  // Try to post to server (best-effort). Server will default date to today if omitted.
  try {
    await apiPost('/attendance', { section, records: recordsObj, by: currentUser?.email || 'Unknown' });
    postedToServer = true;
  } catch (e) {
    postedToServer = false;
  }

  // Derive rec summary from recordsObj
  const absentArr = [];
  const sickArr = [];
  Object.entries(recordsObj).forEach(([roll, status]) => {
    if (status === 'absent') absentArr.push(roll);
    else if (status === 'sick') sickArr.push(roll);
  });
  const rec = { absent: absentArr, sick: sickArr, by: currentUser?.email || 'Unknown' };
  const total = rolls.length;
  const absent = rec.absent.length;
  const sick = rec.sick.length;
  const present = Math.max(0, total - absent);

  if (summaryEl) summaryEl.innerHTML = `
    <div><strong>Section:</strong> ${section} &nbsp; <strong>Posted by:</strong> ${rec.by || '—'}</div>
    <div><strong>Total:</strong> ${total} &nbsp; <strong>Present:</strong> ${present} &nbsp; <strong>Absent:</strong> ${absent} &nbsp; <strong>Sick Room:</strong> ${sick}</div>`;

    // Build a detailed per-roll view (status per student)
  if (detailsEl) {
    if (!rolls || rolls.length === 0) {
      detailsEl.innerHTML = '<p style="color:#666">No rolls defined for this section.</p>';
    } else {
        // Try to fetch mapping roll->name (best-effort). If unavailable, fallback to showing only roll.
        const nameMap = await fetchUserRollMap();
        const rows = rolls.map(r => {
          let status = 'present';
          // Prefer the freshly computed recordsObj (current save). Fallback to rec from server/local.
          const s = recordsObj[r];
          if (s) status = s;
          else {
            if (rec.absent?.includes(r)) status = 'absent';
            else if (rec.sick?.includes(r)) status = 'sick';
          }
          const badge = status === 'absent' ? '<span style="display:inline-block;padding:6px 10px;background:#ffecec;color:#8f1d1d;border-radius:8px;font-weight:700;">Absent</span>' : (status === 'sick' ? '<span style="display:inline-block;padding:6px 10px;background:#cfeeea;color:#065a50;border-radius:8px;font-weight:700;">Sick</span>' : '<span style="display:inline-block;padding:6px 10px;background:#e9f8ea;color:#0b6f2f;border-radius:8px;font-weight:700;">Present</span>');
          const name = nameMap[r];
          const label = name ? `${escapeHtml(r)} — ${escapeHtml(name)}` : escapeHtml(r);
          return `<div class="log-entry" style="display:flex;align-items:center;justify-content:space-between;"> <div><div class="log-name" style="margin-bottom:4px;">${label}</div></div><div>${badge}</div></div>`;
        }).join('');
        detailsEl.innerHTML = rows;
    }
  }
    try {
      const localRecords = getAttendanceRecords();
      const key = getAttendanceKey(section);
      localRecords[key] = { absent, sick, by: currentUser?.email || 'Unknown', postedToServer };
      setAttendanceRecords(localRecords);
    } catch (e) {
      console.error('Failed to save attendance locally', e);
    }
    // Broadcast to other tabs/windows that attendance for this section was updated
    try {
      // Include the poster so other tabs can show a toast (best-effort)
      localStorage.setItem(ATTENDANCE_UPDATED_KEY, JSON.stringify({ section, ts: Date.now(), by: currentUser?.email || 'Unknown' }));
    } catch (e) {}

    // Update UI: remove all interactive checkboxes after posting attendance
    try {
      const checkboxesAfter = Array.from(document.querySelectorAll('#attendanceList .absent-checkbox'));
      checkboxesAfter.forEach(cb => {
        const parentLabel = cb.parentElement;
        if (!parentLabel) return;
        // If the student was marked absent, show static Absent badge; otherwise clear the control
        if (cb.checked) {
          parentLabel.innerHTML = `<span style="display:inline-block; padding:6px 10px; background:#ffecec; color:#8f1d1d; border-radius:8px; font-weight:700;">Absent</span>`;
        } else {
          parentLabel.innerHTML = '';
        }
      });
      // Disable the Save button briefly to indicate posting complete
      const saveBtn = document.getElementById('saveAttendanceBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Posted';
        setTimeout(() => {
          if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Attendance'; }
        }, 2000);
      }
    } catch (e) {
      console.error('Error updating attendance UI', e);
    }
    // Refresh HOD view so section-wise latest attendance is visible immediately
    try { renderHodAttendance(); } catch(_) {}
  })();
}


// (deduped declarations moved to top)

// DOM elements
const roleSelectionPage = document.getElementById('roleSelectionPage');
const authPage = document.getElementById('authPage');
const clinicDashboard = document.getElementById('clinicDashboard');
const facultyDashboard = document.getElementById('facultyDashboard');
const studentDashboard = document.getElementById('studentDashboard');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('🚀 Enhanced Clinic Tracker System Initialized');
    console.log('📧 All credentials are stored in MongoDB backend');
    
    setupEventListeners();
    checkAuthState();
    setupLetterGenerator();
  } catch (err) {
    // Render a helpful overlay instead of a blank page
    showFatalError('Initialization failed', err && err.stack ? err.stack : String(err));
    // Rethrow so global handlers also catch if needed
    throw err;
  }
});

// Setup all event listeners
function setupEventListeners() {
  // Role selection
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const role = e.currentTarget.dataset.role;
      selectRole(role);
    });
  });
  
  // Back to role selection
  document.getElementById('backToRoleSelection').addEventListener('click', showRoleSelection);
  
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Password toggle
  document.getElementById('passwordToggleBtn').addEventListener('click', togglePassword);
  const forgotBtn = document.getElementById('forgotPasswordBtn');
  if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);
  
  // Top-right logout buttons: attach logout handler if any are present (faculty uses #facultyLogoutBtn)
  try {
    document.querySelectorAll('.top-logout').forEach(btn => {
      btn.addEventListener('click', (ev) => { ev.preventDefault(); logout(); });
    });
  } catch (_) {}
  
  // QR Scanner (UI removed) - add listener only if present
  const startScannerBtnEl = document.getElementById('startScannerBtn');
  if (startScannerBtnEl) startScannerBtnEl.addEventListener('click', startQRScanner);
  
  // Edit buttons
  document.getElementById('editNameBtn').addEventListener('click', () => toggleEditMode('studentName'));
  document.getElementById('editIdBtn').addEventListener('click', () => toggleEditMode('studentId'));
  
  // Clinic staff buttons
  document.getElementById('logVisitBtn').addEventListener('click', logVisit);
  // 'Mark Exit' button removed from UI — do not attach listener to avoid errors
  // document.getElementById('markExitBtn').addEventListener('click', markExit);
  
  // Faculty buttons
  document.getElementById('verifyVisitBtn').addEventListener('click', verifyVisit);
  document.getElementById('printFacultyLogsBtn').addEventListener('click', printStudentLogsFaculty);
  document.getElementById('exportCSVBtn').addEventListener('click', exportCSV);
  document.getElementById('printAllLogsBtn').addEventListener('click', printAllLogs);
  
  // Faculty: Sections & Attendance
  const addSectionBtn = document.getElementById('addSectionBtn');
  if (addSectionBtn) addSectionBtn.addEventListener('click', addSection);
  const addRollBtn = document.getElementById('addRollBtn');
  if (addRollBtn) addRollBtn.addEventListener('click', addRollToSection);
  const manageSectionSelect = document.getElementById('manageSectionSelect');
  if (manageSectionSelect) manageSectionSelect.addEventListener('change', renderSectionRolls);
  const attendanceSectionSelect = document.getElementById('attendanceSectionSelect');
  if (attendanceSectionSelect) attendanceSectionSelect.addEventListener('change', renderAttendanceList);
  const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
  if (saveAttendanceBtn) saveAttendanceBtn.addEventListener('click', saveAttendance);

  // Active Patients helpers (seed & refresh) for testing without backend
  // 'Seed Demo Patients' button removed from UI — event binding disabled
  // const seedBtn = document.getElementById('seedDemoBtn');
  // if (seedBtn) seedBtn.addEventListener('click', seedDemoPatients);
  const refreshBtn = document.getElementById('refreshActiveBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => { try { renderActivePatients(); } catch(_) {} });

  // HOD selectors
  const hodDateSelect = document.getElementById('hodDateSelect');
  const hodSectionSelect = document.getElementById('hodSectionSelect');
  if (hodDateSelect) hodDateSelect.addEventListener('change', renderHodAttendance);
  if (hodSectionSelect) hodSectionSelect.addEventListener('change', renderHodAttendance);

  // Student buttons
  document.getElementById('showStudentLogsBtn').addEventListener('click', showStudentLogs);
  document.getElementById('printStudentLogsBtn').addEventListener('click', printStudentLogs);
  // Show gatepass history for a given roll (for faculty/HOD quick lookup)
  const showGpByRollBtn = document.getElementById('showGatePassByRollBtn');
  if (showGpByRollBtn) showGpByRollBtn.addEventListener('click', showGatePassHistoryByRoll);

  // Start a lightweight poll for student's gatepass history so approvals/declines
  // made by HODs in other browsers/devices appear in the student portal soon.
  // Poll only if the student portal container exists.
  try {
    const studentListEl = document.getElementById('studentGatePassList');
    if (studentListEl) {
      // Avoid creating multiple intervals
      if (!window.__studentGatepassPollInterval) {
        window.__studentGatepassPollInterval = setInterval(() => {
          try {
            // Only refresh when the student dashboard is visible to avoid unnecessary requests
            const studentDashboardEl = document.getElementById('studentDashboard');
            if (studentDashboardEl && studentDashboardEl.classList.contains('active')) {
              renderStudentGatePassList();
            }
          } catch (_) {}
        }, 8000); // every 8 seconds
      }
    }
  } catch (_) {}

  // Sidebar navigation (SPA-style, no scrolling)
  document.querySelectorAll('.sidebar .nav-btn').forEach(btn => {
    btn.addEventListener('click', handleSidebarNavClick);
  });
  // Tips admin (safe to call even if card not present)
  try { wireTipsAdmin(); } catch (_) {}
}

// Handle sidebar navigation within each dashboard's app-shell
function handleSidebarNavClick(e) {
  const btn = e.currentTarget;
  const targetId = btn.dataset.target;
  const appShell = btn.closest('.app-shell');
  if (!appShell || !targetId) return;

  appShell.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  appShell.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = appShell.querySelector(`#${targetId}`);
  if (targetView) targetView.classList.add('active');
  // If Clinic's Active Patients view is selected, render immediately
  if (targetId === 'clinic-active-view') {
    try { renderActivePatients(); } catch (_) {}
  }
}

// Role selection functionality
function selectRole(role) {
  selectedRole = role;
  console.log('🎭 Role selected:', role);
  
  roleSelectionPage.style.display = 'none';
  try { unlockBodyScroll(); } catch(_) { try { document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll'); } catch(_) {} }
  authPage.style.display = 'flex';
  
  // Update auth page title
  const titles = {
    faculty: 'Sign In as Faculty',
    clinic: 'Sign In as Clinic Staff',
    student: 'Sign In as Student',
    hod: 'Sign In as HOD'
  };
  
  document.getElementById('authTitle').textContent = titles[role];

  // Update auth page icon by role
  const logoIcon = document.querySelector('#authPage .auth-logo i');
  if (logoIcon) {
    logoIcon.className = 'fas';
    if (role === 'faculty') logoIcon.classList.add('fa-chalkboard-teacher');
    else if (role === 'clinic') logoIcon.classList.add('fa-user-nurse');
    else if (role === 'student') logoIcon.classList.add('fa-user-graduate');
    else if (role === 'hod') logoIcon.classList.add('fa-user-check');
  }
}

function showRoleSelection() {
  roleSelectionPage.style.display = 'flex';
  // Prevent the underlying page from scrolling while the role selection overlay is visible
  try { lockBodyScroll(); } catch(_) { try { document.documentElement.classList.add('no-scroll'); document.body.classList.add('no-scroll'); } catch(_) {} }
  authPage.style.display = 'none';
  hideAllDashboards();
  selectedRole = null;
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  
  console.log('🔐 Login attempt:', email, 'Role:', selectedRole);
  console.log('🔑 Password field ID check:', document.getElementById('loginPassword'));
  console.log('🔑 Password value:', password, 'Length:', password.length);
  
  // Hide previous errors
  hideError();
  
  // Validate email domain
  if (!email.endsWith('@klh.edu.in')) {
    showError('Please use a valid @klh.edu.in email address');
    return;
  }
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

  // All roles now verify against backend MongoDB
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      if (res.ok) {
        // Prefer server-provided user profile if available so each student gets their own account data
        const data = await res.json().catch(() => ({}));
        console.log('✅ Login successful (DB)', data);
        authenticateUser(data.email || email, data.role || selectedRole, data.name || data.fullName || null);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data && data.error ? data.error : 'Invalid credentials. Please check your email and password.';
        showError(msg);
        shakeForm();
      }
    } catch (err) {
      console.error('❌ Login fetch error:', err);
      console.error('API_BASE:', API_BASE);
      console.error('Requested URL:', `${API_BASE}/auth/login`);
      console.error('Error details:', err.message || err);
      const msg = `Unable to reach server (${API_BASE}/auth/login). Check console for details. Is backend running on port 8080?`;
      showError(msg);
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
  })();
}


// Authenticate user and redirect to appropriate dashboard
function authenticateUser(email, role, name) {
  const displayName = name || (email ? email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()) : 'User');
  currentUser = {
    email: email,
    role: role,
    name: displayName,
    roll: (email || '').split('@')[0],
    loginTime: new Date().toISOString()
  };
  
  // Store user session
  localStorage.setItem("clinicUser", JSON.stringify(currentUser));
  
  console.log('👤 User authenticated:', currentUser.name, 'Role:', role);
  showDashboard(role);
  showToast(`Welcome ${currentUser.name}! Logged in as ${role}`);
  loadRecentVisits();
}

// Show appropriate dashboard based on role
function showDashboard(role) {
  hideAllDashboards();
  authPage.style.display = 'none';
  
  switch(role) {
    case 'clinic':
      clinicDashboard.style.display = 'block';
      updateUserInfo('clinic');
      // Do NOT auto-start the QR scanner on page load - let the user click Start Scanner.
      // This avoids immediate camera permission prompts when the page opens.
      try { renderActivePatients(); } catch(_) {}
      if (activePatientsTimer) { try { clearInterval(activePatientsTimer); } catch(_) {} }
      activePatientsTimer = setInterval(() => { try { renderActivePatients(); } catch(_) {} }, 15000);
      break;
    case 'faculty':
      facultyDashboard.style.display = 'block';
      updateUserInfo('faculty');
      initFacultyData();
      break;
    case 'student':
      studentDashboard.style.display = 'block';
      updateUserInfo('student');
      // Auto-populate student form fields
      if (currentUser) {
        const nameEl = document.getElementById('letterStudentName');
        const rollEl = document.getElementById('letterRoll');
        if (nameEl && !nameEl.value) nameEl.value = currentUser.name || '';
        if (rollEl && !rollEl.value) rollEl.value = currentUser.roll || '';
        // Auto-fill studentId input (used by history lookup) and render their gatepass history
        try {
          const sid = document.getElementById('studentIdInput');
          if (sid) sid.value = currentUser.roll || (currentUser.email || '').split('@')[0] || '';
        } catch (_) {}
        try { renderStudentGatePassList(); } catch (_) {}
      }
      break;
    case 'hod':
      document.getElementById('hodDashboard').style.display = 'block';
      updateUserInfo('hod');
      initHodData();
      break;
  }
}

function hideAllDashboards() {
  clinicDashboard.style.display = 'none';
  facultyDashboard.style.display = 'none';
  studentDashboard.style.display = 'none';
  const hodDash = document.getElementById('hodDashboard');
  if (hodDash) hodDash.style.display = 'none';
  if (activePatientsTimer) { try { clearInterval(activePatientsTimer); } catch(_) {} activePatientsTimer = null; }
}

function updateUserInfo(role) {
  if (currentUser) {
    const prefix = role;
    document.getElementById(`${prefix}UserName`).textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById(`${prefix}UserEmail`).textContent = currentUser.email;
    document.getElementById(`${prefix}UserAvatar`).textContent = currentUser.name.charAt(0).toUpperCase();
  }
}

// QR Scanner functionality
async function startQRScanner() {
  const qrReader = document.getElementById('qr-reader');
  const resultsDiv = document.getElementById('qr-reader-results');
  const scannerBtn = document.getElementById('startScannerBtn');
  
  if (html5QrcodeScanner) {
    stopQRScanner();
    return;
  }

  // Ensure camera permission is requested in a controlled way so the browser popup appears
  // only when the user explicitly clicks "Start Scanner".
  try {
    // request and immediately stop a short getUserMedia stream to trigger permission prompt
    await ensureCameraAccess();
  } catch (err) {
    console.error('Camera access denied or unavailable', err);
    if (resultsDiv) resultsDiv.innerHTML = '<p style="color:#ff4757;">Camera access denied or not available. Please allow camera access or use a device with a camera.</p>';
    return;
  }
  
  if (!qrReader) return; // No scanner in this view
  qrReader.style.display = 'block';
  if (scannerBtn) {
    scannerBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Scanner';
    scannerBtn.style.background = '#ff4757';
  }
  
  html5QrcodeScanner = new Html5Qrcode("qr-reader");
  
  const config = {
    fps: 10,
    qrbox: { width: 260, height: 260 },
    aspectRatio: 1.0
  };
  
  html5QrcodeScanner.start(
    { facingMode: "environment" }, // Use back camera
    config,
    (decodedText, decodedResult) => {
      console.log('🔍 QR Code scanned:', decodedText);
      handleQRScanResult(decodedText);
      stopQRScanner();
    },
    (errorMessage) => {
      // Handle scan errors silently
    }
  ).catch((err) => {
    console.error('❌ QR Scanner error:', err);
    resultsDiv.innerHTML = '<p style="color: #ff4757;">Camera access denied or not available</p>';
    stopQRScanner();
  });
}

// Try to get camera permission by briefly opening a MediaStream and releasing it.
// This helps produce a user-friendly permission flow: prompt only after user action.
async function ensureCameraAccess() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia not supported');
  }
  const constraints = { video: { facingMode: 'environment' } };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // immediately stop all tracks to free camera for Html5Qrcode
  try {
    stream.getTracks().forEach(t => t.stop());
  } catch (e) {
    console.warn('Failed to stop tracks after permission', e);
  }
  return true;
}

function stopQRScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }).catch((err) => {
      console.error('Error stopping scanner:', err);
    });
  }
  
  const qrReader = document.getElementById('qr-reader');
  const scannerBtn = document.getElementById('startScannerBtn');
  
  if (qrReader) qrReader.style.display = 'none';
  if (scannerBtn) {
    scannerBtn.innerHTML = '<i class="fas fa-camera"></i> Start Scanner';
    scannerBtn.style.background = '';
  }
}

function handleQRScanResult(qrData) {
  const resultsDiv = document.getElementById('qr-reader-results');
  
  // Try to extract student ID from QR data
  let studentId = qrData;
  
  // If QR contains JSON or structured data, parse it
  try {
    const parsed = JSON.parse(qrData);
    studentId = parsed.studentId || parsed.id || parsed.rollNumber || qrData;
  } catch (e) {
    // If not JSON, try to extract student ID from text
    const match = qrData.match(/(?:ID|Roll|Student).*?([A-Z]{3}\d{3,})/i);
    if (match) {
      studentId = match[1];
    }
  }
  
  resultsDiv.innerHTML = `<p style="color: #28a745;">✅ Scanned: ${studentId}</p>`;
  
  // Look up student in database
  if (STUDENT_DATABASE[studentId]) {
    const student = STUDENT_DATABASE[studentId];
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentId').value = studentId;
    
    showToast(`Student found: ${student.name} (${studentId})`);
  } else {
    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = studentId;
    
    // Make fields editable
    toggleEditMode('studentName');
    showToast('Student ID scanned. Please enter student name.', 'error');
  }
}

// Toggle edit mode for readonly fields
function toggleEditMode(fieldId) {
  const field = document.getElementById(fieldId);
  if (field.readOnly) {
    field.readOnly = false;
    field.style.background = 'white';
    field.focus();
    showToast('Field unlocked for editing');
  } else {
    field.readOnly = true;
    field.style.background = '#f8f9fa';
  }
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('loginPassword');
  const passwordIcon = document.getElementById('passwordToggleIcon');
  const toggleBtn = document.getElementById('passwordToggleBtn');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordIcon.classList.remove('fa-eye');
    passwordIcon.classList.add('fa-eye-slash');
    toggleBtn.setAttribute('title', 'Hide password');
  } else {
    passwordInput.type = 'password';
    passwordIcon.classList.remove('fa-eye-slash');
    passwordIcon.classList.add('fa-eye');
    toggleBtn.setAttribute('title', 'Show password');
  }
}

// Logout user
function logout() {
  // If clinic staff is logged in and a student ID is entered, try to mark exit for that student first
  (async () => {
    const idField = document.getElementById("studentId");
    const idToMark = idField?.value?.trim();
    if (currentUser?.role === 'clinic' && idToMark) {
      try {
        await apiPatch(`/visits/exit/${encodeURIComponent(idToMark)}`);
        showToast(`Exit marked for ${idToMark} before logout`);
      } catch (e) {
        // If marking exit fails, still proceed with logout but inform user
        console.error('Failed to mark exit on logout', e);
        showToast('Logout: failed to mark exit for current student (server offline)', 'error');
      }
    }

    // Proceed to clear session and UI
    localStorage.removeItem("clinicUser");
    currentUser = null;
    selectedRole = null;

    // Stop QR scanner if running
    if (html5QrcodeScanner) {
      stopQRScanner();
    }

    // Reset to role selection
    showRoleSelection();

    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    hideError();

    showToast("Logged out successfully");
    console.log('👋 User logged out');
  })();
}

// Check if user is already authenticated
function checkAuthState() {
  // Restore session from localStorage if present so a page refresh keeps the user logged in
  try {
    const saved = JSON.parse(localStorage.getItem('clinicUser') || 'null');
    if (saved && saved.role) {
      currentUser = saved;
      selectedRole = saved.role;
      showDashboard(saved.role);
      return;
    }
  } catch (e) {
    console.error('Failed to parse saved clinicUser', e);
  }

  // No session found: show role selection
  currentUser = null;
  selectedRole = null;
  hideAllDashboards();
  roleSelectionPage.style.display = 'flex';
  try { lockBodyScroll(); } catch(_) { try { document.documentElement.classList.add('no-scroll'); document.body.classList.add('no-scroll'); } catch(_) {} }
  authPage.style.display = 'none';
}

// Log clinic visit
function logVisit() {
  const name = document.getElementById("studentName").value.trim();
  const id = document.getElementById("studentId").value.trim();
  const symptoms = document.getElementById("symptoms").value.trim();
  
  if (!name || !id) {
    showToast("Please enter both student name and ID!", 'error');
    return;
  }

  // Persist to backend and mirror to localStorage for compatibility
  (async () => {
    try {
      const created = await apiPost('/visits', {
        name,
        id,
        symptoms,
        loggedBy: currentUser?.email || 'Unknown'
      });
      // On success, refresh UI from server (ensure active list & recent visits reflect DB)
      showToast("Visit logged successfully!");
      try { renderActivePatients(); } catch (_) {}
      try { loadRecentVisits(); } catch (_) {}
      try { renderAttendanceList(); } catch (_) {}
    } catch (e) {
      console.error('Failed to log visit via API, falling back to localStorage', e);
      // Fallback to localStorage only if remote is unavailable
      const entryTime = new Date().toISOString();
      const log = { name, id, symptoms, entryTime, exitTime: "", loggedBy: currentUser?.email || 'Unknown' };
      let logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      logs.push(log);
      localStorage.setItem('clinicLogs', JSON.stringify(logs));
      showToast("Visit logged locally (server offline)");
      try { renderActivePatients(); } catch (_) {}
      try { loadRecentVisits(); } catch (_) {}
      try { renderAttendanceList(); } catch (_) {}
    }
  })();

  // QR generation removed as per request

  // Clear form
  document.getElementById("studentName").value = "";
  document.getElementById("studentId").value = "";
  document.getElementById("symptoms").value = "";
  document.getElementById("studentName").readOnly = true;
  document.getElementById("studentId").readOnly = true;
  document.getElementById("studentName").style.background = '#f8f9fa';
  document.getElementById("studentId").style.background = '#f8f9fa';
  console.log('📝 Visit submit:', name, id);
}

// Mark exit
function markExit() {
  const id = document.getElementById("studentId").value.trim();
  if (!id) {
    showToast("Please enter or scan student ID to mark exit!", 'error');
    return;
  }

  (async () => {
    try {
      const updated = await apiPatch(`/visits/exit/${encodeURIComponent(id)}`);
      // On success refresh UI
      showToast("Exit marked successfully!");
      document.getElementById("studentName").value = "";
      document.getElementById("studentId").value = "";
      console.log('🚪 Exit marked for ID:', id);
      try { loadRecentVisits(); } catch (_) {}
      try { renderAttendanceList(); } catch (_) {}
      try { renderActivePatients(); } catch (_) {}
    } catch (e) {
      console.error('Failed to mark exit via API', e);
      // Fallback to local only
      let logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      const found = logs.reverse().find(l => l.id === id && !l.exitTime);
      if (found) {
        found.exitTime = new Date().toISOString();
        localStorage.setItem('clinicLogs', JSON.stringify(logs.reverse()));
        showToast("Exit marked locally (server offline)");
        document.getElementById("studentName").value = "";
        document.getElementById("studentId").value = "";
        try { loadRecentVisits(); } catch (_) {}
        try { renderAttendanceList(); } catch (_) {}
        try { renderActivePatients(); } catch (_) {}
      } else {
        showToast("No active visit found for this student ID.", 'error');
      }
    }
  })();
}

// Load recent visits for clinic dashboard
function loadRecentVisits() {
  // Try backend first
  const recentVisitsDiv = document.getElementById("recentVisits");
  if (!recentVisitsDiv) return;

  (async () => {
    try {
      const recent = await apiGet('/visits/recent?limit=5');
      if (!recent || recent.length === 0) {
        recentVisitsDiv.innerHTML = '<p style="text-align: center; color: #666;">No recent visits</p>';
        return;
      }
      recentVisitsDiv.innerHTML = recent.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const status = log.exitTime ? 'Completed' : 'Active';
        const statusColor = log.exitTime ? '#28a745' : '#ffc107';
        return `
          <div class="log-entry" style="margin-bottom: 10px;">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
            </div>
          </div>`;
      }).join('');
      // (No logout buttons in Recent Visits; actions live in Active Patients view)
    } catch (e) {
      // Fallback to localStorage
      const logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      const recentLogs = logs.slice(-5).reverse();
      if (recentLogs.length === 0) {
        recentVisitsDiv.innerHTML = '<p style="text-align: center; color: #666;">No recent visits</p>';
        return;
      }
      recentVisitsDiv.innerHTML = recentLogs.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const status = log.exitTime ? 'Completed' : 'Active';
        const statusColor = log.exitTime ? '#28a745' : '#ffc107';
        return `
          <div class="log-entry" style="margin-bottom: 10px;">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div style="display:flex; align-items:center; gap:12px;">
                <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></div>
                ${''}
              </div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
            </div>
          </div>`;
      }).join('');
    }
  })();
}

// Show student logs
function showStudentLogs() {
  const id = document.getElementById("studentIdInput").value.trim();
  if (!id) {
    showToast("Please enter your student ID!", 'error');
    return;
  }
  const target = document.getElementById("studentLogs");
  (async () => {
    try {
      const logs = await apiGet(`/visits/student/${encodeURIComponent(id)}`);
      const counts = checkFrequentVisitors(logs);
      if (!logs || logs.length === 0) {
        target.innerHTML = `
          <div class="log-entry">
            <p style="text-align: center; color: #666;">No visit records found for ID: ${id}</p>
          </div>`;
        return;
      }
      target.innerHTML = logs.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const frequentBadge = (counts[log.id] > 3) ? `<span class="frequent-visitor">Frequent Visitor</span>` : '';
        return `
          <div class="log-entry">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            ${frequentBadge}
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
            </div>
          </div>`;
      }).join('');
      console.log('🔍 Student logs shown for ID (API):', id);
    } catch (e) {
      // Fallback to local
      const logs = JSON.parse(localStorage.getItem('clinicLogs') || '[]').filter(l => l.id === id);
      const counts = checkFrequentVisitors(logs);
      if (logs.length === 0) {
        target.innerHTML = `
          <div class="log-entry">
            <p style="text-align: center; color: #666;">No visit records found for ID: ${id}</p>
          </div>`;
        return;
      }
      target.innerHTML = logs.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const frequentBadge = (counts[log.id] > 3) ? `<span class=\"frequent-visitor\">Frequent Visitor</span>` : '';
        return `
          <div class="log-entry">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            ${frequentBadge}
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
            </div>
          </div>`;
      }).join('');
      console.log('🔍 Student logs shown for ID (local):', id);
    }
  })();
}

// Verify visit (Faculty)
function verifyVisit() {
  const id = document.getElementById("facultyIdInput").value.trim();
  if (!id) {
    showToast("Please enter a student ID to search!", 'error');
    return;
  }
  const logsEl = document.getElementById("facultyLogs");
  (async () => {
    try {
      const filtered = await apiGet(`/visits/student/${encodeURIComponent(id)}`);
      const counts = checkFrequentVisitors(filtered);
      if (!filtered || filtered.length === 0) {
        logsEl.innerHTML = `
          <div class="log-entry">
            <p style="text-align: center; color: #666;">No visit records found for student ID: ${id}</p>
          </div>`;
        return;
      }
      logsEl.innerHTML = filtered.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const frequentBadge = counts[log.id] > 3 ? `<span class="frequent-visitor">Frequent Visitor</span>` : '';
        return `
          <div class="log-entry">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            ${frequentBadge}
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
              <div><strong>Logged by:</strong> ${log.loggedBy || "Unknown"}</div>
            </div>
          </div>`;
      }).join('');

      if (typeof Chart !== 'undefined') {
        const dateCounts = {};
        filtered.forEach(log => {
          const date = new Date(log.entryTime).toLocaleDateString();
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        const ctx = document.getElementById('visitChart');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(dateCounts).slice(-7),
            datasets: [{
              label: 'Daily Clinic Visits',
              data: Object.values(dateCounts).slice(-7),
              backgroundColor: 'rgba(70, 138, 154, 0.8)',
              borderColor: 'rgba(70, 138, 154, 1)',
              borderWidth: 2,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Clinic Visit Trends' } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      }
      console.log('✅ Visit verified for ID (API):', id);
    } catch (e) {
      // Fallback to local
      const allLogs = JSON.parse(localStorage.getItem('clinicLogs') || '[]');
      const filtered = allLogs.filter(l => l.id === id);
      const counts = checkFrequentVisitors(filtered);
      if (filtered.length === 0) {
        logsEl.innerHTML = `
          <div class="log-entry">
            <p style="text-align: center; color: #666;">No visit records found for student ID: ${id}</p>
          </div>`;
        return;
      }
      logsEl.innerHTML = filtered.map(log => {
        const duration = calculateDuration(log.entryTime, log.exitTime);
        const frequentBadge = counts[log.id] > 3 ? `<span class=\"frequent-visitor\">Frequent Visitor</span>` : '';
        return `
          <div class="log-entry">
            <div class="log-header">
              <div class="log-name">${log.name}</div>
              <div class="log-id">ID: ${log.id}</div>
            </div>
            ${frequentBadge}
            <div class="log-details">
              <div><strong>Entry:</strong> ${new Date(log.entryTime).toLocaleString()}</div>
              <div><strong>Exit:</strong> ${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Symptoms:</strong> ${log.symptoms || "Not specified"}</div>
              <div><strong>Logged by:</strong> ${log.loggedBy || "Unknown"}</div>
            </div>
          </div>`;
      }).join('');
      if (typeof Chart !== 'undefined') {
        const dateCounts = {};
        allLogs.forEach(log => {
          const date = new Date(log.entryTime).toLocaleDateString();
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        const ctx = document.getElementById('visitChart');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(dateCounts).slice(-7),
            datasets: [{
              label: 'Daily Clinic Visits',
              data: Object.values(dateCounts).slice(-7),
              backgroundColor: 'rgba(70, 138, 154, 0.8)',
              borderColor: 'rgba(70, 138, 154, 1)',
              borderWidth: 2,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Clinic Visit Trends' } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      }
      console.log('✅ Visit verified for ID (local):', id);
    }
  })();
}

// Letter Generator Setup and Handlers
function setupLetterGenerator() {
  const typeSelect = document.getElementById('letterType');
  const attendanceGroup = document.getElementById('attendanceReasonGroup');
  const indisciplineGroup = document.getElementById('indisciplineReasonGroup');
  const facultyMetaGroup = document.getElementById('facultyMetaGroup');
  const gatePassGroup = document.getElementById('gatePassGroup');
  const genBtn = document.getElementById('generateLetterBtn');
  const printBtn = document.getElementById('printLetterBtn');
  const downloadBtn = document.getElementById('downloadLetterBtn');
  const sendBtn = document.getElementById('sendGatePassBtn');
  const statusEl = document.getElementById('gatePassStatus');
  const clearBtn = document.getElementById('clearMyRequestsBtn');
  const cancelBtn = document.getElementById('cancelPendingBtn');

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const v = typeSelect.value;
      if (attendanceGroup) attendanceGroup.style.display = v === 'attendance' ? 'block' : 'none';
      if (indisciplineGroup) indisciplineGroup.style.display = v === 'indiscipline' ? 'block' : 'none';
      if (facultyMetaGroup) facultyMetaGroup.style.display = v === 'indiscipline' ? 'block' : 'none';
      if (gatePassGroup) gatePassGroup.style.display = v === 'gatepass' ? 'block' : 'none';
      // Update generate button label
      if (genBtn) genBtn.innerHTML = v === 'gatepass'
        ? '<i class="fas fa-magic"></i> Generate Pass'
        : '<i class="fas fa-magic"></i> Generate Letter';
    });
    // Trigger once to set initial visibility
    typeSelect.dispatchEvent(new Event('change'));
  }
  if (genBtn) genBtn.addEventListener('click', generateLetter);
  if (printBtn) printBtn.addEventListener('click', printLetter);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadLetterPDF);
  if (sendBtn) sendBtn.addEventListener('click', sendGatePassRequest);
  if (clearBtn) clearBtn.addEventListener('click', clearMyRequests);
  if (cancelBtn) cancelBtn.addEventListener('click', cancelPendingRequest);
  try { renderStudentGatePassList(); } catch(_) {}

  // Signature feature removed

  // Disable print/download initially for gate pass until approved
  function setGatePassControls(enabled, text) {
    if (!printBtn || !downloadBtn) return;
    const isGate = (document.getElementById('letterType')?.value === 'gatepass');
    if (isGate) {
      printBtn.disabled = !enabled;
      downloadBtn.disabled = !enabled;
      if (statusEl) statusEl.textContent = text || '';
    } else {
      printBtn.disabled = false;
      downloadBtn.disabled = false;
      if (statusEl) statusEl.textContent = '';
    }
  }
  // Expose to other funcs
  window.__setGatePassControls = setGatePassControls;
}

function generateLetter() {
  const type = (document.getElementById('letterType')?.value || 'attendance');
  const name = (document.getElementById('letterStudentName')?.value || '').trim();
  const year = (document.getElementById('letterYear')?.value || '').trim();
  const branch = (document.getElementById('letterBranch')?.value || '').trim();
  const dept = (document.getElementById('letterDepartment')?.value || '').trim();
  const college = (document.getElementById('letterCollege')?.value || 'Koneru Lakshmaiah University').trim();
  const roll = (document.getElementById('letterRoll')?.value || '').trim();
  const attendanceReason = (document.getElementById('attendanceReason')?.value || '').trim();
  const incidentReason = (document.getElementById('incidentReason')?.value || '').trim();
  const facultyName = (document.getElementById('facultyName')?.value || '').trim();
  const designation = (document.getElementById('designation')?.value || '').trim();
  const gateReason = (document.getElementById('gateReason')?.value || '').trim();
  const timeOut = (document.getElementById('timeOut')?.value || '').trim();
  const preview = document.getElementById('letterPreview');

  if (!name || !year || !roll) {
    showToast('Please fill Student Name, Year, and Roll Number.', 'error');
    return;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString();
  const university = 'Koneru Lakshmaiah University';

  if (type === 'gatepass') {
    // 🔥 ONLY render preview - DO NOT store in history or localStorage
    // Storage happens ONLY when "Send to HOD" is clicked
    const safe = (v)=> (v && v.length ? v : '____________');
    const card = `
    <div id="letterDocument" style="font-family:'Segoe UI',Arial,sans-serif; color:#0F0E0E; max-width:460px; border:1px solid #f0c9c9; border-radius:12px; background:#ffffff; box-shadow:0 6px 18px rgba(0,0,0,0.06); overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:linear-gradient(135deg,#fff0f0,#fff7f7); border-bottom:1px solid #f0c9c9;">
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="logo.png" alt="KL" style="height:24px; width:auto; object-fit:contain;" onerror="this.style.display='none'"/>
          <div style="font-weight:800; letter-spacing:0.3px; color:#7A0C0C;">GATE PASS / PERMISSION SLIP</div>
        </div>
        <span id="approvalBadge" style="display:none; background:#e8f7ee; color:#1b7d3a; border:1px solid #bfe5ce; padding:4px 8px; border-radius:999px; font-size:12px; font-weight:700;"><i class='fas fa-check-circle'></i> Approved by HOD</span>
      </div>
      <div style="padding:14px 16px; font-size:14px; line-height:2.0;">
        <div><strong>Name:</strong> ${safe(name)}</div>
        <div><strong>Year:</strong> ${safe(year)}</div>
        <div><strong>Roll Number:</strong> ${safe(roll)}</div>
        <div><strong>Reason for Leaving:</strong> ${safe(gateReason)}</div>
        <div><strong>Time Out:</strong> ${safe(timeOut)}</div>
        <div><strong>Date:</strong> ${dateStr}</div>
      </div>
    </div>`;
    if (preview) preview.innerHTML = card;
    // reset any previous tints/badges until status is checked
    const badge = document.getElementById('approvalBadge'); if (badge) badge.style.display='none';
    updateGatePassControlsUI();
    showToast('✅ Gate pass preview generated! Click "Send to HOD" when ready.');
    return;
  }

  const header = `
    <div style="display:flex; align-items:center; gap:12px; justify-content:flex-start; margin-bottom:12px;">
      <img src="logo.png" alt="KL" style="height:54px; width:auto; object-fit:contain;" onerror="this.style.display='none'">
    </div>`;

  let bodyHTML = '';
  if (type === 'attendance') {
    if (!dept || !attendanceReason) {
      showToast('Please fill Department and Attendance Reason.', 'error');
      return;
    }
    bodyHTML = `
      <div style="font-size:15px; line-height:1.8;">
        <p>To<br/>
        The Head of the Department,<br/>
        ${dept}.</p>
        <p>Respected Sir/Madam,</p>
        <p>I, ${name}, studying in ${year} year, bearing roll number ${roll}, would like to bring to your attention that my attendance has fallen below the required percentage due to ${attendanceReason}.</p>
        <p>I sincerely apologize for the shortfall and assure you that I will make every effort to improve my attendance and academic performance in the coming weeks. I kindly request you to consider my situation sympathetically.</p>
        <p>Thanking you,<br/>
        Yours obediently,<br/>
        ${name}<br/>
        ${dateStr}</p>
      </div>`;
  } else if (type === 'indiscipline') {
    if (!incidentReason || !facultyName || !designation) {
      showToast('Please fill Incident, Faculty/Staff Name, and Designation.', 'error');
      return;
    }
    bodyHTML = `
      <div style="font-size:15px; line-height:1.8;">
        <p>To<br/>
        The Disciplinary Committee.</p>
        <p><strong>Subject:</strong> Report on Indiscipline — ${name}, ${roll}.</p>
        <p>Respected Sir/Madam,</p>
        <p>This is to inform you that ${name}, studying in ${year} year, bearing roll number ${roll}, was found involved in ${incidentReason} on ${dateStr}.</p>
        <p>Necessary counseling was given at the department level. Kindly take appropriate disciplinary action as deemed fit.</p>
        <p>Thanking you,<br/>
        Yours faithfully,<br/>
        ${facultyName}<br/>
        ${designation}<br/>
        ${dateStr}</p>
      </div>`;
  }

  const letterHTML = `
    <div id="letterDocument" style="font-family:'Segoe UI', Arial, sans-serif; color:#0F0E0E;">
      ${header}
      <div style="display:flex; justify-content:flex-end; font-size:14px; margin-bottom:8px;"><div><strong>Date:</strong> ${dateStr}</div></div>
      ${bodyHTML}
    </div>`;

  if (preview) preview.innerHTML = letterHTML;
  updateGatePassControlsUI();
  showToast('Letter generated');
}

// Gate pass: send request to HOD and approval gating
function sendGatePassRequest() {
  const type = (document.getElementById('letterType')?.value || 'attendance');
  if (type !== 'gatepass') {
    showToast('Please select Gate Pass letter type first.', 'error');
    return;
  }
  
  const name = (document.getElementById('letterStudentName')?.value || '').trim();
  const year = (document.getElementById('letterYear')?.value || '').trim();
  const roll = (document.getElementById('letterRoll')?.value || '').trim();
  const dept = (document.getElementById('letterDepartment')?.value || '').trim();
  const gateReason = (document.getElementById('gateReason')?.value || '').trim();
  const timeOut = (document.getElementById('timeOut')?.value || '').trim();
  
  if (!name || !year || !roll || !gateReason || !timeOut) { 
    const missing = [];
    if (!name) missing.push('Name');
    if (!year) missing.push('Year');
    if (!roll) missing.push('Roll');
    if (!gateReason) missing.push('Reason');
    if (!timeOut) missing.push('Time Out');
    showToast('Please fill all required fields: ' + missing.join(', '), 'error'); 
    return; 
  }
  
  // Create request WITHOUT frontend ID - let MongoDB generate it
  const reqToSend = {
    studentEmail: currentUser?.email || '',
    studentName: name,
    studentRoll: roll,
    studentYear: year,
    department: dept,
    reason: gateReason,
    timeOut: timeOut,
    status: 'pending_approval',
    userId: currentUser?.id || currentUser?.email || '',
    hodSectionId: currentUser?.section || '',
    hodUserId: ''
  };
  
  console.log('✅ Sending gate pass to HOD (NO ID sent, MongoDB will generate):', reqToSend);
  
  // Update UI immediately to show "sent"
  const statusEl = document.getElementById('gatePassStatus');
  if (statusEl) statusEl.textContent = '⏳ Sent to HOD - Awaiting approval';
  const sendBtn = document.getElementById('sendGatePassBtn');
  if (sendBtn) { sendBtn.textContent = '✓ Sent'; sendBtn.disabled = true; }
  showToast('✅ Gate pass sent to HOD for approval');
  
  // Send to server
  (async () => {
    try {
      const serverRes = await apiPost('/gatepasses', reqToSend);
      console.log('✅ Gate pass received by HOD:', serverRes);
      console.log('📋 Gate Pass ID from server:', serverRes._id || serverRes.id);
      console.log('✅ Status from server:', serverRes.status);
      
      // ✅ IMPORTANT: The gate pass is NOW in the database with the server-generated ID
      // Add the server record to the local mirror so the student sees the request
      // immediately in their History (status: pending_approval).
      try {
        const local = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
        // normalize id field
        const normalized = Object.assign({}, serverRes);
        if (normalized._id && !normalized.id) normalized.id = normalized._id;
        // remember latest generated id in this session for download tracking
        try { sessionStorage.setItem('latestGeneratedGatePassId', normalized.id || normalized._id || ''); } catch(_) {}
        local.unshift(normalized);
        localStorage.setItem(GATEPASS_KEY, JSON.stringify(local));
      } catch (mirrorErr) { console.warn('Failed to update local mirror for gatepass', mirrorErr); }
      // Re-render student history and update controls so the student sees the pending request
      try { renderStudentGatePassList(); } catch(_) {}
      try { updateGatePassControlsUI(); } catch(_) {}
      
    } catch (e) {
      console.error('❌ Failed to send gate pass to HOD:', e);
      showToast('❌ Failed to send to HOD. Try again.', 'error');
      if (sendBtn) { sendBtn.textContent = 'Send to HOD'; sendBtn.disabled = false; }
      if (statusEl) statusEl.textContent = '';
    }
    try { renderHodGatePassList(); } catch(_) {}
  })();
}

function updateGatePassControlsUI() {
  const type = (document.getElementById('letterType')?.value || 'attendance');
  const statusEl = document.getElementById('gatePassStatus');
  if (type !== 'gatepass') { if (window.__setGatePassControls) window.__setGatePassControls(true, ''); return; }
  const list = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
  const today = new Date().toLocaleDateString();
  const my = list.filter(r => isOwnGatePass(r) && r.date === today).sort((a,b)=> (a.id<b.id?-1:1));
  const latest = my[my.length-1];
  const badge = document.getElementById('approvalBadge');
  const sentToday = (()=>{ try { return sessionStorage.getItem('gatepass_sent_today') === today; } catch(_) { return false; } })();
  if (!latest) { if (window.__setGatePassControls) window.__setGatePassControls(false, ''); if (badge) badge.style.display='none'; const sendBtn = document.getElementById('sendGatePassBtn'); if (sendBtn) { sendBtn.textContent='Send to HOD'; sendBtn.disabled=false; } const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='none'; const doc = document.getElementById('letterDocument'); if (doc) { doc.style.borderColor = '#f0c9c9'; doc.style.background = '#ffffff'; } if (statusEl) statusEl.textContent=''; return; }
  // If the latest is only generated (not yet sent), allow sending and show appropriate text
  if (latest.status === 'generated') {
    if (window.__setGatePassControls) window.__setGatePassControls(false, 'Generated (not sent)');
    if (badge) badge.style.display='none';
    const sendBtn = document.getElementById('sendGatePassBtn'); if (sendBtn) { sendBtn.textContent='Send to HOD'; sendBtn.disabled=false; }
    const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='none';
    const doc = document.getElementById('letterDocument'); if (doc) { doc.style.borderColor = '#f0c9c9'; doc.style.background = '#ffffff'; }
    if (statusEl) statusEl.textContent='Generated (not sent)';
    return;
  }
  if (latest.status === 'approved' || latest.status === 'active') {
    if (window.__setGatePassControls) window.__setGatePassControls(true, 'Approved by HOD');
    if (badge) badge.style.display = sentToday ? 'inline-flex' : 'none';
    const doc = document.getElementById('letterDocument');
    if (doc) { doc.style.borderColor = '#bfe5ce'; doc.style.background = '#f3fbf6'; }
    const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='none';
    // Celebration overlay (student side)
    try { maybeCelebrate(latest.id); } catch(_) {}
  } else if (latest.status === 'declined') {
    if (window.__setGatePassControls) window.__setGatePassControls(false, 'Declined');
    const doc = document.getElementById('letterDocument');
    if (doc) { doc.style.borderColor = '#f3c2c2'; doc.style.background = '#fdecec'; }
    if (badge) badge.style.display='none';
    const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='none';
  } else {
    if (window.__setGatePassControls) window.__setGatePassControls(false, 'Waiting for HOD approval');
    if (badge) badge.style.display='none';
    const sendBtn = document.getElementById('sendGatePassBtn');
    if (sendBtn) { sendBtn.textContent='Sent'; sendBtn.disabled=true; }
    if (statusEl) statusEl.textContent = 'Sent • Waiting for HOD approval';
    const doc = document.getElementById('letterDocument'); if (doc) { doc.style.borderColor = '#f0c9c9'; doc.style.background = '#ffffff'; }
    const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='inline-block';
  }
}

// Allow student to cancel their latest pending request so they can re-send
function cancelPendingRequest() {
  const email = currentUser?.email || '';
  if (!email) { showToast('Not logged in', 'error'); return; }
  const all = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
  const todayOnly = new Date().toLocaleDateString();
  const idx = all.findIndex(r => isOwnGatePass(r) && (r.status === 'pending' || r.status === 'pending_approval') && r.date === todayOnly);
  if (idx === -1) { showToast('No pending request to cancel'); return; }
  all.splice(idx, 1);
  localStorage.setItem(GATEPASS_KEY, JSON.stringify(all));
  const sendBtn = document.getElementById('sendGatePassBtn'); if (sendBtn) { sendBtn.textContent='Send to HOD'; sendBtn.disabled=false; }
  const cancelBtn = document.getElementById('cancelPendingBtn'); if (cancelBtn) cancelBtn.style.display='none';
  const statusEl = document.getElementById('gatePassStatus'); if (statusEl) statusEl.textContent='';
  try { sessionStorage.removeItem('gatepass_sent_today'); } catch(_) {}
  try { renderStudentGatePassList(); } catch(_) {}
  try { renderHodGatePassList(); } catch(_) {}
  showToast('Pending request cancelled');
}

// HOD Gate Pass list rendering and actions
async function renderHodGatePassList() {
  const container = document.getElementById('hodGatePassList');
  if (!container) return;
  
  let list = [];
  try {
    // Fetch all gate passes for HOD to see all statuses
    console.log('Fetching all gate passes from /api/gatepasses');
    const allPasses = await apiGet('/gatepasses');
    console.log('Got response:', allPasses);
    
    if (Array.isArray(allPasses)) {
      // Show all gate passes (pending, approved, declined) for HOD overview
      list = allPasses;
      console.log('Showing all', list.length, 'gate pass requests');
    }
  } catch (e) {
    console.error('Failed to fetch gate passes:', e);
    list = [];
  }
  
  if (!list || list.length === 0) { 
    container.innerHTML = '<div style="padding: 30px; text-align: center; color: #999;"><p>📭 No gate pass requests found.</p></div>'; 
    return; 
  }
  
  console.log('Rendering', list.length, 'gate pass requests');
  
  container.innerHTML = list.map(r => {
    console.log('Processing gate pass:', r);
    console.log('🔍 Raw object:', JSON.stringify(r, null, 2));
    
    // Enhanced student details display
    const displayName = r.studentName || r.name || (r.userId ? r.userId.split('@')[0] : 'Unknown');
    const displayRoll = r.studentRoll || r.roll || (r.userId ? r.userId.split('@')[0].toUpperCase() : 'N/A');
    const displayEmail = r.studentEmail || r.userId || 'N/A';
    const displayYear = r.studentYear || r.year || '—';
    const displayDepartment = r.department || '—';
    const displayReason = r.reason || '—';
    const displayTimeOut = r.timeOut || r.timeout || '—';
    const rid = r._id || r.id || '';
    const status = r.status || 'pending_approval';
    
    console.log('🔍 Gate pass ID options: _id=', r._id, 'id=', r.id, 'using rid=', rid);
    console.log('Display info: name=', displayName, 'roll=', displayRoll, 'email=', displayEmail, 'status=', status);
    
    if (!rid) {
      console.warn('Warning: Gate pass without ID found:', r);
      return '';
    }
    
    // Color coding based on status
    let statusColor, statusBg, statusIcon, statusText, cardBg, cardBorder;
    switch(status.toLowerCase()) {
      case 'approved':
      case 'active':
        statusColor = '#2e7d32';
        statusBg = '#e8f5e8';
        statusIcon = '✅';
        statusText = 'Approved';
        cardBg = '#f1f8e9'; // Light green background
        cardBorder = '#4caf50';
        break;
      case 'declined':
      case 'revoked':
        statusColor = '#c62828';
        statusBg = '#ffebee';
        statusIcon = '❌';
        statusText = 'Declined';
        cardBg = '#ffebee'; // Light red background
        cardBorder = '#f44336';
        break;
      case 'pending_approval':
      case 'pending':
      default:
        statusColor = '#f57c00';
        statusBg = '#fff3e0';
        statusIcon = '⏳';
        statusText = 'Pending';
        cardBg = '#fffbf0'; // Light yellow background
        cardBorder = '#ffd89b';
        break;
    }
    
    // Show action buttons only for pending requests
    const showActions = status.toLowerCase() === 'pending_approval' || status.toLowerCase() === 'pending';
    
    return `
    <div style="background:${cardBg}; border:2px solid ${cardBorder}; border-radius:8px; padding:15px; margin-bottom:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <strong style="font-size:16px; color:#333;">${escapeHtml(displayName)}</strong>
          <small style="color:#666; margin-left:10px;"> Roll: ${escapeHtml(displayRoll)}</small>
        </div>
        <span style="background:${statusBg}; color:${statusColor}; border:1px solid ${cardBorder}; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700;">${statusIcon} ${statusText}</span>
      </div>
      <div style="color:#555; font-size:13px; margin-bottom:12px;">
        <div style="margin:6px 0;"><strong>Email:</strong> ${escapeHtml(displayEmail)}</div>
        <div style="margin:6px 0;"><strong>Year:</strong> ${escapeHtml(displayYear)} | <strong>Department:</strong> ${escapeHtml(displayDepartment)}</div>
        <div style="margin:6px 0;"><strong>Reason:</strong> ${escapeHtml(displayReason)}</div>
        <div style="margin:6px 0;"><strong>Time Out:</strong> ${escapeHtml(displayTimeOut)}</div>
        ${r.approvedAt ? `<div style="margin:6px 0;"><strong>Approved At:</strong> ${new Date(r.approvedAt).toLocaleString()}</div>` : ''}
        ${r.declinedAt ? `<div style="margin:6px 0;"><strong>Declined At:</strong> ${new Date(r.declinedAt).toLocaleString()}</div>` : ''}
        ${r.declineReason ? `<div style="margin:6px 0;"><strong>Decline Reason:</strong> ${escapeHtml(r.declineReason)}</div>` : ''}
      </div>
      ${showActions ? `
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="secondary-btn" onclick="approveGatePass('${escapeHtml(rid)}')" style="flex:1; cursor:pointer; padding:8px; background:#4CAF50; color:white; border:none; border-radius:4px;" title="ID: ${rid}"><i class="fas fa-check"></i> Approve</button>
        <button class="secondary-btn" onclick="declineGatePass('${escapeHtml(rid)}')" style="flex:1; cursor:pointer; padding:8px; background:#f44336; color:white; border:none; border-radius:4px;" title="ID: ${rid}"><i class="fas fa-times"></i> Decline</button>
      </div>
      ` : ''}
    </div>`;
  }).filter(x => x).join('');
}

// Handle approve action
async function approveGatePass(id) {
  if (!id) {
    showToast('❌ Gate pass ID is missing!', 'error');
    return;
  }
  
  console.log('🔍 Approving gate pass ID:', id, 'Type:', typeof id, 'Length:', id.length);
  
  // First verify gate pass exists
  try {
    console.log('📋 Checking if gate pass exists in database...');
    const checkUrl = `/gatepasses/${encodeURIComponent(id)}`;
    const checkRes = await apiGet(checkUrl);
    console.log('✅ Gate pass found:', checkRes);
  } catch (checkErr) {
    console.error('❌ Gate pass NOT found in database with ID:', id);
    console.error('Error details:', checkErr);
    showToast('❌ Gate pass not found. ID might be wrong or gate pass was deleted.', 'error');
    return;
  }
  
  try {
    const url = `/gatepasses/${encodeURIComponent(id)}/approve`;
    console.log('📤 Making PATCH request to:', `${API_BASE}${url}`);
    
    const res = await apiPatch(url, {});
    console.log('✅ Approve response:', res);
    console.log('✅ Status is now:', res.status);
    console.log('✅ Approved at:', res.approvedAt);
    showToast('✅ Gate pass approved successfully!');
    
    // 🔥 Update in localStorage so student sees it immediately if on same device
    try {
      const all = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      const idx = all.findIndex(p => (p.id === id || p._id === id));
      if (idx >= 0) {
        all[idx] = { ...all[idx], status: 'approved' };
        localStorage.setItem(GATEPASS_KEY, JSON.stringify(all));
      }
    } catch(_) {}
    
    setTimeout(() => {
      renderHodGatePassList();
      renderStudentGatePassList();  // 🔥 Also refresh student history
    }, 500);
  } catch (e) {
    console.error('❌ Approve error:', e);
    console.error('📋 Full error details:', {
      message: e.message,
      status: e.status,
      stack: e.stack
    });
    console.error('🔍 Gate Pass ID was:', id);
    
    // Check if it's a 404 and provide helpful message
    if (e.message && e.message.includes('404')) {
      showToast('❌ Gate pass not found (404). Try refreshing the page and selecting again.', 'error');
    } else {
      showToast(`❌ Failed to approve: ${e.message || 'Unknown error'}`, 'error');
    }
  }
}

// Handle decline action
async function declineGatePass(id) {
  if (!id) {
    showToast('❌ Gate pass ID is missing!', 'error');
    return;
  }
  
  const reason = prompt('Enter reason for declining (optional):');
  if (reason === null) return;
  
  console.log('� Declining gate pass ID:', id, 'Reason:', reason);
  
  try {
    // Pre-check: Verify gate pass exists before declining
    console.log('🔍 Verifying gate pass exists before declining...');
    const checkUrl = `/gatepasses/${encodeURIComponent(id)}`;
    try {
      const checkRes = await apiGet(checkUrl);
      console.log('✅ Gate pass found in database for decline:', checkRes);
    } catch (checkErr) {
      console.error('❌ Gate pass NOT found in database:', checkErr.message);
      showToast('❌ Gate pass not found (404). Try refreshing the page and selecting again.', 'error');
      return;
    }
    
    // Now proceed with decline
    const url = reason.trim() 
      ? `/gatepasses/${encodeURIComponent(id)}/decline?reason=${encodeURIComponent(reason)}`
      : `/gatepasses/${encodeURIComponent(id)}/decline`;
    
    console.log('📤 Making PATCH request to:', `${API_BASE}${url}`);
    
    const res = await apiPatch(url, {});
    console.log('✅ Decline response:', res);
    showToast('✅ Gate pass declined!');
    
    // 🔥 Update in localStorage so student sees it immediately if on same device
    try {
      const all = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      const idx = all.findIndex(p => (p.id === id || p._id === id));
      if (idx >= 0) {
        all[idx] = { ...all[idx], status: 'declined', declineReason: reason };
        localStorage.setItem(GATEPASS_KEY, JSON.stringify(all));
      }
    } catch(_) {}
    
    setTimeout(() => {
      renderHodGatePassList();
      renderStudentGatePassList();  // 🔥 Also refresh student history
    }, 500);
  } catch (e) {
    console.error('❌ Decline error:', e);
    console.error('📋 Full error details:', {
      message: e.message,
      stack: e.stack
    });
    if (e.message && e.message.includes('404')) {
      showToast('❌ Gate pass not found (404). Try refreshing and try again.', 'error');
    } else {
      showToast('❌ Failed to decline. Check console for details.', 'error');
    }
  }
}

// ---------- Celebration Tips (minimal confetti + daily rotating toast) ----------
function getTips(){
  try {
    const raw = localStorage.getItem(TIPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(_) {}
  const defaults = [
    { text: 'Short break, deep breath. You got this!', category: 'Motivation', emoji: '💬' },
    { text: 'Hydrate and stretch for 1 minute.', category: 'Health', emoji: '🌿' },
    { text: 'Review your next class notes quickly.', category: 'Study', emoji: '📚' },
    { text: 'Coffee with friends? Balance is key.', category: 'Campus Fun', emoji: '☕' }
  ];
  localStorage.setItem(TIPS_KEY, JSON.stringify(defaults));
  return defaults;
}
function setTips(arr){ localStorage.setItem(TIPS_KEY, JSON.stringify(arr||[])); }

function renderTipsAdmin(){
  const host = document.getElementById('tipsList'); if (!host) return;
  const tips = getTips();
  host.innerHTML = tips.map((t,i)=>`
    <div class="log-entry" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span class="chip">${t.emoji || ''} ${t.category}</span>
        <span style="margin-left:6px;">${t.text}</span>
      </div>
      <button class="secondary-btn" data-del-tip="${i}" style="margin-left:8px;">Delete</button>
    </div>`).join('');
  host.querySelectorAll('[data-del-tip]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.getAttribute('data-del-tip'));
      const now = getTips(); now.splice(idx,1); setTips(now); renderTipsAdmin();
    });
  });
}

function wireTipsAdmin(){
  const addBtn = document.getElementById('addTipBtn');
  if (addBtn) {
    addBtn.addEventListener('click', ()=>{
      const text = (document.getElementById('tipText')?.value||'').trim();
      const category = (document.getElementById('tipCategory')?.value||'Motivation');
      const emoji = (document.getElementById('tipEmoji')?.value||'💬').trim();
      if (!text) { showToast('Enter tip text', 'error'); return; }
      const tips = getTips(); tips.unshift({ text, category, emoji }); setTips(tips);
      renderTipsAdmin(); showToast('Tip added');
    });
  }
  renderTipsAdmin();
}

function maybeCelebrate(reqId){
  if (!reqId) return;
  let done = []; try { done = JSON.parse(localStorage.getItem(CELEBRATED_IDS_KEY) || '[]'); } catch {}
  if (done.includes(reqId)) return; // already shown for this request
  done.push(reqId); localStorage.setItem(CELEBRATED_IDS_KEY, JSON.stringify(done));

  // Minimal confetti burst
  try { confettiBurst(); } catch(_) {}

  // Daily rotating tip (by category)
  const todayKey = new Date().toDateString();
  const tips = getTips();
  const order = ['Motivation','Study','Health','Campus Fun'];
  let meta = {}; try { meta = JSON.parse(localStorage.getItem('daily_tip_meta') || '{}'); } catch {}
  let nextCat = order[0];
  if (meta.date === todayKey) {
    // already set today; keep same category
    nextCat = meta.category || order[0];
  } else {
    const idx = order.indexOf(meta.category || order[order.length-1]);
    nextCat = order[(idx + 1) % order.length];
    localStorage.setItem('daily_tip_meta', JSON.stringify({ date: todayKey, category: nextCat }));
  }
  const pool = tips.filter(t=>t.category===nextCat);
  const pick = pool.length ? pool[Math.floor(Math.random()*pool.length)] : (tips[0] || { text:'Keep going!', category: 'Motivation', emoji:'🎉' });
  showToast(`${pick.emoji || ''} ${pick.text}`);
}

function confettiBurst(){
  const root = document.createElement('div');
  root.className = 'confetti';
  const colors = ['#E91E63','#FFC107','#4CAF50','#03A9F4','#9C27B0'];
  for (let i=0;i<18;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.background = colors[i % colors.length];
    const x = (Math.random()*160 - 80) + 'px';
    p.style.setProperty('--x', x);
    p.style.left = '0';
    root.appendChild(p);
  }
  document.body.appendChild(root);
  setTimeout(()=> root.remove(), 1000);
}

function updateGatePassStatus(id, status) {
  // Try to update server first; fall back to localStorage when server unavailable
  (async () => {
    try {
      // Backend accepts PUT /api/gatepasses/{id} with partial GatePass body
      await apiPut(`/gatepasses/${encodeURIComponent(id)}`, { status });
      // Also update local mirror
      const list = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      const idx = list.findIndex(r => r.id === id);
      if (idx >= 0) { list[idx].status = status; localStorage.setItem(GATEPASS_KEY, JSON.stringify(list)); }
  renderHodGatePassList();
  try { renderStudentGatePassList(); } catch(_) {}
  showToast(`Gate pass ${status}`);
    } catch (e) {
      const list = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      const idx = list.findIndex(r => r.id === id);
      if (idx >= 0) {
        list[idx].status = status;
        localStorage.setItem(GATEPASS_KEY, JSON.stringify(list));
        renderHodGatePassList();
        try { renderStudentGatePassList(); } catch(_) {}
        showToast(`Gate pass ${status} (local)`);
      } else {
        showToast('Failed to update gate pass', 'error');
      }
    }
  })();
}

// Render student-specific gate pass history in the student portal
async function renderStudentGatePassList() {
  const container = document.getElementById('studentGatePassList');
  if (!container) return;
  const email = currentUser?.email || '';
  let list = [];
  
  try {
    // Try to fetch from server - get user's own gate passes
    const userId = currentUser?.id || currentUser?.email || '';
    console.debug('renderStudentGatePassList - currentUser:', currentUser, 'userId used:', userId);
    if (userId) {
      try {
        list = await apiGet(`/gatepasses/user/${encodeURIComponent(userId)}`);
        console.debug('DEBUG: Fetched student gate passes from server:', list);
      } catch (e) {
        console.error('Failed to fetch from /gatepasses/user, trying /gatepasses');
        // Fallback: get all and filter
        const all = await apiGet('/gatepasses');
        if (Array.isArray(all)) list = all.filter(p => isOwnGatePass(p));
      }
    }
  } catch (e) {
    console.error('DEBUG: Failed to fetch gate passes from server:', e);
    // Fallback to local storage
    try {
      const local = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      list = (Array.isArray(local) ? local : []).filter(p => isOwnGatePass(p));
      console.debug('DEBUG: Using local storage fallback, found', list.length, 'requests');
    } catch(err) {
      console.error('Failed to read local gatepass mirror:', err);
      list = [];
    }
  }

  // If server returned empty but local mirror has entries, prefer local mirror (helps offline or auth mismatch)
  try {
    if ((!list || list.length === 0) && localStorage.getItem(GATEPASS_KEY)) {
      const mirror = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
      if (Array.isArray(mirror)) {
        const mine = mirror.filter(p => isOwnGatePass(p));
        if (mine && mine.length) {
          console.debug('renderStudentGatePassList - using local mirror entries', mine.length);
          list = mine;
        }
      }
    }
  } catch (_) {}

  // Show all requests for the student (approved/declined/generated/pending).
  // Students should see the status of their requests and be able to download
  // approved ones. Previously we hid pending requests; include them now so
  // students can see the current status.
  const allowedStatuses = ['approved','active','declined','generated','pending','pending_approval'];
  list = list.filter(r => allowedStatuses.includes(String(r.status)));
  console.log('✅ Filtered list (student-visible):', list);

  if (!list || list.length === 0) {
    container.innerHTML = '<p style="color:#666">No requests found.</p>';
    // ensure controls reflect no requests
    if (window.__setGatePassControls) window.__setGatePassControls(false, '');
    return;
  }

  // Sort newest first
  list.sort((a,b) => (b.ts || b.issuedAt || 0) - (a.ts || a.issuedAt || 0));

  container.innerHTML = list.map(r => {
    const approved = r.status === 'approved' || r.status === 'active';
    const declined = r.status === 'declined';
    const generated = r.status === 'generated';
    const pending = r.status === 'pending' || r.status === 'pending_approval';
    
    const statusBadge = approved
      ? `<span style="background:#e8f7ee; color:#1b7d3a; border:1px solid #bfe5ce; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">✅ Approved</span>`
      : declined
        ? `<span style="background:#fdecec; color:#8f1d1d; border:1px solid #f3c2c2; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">⛔ Declined</span>`
        : generated
          ? `<span style="background:#eef6ff; color:#0b5394; border:1px solid #cfe0ff; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">📝 Generated</span>`
          : `<span style="background:#fff6e5; color:#6a4b00; border:1px solid #ffd89b; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">⌛ Pending Approval</span>`;

    const tint = approved ? 'background:#f3fbf6; border:1px solid #bfe5ce; padding:12px; border-radius:8px; margin-bottom:8px;' : (declined ? 'background:#fdecec; border:1px solid #f3c2c2; padding:12px; border-radius:8px; margin-bottom:8px;' : 'background:#fff; border:1px solid #f0f0f0; padding:12px; border-radius:8px; margin-bottom:8px;');

    const displayDate = r.date || (r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : '');
    
    // 🔥 Add download button ONLY for approved requests
    const downloadBtn = approved 
      ? `<button onclick="downloadGatePass('${escapeHtml(r._id || r.id || '')}')" style="margin-top:10px; padding:8px 16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:600;"><i class="fas fa-download"></i> Download</button>`
      : '';
    
    return `
      <div style="${tint}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><strong>${r.name || r.studentName || 'Student'}</strong> &nbsp; <small style="color:#666">${r.roll || r.studentRoll || r.passNumber || ''}</small></div>
          <div>${statusBadge}</div>
        </div>
        <div style="margin-top:8px; color:#444; font-size:13px;">
          <div><strong>Reason:</strong> ${r.reason || '-'}</div>
          <div><strong>Time Out:</strong> ${r.timeOut || '-'}</div>
          <div style="margin-top:8px; font-size:12px; color:#666;"><strong>Date:</strong> ${displayDate}</div>
        </div>
        ${downloadBtn}
      </div>`;
  }).join('');

  // Update controls (print/download enable) based on latest request
  try { updateGatePassControlsUI(); } catch(_) {}
}

// Clear current user's gate pass requests (server + local fallback)
async function clearMyRequests() {
  const email = currentUser?.email || '';
  if (!email) { showToast('Not logged in', 'error'); return; }
  if (!confirm('Clear all your gate pass requests? This cannot be undone.')) return;

  // Try to delete server-side entries first
  try {
  // Get all gatepasses and filter
  const all = await apiGet('/gatepasses');
  const mine = (all || []).filter(p => isOwnGatePass(p));
    for (const p of mine) {
      try { await apiDelete(`/gatepasses/${encodeURIComponent(p.id || p._id || p.passNumber)}`); } catch(_) { /* continue */ }
    }
  } catch (e) {
    // server unreachable - fall back to local only
  }

  // Remove from localStorage mirror
  try {
  const local = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
  const filtered = local.filter(p => !isOwnGatePass(p));
    localStorage.setItem(GATEPASS_KEY, JSON.stringify(filtered));
  } catch (_) {}

  try { renderStudentGatePassList(); } catch(_) {}
  try { renderHodGatePassList(); } catch(_) {}
  showToast('Your requests were cleared');
}

// Cross-tab/tab live updates for gate pass approvals
window.addEventListener('storage', (e) => {
  if (e.key === GATEPASS_KEY) {
    try { renderHodGatePassList(); } catch (_) {}
    try { updateGatePassControlsUI(); } catch (_) {}
    try { renderStudentGatePassList(); } catch (_) {}
  }
});

// Listen for attendance updates from other tabs/windows and refresh HOD view
const ATTENDANCE_UPDATED_KEY = 'attendanceUpdated';
window.addEventListener('storage', (e) => {
  if (!e.key) return;
  try {
    if (e.key === ATTENDANCE_UPDATED_KEY) {
      const payload = JSON.parse(e.newValue || '{}');
      const section = payload.section || 'Unknown section';
      const by = payload.by || 'Someone';
      // Refresh the HOD view so it shows the latest section-wise attendance
      try { renderHodAttendance(); } catch (_) {}
      // Show a small info toast so HOD users notice the update (best-effort)
      try { showToast(`Attendance for ${section} posted by ${by}`, 'info'); } catch (_) {}
    }
  } catch (err) {
    // ignore JSON parse errors
  }
});

async function renderHodAttendance() {
  const secSel = document.getElementById('hodSectionSelect');
  const section = secSel?.value;
  const summaryEl = document.getElementById('hodAttendanceSummary');
  const detailsEl = document.getElementById('hodAttendanceDetails');
  if (!section) return;

  // Attempt to fetch latest attendance for the section (server). Fallback to localStorage.
  let rec = null;
  try {
    const server = await apiGet(`/attendance/section/${encodeURIComponent(section)}`);
    const absent = [];
    const sick = [];
    if (server && server.records) {
      Object.entries(server.records).forEach(([roll, status]) => {
        if (status === 'absent') absent.push(roll);
        else if (status === 'sick') sick.push(roll);
      });
    }
    rec = { absent, sick, by: server?.by || '' };
  } catch (e) {
    // fallback: pick today's or most recent local record for this section
    const records = getAttendanceRecords();
    const todayKey = getAttendanceKey(section);
    if (records[todayKey]) rec = records[todayKey];
    else {
      const all = Object.entries(records).reverse();
      const candidate = all.find(([k]) => k.endsWith(`|${section}`));
      rec = candidate ? candidate[1] : { absent: [], sick: [], by: '' };
    }
  }

  const sections = getSections();
  const rolls = sections[section] || [];
  const total = rolls.length;
  const absent = rec.absent?.length || 0;
  const sick = rec.sick?.length || 0;
  const present = Math.max(0, total - absent);

  // Summary area
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
        <div style="font-size:14px; color:#333;"><strong>Section:</strong> ${escapeHtml(section)}</div>
        <div style="font-size:14px; color:#333;"><strong>Posted by:</strong> ${escapeHtml(rec.by || '—')}</div>
        <div style="font-size:14px; color:#333;"><strong>Total:</strong> ${total}</div>
        <div style="font-size:14px; color:#333;"><strong>Present:</strong> ${present}</div>
        <div style="font-size:14px; color:#333;"><strong>Absent:</strong> ${absent}</div>
        <div style="font-size:14px; color:#333;"><strong>Sick Room:</strong> ${sick}</div>
      </div>`;
  }

  // Details area: render per-roll cards/badges with names when available
  if (detailsEl) {
    if (!rolls || rolls.length === 0) {
      detailsEl.innerHTML = '<p style="color:#666">No rolls defined for this section.</p>';
    } else {
      const nameMap = await fetchUserRollMap();
      const rows = rolls.map(r => {
        const status = (rec.records && rec.records[r]) || (rec.absent?.includes(r) ? 'absent' : (rec.sick?.includes(r) ? 'sick' : 'present'));
        const badge = status === 'absent'
          ? '<span style="display:inline-block;padding:6px 10px;background:#ffecec;color:#8f1d1d;border-radius:8px;font-weight:700;">Absent</span>'
          : (status === 'sick'
            ? '<span style="display:inline-block;padding:6px 10px;background:#cfeeea;color:#065a50;border-radius:8px;font-weight:700;">Sick</span>'
            : '<span style="display:inline-block;padding:6px 10px;background:#e9f8ea;color:#0b6f2f;border-radius:8px;font-weight:700;">Present</span>');
        const label = nameMap && nameMap[r] ? `${escapeHtml(r)} — ${escapeHtml(nameMap[r])}` : escapeHtml(r);
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f0f0f0;"><div style="font-size:14px; color:#222;">${label}</div><div>${badge}</div></div>`;
      }).join('');
      detailsEl.innerHTML = `<div style="display:flex; flex-direction:column; gap:6px;">${rows}</div>`;
    }
  }
}

function printLetter() {
  const node = document.getElementById('letterDocument');
  if (!node) {
    showToast('Generate the letter first.', 'error');
    return;
  }
  const w = window.open('');
  w.document.write(`<!DOCTYPE html><html><head><title>Letter</title></head><body>${node.outerHTML}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

async function downloadLetterPDF() {
  const node = document.getElementById('letterDocument');
  if (!node) {
    showToast('Generate the letter first.', 'error');
    return;
  }
  try {
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#FFFFFF' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 80; // margins
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let y = 40;
    if (imgHeight > pageHeight - 80) {
      // Multi-page simple flow
      let remaining = imgHeight;
      let position = 40;
      const sliceHeight = pageHeight - 80;
      const totalPages = Math.ceil(imgHeight / sliceHeight);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 40, position, imgWidth, imgHeight, undefined, 'FAST');
        position = 40 - (sliceHeight * (i + 1));
      }
    } else {
      pdf.addImage(imgData, 'PNG', 40, y, imgWidth, imgHeight, undefined, 'FAST');
    }
    pdf.save('letter.pdf');
    showToast('PDF downloaded');
    // Mark the latest generated gate pass as downloaded in local mirror and try to persist to server
    try {
      const latestId = (() => { try { return sessionStorage.getItem('latestGeneratedGatePassId'); } catch(_) { return null; } })();
      if (latestId) {
        const stored = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
        const idx = stored.findIndex(r => r.id === latestId || r._id === latestId || (r.passNumber && r.passNumber === latestId));
        const downloadedAt = new Date().toISOString();
        if (idx >= 0) {
          stored[idx] = { ...stored[idx], downloadedAt, downloaded: true };
          localStorage.setItem(GATEPASS_KEY, JSON.stringify(stored));
        }
        // Try to persist to server (non-blocking)
        (async () => {
          try {
            await apiPut(`/gatepasses/${encodeURIComponent(latestId)}`, { downloadedAt });
          } catch (_) {
            // ignore server errors; local mirror is authoritative until sync
          }
        })();
        try { renderStudentGatePassList(); } catch(_) {}
      }
    } catch (err) { console.warn('Failed to update download status in history', err); }
  } catch (err) {
    console.error(err);
    showToast('Failed to generate PDF', 'error');
  }
}

// 🔥 Download an approved gate pass from history
async function downloadGatePass(gatePassId) {
  if (!gatePassId) {
    showToast('Invalid gate pass ID', 'error');
    return;
  }
  
  try {
    // Fetch the gate pass from server to get the latest data
    let gatePass = null;
    try {
      gatePass = await apiGet(`/gatepasses/${encodeURIComponent(gatePassId)}`);
    } catch (errFetch) {
      console.warn('downloadGatePass: server fetch failed, will try local mirror', errFetch);
      gatePass = null;
    }

    // Fallback: if server didn't return a usable object, try the local mirror
    if (!gatePass || !(gatePass.studentRoll || gatePass.studentName || gatePass.roll)) {
      try {
        const mirror = JSON.parse(localStorage.getItem(GATEPASS_KEY) || '[]');
        if (Array.isArray(mirror)) {
          const found = mirror.find(p => (p._id === gatePassId) || (p.id === gatePassId) || (p.passNumber === gatePassId));
          if (found) {
            console.debug('downloadGatePass: using local mirror entry for', gatePassId);
            gatePass = found;
          }
        }
      } catch (errMirror) {
        console.error('downloadGatePass: failed reading local mirror', errMirror);
      }
    }

    if (!gatePass) {
      showToast('Gate pass not found', 'error');
      return;
    }
    
    // Check if approved
    if (gatePass.status !== 'approved' && gatePass.status !== 'active') {
      showToast('Only approved gate passes can be downloaded', 'error');
      return;
    }
    
    // Build HTML for the gate pass
    // Normalize fields (server may use createdAt, approvedAt etc.)
    const gpName = gatePass.studentName || gatePass.name || gatePass.student || '-';
    const gpRoll = gatePass.studentRoll || gatePass.roll || gatePass.studentId || '-';
    const gpYear = gatePass.studentYear || gatePass.year || '-';
    const gpDept = gatePass.department || '-';
    const gpReason = gatePass.reason || '-';
    const gpTimeOut = gatePass.timeOut || gatePass.time || '-';
    const gpIssued = gatePass.issuedAt || gatePass.date || gatePass.createdAt || null;
    const gpApproved = gatePass.approvedAt || gatePass.approvedOn || null;

    const issuedDateStr = gpIssued ? new Date(gpIssued).toLocaleDateString() : new Date().toLocaleDateString();
    const approvedDateStr = gpApproved ? new Date(gpApproved).toLocaleDateString() : '-';

    // Debug: log gatePass object & normalized fields to help diagnose missing PDF details
    try {
      console.debug('downloadGatePass - fetched gatePass:', gatePass);
      console.debug('Normalized fields:', { gpName, gpRoll, gpYear, gpDept, gpReason, gpTimeOut, gpIssued, gpApproved, issuedDateStr, approvedDateStr });
    } catch (e) { /* ignore logging errors */ }

    const html = `
      <div id="printableGatePass" style="font-family: 'Segoe UI', Arial, sans-serif; color:#111; max-width:760px; border:2px solid #7A0C0C; border-radius:12px; background:#fff; margin:12px auto; overflow:hidden;">
        <style>
          /* Force readable colors and print adjustments for html2canvas */
          #printableGatePass, #printableGatePass * { color: #000 !important; background: transparent !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #printableGatePass { background: #ffffff !important; }
          #printableGatePass img { max-width:100%; height:auto; }
        </style>
        <div style="padding:28px 24px; background:linear-gradient(180deg, rgba(250,240,240,1), rgba(255,250,250,1)); border-bottom:2px solid #7A0C0C; text-align:center;">
          <div style="font-weight:900; font-size:32px; color:#7A0C0C; letter-spacing:1px;">GATE PASS / PERMISSION SLIP</div>
          <div style="font-size:13px; color:#777; margin-top:6px;">Koneru Lakshmaiah University</div>
        </div>

        <div style="padding:22px 32px; font-size:15px; line-height:1.8;">
          <div style="display:flex; align-items:flex-start; gap:16px; padding:6px 0;"><div style="width:180px; font-weight:800;">Name:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(gpName)}</div></div>
          <div style="display:flex; align-items:flex-start; gap:16px; padding:6px 0;"><div style="width:180px; font-weight:800;">Roll Number:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(gpRoll)}</div></div>
          <div style="display:flex; align-items:flex-start; gap:16px; padding:6px 0;"><div style="width:180px; font-weight:800;">Year:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(formatYear(gpYear))}</div></div>
          <div style="display:flex; align-items:flex-start; gap:16px; padding:6px 0; border-bottom:1px solid #eee; margin-top:8px; padding-bottom:12px;"><div style="width:180px; font-weight:800;">Department:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(gpDept)}</div></div>

          <div style="padding-top:14px;">
            <div style="display:flex; gap:16px; padding:8px 0;"><div style="width:180px; font-weight:800;">Reason for Leaving:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(gpReason)}</div></div>
            <div style="display:flex; gap:16px; padding:8px 0;"><div style="width:180px; font-weight:800;">Time Out:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(gpTimeOut)}</div></div>
            <div style="display:flex; gap:16px; padding:8px 0;"><div style="width:180px; font-weight:800;">Date Issued:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(issuedDateStr)}</div></div>
            <div style="display:flex; gap:16px; padding:8px 0;"><div style="width:180px; font-weight:800;">Approved Date:</div><div style="flex:1; color:#222; font-weight:600;">${escapeHtml(approvedDateStr)}</div></div>
          </div>
        </div>

        <div style="padding:18px; background:#f7f7f7; border-top:1px solid #e8e8e8; text-align:center;">
          <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
            <div style="font-size:20px; color:${gpApproved ? '#28a745' : '#999'};">${gpApproved ? '✅' : '❌'}</div>
            <div style="color:${gpApproved ? '#28a745' : '#666'}; font-weight:800; font-size:18px;">${gpApproved ? 'APPROVED BY HOD' : 'NOT APPROVED'}</div>
          </div>
        </div>
      </div>`;
    
    // Convert to PDF and download
    const tempDiv = document.createElement('div');
    // make sure the element is visible and not affected by page CSS
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.zIndex = '99999';
    tempDiv.style.background = 'transparent';
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    
    const node = tempDiv.querySelector('#printableGatePass');
    if (!node) throw new Error('Printable node missing');
    // enforce high-contrast readable colors
    node.style.color = '#000';
    node.style.background = '#fff';
    node.style.webkitPrintColorAdjust = 'exact';
    node.style.printColorAdjust = 'exact';

    // allow browser to layout and apply styles (fonts, etc.)
    await new Promise(resolve => setTimeout(resolve, 80));

    // html2canvas options tuned for reliable text rendering
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: '#FFFFFF',
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      logging: false
    });
    // Detect blank capture (common html2canvas failure) by sampling center pixel
    try {
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) {
        const cx = Math.floor(canvas.width / 2);
        const cy = Math.floor(canvas.height / 2);
        try {
          const p = ctx.getImageData(cx, cy, 1, 1).data;
          const isWhiteOrTransparent = (p[3] === 0) || (p[0] === 255 && p[1] === 255 && p[2] === 255);
          if (isWhiteOrTransparent) {
            console.warn('downloadGatePass: canvas looks blank — falling back to printable window print');
            // Fallback: open printable HTML in a new window and call print so browser's PDF works
            const w = window.open('', '_blank');
            if (w) {
              w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Gate Pass</title><style>body{font-family:Segoe UI,Arial,sans-serif;color:#000;background:#fff;padding:20px;}#printableGatePass{max-width:760px;margin:0 auto;}</style></head><body>${node.outerHTML}<script>window.onload=function(){setTimeout(()=>{window.print();},250);}</script></body></html>`);
              w.document.close();
            }
            document.body.removeChild(tempDiv);
            showToast('Capture failed — opened printable view. Use browser Print → Save as PDF.', 'info');
            return;
          }
        } catch (sampleErr) {
          console.debug('Failed to sample canvas pixel for blank detection', sampleErr);
        }
      }
    } catch (e) {
      console.debug('Blank-detection error', e);
    }
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 80;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    
    pdf.addImage(imgData, 'PNG', 40, 40, imgWidth, imgHeight, undefined, 'FAST');
    const fileName = `GatePass_${gatePass.studentRoll || gatePass.roll || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    // Cleanup
    document.body.removeChild(tempDiv);
    showToast('✅ Gate pass downloaded successfully');
    
  } catch (err) {
    console.error('Download error:', err);
    showToast('Failed to download gate pass', 'error');
  }
}

// Utility functions
function calculateDuration(entry, exit) {
  if (!exit) return "Still inside";
  let start = new Date(entry), end = new Date(exit);
  let diff = (end - start) / 60000; // minutes
  let hours = Math.floor(diff / 60);
  let minutes = Math.floor(diff % 60);
  return hours + "h " + minutes + "m";
}

function formatYear(year) {
  if (!year) return '-';
  const y = String(year).trim();
  if (/^\d+$/.test(y)) {
    const n = parseInt(y, 10);
    if (n === 1) return '1st Year';
    if (n === 2) return '2nd Year';
    if (n === 3) return '3rd Year';
    return n + 'th Year';
  }
  return y;
}

function checkFrequentVisitors(logs) {
  const counts = {};
  logs.forEach(l => { counts[l.id] = (counts[l.id] || 0) + 1 });
  return counts;
}

function showError(message) {
  const loginError = document.getElementById('loginError');
  const loginErrorText = document.getElementById('loginErrorText');
  loginErrorText.textContent = message;
  loginError.style.display = 'block';
}

function hideError() {
  document.getElementById('loginError').style.display = 'none';
}

function shakeForm() {
  const loginForm = document.getElementById('loginForm');
  loginForm.classList.add('shake');
  setTimeout(() => {
    loginForm.classList.remove('shake');
  }, 500);
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove('error');
  
  if (type === 'error') {
    toast.classList.add('error');
  }
  
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

// Print functions
function printStudentLogs() {
  const id = document.getElementById("studentIdInput").value.trim();
  if (!id) {
    showToast("Please enter a student ID first!", 'error');
    return;
  }
  
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]").filter(l => l.id === id);
  if (logs.length === 0) {
    showToast("No records found for this student!", 'error');
    return;
  }
  
  printHelper(logs, `Student Records - ID: ${id}`);
}

function printStudentLogsFaculty() {
  const id = document.getElementById("facultyIdInput").value.trim();
  if (!id) {
    showToast("Please search for a student first!", 'error');
    return;
  }
  
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]").filter(l => l.id === id);
  if (logs.length === 0) {
    showToast("No records found for this student!", 'error');
    return;
  }
  
  printHelper(logs, `Student Verification Report - ID: ${id}`);
}

// Show gate pass history for a given student roll (can be used by faculty/HOD)
async function showGatePassHistoryByRoll() {
  const id = (document.getElementById('studentIdInput') || {}).value || '';
  const container = document.getElementById('studentGatePassList');
  if (!id) { showToast('Enter a roll/ID first', 'error'); return; }
  if (!container) { showToast('Gatepass history container not found on this page', 'error'); return; }
  try {
    // Try server endpoint for user-specific gatepasses first
    let list = [];
    try {
      list = await apiGet(`/gatepasses/user/${encodeURIComponent(id)}`);
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      // fallback: get all and filter by roll/email
      const all = await apiGet('/gatepasses');
      if (Array.isArray(all)) {
        const lowerId = id.toLowerCase();
        list = all.filter(p => ((p.studentRoll || p.roll || '') + '').toLowerCase() === lowerId || ((p.studentEmail || p.userId || '') + '').toLowerCase().includes(lowerId));
      } else list = [];
    }

    if (!list || list.length === 0) {
      container.innerHTML = `<p style="color:#666">No gatepass requests found for ${escapeHtml(id)}</p>`;
      return;
    }

    // Reuse rendering styles from student history
    const allowedStatuses = ['approved','active','declined','generated','pending','pending_approval'];
    const filtered = list.filter(r => allowedStatuses.includes(String(r.status)));
    filtered.sort((a,b) => (b.ts || b.issuedAt || 0) - (a.ts || a.issuedAt || 0));
    container.innerHTML = filtered.map(r => {
      const approved = r.status === 'approved' || r.status === 'active';
      const declined = r.status === 'declined';
      const generated = r.status === 'generated';
      const pending = r.status === 'pending' || r.status === 'pending_approval';
      const statusBadge = approved
        ? `<span style="background:#e8f7ee; color:#1b7d3a; border:1px solid #bfe5ce; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">✅ Approved</span>`
        : declined
          ? `<span style="background:#fdecec; color:#8f1d1d; border:1px solid #f3c2c2; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">⛔ Declined</span>`
          : generated
            ? `<span style="background:#eef6ff; color:#0b5394; border:1px solid #cfe0ff; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">📝 Generated</span>`
            : `<span style="background:#fff6e5; color:#6a4b00; border:1px solid #ffd89b; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">⌛ Pending Approval</span>`;
      const displayDate = r.date || (r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : '');
      const downloadBtn = approved ? `<button onclick="downloadGatePass('${escapeHtml(r._id || r.id || '')}')" style="margin-top:10px; padding:8px 16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:600;"><i class="fas fa-download"></i> Download</button>` : '';
      return `
        <div style="background:#fff; border:1px solid #f0f0f0; padding:12px; border-radius:8px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;"><div><strong>${escapeHtml(r.studentName || r.name || 'Student')}</strong> <small style="color:#666; margin-left:8px;">${escapeHtml(r.studentRoll || r.roll || '')}</small></div><div>${statusBadge}</div></div>
          <div style="margin-top:8px; color:#444; font-size:13px;"><div><strong>Reason:</strong> ${escapeHtml(r.reason || '-')}</div><div><strong>Time Out:</strong> ${escapeHtml(r.timeOut || r.time || '-')}</div><div style="margin-top:8px; font-size:12px; color:#666;"><strong>Date:</strong> ${escapeHtml(displayDate)}</div></div>
          ${downloadBtn}
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Failed to load gatepass history for', id, err);
    showToast('Failed to fetch gatepass history', 'error');
  }
}

// Expose for debugging
window.showGatePassHistoryByRoll = showGatePassHistoryByRoll;

function printAllLogs() {
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  if (logs.length === 0) {
    showToast("No records available to print!", 'error');
    return;
  }
  
  printHelper(logs, "Complete Clinic Records");
}

function printHelper(logs, title) {
  let w = window.open("");
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #748DAE; padding-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #748DAE; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Kalinga Institute of Industrial Technology - Clinic System</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration</th>
              <th>Symptoms</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
  `);
  
  logs.forEach(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    w.document.write(`
      <tr>
        <td>${log.name}</td>
        <td>${log.id}</td>
        <td>${new Date(log.entryTime).toLocaleString()}</td>
        <td>${log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside"}</td>
        <td>${duration}</td>
        <td>${log.symptoms || "Not specified"}</td>
        <td>${log.loggedBy || "Unknown"}</td>
      </tr>
    `);
  });
  
  w.document.write('</tbody></table></body></html>');
  w.print();
  w.close();
}

// Export CSV
function exportCSV() {
  const logs = JSON.parse(localStorage.getItem("clinicLogs") || "[]");
  if (logs.length === 0) {
    showToast("No data available to export!", 'error');
    return;
  }
  
  let csv = "Name,Student ID,Entry Time,Exit Time,Duration,Symptoms,Logged By\n";
  logs.forEach(log => {
    let duration = calculateDuration(log.entryTime, log.exitTime);
    csv += `"${log.name}","${log.id}","${log.entryTime}","${log.exitTime || "Still inside"}","${duration}","${log.symptoms || "Not specified"}","${log.loggedBy || "Unknown"}"\n`;
  });
  
  let blob = new Blob([csv], { type: 'text/csv' });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `clinic_logs_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showToast("CSV file downloaded successfully!");
  console.log('📥 CSV exported with', logs.length, 'records');
}

// ==================== DEBUG FUNCTIONS ====================
// Call these from browser console to clean up old data

window.clearGatePassData = async function() {
  console.log('🧹 Clearing old gate pass data...');
  
  // Clear localStorage
  localStorage.removeItem('gatepass_history');
  localStorage.removeItem('gatepass_key');
  try { sessionStorage.removeItem('latestGeneratedGatePassId'); } catch(_) {}
  try { sessionStorage.removeItem('gatepass_sent_today'); } catch(_) {}
  
  console.log('✅ Cleared localStorage');
  
  // Try to delete old gate passes from backend (ones with GP- prefix)
  try {
    const allPasses = await apiGet('/gatepasses');
    const oldOnes = allPasses.filter(p => p.id && p.id.startsWith('GP-'));
    console.log('Found', oldOnes.length, 'old gate passes to delete:', oldOnes);
    
    for (const gp of oldOnes) {
      try {
        await fetch(`http://localhost:8080/api/gatepasses/${encodeURIComponent(gp.id)}`, {
          method: 'DELETE'
        });
        console.log('✅ Deleted old gate pass:', gp.id);
      } catch (e) {
        console.error('Failed to delete:', gp.id, e);
      }
    }
  } catch (e) {
    console.error('Error fetching gate passes:', e);
  }
  
  console.log('🎉 Cleanup complete!');
  alert('✅ Cleared old gate pass data. Now submit a fresh gate pass.');
};

window.deleteAllGatePasses = async function() {
  if (!confirm('⚠️ DELETE ALL GATE PASSES FROM DATABASE? This cannot be undone!')) {
    console.log('❌ Cancelled');
    return;
  }
  
  console.log('🗑️ Deleting all gate passes from database...');
  
  try {
    const allPasses = await apiGet('/gatepasses');
    console.log('Found', allPasses.length, 'gate passes');
    
    let deleted = 0;
    for (const gp of allPasses) {
      try {
        const passId = gp._id || gp.id;
        await fetch(`http://localhost:8080/api/gatepasses/${encodeURIComponent(passId)}`, {
          method: 'DELETE'
        });
        deleted++;
        console.log(`✅ [${deleted}/${allPasses.length}] Deleted:`, passId);
      } catch (e) {
        console.error('Failed to delete:', gp._id || gp.id, e);
      }
    }
    
    console.log('🎉 Deleted', deleted, 'gate passes!');
    alert(`✅ Deleted ${deleted} gate passes. Ready for fresh submissions!`);
  } catch (e) {
    console.error('Error:', e);
    alert('❌ Error: ' + e.message);
  }
};
