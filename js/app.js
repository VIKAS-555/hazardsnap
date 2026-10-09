/**
 * BST Tech Club Web App - Core Interactivity & Dynamic Content Engine
 * Branch: CSE (AI & ML)
 * Domains: Competitive Programming, Robotics, Open Source, Hackathon
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkAuthNavbarState();
  initCloudEngineSync();
  renderClubOverview();
  renderDomains();
  renderEvents();
  renderProjects();
  renderFaqs();
  setupEventListeners();
  updateRsvpBadges();
  initDetectiveLens();
  initLiquidCanvas();
  initSpotlightCards();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ============================================================
   THEME TOGGLING (Clean Academic Light / Dark Mode)
   ============================================================ */
function initTheme() {
  const savedTheme = localStorage.getItem('devsphere-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  updateThemeIcons();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('devsphere-theme', isDark ? 'dark' : 'light');
  updateThemeIcons();
  if (window.liquidEffect && typeof window.liquidEffect.setTheme === 'function') {
    window.liquidEffect.setTheme(isDark ? 'dark' : 'light');
  }
  showToast(isDark ? 'Switched to Dark Mode' : 'Switched to Light Mode', 'moon');
}

function updateThemeIcons() {
  const isDark = document.documentElement.classList.contains('dark');
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  
  themeToggles.forEach(btn => {
    btn.innerHTML = isDark
      ? `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>`
      : `<i data-lucide="moon" class="w-4 h-4 text-slate-600"></i>`;
  });

  if (window.lucide) window.lucide.createIcons();
}

/* ============================================================
   ACTIVE MEMBER SESSION SYNC & GOVERNANCE PERMISSIONS
   ============================================================ */
function hasContentAdminAccess() {
  if (!window.AuthEngine || typeof window.AuthEngine.getActiveSession !== 'function') {
    return false;
  }
  const session = window.AuthEngine.getActiveSession();
  if (!session) return false;
  const role = window.AuthEngine.normalizeMemberRank ? window.AuthEngine.normalizeMemberRank(session.role) : session.role;
  return role === 'Root Architect' || role === 'Core Maintainer';
}

function hasEvaluatorAccess() {
  if (!window.AuthEngine || typeof window.AuthEngine.getActiveSession !== 'function') {
    return false;
  }
  const session = window.AuthEngine.getActiveSession();
  if (!session) return false;
  const role = window.AuthEngine.normalizeMemberRank ? window.AuthEngine.normalizeMemberRank(session.role) : session.role;
  return role === 'Root Architect' || role === 'Core Maintainer' || role === 'Faculty Evaluator' || !!session.isTeacher;
}

function syncContentAdminControls() {
  const canEdit = hasContentAdminAccess();
  const canEvaluate = hasEvaluatorAccess();

  const btnAddEvent = document.getElementById('btn-add-event-toolbar');
  if (btnAddEvent) {
    if (canEdit) btnAddEvent.classList.remove('hidden');
    else btnAddEvent.classList.add('hidden');
  }

  const btnAddProj = document.getElementById('btn-add-project-toolbar');
  if (btnAddProj) {
    if (canEdit) btnAddProj.classList.remove('hidden');
    else btnAddProj.classList.add('hidden');
  }

  const btnTeamsConsole = document.getElementById('btn-teams-submissions-toolbar');
  if (btnTeamsConsole) {
    if (canEvaluate) btnTeamsConsole.classList.remove('hidden');
    else btnTeamsConsole.classList.add('hidden');
  }
}

function checkAuthNavbarState() {
  const session = window.AuthEngine && window.AuthEngine.getActiveSession ? window.AuthEngine.getActiveSession() : null;
  const navText = document.getElementById('nav-auth-text');
  const navLink = document.getElementById('nav-auth-link');
  const verifiedDot = document.getElementById('nav-verified-dot');

  if (session && navText && navLink) {
    const role = window.AuthEngine.normalizeMemberRank ? window.AuthEngine.normalizeMemberRank(session.role) : session.role;
    const firstName = (session.name || 'Member').split(' ')[0];

    if (role === 'Root Architect') {
      navText.textContent = `Lead Admin • ${firstName}`;
      navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white transition shadow-md border border-amber-300/60 ring-2 ring-amber-400/20';
    } else if (role === 'Core Maintainer') {
      navText.textContent = `Maintainer • ${firstName}`;
      navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white transition shadow-md border border-purple-300/60 ring-2 ring-purple-400/20';
    } else if (role === 'Staff Contributor') {
      navText.textContent = `Staff • ${firstName}`;
      navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white transition shadow-md border border-emerald-300/60 ring-2 ring-emerald-400/20';
    } else if (role === 'Faculty Evaluator' || session.isTeacher) {
      navText.textContent = `Faculty • ${firstName}`;
      navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white transition shadow-md border border-indigo-300/60 ring-2 ring-indigo-400/20';
    } else {
      navText.textContent = `${session.techClubId} (${firstName})`;
      navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm border border-blue-400/40';
    }
    if (verifiedDot) verifiedDot.classList.remove('hidden');
  } else if (navLink) {
    if (navText) navText.textContent = 'BST Member Portal';
    navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm border border-blue-500/40';
    if (verifiedDot) verifiedDot.classList.add('hidden');
  }

  syncContentAdminControls();
}

/* ============================================================
   SUPABASE CLOUD DATABASE & REALTIME SYNCHRONIZATION (OPTION A)
   ============================================================ */
async function initCloudEngineSync() {
  updateCloudStatusUI();

  if (!window.SupabaseEngine || !window.SupabaseEngine.isConfigured()) {
    return;
  }

  // 1. Initial Cloud Data Pull
  try {
    // Sync members
    const members = await window.SupabaseEngine.fetchMembers();
    if (members && Object.keys(members).length > 0) {
      if (window.AuthEngine && typeof window.AuthEngine.saveMembersVault === 'function') {
        window.AuthEngine.saveMembersVault(members);
      } else {
        localStorage.setItem('devsphere_members_vault_v1', JSON.stringify(members));
      }
      renderClubOverview();
    }

    // Sync events
    const cloudEvents = await window.SupabaseEngine.fetchEvents();
    if (cloudEvents && cloudEvents.length > 0) {
      saveStoredEvents(cloudEvents);
      renderEvents();
      renderClubOverview();
    }

    // Sync projects
    const cloudProjects = await window.SupabaseEngine.fetchProjects();
    if (cloudProjects && cloudProjects.length > 0) {
      saveStoredProjects(cloudProjects);
      renderProjects();
    }

    // Sync RSVPs
    const cloudRsvps = await window.SupabaseEngine.fetchRsvps();
    if (cloudRsvps) {
      const localRsvps = getUserRsvps();
      const mergedRsvps = { ...localRsvps, ...cloudRsvps };
      localStorage.setItem('devsphere-user-rsvps', JSON.stringify(mergedRsvps));
      updateRsvpBadges();
      renderClubOverview();
    }
  } catch (err) {
    console.warn('[Cloud Sync] Initial sync:', err);
  }

  // 2. Setup Realtime WebSockets for Instant Campus-Wide Push Updates
  window.SupabaseEngine.setupRealtimeSubscriptions({
    onMembersUpdate: async () => {
      const members = await window.SupabaseEngine.fetchMembers();
      if (members) {
        if (window.AuthEngine && typeof window.AuthEngine.saveMembersVault === 'function') {
          window.AuthEngine.saveMembersVault(members);
        } else {
          localStorage.setItem('devsphere_members_vault_v1', JSON.stringify(members));
        }
        renderClubOverview();
      }
    },
    onEventsUpdate: async () => {
      const events = await window.SupabaseEngine.fetchEvents();
      if (events) {
        saveStoredEvents(events);
        renderEvents();
        renderClubOverview();
      }
    },
    onProjectsUpdate: async () => {
      const projects = await window.SupabaseEngine.fetchProjects();
      if (projects) {
        saveStoredProjects(projects);
        renderProjects();
      }
    },
    onRsvpsUpdate: async () => {
      const rsvps = await window.SupabaseEngine.fetchRsvps();
      if (rsvps) {
        const localRsvps = getUserRsvps();
        localStorage.setItem('devsphere-user-rsvps', JSON.stringify({ ...localRsvps, ...rsvps }));
        updateRsvpBadges();
        renderClubOverview();
      }
    }
  });
}

function updateCloudStatusUI() {
  const dot = document.getElementById('cloud-status-dot');
  const text = document.getElementById('cloud-status-text');
  const modalIndicator = document.getElementById('cloud-modal-indicator');
  const modalStatus = document.getElementById('cloud-modal-status-text');
  const modalDetail = document.getElementById('cloud-modal-detail-text');

  const isConfigured = window.SupabaseEngine && window.SupabaseEngine.isConfigured();

  if (dot && text) {
    if (isConfigured) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      text.textContent = 'Cloud: Live';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400';
      text.textContent = 'Local Mode';
    }
  }

  if (modalIndicator && modalStatus && modalDetail) {
    if (isConfigured) {
      modalIndicator.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0';
      modalStatus.textContent = 'Supabase Cloud Connected (Live Sync)';
      modalDetail.textContent = 'Active realtime PostgreSQL channel. Changes sync across all student devices instantly.';
    } else {
      modalIndicator.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0';
      modalStatus.textContent = 'Local Fallback Mode';
      modalDetail.textContent = 'Data persists in this browser. Enter Supabase credentials to enable cross-device sync.';
    }
  }
}

