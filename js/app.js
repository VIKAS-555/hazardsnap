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

function syncContentAdminControls() {
  const canEdit = hasContentAdminAccess();
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
      localStorage.setItem('devsphere_members_vault_v1', JSON.stringify(members));
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
        localStorage.setItem('devsphere_members_vault_v1', JSON.stringify(members));
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
      <div class="academic-card rounded-2xl overflow-hidden flex flex-col justify-between relative group" id="event-card-${evt.id}">
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
  } else {
    titleEl.textContent = 'Schedule New Event';
    idInput.value = '';
    document.getElementById('edit-event-seats').value = 90;
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

function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const projects = getStoredProjects();
  const canManage = hasContentAdminAccess();

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

  container.innerHTML = projects.map(proj => `
    <div class="academic-card p-6 rounded-2xl flex flex-col justify-between group relative">
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
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          ${proj.description}
        </p>
      </div>

      <div>
        <div class="flex flex-wrap gap-1.5 mb-5">
          ${(proj.tech || []).map(t => `
            <span class="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              ${t}
            </span>
          `).join('')}
        </div>

        <div class="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
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
      </div>
    </div>
  `).join('');

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
  
  if (activeSession) {
    document.getElementById('rsvp-name').value = activeSession.name || '';
    document.getElementById('rsvp-email').value = activeSession.email || '';
    document.getElementById('rsvp-student-id').value = activeSession.usn || '';
  } else {
    if (cachedProfile.name) document.getElementById('rsvp-name').value = cachedProfile.name;
    if (cachedProfile.email) document.getElementById('rsvp-email').value = cachedProfile.email;
    if (cachedProfile.studentId) document.getElementById('rsvp-student-id').value = cachedProfile.studentId;
    if (cachedProfile.year) document.getElementById('rsvp-year').value = cachedProfile.year;
  }

  // Lock branch to CSE (AI & ML)
  const deptSelect = document.getElementById('rsvp-dept');
  if (deptSelect) deptSelect.value = 'CSE (AI & ML)';

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

  // Cache student info for convenient 1-click subsequent RSVPs
  localStorage.setItem('devsphere-student-profile', JSON.stringify({ name, email, studentId, dept, year }));

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
    year: year
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
  showToast('RSVP Confirmed! Your admission pass is ready.', 'check-circle-2');
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
window.openRsvpModal = openRsvpModal;
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


