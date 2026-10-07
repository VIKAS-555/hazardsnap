/**
 * BST Tech Club Web App - Core Interactivity & Dynamic Content Engine
 * Branch: CSE (AI & ML)
 * Domains: Competative Programming, Robotics, Open Source, Hackathon
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
  initAiAdvisor();
  
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
   ACTIVE MEMBER SESSION SYNC
   ============================================================ */
function checkAuthNavbarState() {
  const session = window.AuthEngine && window.AuthEngine.getActiveSession ? window.AuthEngine.getActiveSession() : null;
  const navText = document.getElementById('nav-auth-text');
  const navLink = document.getElementById('nav-auth-link');
  const verifiedDot = document.getElementById('nav-verified-dot');

  if (session && navText && navLink) {
    navText.textContent = `${session.techClubId} (${session.name.split(' ')[0]})`;
    navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm border border-blue-400/40';
    if (verifiedDot) verifiedDot.classList.remove('hidden');
  } else if (navLink) {
    if (navText) navText.textContent = 'BST Member Portal';
    navLink.className = 'holographic-id-badge inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm border border-blue-500/40';
    if (verifiedDot) verifiedDot.classList.add('hidden');
  }
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
        <div class="mt-2 text-[10px] text-slate-400 font-mono">Department Cohort</div>
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

  // If no events exist in the club
  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="calendar" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">No Events Scheduled Yet</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
          The schedule is currently clear. Club leads and coordinators can add workshops, labs, and hackathons below.
        </p>
        <button onclick="openEventEditorModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition">
          <i data-lucide="plus" class="w-4 h-4"></i> Add New Event
        </button>
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
              <!-- Edit & Delete Controls -->
              <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                <button onclick="openEventEditorModal('${evt.id}')" title="Edit Event" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition">
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="deleteEvent('${evt.id}')" title="Delete Event" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
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
    document.getElementById('edit-event-category').value = evt.category || 'Competative Programming';
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

  // If empty state
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="folder-code" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">No Projects Published Yet</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
          Members can publish their projects built in Competative Programming, Robotics, Open Source, or Hackathons.
        </p>
        <button onclick="openProjectEditorModal()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition">
          <i data-lucide="plus" class="w-4 h-4"></i> Add First Project
        </button>
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
            ${proj.category}
          </span>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              ${proj.badge || 'Project'}
            </span>
            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
              <button onclick="openProjectEditorModal('${proj.id}')" title="Edit Project" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition">
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="deleteProject('${proj.id}')" title="Delete Project" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
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
    document.getElementById('edit-project-category').value = proj.category || 'Competative Programming';
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

  const baseOrigin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'https://bst-club-portal.vercel.app'
    : window.location.origin;
  const verifyUrl = `${baseOrigin}/login.html?verify=${encodeURIComponent(text)}`;

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
      updateRsvpBadges();
      checkAuthNavbarState();
    }
  });

  window.addEventListener('pageshow', () => {
    renderClubOverview();
    renderEvents();
    updateRsvpBadges();
    checkAuthNavbarState();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      renderClubOverview();
      renderEvents();
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
   BST AI ADVISOR & QUERY ENGINE (Google Gemini & Semantic Brain)
   ============================================================ */

const AI_CONFIG_KEY = 'bst_ai_settings_v1';

function getAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    model: 'gemini-1.5-flash',
    apiKey: '',
  };
}

function saveAiConfig(cfg) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {}
}

function initAiAdvisor() {
  const cfg = getAiConfig();
  const select = document.getElementById('ai-model-select');
  const keyInput = document.getElementById('ai-custom-key-input');

  if (select) select.value = cfg.model || 'gemini-1.5-flash';
  if (keyInput && cfg.apiKey) keyInput.value = cfg.apiKey;
  updateAiModelBadge();
}

function updateAiModelBadge() {
  const cfg = getAiConfig();
  const badge = document.getElementById('ai-model-active-badge');
  if (!badge) return;
  if (cfg.apiKey) {
    badge.textContent = cfg.model === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash';
  } else if (cfg.model === 'builtin-smart') {
    badge.textContent = 'Built-in Brain';
  } else {
    badge.textContent = 'Gemini Flash • Instant Mode';
  }
}