function openCloudConfigModal() {
  const modal = document.getElementById('cloud-config-modal');
  if (!modal) return;

  const urlInput = document.getElementById('cloud-input-url');
  const keyInput = document.getElementById('cloud-input-key');

  const storedUrl = localStorage.getItem('bst_supabase_url') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || '';
  const storedKey = localStorage.getItem('bst_supabase_anon_key') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) || '';

  if (urlInput) urlInput.value = storedUrl;
  if (keyInput) keyInput.value = storedKey;

  updateCloudStatusUI();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeCloudConfigModal() {
  const modal = document.getElementById('cloud-config-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

async function handleCloudConfigSubmit(e) {
  e.preventDefault();
  const url = document.getElementById('cloud-input-url').value.trim();
  const key = document.getElementById('cloud-input-key').value.trim();

  if (!url || !key) {
    showToast('Please provide both Project URL and Anon Key.', 'alert-circle');
    return;
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    showToast('Invalid Project URL. Should look like: https://xxx.supabase.co', 'alert-circle');
    return;
  }

  if (window.SupabaseEngine) {
    window.SupabaseEngine.setCredentials(url, key);
    updateCloudStatusUI();

    showToast('Testing database connection...', 'loader-2');
    const result = await window.SupabaseEngine.testConnection();
    if (result.success) {
      showToast(`Connected to Supabase! Live sync active (${result.count} registered members).`, 'check-circle-2');
      closeCloudConfigModal();
      await initCloudEngineSync();
    } else {
      showToast(`Database ping failed: ${result.message}. Did you run supabase-schema.sql?`, 'alert-circle');
    }
  }
}

function clearCloudCredentialsUI() {
  if (window.SupabaseEngine) {
    window.SupabaseEngine.clearCredentials();
    updateCloudStatusUI();
    const urlInput = document.getElementById('cloud-input-url');
    const keyInput = document.getElementById('cloud-input-key');
    if (urlInput) urlInput.value = '';
    if (keyInput) keyInput.value = '';
    showToast('Reverted to Local Fallback Mode.', 'info');
  }
}

async function testCloudConnectionUI() {
  if (!window.SupabaseEngine || !window.SupabaseEngine.isConfigured()) {
    showToast('Please enter your Supabase credentials first.', 'info');
    return;
  }
  showToast('Pinging Supabase cloud...', 'loader-2');
  const result = await window.SupabaseEngine.testConnection();
  if (result.success) {
    showToast(`Connection Healthy! ${result.count} member records reachable.`, 'check-circle-2');
  } else {
    showToast(`Error: ${result.message}`, 'alert-circle');
  }
}

/* ============================================================
   RENDER CLUB OVERVIEW & STATS
   ============================================================ */
function renderClubOverview() {
  const config = window.clubConfig.club;
  
  // Set textual club data
  document.querySelectorAll('.club-name-text').forEach(el => el.textContent = config.name);
  document.querySelectorAll('.club-full-name').forEach(el => el.textContent = config.fullName);
  document.querySelectorAll('.college-name-text').forEach(el => el.textContent = config.collegeName);
  
  const heroTagline = document.getElementById('hero-tagline');
  if (heroTagline) heroTagline.textContent = config.tagline;
  
  const heroSubtagline = document.getElementById('hero-subtagline');
  if (heroSubtagline) heroSubtagline.textContent = config.subtagline;

  // Render Stats dynamically with live metrics
  const statsContainer = document.getElementById('hero-stats-container');
  if (statsContainer) {
    // 1. Live Joined Members Count (reflects exact number of real student signups)
    let joinedCount = 0;
    if (window.AuthEngine && typeof window.AuthEngine.getMembersVault === 'function') {
      const vault = window.AuthEngine.getMembersVault();
      joinedCount = Object.keys(vault || {}).length;
    }

    // 2. Technical Domains
    const domainsCount = window.clubConfig && window.clubConfig.domains ? window.clubConfig.domains.length : 4;

    // 3. Events, Hackathons & RSVPs
    const storedEvents = typeof getStoredEvents === 'function' ? getStoredEvents() : [];
    const totalEvents = storedEvents.length;
    const hackathonsCount = storedEvents.filter(e => 
      (e.type && e.type.toLowerCase() === 'hackathon') || 
      (e.category && e.category.toLowerCase().includes('hackathon')) || 
      (e.title && e.title.toLowerCase().includes('hackathon'))
    ).length;
    const storedRsvps = typeof getUserRsvps === 'function' ? getUserRsvps() : {};
    const rsvpCount = Object.keys(storedRsvps || {}).length;

    statsContainer.innerHTML = `
      <!-- Stat 1: Live Joined Members -->
      <div class="px-4 sm:px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-center flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-center gap-2 mb-1">
            <i data-lucide="users" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
            <span class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">${joinedCount}</span>
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Members</p>
        </div>
        <div class="mt-2">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Count
          </span>
        </div>
      </div>

      <!-- Stat 2: Technical Domains -->
      <div class="px-4 sm:px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-center flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-center gap-2 mb-1">
            <i data-lucide="layers" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
            <span class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">${domainsCount}</span>
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Technical Domains</p>
        </div>
        <div class="mt-2 text-[10px] text-slate-400 font-mono">4 Core Focus Areas</div>
      </div>

      <!-- Stat 3: CSE (AI & ML) Branch - In one line except Branch -->
      <div class="px-4 sm:px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-center flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-center gap-1.5 mb-1 text-blue-600 dark:text-blue-400">
            <i data-lucide="cpu" class="w-4 h-4 shrink-0"></i>
            <span class="whitespace-nowrap text-base sm:text-lg lg:text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">CSE (AI & ML)</span>
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branch</p>
        </div>
        <div class="mt-2 text-[10px] text-slate-400 font-mono">Cohort 2026</div>
      </div>

      <!-- Stat 4: Live Technical Sessions & RSVP (Updates on Hackathon/Event CRUD & RSVP) -->
      <div class="px-4 sm:px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-center flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-center gap-2 mb-1">
            <i data-lucide="trophy" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
            <span class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">${totalEvents}</span>
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Technical Sessions & RSVP</p>
        </div>
        <div class="mt-2">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            ${hackathonsCount} Hackathon${hackathonsCount === 1 ? '' : 's'} • ${rsvpCount} RSVP${rsvpCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}

/* ============================================================
   RENDER FOCUS DOMAINS / TRACKS
   ============================================================ */
function renderDomains() {
  const container = document.getElementById('domains-grid');
  if (!container) return;

  const domains = window.clubConfig.domains;
  container.innerHTML = domains.map(domain => `
    <div class="academic-card p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-900/40">
          <i data-lucide="${domain.icon}" class="w-5 h-5"></i>
        </div>
        <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">${domain.lead}</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${domain.title}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">${domain.description}</p>
      </div>
      <div>
        <div class="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          ${domain.tags.map(t => `
            <span class="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
              ${t}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   EVENTS STORAGE & FULL CRUD (Add, Edit, Delete, RSVP)
   ============================================================ */
const EVENTS_STORAGE_KEY = 'bst_events_data_v1';

function getStoredEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return window.clubConfig.events || [];
  } catch (e) {
    return [];
  }
}

function saveStoredEvents(events) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

let currentEventFilter = 'all';
let currentSearchTerm = '';

function renderEvents() {
  const container = document.getElementById('events-grid');
  if (!container) return;

  const events = getStoredEvents();
  const userRsvps = getUserRsvps();
  const canManage = hasContentAdminAccess();

  // If no events exist in the club
  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="calendar" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">No Events Scheduled Yet</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 ${canManage ? 'mb-5' : 'mb-2'} leading-relaxed">
          ${canManage 
            ? 'The schedule is currently clear. You have governance permissions to schedule workshops, labs, and hackathons.' 
            : 'The schedule is currently clear. Upcoming technical sessions, workshops, and hackathons will appear here once announced.'}
        </p>
        ${canManage ? `
          <button onclick="openEventEditorModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> Add New Event
          </button>
        ` : ''}
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const filtered = events.filter(evt => {
    // Tab filter
    if (currentEventFilter === 'upcoming' && evt.status !== 'Upcoming') return false;
    if (currentEventFilter === 'past' && evt.status !== 'Past') return false;
    if (currentEventFilter === 'hackathons' && evt.type !== 'Hackathon') return false;

    // Search query
    if (currentSearchTerm) {
      const q = currentSearchTerm.toLowerCase();
      const matchTitle = (evt.title || '').toLowerCase().includes(q);
      const matchDesc = (evt.description || '').toLowerCase().includes(q);
      const matchVenue = (evt.venue || '').toLowerCase().includes(q);
      const matchSpeaker = evt.speaker && (evt.speaker.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchVenue && !matchSpeaker) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-400 mb-3"></i>
        <p class="text-slate-600 dark:text-slate-300 font-medium">No events found matching your filter.</p>
        <button onclick="resetEventFilters()" class="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Reset filters & search
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Render cards in the exact requested format with Edit/Delete options
  container.innerHTML = filtered.map(evt => {
    const isRegistered = !!userRsvps[evt.id];
    const isPast = evt.status === 'Past';
    
    // Status badges
    let statusBadge = '';
    if (isRegistered) {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><i data-lucide="check-check" class="w-3 h-3"></i> Registered</span>`;
    } else if (isPast) {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Completed</span>`;
    } else if (evt.seatsLeft <= 5) {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 animate-pulse">Few Seats Left (${evt.seatsLeft})</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Open (${evt.seatsLeft} spots)</span>`;
    }

    const speakerAvatar = evt.speaker && evt.speaker.avatar ? evt.speaker.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
    const speakerName = evt.speaker && evt.speaker.name ? evt.speaker.name : 'BST Tech Coordinator';
    const speakerRole = evt.speaker && evt.speaker.role ? evt.speaker.role : 'Technical Lead';

    return `
      <div class="academic-card rounded-2xl overflow-hidden flex flex-col justify-between relative group shadow-sm hover:shadow-md transition" id="event-card-${evt.id}">
        ${evt.coverImage ? `
          <div class="relative w-full h-40 overflow-hidden bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <img src="${evt.coverImage}" alt="${evt.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.parentElement.style.display='none'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
            ${evt.minTeamSize && evt.maxTeamSize ? `
              <span class="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-white/20">
                <i data-lucide="users" class="w-3 h-3 text-indigo-400"></i> ${evt.minTeamSize === evt.maxTeamSize ? `Team: ${evt.maxTeamSize}` : `Team: ${evt.minTeamSize}–${evt.maxTeamSize} Members`}
              </span>
            ` : ''}
          </div>
        ` : (evt.minTeamSize && evt.maxTeamSize && (evt.maxTeamSize > 1 || evt.minTeamSize > 1) ? `
          <div class="px-6 pt-4 -mb-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
              <i data-lucide="users" class="w-3 h-3 text-indigo-500"></i> Team Size: ${evt.minTeamSize === evt.maxTeamSize ? evt.maxTeamSize : `${evt.minTeamSize}–${evt.maxTeamSize} Members`}
            </span>
          </div>
        ` : '')}
        <div class="p-6">
          <div class="flex items-center justify-between gap-3 mb-3">
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
              ${evt.type}
            </span>
            <div class="flex items-center gap-2">
              ${statusBadge}
              ${canManage ? `
                <!-- Edit & Delete Controls (Lead Admin & Core Maintainer only) -->
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button onclick="openEventEditorModal('${evt.id}')" title="Edit Event" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition cursor-pointer">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="deleteEvent('${evt.id}')" title="Delete Event" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition cursor-pointer">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
            ${evt.title}
          </h3>

          <p class="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
            ${evt.description}
          </p>

          <div class="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-slate-400 shrink-0"></i>
              <span>${evt.date}</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-slate-400 shrink-0"></i>
              <span>${evt.time}</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 shrink-0"></i>
              <span class="truncate">${evt.venue}</span>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <img src="${speakerAvatar}" alt="${speakerName}" class="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700">
            <div class="truncate">
              <div class="text-xs font-semibold text-slate-900 dark:text-white truncate">${speakerName}</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${speakerRole}</div>
            </div>
          </div>

          <div>
            ${isRegistered ? `
              <button onclick="openPassModal('${evt.id}')" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="ticket" class="w-3.5 h-3.5"></i> View Ticket
              </button>
            ` : isPast ? `
              <button disabled class="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed">
                Concluded
              </button>
            ` : `
              <button onclick="openRsvpModal('${evt.id}')" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="send" class="w-3.5 h-3.5"></i> RSVP Now
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function filterEvents(type, btn) {
  currentEventFilter = type;
  document.querySelectorAll('.event-filter-btn').forEach(b => {
    b.classList.remove('active', 'bg-blue-600', 'text-white');
    b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
  });

  btn.classList.add('active', 'bg-blue-600', 'text-white');
  btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
  
  renderEvents();
}

function resetEventFilters() {
  currentEventFilter = 'all';
  currentSearchTerm = '';
  const searchInput = document.getElementById('event-search-input');
  if (searchInput) searchInput.value = '';

  const allBtn = document.querySelector('.event-filter-btn[data-type="all"]');
  if (allBtn) filterEvents('all', allBtn);
  else renderEvents();
}

// --- EVENT COVER IMAGE HELPERS ---
function previewEventCoverImage(url) {
  const box = document.getElementById('edit-event-cover-preview-box');
  const img = document.getElementById('edit-event-cover-preview');
  if (!box || !img) return;
  if (url && url.trim()) {
    img.src = url.trim();
    box.classList.remove('hidden');
  } else {
    img.src = '';
    box.classList.add('hidden');
  }
}

function setEventCoverPreset(preset) {
  const presets = {
    aiml: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    robotics: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    algorithms: 'https://images.unsplash.com/photo-1516116211227-bbc03e3cb828?auto=format&fit=crop&w=1200&q=80',
    opensource: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  };
  const url = presets[preset] || presets.aiml;
  const input = document.getElementById('edit-event-cover-image');
  if (input) {
    input.value = url;
    previewEventCoverImage(url);
  }
}

function clearEventCoverImage() {
  const input = document.getElementById('edit-event-cover-image');
  if (input) {
    input.value = '';
    previewEventCoverImage('');
  }
}

// --- EVENT EDITOR MODAL LOGIC (ADD / EDIT) ---
function openEventEditorModal(eventId = null) {
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can manage workshops.', 'shield-alert');
    return;
  }
  const modal = document.getElementById('event-editor-modal');
  if (!modal) return;

  const form = document.getElementById('event-editor-form');
  form.reset();

  const titleEl = document.getElementById('event-editor-modal-title');
  const idInput = document.getElementById('edit-event-id');

  if (eventId) {
    const events = getStoredEvents();
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    titleEl.textContent = 'Edit Event Details';
    idInput.value = evt.id;
    document.getElementById('edit-event-title').value = evt.title || '';
    document.getElementById('edit-event-type').value = evt.type || 'Workshop';
    document.getElementById('edit-event-category').value = (evt.category === 'Competative Programming' ? 'Competitive Programming' : (evt.category || 'Competitive Programming'));
    document.getElementById('edit-event-status').value = evt.status || 'Upcoming';
    document.getElementById('edit-event-date').value = evt.date || '';
    document.getElementById('edit-event-time').value = evt.time || '';
    document.getElementById('edit-event-venue').value = evt.venue || '';
    document.getElementById('edit-event-seats').value = evt.seatsTotal || 90;
    document.getElementById('edit-event-speaker-name').value = evt.speaker?.name || '';
    document.getElementById('edit-event-speaker-role').value = evt.speaker?.role || '';
    document.getElementById('edit-event-description').value = evt.description || '';
    document.getElementById('edit-event-cover-image').value = evt.coverImage || '';
    document.getElementById('edit-event-min-team-size').value = evt.minTeamSize || 1;
    document.getElementById('edit-event-max-team-size').value = evt.maxTeamSize || 4;
    previewEventCoverImage(evt.coverImage || '');
  } else {
    titleEl.textContent = 'Schedule New Event';
    idInput.value = '';
    document.getElementById('edit-event-seats').value = 90;
    document.getElementById('edit-event-cover-image').value = '';
    document.getElementById('edit-event-min-team-size').value = 1;
    document.getElementById('edit-event-max-team-size').value = 4;
    previewEventCoverImage('');
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeEventEditorModal() {
  const modal = document.getElementById('event-editor-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function handleEventEditorSubmit(e) {
  e.preventDefault();
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can manage workshops.', 'shield-alert');
    closeEventEditorModal();
    return;
  }
  const id = document.getElementById('edit-event-id').value;
  const title = document.getElementById('edit-event-title').value.trim();
  const type = document.getElementById('edit-event-type').value;
  const category = document.getElementById('edit-event-category').value;
  const status = document.getElementById('edit-event-status').value;
  const date = document.getElementById('edit-event-date').value.trim();
  const time = document.getElementById('edit-event-time').value.trim();
  const venue = document.getElementById('edit-event-venue').value.trim();
  const seatsTotal = parseInt(document.getElementById('edit-event-seats').value, 10) || 60;
  const speakerName = document.getElementById('edit-event-speaker-name').value.trim() || 'BST Tech Team';
  const speakerRole = document.getElementById('edit-event-speaker-role').value.trim() || 'Domain Coordinator';
  const description = document.getElementById('edit-event-description').value.trim();
  const coverImage = document.getElementById('edit-event-cover-image')?.value.trim() || '';
  const minTeamSize = parseInt(document.getElementById('edit-event-min-team-size')?.value, 10) || 1;
  const maxTeamSize = parseInt(document.getElementById('edit-event-max-team-size')?.value, 10) || 4;

  let events = getStoredEvents();

  if (id) {
    // Edit existing event
    const idx = events.findIndex(ev => ev.id === id);
    if (idx !== -1) {
      events[idx] = {
        ...events[idx],
        title,
        type,
        category,
        status,
        date,
        time,
        venue,
        seatsTotal,
        seatsLeft: Math.min(events[idx].seatsLeft, seatsTotal),
        description,
        coverImage,
        minTeamSize,
        maxTeamSize,
        speaker: {
          ...events[idx].speaker,
          name: speakerName,
          role: speakerRole
        }
      };
      showToast('Event updated successfully!', 'check-circle-2');
    }
  } else {
    // Create new event
    const newId = `evt-${Date.now().toString().slice(-5)}`;
    const newEvent = {
      id: newId,
      title,
      type,
      category,
      status,
      date,
      time,
      venue,
      seatsTotal,
      seatsLeft: seatsTotal,
      description,
      coverImage,
      minTeamSize,
      maxTeamSize,
      rsvpOpen: status === 'Upcoming',
      speaker: {
        name: speakerName,
        role: speakerRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      }
    };
    events.unshift(newEvent);
    showToast('New event scheduled successfully!', 'sparkles');
  }

  saveStoredEvents(events);
  closeEventEditorModal();
  renderEvents();
  renderClubOverview();

  // Cloud sync (Option A)
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    const targetEvent = id ? events.find(ev => ev.id === id) : events[0];
    if (targetEvent) {
      window.SupabaseEngine.saveEvent(targetEvent).catch(err => {
        console.warn('[Supabase] Event save error:', err);
      });
    }
  }
}

function deleteEvent(eventId) {
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can delete workshops.', 'shield-alert');
    return;
  }
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    return;
  }
  let events = getStoredEvents();
  events = events.filter(e => e.id !== eventId);
  saveStoredEvents(events);
  renderEvents();
  renderClubOverview();
  showToast('Event removed.', 'trash-2');

  // Cloud sync (Option A)
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    window.SupabaseEngine.deleteEvent(eventId).catch(err => {
      console.warn('[Supabase] Event delete error:', err);
    });
  }
}

/* ============================================================
   PROJECTS STORAGE & FULL CRUD (Add, Edit, Delete)
   ============================================================ */
const PROJECTS_STORAGE_KEY = 'bst_projects_data_v1';

function getStoredProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return window.clubConfig.projects || [];
  } catch (e) {
    return [];
  }
}

function saveStoredProjects(projects) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

const PROJECT_EVALUATIONS_STORAGE_KEY = 'bst_project_evaluations_v1';

function getStoredProjectEvaluations() {
  try {
    const raw = localStorage.getItem(PROJECT_EVALUATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return {
      'proj-1': {
        score: 96,
        tier: 'Outstanding (Tier A+)',
        feedback: 'Superb architecture utilizing quantized on-device embeddings and FAISS index. Well-documented and clean academic implementation.',
        evaluatorName: 'Dr. S. K. Raman (Faculty Evaluator)',
        evaluatedAt: '2026-09-28T14:30:00.000Z'
      }
    };
  } catch (e) {
    return {};
  }
}

function saveStoredProjectEvaluations(evals) {
  try {
    localStorage.setItem(PROJECT_EVALUATIONS_STORAGE_KEY, JSON.stringify(evals));
  } catch (e) {}
}

function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const projects = getStoredProjects();
  const canManage = hasContentAdminAccess();
  const canEvaluate = hasEvaluatorAccess();
  const evals = getStoredProjectEvaluations();

  // If empty state
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="folder-code" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">No Projects Published Yet</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 ${canManage ? 'mb-5' : 'mb-2'} leading-relaxed">
          ${canManage 
            ? 'No projects published yet. You have maintainer access to publish student projects built in AI, Robotics, CP, and Open Source.' 
            : 'No projects published yet. Curated member projects reviewed and published by Core Maintainers will appear here.'}
        </p>
        ${canManage ? `
          <button onclick="openProjectEditorModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> Add First Project
          </button>
        ` : ''}
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = projects.map(proj => {
    const evaluation = evals[proj.id] || null;

    return `
      <div class="academic-card p-6 rounded-2xl flex flex-col justify-between group relative shadow-sm hover:shadow-md transition">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              ${proj.category === 'Competative Programming' ? 'Competitive Programming' : (proj.category || 'Competitive Programming')}
            </span>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                ${proj.badge || 'Project'}
              </span>
              ${canManage ? `
                <!-- Edit & Delete Controls (Lead Admin & Core Maintainer only) -->
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button onclick="openProjectEditorModal('${proj.id}')" title="Edit Project" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition cursor-pointer">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="deleteProject('${proj.id}')" title="Delete Project" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition cursor-pointer">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
            ${proj.title}
          </h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">${proj.tagline || ''}</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            ${proj.description}
          </p>

          <!-- Academic Evaluation Badge if marked -->
          ${evaluation ? `
            <div class="mb-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                  <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i> ${evaluation.evaluatorName || 'Faculty Evaluator'}
                </span>
                <span class="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[10px]">
                  ${evaluation.score}/100 • ${evaluation.tier || 'Graded'}
                </span>
              </div>
              ${evaluation.feedback ? `
                <p class="text-[11px] text-slate-600 dark:text-slate-300 italic leading-snug">
                  "${evaluation.feedback}"
                </p>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <div>
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${(proj.tech || []).map(t => `
              <span class="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                ${t}
              </span>
            `).join('')}
          </div>

          <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div class="flex items-center gap-3">
              <a href="${proj.github || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg> Source Code
              </a>
              <span class="text-slate-300 dark:text-slate-700">•</span>
              <a href="${proj.demo || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Live Demo
              </a>
            </div>

            ${canEvaluate ? `
              <button 
                type="button" 
                onclick="openProjectEvaluationModal('${proj.id}')" 
                class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 transition shadow-sm cursor-pointer shrink-0">
                <i data-lucide="award" class="w-3.5 h-3.5"></i> ${evaluation ? 'Update Marks' : 'Mark Project'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openProjectEditorModal(projectId = null) {
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can manage projects.', 'shield-alert');
    return;
  }
  const modal = document.getElementById('project-editor-modal');
  if (!modal) return;

  const form = document.getElementById('project-editor-form');
  form.reset();

  const titleEl = document.getElementById('project-editor-modal-title');
  const idInput = document.getElementById('edit-project-id');

  if (projectId) {
    const projects = getStoredProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    titleEl.textContent = 'Edit Project Details';
    idInput.value = proj.id;
    document.getElementById('edit-project-title').value = proj.title || '';
    document.getElementById('edit-project-tagline').value = proj.tagline || '';
    document.getElementById('edit-project-category').value = (proj.category === 'Competative Programming' ? 'Competitive Programming' : (proj.category || 'Competitive Programming'));
    document.getElementById('edit-project-badge').value = proj.badge || 'Community Project';
    document.getElementById('edit-project-description').value = proj.description || '';
    document.getElementById('edit-project-tech').value = (proj.tech || []).join(', ');
    document.getElementById('edit-project-github').value = proj.github || '';
    document.getElementById('edit-project-demo').value = proj.demo || '';
  } else {
    titleEl.textContent = 'Add Student Project';
    idInput.value = '';
    document.getElementById('edit-project-badge').value = 'Student Project';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeProjectEditorModal() {
  const modal = document.getElementById('project-editor-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function handleProjectEditorSubmit(e) {
  e.preventDefault();
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can manage projects.', 'shield-alert');
    closeProjectEditorModal();
    return;
  }
  const id = document.getElementById('edit-project-id').value;
  const title = document.getElementById('edit-project-title').value.trim();
  const tagline = document.getElementById('edit-project-tagline').value.trim();
  const category = document.getElementById('edit-project-category').value;
  const badge = document.getElementById('edit-project-badge').value.trim() || 'Student Project';
  const description = document.getElementById('edit-project-description').value.trim();
  const techStr = document.getElementById('edit-project-tech').value.trim();
  const tech = techStr ? techStr.split(',').map(s => s.trim()).filter(Boolean) : ['CSE (AI & ML)'];
  const github = document.getElementById('edit-project-github').value.trim() || 'https://github.com';
  const demo = document.getElementById('edit-project-demo').value.trim() || 'https://example.com';

  let projects = getStoredProjects();

  if (id) {
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      projects[idx] = {
        ...projects[idx],
        title,
        tagline,
        category,
        badge,
        description,
        tech,
        github,
        demo
      };
      showToast('Project updated successfully!', 'check-circle-2');
    }
  } else {
    const newId = `proj-${Date.now().toString().slice(-5)}`;
    const newProject = {
      id: newId,
      title,
      tagline,
      category,
      badge,
      description,
      tech,
      github,
      demo
    };
    projects.unshift(newProject);
    showToast('Project added to showcase!', 'sparkles');
  }

  saveStoredProjects(projects);
  closeProjectEditorModal();
  renderProjects();

  // Cloud sync (Option A)
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    const targetProj = id ? projects.find(p => p.id === id) : projects[0];
    if (targetProj) {
      window.SupabaseEngine.saveProject(targetProj).catch(err => {
        console.warn('[Supabase] Project save error:', err);
      });
    }
  }
}

function deleteProject(projectId) {
  if (!hasContentAdminAccess()) {
    showToast('Access Restricted: Only Lead Administrators and Core Maintainers can delete projects.', 'shield-alert');
    return;
  }
  if (!confirm('Are you sure you want to remove this project?')) return;
  let projects = getStoredProjects();
  projects = projects.filter(p => p.id !== projectId);
  saveStoredProjects(projects);
  renderProjects();
  showToast('Project removed.', 'trash-2');

  // Cloud sync (Option A)
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    window.SupabaseEngine.deleteProject(projectId).catch(err => {
      console.warn('[Supabase] Project delete error:', err);
    });
  }
}

/* ============================================================
   FAQS ACCORDION
   ============================================================ */
function renderFaqs() {
  const container = document.getElementById('faqs-container');
  if (!container) return;

  const faqs = window.clubConfig.faqs;
  container.innerHTML = faqs.map((faq, idx) => `
    <div class="academic-card rounded-xl overflow-hidden">
      <button class="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" onclick="toggleFaq(${idx})">
        <span class="text-sm">${faq.question}</span>
        <i data-lucide="chevron-down" id="faq-chevron-${idx}" class="w-4 h-4 text-slate-400 transition-transform duration-200"></i>
      </button>
      <div id="faq-content-${idx}" class="hidden px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
        ${faq.answer}
      </div>
    </div>
  `).join('');
}

function toggleFaq(idx) {
  const content = document.getElementById(`faq-content-${idx}`);
  const chevron = document.getElementById(`faq-chevron-${idx}`);
  if (!content) return;

  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden');
  if (chevron) {
    chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

/* ============================================================
   EVENT TEAMS STORAGE & MUTUAL EXCLUSIVITY ENGINE
   ============================================================ */
const EVENT_TEAMS_STORAGE_KEY = 'bst_event_teams_v1';

function getStoredEventTeams() {
  try {
    const raw = localStorage.getItem(EVENT_TEAMS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return [
      {
        id: 'team-neural-nexus',
        eventId: 'hack-1',
        eventTitle: 'HackNova 2026: 24h AI Hackathon',
        teamName: 'Neural Nexus',
        leaderName: 'Aarav Sharma',
        leaderUsn: '2392608101',
        leaderEmail: 'aarav.sharma@college.edu',
        members: [
          { usn: '2392608102', name: 'Priya Patel' },
          { usn: '2392608103', name: 'Rohan Iyer' }
        ],
        projectLink: 'https://github.com/bst-club/neural-nexus',
        pptLink: 'https://docs.google.com/presentation/d/sample-pitch',
        status: 'SUBMITTED',
        registeredAt: '2026-10-01T10:15:00.000Z'
      },
      {
        id: 'team-quantum-coders',
        eventId: 'hack-1',
        eventTitle: 'HackNova 2026: 24h AI Hackathon',
        teamName: 'Quantum Coders',
        leaderName: 'Divya Nair',
        leaderUsn: '2392608145',
        leaderEmail: 'divya.nair@college.edu',
        members: [
          { usn: '2392608146', name: 'Karthik Menon' }
        ],
        projectLink: '',
        pptLink: '',
        status: 'NOT SUBMITTED',
        registeredAt: '2026-10-02T16:40:00.000Z'
      }
    ];
  } catch (e) {
    return [];
  }
}

function saveStoredEventTeams(teams) {
  try {
    localStorage.setItem(EVENT_TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (e) {}
}

/* ============================================================
   RSVP MODAL & PASS GENERATOR
   ============================================================ */
let activeRsvpEvent = null;

function getUserRsvps() {
  try {
    return JSON.parse(localStorage.getItem('devsphere-user-rsvps') || '{}');
  } catch (e) {
    return {};
  }
}

function saveUserRsvp(eventId, rsvpDetails) {
  const current = getUserRsvps();
  current[eventId] = rsvpDetails;
  localStorage.setItem('devsphere-user-rsvps', JSON.stringify(current));
}

function openRsvpModal(eventId) {
  const events = getStoredEvents();
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  activeRsvpEvent = evt;

  document.getElementById('modal-event-title').textContent = evt.title;
  document.getElementById('modal-event-meta').textContent = `${evt.date} • ${evt.time} • ${evt.venue}`;
  document.getElementById('modal-event-seats').textContent = `${evt.seatsLeft} seats remaining`;
  document.getElementById('modal-event-id-hidden').value = evt.id;

  // Pre-fill student info from active authenticated session or cached profile
  const activeSession = window.AuthEngine && window.AuthEngine.getActiveSession ? window.AuthEngine.getActiveSession() : null;
  const cachedProfile = JSON.parse(localStorage.getItem('devsphere-student-profile') || '{}');
  
  const currentName = activeSession?.name || cachedProfile?.name || '';
  const currentEmail = activeSession?.email || cachedProfile?.email || '';
  const currentUsn = activeSession?.usn || cachedProfile?.studentId || '';
  const currentYear = cachedProfile?.year || '2nd Year';

  document.getElementById('rsvp-name').value = currentName;
  document.getElementById('rsvp-email').value = currentEmail;
  document.getElementById('rsvp-student-id').value = currentUsn;
  const yearSelect = document.getElementById('rsvp-year');
  if (yearSelect && currentYear) yearSelect.value = currentYear;

  // Lock branch to CSE (AI & ML)
  const deptSelect = document.getElementById('rsvp-dept');
  if (deptSelect) deptSelect.value = 'CSE (AI & ML)';

  // Dynamic Team Section Setup
  const teamSection = document.getElementById('rsvp-team-section');
  const teamSizeBadge = document.getElementById('rsvp-team-size-badge');
  const teamLeaderLabel = document.getElementById('rsvp-team-leader-label');
  const teamNameInput = document.getElementById('rsvp-team-name');
  const teammatesList = document.getElementById('rsvp-teammates-list');
  const projectLinkInput = document.getElementById('rsvp-project-link');
  const pptLinkInput = document.getElementById('rsvp-ppt-link');

  const minTeamSize = evt.minTeamSize || 1;
  const maxTeamSize = evt.maxTeamSize || 1;
  const isTeamEvent = maxTeamSize > 1 || minTeamSize > 1;

  if (teamSection) {
    if (isTeamEvent) {
      teamSection.classList.remove('hidden');
      if (teamSizeBadge) {
        teamSizeBadge.textContent = minTeamSize === maxTeamSize
          ? `Team Event (${maxTeamSize} Members)`
          : `Team: ${minTeamSize}–${maxTeamSize} Members`;
      }
      // Populate Team Capacity Range Dropdown
      const targetSizeSelect = document.getElementById('rsvp-target-team-size');
      if (targetSizeSelect) {
        targetSizeSelect.innerHTML = '';
        for (let sz = minTeamSize; sz <= maxTeamSize; sz++) {
          const opt = document.createElement('option');
          opt.value = sz;
          opt.textContent = `${sz} Members${sz === maxTeamSize ? ' (Max)' : ''}`;
          targetSizeSelect.appendChild(opt);
        }
        if (existingTeam && existingTeam.targetTeamSize) {
          targetSizeSelect.value = existingTeam.targetTeamSize;
        } else {
          targetSizeSelect.value = maxTeamSize;
        }
      }
      if (teammatesList) teammatesList.innerHTML = '';

      // Check if user is already registered in a team for this event
      const allTeams = getStoredEventTeams();
      const existingTeam = allTeams.find(t => t.eventId === evt.id && (t.leaderUsn === currentUsn || (t.members || []).some(m => m.usn === currentUsn)));

      if (existingTeam) {
        if (teamNameInput) teamNameInput.value = existingTeam.teamName;
        if (projectLinkInput) projectLinkInput.value = existingTeam.projectLink || '';
        if (pptLinkInput) pptLinkInput.value = existingTeam.pptLink || '';

        const isLeader = existingTeam.leaderUsn === currentUsn;
        if (teamLeaderLabel) {
          teamLeaderLabel.textContent = isLeader 
            ? `${existingTeam.leaderName} (You - Team Leader)` 
            : `${existingTeam.leaderName} (Team Leader)`;
        }

        // Populate existing teammates
        (existingTeam.members || []).forEach(m => {
          addTeammateRow(m.usn, m.name);
        });
      } else {
        if (teamNameInput) teamNameInput.value = '';
        if (projectLinkInput) projectLinkInput.value = '';
        if (pptLinkInput) pptLinkInput.value = '';
        if (teamLeaderLabel) {
          teamLeaderLabel.textContent = currentName 
            ? `${currentName} (Team Leader)` 
            : 'Current Registrant (Designated Team Leader)';
        }
      }
    } else {
      teamSection.classList.add('hidden');
    }
  }

  // Show modal
  const modal = document.getElementById('rsvp-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  if (window.lucide) window.lucide.createIcons();
}

function closeRsvpModal() {
  const modal = document.getElementById('rsvp-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
  activeRsvpEvent = null;
}

function addTeammateRow(initialUsn = '', initialName = '') {
  const container = document.getElementById('rsvp-teammates-list');
  if (!container) return;

  const maxTeamSize = (activeRsvpEvent && activeRsvpEvent.maxTeamSize) ? activeRsvpEvent.maxTeamSize : 4;
  const currentCount = container.querySelectorAll('.teammate-row').length + 1; // +1 for Leader

  if (currentCount >= maxTeamSize && !initialUsn) {
    showToast(`Maximum team size reached (${maxTeamSize} members allowed).`, 'alert-circle');
    return;
  }

  const row = document.createElement('div');
  row.className = 'teammate-row flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800';
  row.innerHTML = `
    <span class="text-[10px] font-mono font-bold text-slate-400 w-4">${currentCount + 1}.</span>
    <input 
      type="text" 
      class="teammate-usn flex-1 px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" 
      placeholder="USN (e.g. 2392608102)" 
      value="${initialUsn || ''}">
    <input 
      type="text" 
      class="teammate-name flex-1 px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" 
      placeholder="Teammate Full Name" 
      value="${initialName || ''}">
    <button 
      type="button" 
      onclick="this.closest('.teammate-row').remove()" 
      class="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer" 
      title="Remove member">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
    </button>
  `;

  container.appendChild(row);
  if (window.lucide) window.lucide.createIcons();
}

function handleRsvpSubmit(e) {
  e.preventDefault();
  if (!activeRsvpEvent) return;

  const name = document.getElementById('rsvp-name').value.trim();
  const email = document.getElementById('rsvp-email').value.trim();
  const studentId = document.getElementById('rsvp-student-id').value.trim();
  const dept = 'CSE (AI & ML)';
  const year = document.getElementById('rsvp-year').value;

  // USN validation: 2392608001 to 2392608302
  const usnNum = parseInt(studentId, 10);
  if (isNaN(usnNum) || usnNum < 2392608001 || usnNum > 2392608302) {
    showToast('USN must be between 2392608001 and 2392608302.', 'alert-circle');
    return;
  }

  // Cache student info for convenient subsequent RSVPs
  localStorage.setItem('devsphere-student-profile', JSON.stringify({ name, email, studentId, dept, year }));

  const minTeamSize = activeRsvpEvent.minTeamSize || 1;
  const maxTeamSize = activeRsvpEvent.maxTeamSize || 1;
  const isTeamEvent = maxTeamSize > 1 || minTeamSize > 1;

  let teamRecord = null;

  if (isTeamEvent) {
    const teamNameInput = document.getElementById('rsvp-team-name');
    const teamName = teamNameInput ? teamNameInput.value.trim() : '';
    if (!teamName) {
      showToast('Please enter a team name.', 'alert-circle');
      if (teamNameInput) teamNameInput.focus();
      return;
    }

    // Collect and validate teammates
    const teammateRows = document.querySelectorAll('.teammate-row');
    const teammates = [];
    const seenUsns = new Set([studentId]);

    for (const row of teammateRows) {
      const u = (row.querySelector('.teammate-usn')?.value || '').trim();
      const n = (row.querySelector('.teammate-name')?.value || '').trim();

      if (!u || !n) {
        showToast('Please provide both USN and Full Name for all added teammates.', 'alert-circle');
        return;
      }

      const uNum = parseInt(u, 10);
      if (isNaN(uNum) || uNum < 2392608001 || uNum > 2392608302) {
        showToast(`Teammate USN ${u} must be between 2392608001 and 2392608302.`, 'alert-circle');
        return;
      }

      if (u === studentId) {
        showToast(`Teammate USN ${u} cannot be the same as Team Leader USN.`, 'alert-circle');
        return;
      }

      if (seenUsns.has(u)) {
        showToast(`Duplicate USN ${u} detected in team roster. Each member must be unique.`, 'alert-circle');
        return;
      }

      seenUsns.add(u);
      teammates.push({ usn: u, name: n });
    }

    const totalMembers = 1 + teammates.length;
    if (totalMembers < minTeamSize) {
      showToast(`This event requires a minimum of ${minTeamSize} team members. Currently: ${totalMembers}.`, 'alert-circle');
      return;
    }

    const targetTeamSize = parseInt(document.getElementById('rsvp-target-team-size')?.value || maxTeamSize, 10);
    if (totalMembers > targetTeamSize) {
      showToast(`Selected team size is ${targetTeamSize} members. You have currently added ${totalMembers}. Adjust roster or team size.`, 'alert-circle');
      return;
    }

    // --- STRICT MUTUAL EXCLUSIVITY ENFORCEMENT ---
    // A person in one group cannot register in another team. To do so, they must get out (leave) from existing team.
    const allTeams = getStoredEventTeams();
    const allRosterUsns = [studentId, ...teammates.map(t => t.usn)];

    for (const existingTeam of allTeams) {
      if (existingTeam.eventId === activeRsvpEvent.id) {
        // Is this the team currently being updated by its own leader?
        const isCurrentLeaderUpdating = existingTeam.leaderUsn === studentId;

        for (const u of allRosterUsns) {
          const inThisTeam = (existingTeam.leaderUsn === u) || (existingTeam.members || []).some(m => m.usn === u);
          
          if (inThisTeam && !isCurrentLeaderUpdating) {
            const memberObj = u === studentId 
              ? { name, usn: studentId } 
              : (teammates.find(t => t.usn === u) || { name: u, usn: u });

            alert(
              `[Mutual Exclusivity Enforced]\n\n` +
              `Student: ${memberObj.name} (USN: ${memberObj.usn})\n` +
              `Status: Already registered in team "${existingTeam.teamName}" for this event.\n\n` +
              `Rule: A student in one group cannot register in another team. ` +
              `To join this team, they must first get out (leave or disband) from team "${existingTeam.teamName}".`
            );
            return;
          }
        }
      }
    }

    const projectLink = (document.getElementById('rsvp-project-link')?.value || '').trim();
    const pptLink = (document.getElementById('rsvp-ppt-link')?.value || '').trim();
    const isDeliverablesSubmitted = Boolean(projectLink && pptLink);

    // Save or update team in bst_event_teams
    let currentTeams = getStoredEventTeams();
    const existingTeamIdx = currentTeams.findIndex(t => t.eventId === activeRsvpEvent.id && t.leaderUsn === studentId);

    const generatedCode = 'BST-' + teamName.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    if (existingTeamIdx !== -1) {
      currentTeams[existingTeamIdx] = {
        ...currentTeams[existingTeamIdx],
        teamName,
        leaderName: name,
        leaderUsn: studentId,
        leaderEmail: email,
        targetTeamSize,
        inviteCode: currentTeams[existingTeamIdx].inviteCode || generatedCode,
        members: teammates,
        projectLink,
        pptLink,
        status: isDeliverablesSubmitted ? 'SUBMITTED' : 'NOT SUBMITTED',
        updatedAt: new Date().toISOString()
      };
      teamRecord = currentTeams[existingTeamIdx];
    } else {
      teamRecord = {
        id: `team-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        eventId: activeRsvpEvent.id,
        eventTitle: activeRsvpEvent.title,
        teamName,
        leaderName: name,
        leaderUsn: studentId,
        leaderEmail: email,
        targetTeamSize,
        inviteCode: generatedCode,
        members: teammates,
        projectLink,
        pptLink,
        status: isDeliverablesSubmitted ? 'SUBMITTED' : 'NOT SUBMITTED',
        registeredAt: new Date().toISOString()
      };
      currentTeams.push(teamRecord);
    }

    saveStoredEventTeams(currentTeams);
  }

  // Generate unique ticket number
  const ticketId = `BST-${studentId.slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

  const rsvpRecord = {
    ticketId,
    eventId: activeRsvpEvent.id,
    eventTitle: activeRsvpEvent.title,
    eventDate: activeRsvpEvent.date,
    eventTime: activeRsvpEvent.time,
    eventVenue: activeRsvpEvent.venue,
    registeredAt: new Date().toISOString(),
    studentName: name,
    studentEmail: email,
    studentId: studentId,
    department: 'CSE (AI & ML)',
    year: year,
    teamId: teamRecord ? teamRecord.id : null,
    teamName: teamRecord ? teamRecord.teamName : null,
    role: teamRecord ? 'Team Leader' : 'Attendee'
  };

  saveUserRsvp(activeRsvpEvent.id, rsvpRecord);

  // Cloud sync (Option A)
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    window.SupabaseEngine.insertRsvp(rsvpRecord).catch(err => {
      console.warn('[Supabase] RSVP insert error:', err);
    });
  }

  // Decrement seat count in stored events
  let events = getStoredEvents();
  const currentIdx = events.findIndex(ev => ev.id === activeRsvpEvent.id);
  if (currentIdx !== -1 && events[currentIdx].seatsLeft > 0) {
    events[currentIdx].seatsLeft -= 1;
    saveStoredEvents(events);
    if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
      window.SupabaseEngine.saveEvent(events[currentIdx]).catch(() => {});
    }
  }

  closeRsvpModal();
  renderEvents();
  renderClubOverview();
  updateRsvpBadges();
  openPassModal(activeRsvpEvent.id);
  showToast(teamRecord ? `Team "${teamRecord.teamName}" registered! Pass ready.` : 'RSVP Confirmed! Your admission pass is ready.', 'check-circle-2');
}

function openPassModal(eventId) {
  const userRsvps = getUserRsvps();
  const rsvp = userRsvps[eventId];
  if (!rsvp) return;

  const modal = document.getElementById('pass-modal');
  
  document.getElementById('pass-ticket-id').textContent = rsvp.ticketId;
  document.getElementById('pass-event-title').textContent = rsvp.eventTitle;
  document.getElementById('pass-student-name').textContent = rsvp.studentName;
  document.getElementById('pass-student-id').textContent = rsvp.studentId;
  document.getElementById('pass-datetime').textContent = `${rsvp.eventDate} | ${rsvp.eventTime}`;
  document.getElementById('pass-venue').textContent = rsvp.eventVenue;
  document.getElementById('pass-meta').textContent = `CSE (AI & ML) (${rsvp.year})`;

  // Display Team Details if attendee belongs to a team
  const teamContainer = document.getElementById('pass-team-container');
  const teamNameEl = document.getElementById('pass-team-name');
  const teamRoleBadge = document.getElementById('pass-team-role-badge');
  const teamMembersEl = document.getElementById('pass-team-members');
  const teamStatusEl = document.getElementById('pass-team-submission-status');
  const leaveTeamBtn = document.getElementById('btn-pass-leave-team');

  const allTeams = getStoredEventTeams();
  const userTeam = allTeams.find(t => t.eventId === eventId && (t.leaderUsn === rsvp.studentId || (t.members || []).some(m => m.usn === rsvp.studentId)));

  if (teamContainer) {
    if (userTeam) {
      teamContainer.classList.remove('hidden');
      if (teamNameEl) teamNameEl.textContent = userTeam.teamName;
      
      const isLeader = userTeam.leaderUsn === rsvp.studentId;
      if (teamRoleBadge) {
        teamRoleBadge.textContent = isLeader ? 'TEAM LEADER' : 'TEAM MEMBER';
        teamRoleBadge.className = isLeader 
          ? 'px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
          : 'px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      }

      if (teamMembersEl) {
        const roster = [
          `${userTeam.leaderName} (Lead)`,
          ...(userTeam.members || []).map(m => m.name)
        ];
        teamMembersEl.textContent = `Roster: ${roster.join(', ')}`;
      }

      // Team Capacity Pill & Invite Link Box
      const filledSlots = 1 + (userTeam.members || []).length;
      const targetSize = userTeam.targetTeamSize || userTeam.maxTeamSize || 4;
      const capacityPill = document.getElementById('pass-team-capacity-pill');
      if (capacityPill) {
        capacityPill.textContent = `${filledSlots} / ${targetSize} Slots Filled`;
      }

      const inviteInput = document.getElementById('pass-team-invite-link');
      const inviteBox = document.getElementById('pass-team-invite-box');
      if (inviteInput) {
        const inviteUrl = `${window.location.origin}${window.location.pathname}?join_team=${encodeURIComponent(userTeam.id)}`;
        inviteInput.value = inviteUrl;
        if (inviteBox) {
          if (filledSlots >= targetSize) {
            inviteBox.classList.add('opacity-75');
            inviteInput.title = 'Team capacity filled';
          } else {
            inviteBox.classList.remove('opacity-75');
            inviteInput.title = 'Send this invite link to your teammates';
          }
        }
      }

      if (teamStatusEl) {
        const hasLinks = Boolean(userTeam.projectLink && userTeam.pptLink);
        teamStatusEl.textContent = hasLinks ? 'Deliverables: SUBMITTED' : 'Deliverables: NOT SUBMITTED';
        teamStatusEl.className = hasLinks 
          ? 'font-mono font-bold text-emerald-600 dark:text-emerald-400' 
          : 'font-mono font-bold text-rose-600 dark:text-rose-400';
      }

      if (leaveTeamBtn) {
        leaveTeamBtn.textContent = isLeader ? 'Disband Team' : 'Leave Team';
        leaveTeamBtn.onclick = () => leaveEventTeam(eventId, rsvp.studentId);
      }
    } else {
      teamContainer.classList.add('hidden');
    }
  }

  renderTicketQr(rsvp.ticketId);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  const calBtn = document.getElementById('pass-cal-btn');
  if (calBtn) {
    calBtn.onclick = () => downloadIcsFile(rsvp);
  }

  if (window.lucide) window.lucide.createIcons();
}

function leaveEventTeam(eventId, studentUsn) {
  let teams = getStoredEventTeams();
  const teamIdx = teams.findIndex(t => t.eventId === eventId && (t.leaderUsn === studentUsn || (t.members || []).some(m => m.usn === studentUsn)));
  
  if (teamIdx === -1) {
    showToast('No active team found for this event.', 'alert-circle');
    return;
  }

  const team = teams[teamIdx];
  const isLeader = team.leaderUsn === studentUsn;

  if (isLeader) {
    const confirmDisband = confirm(
      `As Team Leader of "${team.teamName}", leaving will disband this team for all registered teammates (${(team.members || []).length} members).\n\n` +
      `Are you sure you want to disband this team? You and your members will then be free to register in other teams.`
    );
    if (!confirmDisband) return;

    teams.splice(teamIdx, 1);
    saveStoredEventTeams(teams);

    // Remove user RSVP
    const userRsvps = getUserRsvps();
    delete userRsvps[eventId];
    localStorage.setItem('devsphere-user-rsvps', JSON.stringify(userRsvps));

    showToast(`Team "${team.teamName}" disbanded. You can now register in another team.`, 'check-circle-2');
  } else {
    const confirmLeave = confirm(
      `Are you sure you want to leave team "${team.teamName}"?\n\nYou will be removed from the roster and can then register with a different team.`
    );
    if (!confirmLeave) return;

    team.members = (team.members || []).filter(m => m.usn !== studentUsn);
    saveStoredEventTeams(teams);

    const userRsvps = getUserRsvps();
    delete userRsvps[eventId];
    localStorage.setItem('devsphere-user-rsvps', JSON.stringify(userRsvps));

    showToast(`You have left team "${team.teamName}". You can now register with another team.`, 'check-circle-2');
  }

  closePassModal();
  renderEvents();
  renderClubOverview();
  updateRsvpBadges();
}

function closePassModal() {
  const modal = document.getElementById('pass-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function renderTicketQr(text) {
  const qrBox = document.getElementById('pass-qr-box');
  if (!qrBox) return;

  const host = (window.location.hostname || '').toLowerCase();
  const baseOrigin = (host === 'localhost' || host === '127.0.0.1' || host.includes('-git-') || (host.endsWith('.vercel.app') && host !== 'bst-tech-club-2gvj.vercel.app' && host !== 'bst-tech-club.vercel.app'))
    ? 'https://bst-tech-club-2gvj.vercel.app'
    : window.location.origin;
  const verifyUrl = `${baseOrigin}/login?verify=${encodeURIComponent(text)}`;

  qrBox.innerHTML = `
    <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
      <div id="ticket-qr-canvas-box" class="w-28 h-28 flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100"></div>
      <span class="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold mt-2 tracking-wider">${text}</span>
      <span class="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Scan to Verify Admission Pass
      </span>
    </div>
  `;

  renderSmoothQrCode('ticket-qr-canvas-box', verifyUrl, 100);
}

function renderSmoothQrCode(containerId, url, size = 112) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (window.QRCode) {
    try {
      new QRCode(container, {
        text: url,
        width: size,
        height: size,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      const canvas = container.querySelector('canvas') || container.querySelector('img');
      if (canvas) {
        canvas.style.borderRadius = '6px';
        canvas.style.margin = 'auto';
        canvas.style.display = 'block';
      }
      return;
    } catch (err) {
      console.warn('[QR Render] Client-side canvas fallback:', err);
    }
  }

  // Ultra-fast progressive image fallback
  container.innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(url)}&margin=4" 
         alt="QR Pass" 
         class="w-full h-full object-contain rounded"
         loading="eager"
         onerror="this.parentElement.innerHTML='<div class=\\'font-mono text-[9px] text-center font-bold p-1\\'>PASS READY<br>${url}</div>';">
  `;
}

function downloadIcsFile(rsvp) {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BST Tech Club//Events//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${rsvp.eventTitle}`,
    `DESCRIPTION:Ticket Pass: ${rsvp.ticketId} for ${rsvp.studentName} [CSE AI & ML]`,
    `LOCATION:${rsvp.eventVenue}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rsvp.ticketId}-event.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Calendar invite (.ics) downloaded!', 'calendar');
}

function printTicketPass() {
  window.print();
}

/* ============================================================
   JOIN CLUB / RECRUITMENT MODAL
   ============================================================ */
function openJoinModal() {
  window.location.href = 'login.html?tab=register';
}

function closeJoinModal() {
  const modal = document.getElementById('join-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

/* ============================================================
   SEARCH & EVENT LISTENERS
   ============================================================ */
function setupEventListeners() {
  const searchInput = document.getElementById('event-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim();
      renderEvents();
    });
  }

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  function closeMobileMenu() {
    const m = document.getElementById('mobile-menu');
    if (m) m.classList.add('hidden');
  }
  window.closeMobileMenu = closeMobileMenu;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRsvpModal();
      closePassModal();
      closeEventEditorModal();
      closeProjectEditorModal();
    }
  });

  // Real-time synchronization across browser tabs and page navigations
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.includes('devsphere') || e.key.includes('bst')) {
      renderClubOverview();
      renderEvents();
      renderProjects();
      updateRsvpBadges();
      checkAuthNavbarState();
    }
  });

  window.addEventListener('pageshow', () => {
    renderClubOverview();
    renderEvents();
    renderProjects();
    updateRsvpBadges();
    checkAuthNavbarState();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderClubOverview();
      renderEvents();
      renderProjects();
      updateRsvpBadges();
      checkAuthNavbarState();
    }
  });
}

function updateRsvpBadges() {
  const userRsvps = getUserRsvps();
  const count = Object.keys(userRsvps).length;
  const badge = document.getElementById('user-rsvps-count');
  if (badge) {
    if (count > 0) {
      badge.textContent = `${count} Pass${count > 1 ? 'es' : ''}`;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

/* ============================================================
   TOAST NOTIFICATION COMPONENT
   ============================================================ */
function showToast(message, iconName = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"></i>
    <span class="text-slate-800 dark:text-slate-100 flex-1">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// Expose functions globally for HTML inline handlers
window.toggleTheme = toggleTheme;
window.filterEvents = filterEvents;
window.resetEventFilters = resetEventFilters;
/* ============================================================
   HACKATHON TEAMMATE JOIN & INVITE ENGINE
   ============================================================ */

function openJoinTeamModal(teamIdOrCode = '') {
  const modal = document.getElementById('join-team-modal');
  if (!modal) return;

  // Pre-fill user profile if logged in
  const session = window.AuthEngine && window.AuthEngine.getActiveSession ? window.AuthEngine.getActiveSession() : null;
  const cached = JSON.parse(localStorage.getItem('devsphere-student-profile') || '{}');

  const nameInput = document.getElementById('join-member-name');
  if (nameInput) nameInput.value = session?.name || cached?.name || '';

  const usnInput = document.getElementById('join-member-usn');
  if (usnInput) usnInput.value = session?.usn || cached?.studentId || '';

  const emailInput = document.getElementById('join-member-email');
  if (emailInput) emailInput.value = session?.email || cached?.email || '';

  const yearInput = document.getElementById('join-member-year');
  if (yearInput && cached?.year) yearInput.value = cached.year;

  // Populate open teams dropdown
  const selectDropdown = document.getElementById('join-team-select-dropdown');
  const allTeams = getStoredEventTeams();

  if (selectDropdown) {
    selectDropdown.innerHTML = '<option value="">— Or pick from open registered teams —</option>';
    allTeams.forEach(t => {
      const filled = 1 + (t.members || []).length;
      const target = t.targetTeamSize || t.maxTeamSize || 4;
      if (filled < target) {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.teamName} (${t.eventTitle || 'Event'}) — ${filled}/${target} filled`;
        selectDropdown.appendChild(opt);
      }
    });
  }

  // Hide details card initially
  const detailsCard = document.getElementById('join-team-details-card');
  if (detailsCard) detailsCard.classList.add('hidden');
  const teamHidden = document.getElementById('join-team-id-hidden');
  if (teamHidden) teamHidden.value = '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';

  if (teamIdOrCode) {
    const codeInput = document.getElementById('join-team-code-input');
    if (codeInput) codeInput.value = teamIdOrCode;
    lookupTeamByCode(teamIdOrCode);
  }

  if (window.lucide) window.lucide.createIcons();
}

function closeJoinTeamModal() {
  const modal = document.getElementById('join-team-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function lookupTeamByCode(explicitCode = '') {
  const input = document.getElementById('join-team-code-input');
  const code = (explicitCode || input?.value || '').trim();
  if (!code) {
    showToast('Please enter a team code or team ID.', 'alert-circle');
    return;
  }

  const allTeams = getStoredEventTeams();
  const normalized = code.toLowerCase();
  const team = allTeams.find(t => 
    t.id.toLowerCase() === normalized || 
    (t.inviteCode && t.inviteCode.toLowerCase() === normalized) ||
    t.teamName.toLowerCase() === normalized
  );

  if (!team) {
    showToast(`Team with code "${code}" not found. Please verify.`, 'alert-circle');
    return;
  }

  displaySelectedTeamInJoinModal(team);
}

function selectTeamFromDropdown(teamId) {
  if (!teamId) {
    const detailsCard = document.getElementById('join-team-details-card');
    if (detailsCard) detailsCard.classList.add('hidden');
    const teamHidden = document.getElementById('join-team-id-hidden');
    if (teamHidden) teamHidden.value = '';
    return;
  }
  const allTeams = getStoredEventTeams();
  const team = allTeams.find(t => t.id === teamId);
  if (team) {
    displaySelectedTeamInJoinModal(team);
  }
}

function displaySelectedTeamInJoinModal(team) {
  const detailsCard = document.getElementById('join-team-details-card');
  const nameDisplay = document.getElementById('join-team-name-display');
  const eventDisplay = document.getElementById('join-team-event-display');
  const slotsBadge = document.getElementById('join-team-slots-badge');
  const leaderDisplay = document.getElementById('join-team-leader-display');
  const rosterDisplay = document.getElementById('join-team-roster-display');
  const teamHidden = document.getElementById('join-team-id-hidden');

  const filled = 1 + (team.members || []).length;
  const target = team.targetTeamSize || team.maxTeamSize || 4;
  const isFull = filled >= target;

  if (nameDisplay) nameDisplay.textContent = team.teamName;
  if (eventDisplay) eventDisplay.textContent = team.eventTitle || 'Hackathon / Event';
  if (slotsBadge) {
    slotsBadge.textContent = isFull ? `${filled}/${target} Filled (FULL)` : `${filled}/${target} Slots Filled (${target - filled} Open)`;
    slotsBadge.className = isFull 
      ? 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200'
      : 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
  }
  if (leaderDisplay) leaderDisplay.textContent = `${team.leaderName} (${team.leaderUsn})`;
  if (rosterDisplay) {
    const list = [team.leaderName, ...(team.members || []).map(m => m.name)];
    rosterDisplay.textContent = list.join(', ');
  }
  if (teamHidden) teamHidden.value = team.id;

  if (detailsCard) detailsCard.classList.remove('hidden');

  const submitBtn = document.getElementById('btn-submit-join-team');
  if (submitBtn) {
    submitBtn.disabled = isFull;
    if (isFull) {
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Team Full';
    } else {
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      submitBtn.innerHTML = '<i data-lucide="user-check" class="w-4 h-4"></i> Confirm & Join Team';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function handleJoinTeamSubmit(e) {
  e.preventDefault();
  const teamId = document.getElementById('join-team-id-hidden')?.value;
  if (!teamId) {
    showToast('Please select or look up a valid team first.', 'alert-circle');
    return;
  }

  const allTeams = getStoredEventTeams();
  const teamIdx = allTeams.findIndex(t => t.id === teamId);
  if (teamIdx === -1) {
    showToast('Team not found.', 'alert-circle');
    return;
  }

  const team = allTeams[teamIdx];
  const name = (document.getElementById('join-member-name')?.value || '').trim();
  const usn = (document.getElementById('join-member-usn')?.value || '').trim();
  const email = (document.getElementById('join-member-email')?.value || '').trim();
  const year = document.getElementById('join-member-year')?.value || '2nd Year';

  // USN validation
  const usnNum = parseInt(usn, 10);
  if (isNaN(usnNum) || usnNum < 2392608001 || usnNum > 2392608302) {
    showToast('USN must be between 2392608001 and 2392608302.', 'alert-circle');
    return;
  }

  const targetSize = team.targetTeamSize || team.maxTeamSize || 4;
  const currentSlots = 1 + (team.members || []).length;
  if (currentSlots >= targetSize) {
    showToast(`Team "${team.teamName}" is already at full capacity (${targetSize} members).`, 'alert-circle');
    return;
  }

  // Mutual exclusivity check across all teams for this event
  for (const existingTeam of allTeams) {
    if (existingTeam.eventId === team.eventId) {
      const inThisTeam = (existingTeam.leaderUsn === usn) || (existingTeam.members || []).some(m => m.usn === usn);
      if (inThisTeam) {
        alert(
          `[Mutual Exclusivity Enforced]

` +
          `USN: ${usn}
` +
          `Status: Already registered in team "${existingTeam.teamName}" for this event.

` +
          `Rule: A student in one group cannot register in another team. To join "${team.teamName}", you must first leave or disband team "${existingTeam.teamName}".`
        );
        return;
      }
    }
  }

  // Add teammate to team roster
  team.members = team.members || [];
  team.members.push({ usn, name, email, year });
  team.updatedAt = new Date().toISOString();
  saveStoredEventTeams(allTeams);

  // Mint RSVP Pass for this teammate
  const ticketId = `BST-${usn.slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
  const rsvpRecord = {
    ticketId,
    eventId: team.eventId,
    eventTitle: team.eventTitle,
    eventDate: activeRsvpEvent?.date || 'Hackathon Track',
    eventTime: activeRsvpEvent?.time || 'Scheduled',
    eventVenue: activeRsvpEvent?.venue || 'Lab Complex',
    registeredAt: new Date().toISOString(),
    studentName: name,
    studentEmail: email,
    studentId: usn,
    department: 'CSE (AI & ML)',
    year: year,
    teamId: team.id,
    teamName: team.teamName,
    role: 'Team Member'
  };

  // Find event details for pass
  const events = getStoredEvents();
  const evt = events.find(e => e.id === team.eventId);
  if (evt) {
    rsvpRecord.eventDate = evt.date;
    rsvpRecord.eventTime = evt.time;
    rsvpRecord.eventVenue = evt.venue;
  }

  saveUserRsvp(team.eventId, rsvpRecord);

  // Save student profile
  localStorage.setItem('devsphere-student-profile', JSON.stringify({ name, email, studentId: usn, dept: 'CSE (AI & ML)', year }));

  closeJoinTeamModal();
  updateRsvpBadges();
  renderEvents();
  openPassModal(team.eventId);
  showToast(`Successfully joined "${team.teamName}"! Admission pass ready.`, 'check-circle-2');
}

function copyTeamInviteLinkFromPass() {
  const input = document.getElementById('pass-team-invite-link');
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    showToast('Team invite link copied to clipboard!', 'copy');
  }).catch(() => {
    document.execCommand('copy');
    showToast('Team invite link copied!', 'copy');
  });
}

function shareTeamInviteWhatsAppFromPass() {
  const input = document.getElementById('pass-team-invite-link');
  const teamNameEl = document.getElementById('pass-team-name');
  const teamName = teamNameEl?.textContent || 'our hackathon team';
  const link = input?.value || window.location.href;

  const text = `Hey! Join our hackathon team "${teamName}" for the upcoming BST Tech Club event:

Click this invite link to join directly:
${link}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}

function handleJoinTeamUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const joinTeamId = params.get('join_team') || params.get('team_code') || params.get('team');
  if (joinTeamId) {
    setTimeout(() => {
      openJoinTeamModal(joinTeamId);
    }, 250);
  }
}

window.openRsvpModal = openRsvpModal;
window.openJoinTeamModal = openJoinTeamModal;
window.closeJoinTeamModal = closeJoinTeamModal;
window.lookupTeamByCode = lookupTeamByCode;
window.selectTeamFromDropdown = selectTeamFromDropdown;
window.handleJoinTeamSubmit = handleJoinTeamSubmit;
window.copyTeamInviteLinkFromPass = copyTeamInviteLinkFromPass;
window.shareTeamInviteWhatsAppFromPass = shareTeamInviteWhatsAppFromPass;

window.closeRsvpModal = closeRsvpModal;
window.handleRsvpSubmit = handleRsvpSubmit;
window.openPassModal = openPassModal;
window.closePassModal = closePassModal;
window.downloadIcsFile = downloadIcsFile;
window.printTicketPass = printTicketPass;
window.openJoinModal = openJoinModal;
window.closeJoinModal = closeJoinModal;
window.toggleFaq = toggleFaq;

// Event & Project CRUD handlers
window.openEventEditorModal = openEventEditorModal;
window.closeEventEditorModal = closeEventEditorModal;
window.handleEventEditorSubmit = handleEventEditorSubmit;
window.deleteEvent = deleteEvent;
window.openProjectEditorModal = openProjectEditorModal;
window.closeProjectEditorModal = closeProjectEditorModal;
window.handleProjectEditorSubmit = handleProjectEditorSubmit;
window.deleteProject = deleteProject;
window.hasContentAdminAccess = hasContentAdminAccess;
window.syncContentAdminControls = syncContentAdminControls;
window.hasEvaluatorAccess = hasEvaluatorAccess;
window.addTeammateRow = addTeammateRow;
window.leaveEventTeam = leaveEventTeam;
window.previewEventCoverImage = previewEventCoverImage;
window.setEventCoverPreset = setEventCoverPreset;
window.clearEventCoverImage = clearEventCoverImage;

/* ============================================================
   HACKATHON & EVENT TEAMS SUBMISSIONS CONSOLE
   (Admin, Core Maintainer & Faculty Evaluator Suite)
   ============================================================ */
function openTeamSubmissionsModal() {
  if (!hasEvaluatorAccess()) {
    showToast('Access Restricted: Lead Administrator, Maintainer or Faculty Evaluator access required.', 'shield-alert');
    return;
  }

  // Populate events filter selector
  const eventSelect = document.getElementById('team-submissions-event-filter');
  if (eventSelect) {
    const events = getStoredEvents();
    const currentVal = eventSelect.value || 'ALL';
    eventSelect.innerHTML = `<option value="ALL">All Events & Hackathons</option>` +
      events.map(ev => `<option value="${ev.id}" ${ev.id === currentVal ? 'selected' : ''}>${ev.title}</option>`).join('');
  }

  renderTeamSubmissionsTable();

  const modal = document.getElementById('team-submissions-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeTeamSubmissionsModal() {
  const modal = document.getElementById('team-submissions-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function renderTeamSubmissionsTable() {
  const container = document.getElementById('team-submissions-list');
  if (!container) return;

  const teams = getStoredEventTeams();
  const filterEventId = document.getElementById('team-submissions-event-filter')?.value || 'ALL';
  const searchTerm = (document.getElementById('team-submissions-search')?.value || '').toLowerCase().trim();

  let filtered = teams.filter(t => {
    if (filterEventId !== 'ALL' && t.eventId !== filterEventId) return false;
    if (searchTerm) {
      const matchName = (t.teamName || '').toLowerCase().includes(searchTerm);
      const matchLeader = (t.leaderName || '').toLowerCase().includes(searchTerm) || (t.leaderUsn || '').includes(searchTerm);
      const matchEvent = (t.eventTitle || '').toLowerCase().includes(searchTerm);
      const matchMembers = (t.members || []).some(m => (m.name || '').toLowerCase().includes(searchTerm) || (m.usn || '').includes(searchTerm));
      return matchName || matchLeader || matchEvent || matchMembers;
    }
    return true;
  });

  // Calculate statistics
  const totalCount = filtered.length;
  const submittedCount = filtered.filter(t => t.projectLink && t.pptLink && t.status === 'SUBMITTED').length;
  const missingCount = totalCount - submittedCount;

  const countEl = document.getElementById('team-submissions-count');
  const subEl = document.getElementById('team-submissions-submitted-count');
  const missEl = document.getElementById('team-submissions-missing-count');

  if (countEl) countEl.textContent = totalCount;
  if (subEl) subEl.textContent = submittedCount;
  if (missEl) missEl.textContent = missingCount;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-12 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <i data-lucide="users" class="w-8 h-8 text-slate-400 mx-auto mb-2"></i>
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">No Teams Found</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No registered teams match the current search or event filter criteria.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(t => {
    const isComplete = Boolean(t.projectLink && t.pptLink && t.status === 'SUBMITTED');
    const membersList = (t.members && t.members.length > 0)
      ? t.members.map(m => `<span class="inline-flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">${m.name} <span class="font-mono text-slate-400 text-[10px]">(${m.usn})</span></span>`).join(' ')
      : '<span class="text-slate-400 italic text-[11px]">No additional teammates</span>';

    return `
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3">
        <!-- Team Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-sm text-slate-900 dark:text-white">${t.teamName}</h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isComplete ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse'}">
                ${isComplete ? '✓ SUBMITTED' : '⚠ NOT SUBMITTED'}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ${t.eventTitle} • Logged on ${new Date(t.registeredAt).toLocaleDateString()}
            </p>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 shrink-0">
            <button 
              type="button" 
              onclick="promptEditTeamLinks('${t.id}')" 
              class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1">
              <i data-lucide="edit-3" class="w-3 h-3"></i> Edit Links
            </button>
            <button 
              type="button" 
              onclick="toggleTeamSubmissionStatus('${t.id}')" 
              class="px-2.5 py-1 text-xs font-semibold rounded-lg ${isComplete ? 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} transition cursor-pointer">
              ${isComplete ? 'Mark Unsubmitted' : 'Mark Submitted'}
            </button>
            <button 
              type="button" 
              onclick="deleteTeamSubmission('${t.id}')" 
              class="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer" 
              title="Disband / Remove Team">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Roster Information -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">TEAM LEADER (CREATOR)</span>
            <div class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              ${t.leaderName} <span class="font-mono text-slate-400 text-[10px]">(${t.leaderUsn})</span>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">${t.leaderEmail}</div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TEAMMATES (${(t.members || []).length})</span>
            <div class="flex flex-wrap gap-1.5 mt-1">
              ${membersList}
            </div>
          </div>
        </div>

        <!-- Deliverables -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400">GitHub Code Link:</span>
            ${t.projectLink ? `
              <a href="${t.projectLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-mono text-[11px] hover:text-blue-800 truncate max-w-xs flex items-center gap-1">
                <i data-lucide="github" class="w-3 h-3"></i> ${t.projectLink}
              </a>
            ` : `
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950 dark:text-rose-400">Not Submitted</span>
            `}
          </div>

          <span class="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400">PPT Presentation:</span>
            ${t.pptLink ? `
              <a href="${t.pptLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-mono text-[11px] hover:text-blue-800 truncate max-w-xs flex items-center gap-1">
                <i data-lucide="presentation" class="w-3 h-3"></i> ${t.pptLink}
              </a>
            ` : `
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950 dark:text-rose-400">Not Submitted</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function toggleTeamSubmissionStatus(teamId) {
  let teams = getStoredEventTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  team.status = team.status === 'SUBMITTED' ? 'NOT SUBMITTED' : 'SUBMITTED';
  saveStoredEventTeams(teams);
  renderTeamSubmissionsTable();
  showToast(`Team "${team.teamName}" status changed to ${team.status}.`, 'check-circle-2');
}

function promptEditTeamLinks(teamId) {
  let teams = getStoredEventTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  const newProjectLink = prompt(`Enter GitHub / Project URL for "${team.teamName}":`, team.projectLink || '');
  if (newProjectLink === null) return;

  const newPptLink = prompt(`Enter PPT Slides Presentation URL for "${team.teamName}":`, team.pptLink || '');
  if (newPptLink === null) return;

  team.projectLink = newProjectLink.trim();
  team.pptLink = newPptLink.trim();
  team.status = (team.projectLink && team.pptLink) ? 'SUBMITTED' : 'NOT SUBMITTED';

  saveStoredEventTeams(teams);
  renderTeamSubmissionsTable();
  showToast(`Deliverables updated for team "${team.teamName}".`, 'check-circle-2');
}

function deleteTeamSubmission(teamId) {
  if (!confirm('Are you sure you want to remove/disband this registered team?')) return;
  let teams = getStoredEventTeams();
  teams = teams.filter(t => t.id !== teamId);
  saveStoredEventTeams(teams);
  renderTeamSubmissionsTable();
  showToast('Team removed from registry.', 'trash-2');
}

function exportTeamsToGoogleSpreadsheet() {
  const teams = getStoredEventTeams();
  if (teams.length === 0) {
    showToast('No registered teams available to export.', 'alert-circle');
    return;
  }

  // Generate CSV rows
  const headers = [
    'Team Name',
    'Event / Hackathon Title',
    'Team Leader Name',
    'Team Leader USN',
    'Team Leader Email',
    'Total Team Members',
    'Teammate Roster (USNs)',
    'GitHub / Project Link',
    'PPT Presentation Slides Link',
    'Submission Status',
    'Registered Timestamp'
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replaceAll('"', '""');
    return `"${s}"`;
  };

  const csvRows = [headers.map(escapeCsv).join(',')];

  teams.forEach(t => {
    const totalMembers = 1 + (t.members ? t.members.length : 0);
    const rosterStr = (t.members || []).map(m => `${m.name} (${m.usn})`).join('; ') || 'None';
    const statusText = (t.projectLink && t.pptLink && t.status === 'SUBMITTED') ? 'SUBMITTED' : 'NOT SUBMITTED';

    const row = [
      escapeCsv(t.teamName),
      escapeCsv(t.eventTitle),
      escapeCsv(t.leaderName),
      escapeCsv(t.leaderUsn),
      escapeCsv(t.leaderEmail),
      escapeCsv(totalMembers),
      escapeCsv(rosterStr),
      escapeCsv(t.projectLink || 'NOT SUBMITTED'),
      escapeCsv(t.pptLink || 'NOT SUBMITTED'),
      escapeCsv(statusText),
      escapeCsv(t.registeredAt ? new Date(t.registeredAt).toLocaleString() : '')
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const filename = `BST_Teams_Submissions_${new Date().toISOString().slice(0, 10)}.csv`;

  downloadLink.href = url;
  downloadLink.setAttribute('download', filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  // 1-Click Launch Google Spreadsheet in a new tab
  window.open('https://docs.google.com/spreadsheets/u/0/create', '_blank');

  showToast('CSV downloaded! Google Sheets opened in a new tab. Select File > Import > Upload.', 'check-circle-2');
}

/* ============================================================
   PROJECT ACADEMIC EVALUATION CONSOLE (Faculty Evaluator)
   ============================================================ */
function openProjectEvaluationModal(projectId) {
  if (!hasEvaluatorAccess()) {
    showToast('Access Restricted: Only Faculty Evaluators, Lead Administrators, and Core Maintainers can evaluate projects.', 'shield-alert');
    return;
  }

  const projects = getStoredProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  const evals = getStoredProjectEvaluations();
  const existing = evals[projectId];

  document.getElementById('eval-project-id').value = proj.id;
  document.getElementById('eval-project-title-display').textContent = proj.title;
  document.getElementById('eval-project-meta-display').textContent = `${proj.badge || 'Project'} • ${(proj.tech || []).join(', ')}`;

  const activeSession = window.AuthEngine?.getActiveSession?.();
  const defaultEvaluator = activeSession 
    ? `${activeSession.name} (${activeSession.role || 'Evaluator'})` 
    : 'Faculty Evaluator';

  document.getElementById('eval-teacher-name').value = existing?.evaluatorName || defaultEvaluator;
  document.getElementById('eval-grade-tier').value = existing?.tier || 'Outstanding (Tier A+)';
  
  const score = existing?.score ?? 85;
  document.getElementById('eval-score-range').value = score;
  document.getElementById('eval-score-number').value = score;
  document.getElementById('eval-score-display').textContent = `${score} / 100`;
  document.getElementById('eval-feedback-text').value = existing?.feedback || '';

  const modal = document.getElementById('project-evaluation-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeProjectEvaluationModal() {
  const modal = document.getElementById('project-evaluation-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function handleProjectEvaluationSubmit(e) {
  e.preventDefault();
  if (!hasEvaluatorAccess()) {
    showToast('Access Restricted: Evaluator privileges required.', 'shield-alert');
    return;
  }

  const projectId = document.getElementById('eval-project-id').value;
  const evaluatorName = document.getElementById('eval-teacher-name').value.trim();
  const tier = document.getElementById('eval-grade-tier').value;
  const score = parseInt(document.getElementById('eval-score-number').value, 10) || 85;
  const feedback = document.getElementById('eval-feedback-text').value.trim();

  let evals = getStoredProjectEvaluations();
  evals[projectId] = {
    score,
    tier,
    feedback,
    evaluatorName,
    evaluatedAt: new Date().toISOString()
  };

  saveStoredProjectEvaluations(evals);
  closeProjectEvaluationModal();
  renderProjects();
  showToast(`Academic marks & evaluation published for project!`, 'award');
}

// Window exports for submissions & evaluation consoles
window.openTeamSubmissionsModal = openTeamSubmissionsModal;
window.closeTeamSubmissionsModal = closeTeamSubmissionsModal;
window.renderTeamSubmissionsTable = renderTeamSubmissionsTable;
window.toggleTeamSubmissionStatus = toggleTeamSubmissionStatus;
window.promptEditTeamLinks = promptEditTeamLinks;
window.deleteTeamSubmission = deleteTeamSubmission;
window.exportTeamsToGoogleSpreadsheet = exportTeamsToGoogleSpreadsheet;
window.openProjectEvaluationModal = openProjectEvaluationModal;
window.closeProjectEvaluationModal = closeProjectEvaluationModal;
window.handleProjectEvaluationSubmit = handleProjectEvaluationSubmit;

/* ============================================================
   DEEPSEEK-STYLE DETECTIVE CODE LENS
   Interactive circular X-ray lens revealing programming code
   behind "Code the Future."
   ============================================================ */
function initDetectiveLens() {
  const lensWrapper = document.getElementById('code-future-lens');
  const codeContent = document.getElementById('lens-code-content');
  const langBadge = document.getElementById('lens-lang-badge');

  if (!lensWrapper || !codeContent) return;

  const codeSnippets = [
    {
      lang: 'Python 3',
      label: '🔍 Python 3 • click to switch',
      html: '<span class="text-emerald-400 font-semibold">print</span><span class="text-slate-300">(</span><span class="text-amber-300 font-medium">"Code the Future."</span><span class="text-slate-300">)</span>'
    },
    {
      lang: 'C++',
      label: '⚡ C++20 • click to switch',
      html: '<span class="text-sky-400 font-semibold">std::cout</span> <span class="text-indigo-300">&lt;&lt;</span> <span class="text-amber-300 font-medium">"Code the Future."</span><span class="text-slate-300">;</span>'
    },
    {
      lang: 'JavaScript',
      label: '🌐 JavaScript • click to switch',
      html: '<span class="text-yellow-400 font-semibold">console</span><span class="text-slate-400">.</span><span class="text-blue-400 font-semibold">log</span><span class="text-slate-300">(</span><span class="text-amber-300 font-medium">"Code the Future."</span><span class="text-slate-300">);</span>'
    },
    {
      lang: 'Rust',
      label: '🦀 Rust • click to switch',
      html: '<span class="text-orange-400 font-semibold">println!</span><span class="text-slate-300">(</span><span class="text-amber-300 font-medium">"Code the Future."</span><span class="text-slate-300">);</span>'
    },
    {
      lang: 'Java',
      label: '☕ Java • click to switch',
      html: '<span class="text-rose-400 font-semibold">System</span><span class="text-slate-400">.out.</span><span class="text-purple-400 font-semibold">println</span><span class="text-slate-300">(</span><span class="text-amber-300 font-medium">"Code the Future."</span><span class="text-slate-300">);</span>'
    }
  ];

  let currentSnippetIndex = 0;

  function updateSnippet() {
    const snippet = codeSnippets[currentSnippetIndex];
    codeContent.innerHTML = snippet.html;
    if (langBadge) {
      langBadge.textContent = snippet.label;
    }
    requestAnimationFrame(syncCodeMetrics);
  }

  // Initial render
  updateSnippet();

  /* ============================================================
     LENS ACTIVATION STATE MACHINE & ENDPOINT RANGE CALCULATION
     INACTIVE -> (enter) -> EXPAND -> ACTIVE (compact size) -> (leave) -> CONTRACT -> INACTIVE
     ============================================================ */
  const INACTIVE_RADIUS = 8;
  function getTargetRadius() {
    return window.innerWidth <= 640 ? 24 : 30;
  }

  let lensState = 'INACTIVE'; // 'INACTIVE' | 'EXPANDING' | 'ACTIVE' | 'CONTRACTING'
  let currentRadius = INACTIVE_RADIUS;
  let animRafId = null;

  // Spring curve for snappy tactile expansion (fast start, slight overshoot, settles smoothly)
  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Smooth quadratic easing for clean exit contraction
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function setRadius(r) {
    currentRadius = r;
    lensWrapper.style.setProperty('--lens-radius', `${Math.round(r)}px`);
  }

  // Calculate actual rendered code bounds and exact minLensX / maxLensX movement range
  function syncCodeMetrics() {
    const wrapperRect = lensWrapper.getBoundingClientRect();
    const codeRect = codeContent.getBoundingClientRect();
    const radius = currentRadius || getTargetRadius();

    // Actual code element bounding box relative to lensWrapper
    const codeLeft = codeRect.left - wrapperRect.left;
    const codeRight = codeRect.right - wrapperRect.left;

    // Minimum X: position lens so visible circular area covers the first code characters
    const minLensX = Math.round(codeLeft + radius);
    // Maximum X: position lens so visible circular area covers the last code characters
    const maxLensX = Math.round(codeRight - radius);

    // Expand the invisible interaction area and reveal background to cover the full code extent plus radius
    const overflowLeft = Math.max(0, -codeLeft);
    const overflowRight = Math.max(0, codeRight - wrapperRect.width);
    const offsetX = Math.max(overflowLeft, overflowRight) + radius + 40;

    lensWrapper.style.setProperty('--lens-offset-x', `${Math.round(offsetX)}px`);
    lensWrapper.style.setProperty('--lens-offset-y', '32px');

    return { minLensX, maxLensX, wrapperRect, radius };
  }

  // Initial inactive state and metrics setup
  setRadius(INACTIVE_RADIUS);
  lensWrapper.style.setProperty('--lens-opacity', '0');
  requestAnimationFrame(syncCodeMetrics);
  window.addEventListener('resize', syncCodeMetrics);

  function updatePosition(clientX, clientY) {
    const metrics = syncCodeMetrics();
    const wrapperRect = metrics.wrapperRect;
    const minLensX = metrics.minLensX;
    const maxLensX = metrics.maxLensX;
    const radius = metrics.radius;

    const rawX = Math.round(clientX - wrapperRect.left);
    // Clamp lens movement strictly between minLensX and maxLensX as calculated
    const clampedX = Math.max(minLensX, Math.min(rawX, maxLensX));

    const rawY = Math.round(clientY - wrapperRect.top);
    const clampedY = Math.max(Math.round(radius * 0.4), Math.min(rawY, Math.round(wrapperRect.height - radius * 0.4)));

    lensWrapper.style.setProperty('--lens-x', `${clampedX}px`);
    lensWrapper.style.setProperty('--lens-y', `${clampedY}px`);
  }

  // 1. ENTER / ACTIVATE: Trigger expansion ONCE
  function activateLens(clientX, clientY) {
    // If already active or currently expanding, simply update position and return
    if (lensState === 'ACTIVE' || lensState === 'EXPANDING') {
      updatePosition(clientX, clientY);
      return;
    }

    if (animRafId) cancelAnimationFrame(animRafId);

    lensState = 'EXPANDING';
    updatePosition(clientX, clientY);
    lensWrapper.style.setProperty('--lens-opacity', '1');

    const startRadius = currentRadius;
    const targetRadius = getTargetRadius();
    const duration = 240; // Snappy compact spring expansion
    const startTime = performance.now();

    function springStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const springVal = easeOutBack(progress);
      const r = startRadius + (targetRadius - startRadius) * springVal;
      setRadius(r);

      if (progress < 1) {
        animRafId = requestAnimationFrame(springStep);
      } else {
        // Settle firmly at the fixed compact DeepSeek target diameter
        setRadius(targetRadius);
        lensState = 'ACTIVE';
        animRafId = null;
      }
    }

    animRafId = requestAnimationFrame(springStep);
  }

  // 2. LEAVE / DEACTIVATE: Smoothly contract back to inactive state
  function deactivateLens() {
    if (lensState === 'INACTIVE' || lensState === 'CONTRACTING') return;

    if (animRafId) cancelAnimationFrame(animRafId);

    lensState = 'CONTRACTING';
    const startRadius = currentRadius;
    const targetRadius = INACTIVE_RADIUS;
    const duration = 180; // Smooth compact contraction exit
    const startTime = performance.now();

    function contractStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeVal = easeInOutQuad(progress);
      const r = startRadius + (targetRadius - startRadius) * easeVal;
      setRadius(r);

      // Smoothly fade opacity alongside contraction
      lensWrapper.style.setProperty('--lens-opacity', `${Math.max(0, 1 - progress).toFixed(2)}`);

      if (progress < 1) {
        animRafId = requestAnimationFrame(contractStep);
      } else {
        setRadius(INACTIVE_RADIUS);
        lensWrapper.style.setProperty('--lens-opacity', '0');
        lensState = 'INACTIVE';
        animRafId = null;
      }
    }

    animRafId = requestAnimationFrame(contractStep);
  }

  // Pointer interactions
  lensWrapper.addEventListener('mouseenter', (e) => {
    activateLens(e.clientX, e.clientY);
  });

  lensWrapper.addEventListener('mousemove', (e) => {
    if (lensState === 'INACTIVE') {
      activateLens(e.clientX, e.clientY);
    } else {
      // While active or expanding: ONLY track coordinates, never resize or re-trigger
      updatePosition(e.clientX, e.clientY);
    }
  });

  lensWrapper.addEventListener('mouseleave', () => {
    deactivateLens();
  });

  // Click to cycle programming languages
  lensWrapper.addEventListener('click', (e) => {
    e.preventDefault();
    currentSnippetIndex = (currentSnippetIndex + 1) % codeSnippets.length;
    updateSnippet();
    if (window.showToast) {
      showToast(`Detective Lens: ${codeSnippets[currentSnippetIndex].lang} selected`, 'code');
    }
  });

  // Touch interactions for mobile / tablet devices
  let touchEndTimer = null;

  lensWrapper.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      clearTimeout(touchEndTimer);
      activateLens(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  lensWrapper.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      clearTimeout(touchEndTimer);
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  lensWrapper.addEventListener('touchend', () => {
    touchEndTimer = setTimeout(deactivateLens, 900);
  });
}

window.initDetectiveLens = initDetectiveLens;

/* ============================================================
   LIQUID EFFECT (GPU WebGL Interactive Fluid Surface)
   ============================================================ */
function initLiquidCanvas() {
  const container = document.getElementById('liquid-effect-container');
  if (!container) return;

  // Check if LiquidEffect class is loaded
  if (typeof window.LiquidEffect !== 'undefined') {
    window.liquidEffect = new window.LiquidEffect(container, {
      intensity: 0.55,
      interactive: true
    });

    // Subtle physical reactivity on developer canvas controls
    const interactiveElements = document.querySelectorAll('.pillar-interactive-badge, .cta-liquid-hover');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (window.liquidEffect) window.liquidEffect.setIntensity(0.78);
      });
      el.addEventListener('mouseleave', () => {
        if (window.liquidEffect) window.liquidEffect.setIntensity(0.55);
      });
      el.addEventListener('mousedown', (e) => {
        if (window.liquidEffect) {
          window.liquidEffect.setIntensity(0.95);
          const rect = container.getBoundingClientRect();
          const u = (e.clientX - rect.left) / rect.width;
          const v = 1.0 - (e.clientY - rect.top) / rect.height;
          window.liquidEffect.addRipple(u, v, 1.2);
        }
      });
      el.addEventListener('mouseup', () => {
        if (window.liquidEffect) window.liquidEffect.setIntensity(0.65);
      });
    });
  } else {
    // Retry shortly if Three.js / LiquidEffect script is still loading asynchronously
    setTimeout(initLiquidCanvas, 150);
  }
}

window.initLiquidCanvas = initLiquidCanvas;

/**
 * Vercel / Linear Spotlight Cursor Border Glow on Cards
 */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.academic-card');
  cards.forEach(card => {
    let bounds = null;
    const updateBounds = () => { bounds = card.getBoundingClientRect(); };
    window.addEventListener('resize', updateBounds, { passive: true });
    window.addEventListener('scroll', updateBounds, { passive: true });
    card.addEventListener('pointerenter', updateBounds, { passive: true });

    let rafId = null;
    card.addEventListener('pointermove', (e) => {
      if (!bounds) updateBounds();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          rafId = null;
        });
      }
    }, { passive: true });
  });
}

window.initSpotlightCards = initSpotlightCards;