function toggleAiSettingsDrawer() {
  const drawer = document.getElementById('ai-settings-drawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function handleModelChange() {
  const select = document.getElementById('ai-model-select');
  if (!select) return;
  const cfg = getAiConfig();
  cfg.model = select.value;
  saveAiConfig(cfg);
  updateAiModelBadge();
}

function saveAiSettings() {
  const select = document.getElementById('ai-model-select');
  const keyInput = document.getElementById('ai-custom-key-input');
  const cfg = {
    model: select ? select.value : 'gemini-1.5-flash',
    apiKey: keyInput ? keyInput.value.trim() : ''
  };
  saveAiConfig(cfg);
  updateAiModelBadge();
  toggleAiSettingsDrawer();
  if (window.showToast) {
    showToast('AI Advisor configuration updated.', 'check');
  }
}

function clearAiKey() {
  const keyInput = document.getElementById('ai-custom-key-input');
  if (keyInput) keyInput.value = '';
  const cfg = getAiConfig();
  cfg.apiKey = '';
  saveAiConfig(cfg);
  updateAiModelBadge();
  if (window.showToast) {
    showToast('API Key cleared. Using built-in engine.', 'info');
  }
}

function fillAndAskAi(question) {
  const input = document.getElementById('ai-user-query');
  if (input) {
    input.value = question;
    input.focus();
    executeAiQuery(question);
  }
}

function handleAiQuery(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('ai-user-query');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  executeAiQuery(query);
}

async function executeAiQuery(query) {
  const container = document.getElementById('ai-response-container');
  const loading = document.getElementById('ai-loading-state');
  const content = document.getElementById('ai-answer-content');
  const modelTag = document.getElementById('ai-response-model-tag');
  const submitBtn = document.getElementById('ai-submit-button');

  if (!container || !loading || !content) return;

  // Show container and loading state
  container.classList.remove('hidden');
  loading.classList.remove('hidden');
  content.innerHTML = '';
  if (submitBtn) submitBtn.disabled = true;

  if (window.lucide) window.lucide.createIcons();

  const cfg = getAiConfig();

  try {
    let answerText = '';
    let usedModel = 'Gemini 1.5 Flash';

    if (cfg.apiKey && cfg.model !== 'builtin-smart') {
      usedModel = cfg.model === 'gemini-1.5-pro' ? 'Google Gemini 1.5 Pro' : 'Google Gemini 1.5 Flash';
      answerText = await callGeminiApi(query, cfg.apiKey, cfg.model);
    } else {
      // Use built-in intelligent engine with slight human-like thinking delay (350ms)
      await new Promise(r => setTimeout(r, 380));
      usedModel = 'BST CSE (AI & ML) Knowledge Brain';
      answerText = generateBuiltinAiAnswer(query);
    }

    if (modelTag) modelTag.textContent = `${usedModel} Answer`;
    renderAiAnswer(answerText);
  } catch (err) {
    console.warn('Gemini API call failed, falling back to built-in knowledge engine:', err);
    if (modelTag) modelTag.textContent = 'BST Knowledge Engine (Fallback)';
    const fallbackAnswer = generateBuiltinAiAnswer(query);
    renderAiAnswer(fallbackAnswer);
  } finally {
    loading.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderAiAnswer(markdownText) {
  const content = document.getElementById('ai-answer-content');
  if (!content) return;
  content.innerHTML = formatMarkdownToHtml(markdownText);
  content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeAiResponse() {
  const container = document.getElementById('ai-response-container');
  if (container) container.classList.add('hidden');
}

function copyAiResponse() {
  const content = document.getElementById('ai-answer-content');
  if (!content) return;
  const text = content.innerText;
  navigator.clipboard.writeText(text).then(() => {
    if (window.showToast) showToast('AI response copied to clipboard!', 'copy');
  }).catch(() => {
    if (window.showToast) showToast('Failed to copy.', 'alert-circle');
  });
}

async function callGeminiApi(prompt, apiKey, model = 'gemini-1.5-flash') {
  const events = getStoredEvents();
  const projects = getStoredProjects();
  
  const systemContext = `
You are the official Technical Advisor and Club AI for BST Tech Club at Bosscoder School of Technology.
Department: Department of Computer Science & Engineering (AI & ML).
Target Cohort: 2026.
Eligibility Rule: ONLY students with USNs strictly in the range 2392608001 through 2392608302 are eligible to register. If asked about a USN, check if it is within 2392608001-2392608302 and state the verdict clearly.
The club has 4 core technical verticals:
1. Competative Programming (C++, Python, DSA, contest strategy, Codeforces, LeetCode, CodeChef, ICPC preparation).
2. Robotics (Autonomous rovers, ROS 2, OpenCV computer vision, sensor fusion, Arduino/ESP32, edge AI navigation).
3. Open Source (Git/GitHub mastery, contributing to production repositories, pull requests, Linux, Hacktoberfest).
4. Hackathon (24-48 hour rapid prototyping sprints, full-stack MVP architecture, pitch presentations, AI app integrations).
Workshops are 100% free for department undergraduates.
RSVPs generate personalized digital ticket passes with unique verification codes and QR codes.
Currently scheduled events in club registry: ${events.length > 0 ? events.map(e => `${e.title} (${e.date}, ${e.venue}, ${e.seats} seats)`).join('; ') : 'No upcoming workshops scheduled right now, new labs announced weekly.'}
Student projects showcase: ${projects.length > 0 ? projects.map(p => `${p.title} (${p.category})`).join('; ') : 'Student project submissions are currently open.'}
Contact & Faculty Advisor: contact@bsttechclub.edu

Guidelines for your response:
- Be concise, direct, helpful, and welcoming.
- Use clear bullet points and bold formatting for key details.
- If recommending domain tracks for a beginner, recommend starting with Open Source or Competitive Programming before stepping into Hackathons and Robotics.
- If relevant, include actionable steps.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nStudent Question: ${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error status: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response text generated.');
  return text;
}

function generateBuiltinAiAnswer(query) {
  const q = query.toLowerCase().trim();
  const events = getStoredEvents();

  // 1. Check for USN number verification
  const usnMatch = query.match(/\b(2392\d{6}|\d{10})\b/);
  if (usnMatch || q.includes('usn') || q.includes('eligible') || q.includes('eligibility') || q.includes('who can join')) {
    if (usnMatch) {
      const usnNum = parseInt(usnMatch[0], 10);
      if (usnNum >= 2392608001 && usnNum <= 2392608302) {
        return `✅ **USN Verification Successful: \`${usnMatch[0]}\` is ELIGIBLE!**\n\n` +
          `• **Department**: CSE (AI & ML) Cohort 2026\n` +
          `• **Status**: Permitted within active registry range (\`2392608001\` – \`2392608302\`)\n\n` +
          `You can create your account and access all domain tracks immediately at the **[BST Member Portal](login.html)**.`;
      } else {
        return `❌ **USN Check: \`${usnMatch[0]}\` is Outside Cohort Range**\n\n` +
          `BST Tech Club membership is currently strictly reserved for the **Department of CSE (AI & ML)** undergraduates with USNs between **\`2392608001\`** and **\`2392608302\`**.\n\n` +
          `If this is an administrative or lateral entry error, please reach out to the faculty coordinator at \`contact@bsttechclub.edu\`.`;
      }
    }

    return `🎓 **BST Tech Club Eligibility Criteria**\n\n` +
      `• **Eligible Department**: Department of Computer Science & Engineering (AI & ML)\n` +
      `• **Permitted USN Range**: **\`2392608001\`** through **\`2392608302\`**\n` +
      `• **Cohort**: Class of 2026\n` +
      `• **Prerequisites**: No prior experience required! We cater to all levels from absolute beginners to advanced builders.\n\n` +
      `Ready to register? Visit the **[Member Sign-In / Join](login.html)** portal to claim your personal digital ID badge.`;
  }

  // 2. Specific Technical Domains
  if (q.includes('robot') || q.includes('ros') || q.includes('rover') || q.includes('opencv') || q.includes('hardware')) {
    return `🤖 **Robotics & Autonomous Systems Track**\n\n` +
      `The Robotics domain bridges physical computing with Artificial Intelligence and Computer Vision:\n\n` +
      `• **Core Tech Stack**: ROS 2 (Robot Operating System), OpenCV, PyTorch Edge AI, Python/C++, Arduino & ESP32\n` +
      `• **What We Build**: Autonomous obstacle-navigating rovers, camera-based object trackers, SLAM mapping robots, and sensor fusion units\n` +
      `• **Lab Location**: CSE (AI & ML) Robotics Lab\n\n` +
      `Check out scheduled hardware build sessions in the **[Events & Workshops](#events)** section!`;
  }

  if (q.includes('competitive') || q.includes('cp') || q.includes('dsa') || q.includes('leetcode') || q.includes('codeforces') || q.includes('algorithm')) {
    return `⚡ **Competative Programming & DSA Track**\n\n` +
      `Focuses on algorithmic mastery, contest problem-solving, and interview readiness:\n\n` +
      `• **Core Focus**: Data Structures & Algorithms, Graph Theory, Dynamic Programming, Time/Space Complexity\n` +
      `• **Languages**: C++ (STL), Python, Java\n` +
      `• **Activities**: Weekly LeetCode sprint jams, Codeforces rating pushes, and internal mock ICPC contests\n` +
      `• **Next Steps**: Join the weekly problem of the day challenges posted in the community!`;
  }

  if (q.includes('open source') || q.includes('git') || q.includes('github') || q.includes('pr') || q.includes('hacktoberfest')) {
    return `🌐 **Open Source & Real-World Engineering Track**\n\n` +
      `Learn how software is actually built and maintained in global engineering teams:\n\n` +
      `• **Core Competencies**: Advanced Git workflows, PR reviews, merge conflict resolution, CI/CD pipelines, and open-source licensing\n` +
      `• **Flagship Initiatives**: Club GitHub organization repositories, Hacktoberfest contributions, and department utility tools\n` +
      `• **Repository**: Explore our official code repositories via the **[GitHub Organization](https://github.com)**.`;
  }

  if (q.includes('hackathon') || q.includes('hack') || q.includes('mvp') || q.includes('sprint') || q.includes('pitch')) {
    return `🏆 **Hackathons & Rapid Prototyping Track**\n\n` +
      `Turn ideas into working software in high-adrenaline sprints:\n\n` +
      `• **Format**: 24-hour to 48-hour team hackathons\n` +
      `• **Key Skills**: Fast MVP scaffolding, AI API integration, full-stack deployment, clean pitch decks, and problem-solution fit\n` +
      `• **Team Matching**: The club forms balanced teams pairing frontend developers, AI/backend engineers, and presenters for state & national hackathons.`;
  }

  if (q.includes('domain') || q.includes('track') || q.includes('vertical') || q.includes('which domain')) {
    return `🏛️ **The 4 Core Technical Verticals of BST Tech Club**\n\n` +
      `1. **Competative Programming**: Data structures, algorithms, and speed problem solving on Codeforces & LeetCode.\n` +
      `2. **Robotics**: ROS 2, sensor fusion, OpenCV edge vision, and physical rover prototyping.\n` +
      `3. **Open Source**: Production Git workflows, contributing to public repositories, and collaborative engineering.\n` +
      `4. **Hackathon**: Fast 24-48h MVP development, pitch storytelling, and national hackathon squads.\n\n` +
      `You can participate across multiple domains or specialize in the one you're most excited about!`;
  }

  // 3. Events, Workshops & RSVPs
  if (q.includes('event') || q.includes('workshop') || q.includes('schedule') || q.includes('next event') || q.includes('session')) {
    if (events.length > 0) {
      const eventList = events.slice(0, 3).map(e => `• **${e.title}** (${e.type})\n  📅 ${e.date} • 📍 ${e.venue} • 🪑 ${e.seats} seats available`).join('\n\n');
      return `📅 **Upcoming Events & Technical Sessions**\n\n` +
        `Here are the latest sessions currently scheduled in the registry:\n\n` +
        eventList + `\n\n` +
        `Head down to **[Events & Workshops](#events)** to reserve your seat and generate your pass!`;
    } else {
      return `📅 **Upcoming Events & Technical Sessions**\n\n` +
        `• General workshops and bootcamps are announced periodically.\n` +
        `• **100% Free**: All department sessions are free for enrolled CSE (AI & ML) students.\n` +
        `• You can view current schedules or schedule a new event in the **[Events Section](#events)**.`;
    }
  }

  if (q.includes('rsvp') || q.includes('ticket') || q.includes('pass') || q.includes('seat')) {
    return `🎟️ **How Event RSVP & Attendance Passes Work**\n\n` +
      `1. Find any upcoming workshop in the **[Events Section](#events)**.\n` +
      `2. Click **RSVP** and confirm your Name and USN.\n` +
      `3. The system generates a digital pass containing your **Unique Verification Code** and **Dynamic QR Code**.\n` +
      `4. You can save your pass or add the event directly to Google Calendar.\n\n` +
      `*Note: Each event has capped seats to ensure dedicated mentor bandwidth in the labs.*`;
  }

  // 4. Beginner Guidance
  if (q.includes('beginner') || q.includes('start') || q.includes('freshman') || q.includes('1st year') || q.includes('new to coding')) {
    return `🚀 **Beginner Roadmap for CSE (AI & ML) Students**\n\n` +
      `Don't worry if you're just starting out! Here is the ideal progression:\n\n` +
      `1. **Step 1 (Week 1–2)**: Create your profile at the **[Member Portal](login.html)** and set up Git/GitHub.\n` +
      `2. **Step 2 (Month 1)**: Start in the **Competative Programming** track to master programming syntax (C++ or Python) and basic DSA.\n` +
      `3. **Step 3 (Month 2)**: Join the **Open Source** track to learn how to clone repos, submit pull requests, and collaborate.\n` +
      `4. **Step 4 (Month 3+)**: Team up in **Hackathons** to build web/AI MVPs or delve into **Robotics** sensors!\n\n` +
      `Every track has senior peer mentors available to guide you step-by-step.`;
  }

  // 5. Projects
  if (q.includes('project') || q.includes('showcase') || q.includes('portfolio') || q.includes('add project')) {
    return `📁 **Student Projects Showcase**\n\n` +
      `Every member can showcase their work on the homepage:\n\n` +
      `• Includes project title, domain category, tech stack tags, live demo URL, and GitHub repository link.\n` +
      `• Allows fellow students to star, test, and contribute to your code.\n` +
      `• To add your build, click **Add Project** in the **[Projects Section](#projects)**!`;
  }

  // 6. Security & Login
  if (q.includes('login') || q.includes('sign in') || q.includes('signup') || q.includes('register') || q.includes('password') || q.includes('account')) {
    return `🔐 **Member Portal & Authentication Architecture**\n\n` +
      `• **Secure Cryptography**: Password entries are protected with SHA-256 cryptographic hashing and unique per-account salting.\n` +
      `• **Digital Identity**: Successfully registering mints a unique club identifier formatted as \`DS-2026-XXXX\`.\n` +
      `• **Single Session**: Once logged in, your active session persists safely and displays your member badge across the site.\n\n` +
      `Access your account at **[Member Sign-In / Join](login.html)**.`;
  }

  // 7. General Fallback with intelligent suggestions
  return `💡 **BST Tech Club Advisor Response**\n\n` +
    `BST Tech Club is the premier builder collective for the **Department of CSE (AI & ML)** at Bosscoder School of Technology (Cohort 2026).\n\n` +
    `• **Eligible USNs**: \`2392608001\` to \`2392608302\`\n` +
    `• **4 Technical Verticals**: Competative Programming, Robotics, Open Source, and Hackathons\n` +
    `• **Cost**: 100% Free for all department undergraduates\n\n` +
    `You can check out our **[Events Schedule](#events)**, explore **[Student Projects](#projects)**, or claim your membership badge at the **[Member Portal](login.html)**. Have a specific USN or domain question? Feel free to ask!`;
}

function formatMarkdownToHtml(md) {
  if (!md) return '';
  let html = md;
  // Code blocks
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto"><code>$2</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">$1</code>');
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  // Markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold">$1</a>');
  // Bullet points
  html = html.split('\n\n').map(paragraph => {
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
      const items = paragraph.trim().split('\n').map(line => {
        const cleanLine = line.replace(/^[•\-]\s*/, '');
        return `<li class="ml-4 list-disc">${cleanLine}</li>`;
      }).join('');
      return `<ul class="space-y-1.5 my-2">${items}</ul>`;
    }
    return `<p class="leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

// Export AI functions to window
window.initAiAdvisor = initAiAdvisor;
window.toggleAiSettingsDrawer = toggleAiSettingsDrawer;
window.handleModelChange = handleModelChange;
window.saveAiSettings = saveAiSettings;
window.clearAiKey = clearAiKey;
window.fillAndAskAi = fillAndAskAi;
window.handleAiQuery = handleAiQuery;
window.closeAiResponse = closeAiResponse;
window.copyAiResponse = copyAiResponse;


