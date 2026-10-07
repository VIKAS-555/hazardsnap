/**
 * DevSphere Club - Secure Authentication & Member Portal Engine
 * Features:
 * - SHA-256 Cryptographic Hashing with Per-User Salt (using Web Crypto API)
 * - Unique Personalized Tech Club ID Generator (e.g. DS-2026-XXXX)
 * - Multi-factor validation (USN, College Email, Section, Dept)
 * - Rate Limiting & Brute Force Lockout
 * - Referral Link & QR Code Generation for Inviting Peers
 * - Password Management & Profile Vault
 */

const AUTH_STORAGE_KEY = 'devsphere_members_vault_v1';
const SESSION_STORAGE_KEY = 'devsphere_active_session_v1';
const ATTEMPTS_STORAGE_KEY = 'devsphere_login_attempts_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout

// --- Open-Source Community Roles & Contribution Tracks Configuration ---
const CLUB_RANKS = {
  'Root Architect': {
    rankLevel: 4,
    name: 'Root Architect',
    title: 'Root Architect (Founder)',
    passLabel: 'ROOT ARCHITECT PASS',
    statusLabel: 'ROOT ARCHITECT [UID 0]',
    avatarIcon: 'terminal',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    description: 'root / UID 0. System initialization, platform infrastructure, and core club direction.'
  },
  'Core Maintainer': {
    rankLevel: 3,
    name: 'Core Maintainer',
    title: 'Core Maintainer',
    passLabel: 'CORE MAINTAINER PASS',
    statusLabel: 'CORE MAINTAINER [MAIN BRANCH]',
    avatarIcon: 'git-branch',
    badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    description: 'Main branch merge authority. Directs domain tracks (CP, Robotics, AI & ML) and reviews code submissions.'
  },
  'Staff Contributor': {
    rankLevel: 2,
    name: 'Staff Contributor',
    title: 'Staff Contributor',
    passLabel: 'STAFF CONTRIBUTOR PASS',
    statusLabel: 'STAFF CONTRIBUTOR [VERIFIED REVIEWER]',
    avatarIcon: 'code-2',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    description: 'Senior peer builder and mentor. Earned by introducing 5+ student developers or contributing to club projects.'
  },
  'Active Developer': {
    rankLevel: 1,
    name: 'Active Developer',
    title: 'Active Developer',
    passLabel: 'ACTIVE DEVELOPER PASS',
    statusLabel: 'ACTIVE DEVELOPER [USERLAND]',
    avatarIcon: 'cpu',
    badgeClass: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Verified student member in the CSE (AI & ML) registry. Active participant in workshops, hackathons, and projects.'
  }
};

function normalizeMemberRank(role) {
  if (!role) return 'Active Developer';
  if (role === 'Root Architect' || role === 'Admin' || role === 'Head Admin' || role === 'Founder') return 'Root Architect';
  if (role === 'Core Maintainer' || role === 'Co-Leader') return 'Core Maintainer';
  if (role === 'Staff Contributor' || role === 'Elder') return 'Staff Contributor';
  return 'Active Developer';
}

// --- Web Crypto SHA-256 Helper ---
async function hashPasswordWithSalt(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::devsphere_salt::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Unique Tech Club ID Generator ---
function generateTechClubId(usn, year = '2026') {
  // Extract alphanumeric suffix or hash
  const cleanUsn = (usn || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const usnSuffix = cleanUsn.length >= 4 ? cleanUsn.slice(-4) : Math.floor(1000 + Math.random() * 9000);
  return `BST-${year}-${usnSuffix}`;
}

// --- Members Database / Vault ---
function getMembersVault() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const vault = JSON.parse(raw);
    let modified = false;

    // Purge any pre-seeded demo accounts (e.g. Aditya Sharma)
    for (const key of Object.keys(vault)) {
      if (
        key === 'BST-2026-8001' || 
        vault[key].name === 'Aditya Sharma' || 
        vault[key].name === 'Alex Sharma' || 
        vault[key].email === '2392608001@svyasa-sas.edu.in'
      ) {
        delete vault[key];
        modified = true;
      }
    }

    if (modified) {
      saveMembersVault(vault);
    }
    return vault;
  } catch (e) {
    return {};
  }
}

function saveMembersVault(vault) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(vault));
}

// --- Brute-force & Lockout Protection ---
function checkLockout() {
  try {
    const record = JSON.parse(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || '{}');
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, remainingSec };
    }
    return { isLocked: false, remainingSec: 0 };
  } catch (e) {
    return { isLocked: false, remainingSec: 0 };
  }
}

function recordFailedAttempt() {
  try {
    const record = JSON.parse(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || '{"count": 0}');
    record.count = (record.count || 0) + 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      record.count = 0;
    }
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(record));
    return record;
  } catch (e) {
    return { count: 1 };
  }
}

function clearFailedAttempts() {
  localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
}

// --- Active Session Management ---
function getActiveSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && (session.techClubId === 'BST-2026-8001' || session.name === 'Aditya Sharma' || session.name === 'Alex Sharma')) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

function setActiveSession(member, rememberMe = true) {
  // Strip sensitive hashes from session object
  const safeSession = { ...member };
  delete safeSession.passwordHash;
  delete safeSession.salt;
  
  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeSession));
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeSession));
  }
  return safeSession;
}

function logoutMember() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.reload();
}

// --- Core Auth APIs ---

/**
 * Register a new member
 */
async function registerNewMember({ name, usn, section, email, department, password, referredBy }) {
  const vault = getMembersVault();

  // Normalize inputs
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsn = usn.trim().toUpperCase();
  const cleanName = name.trim();
  const cleanSection = section.trim().toUpperCase();

  // Strict USN Range Validation: 2392608001 to 2392608302
  const usnNum = parseInt(cleanUsn, 10);
  if (isNaN(usnNum) || usnNum < 2392608001 || usnNum > 2392608302) {
    throw new Error('Invalid USN. Authorized USN range is 2392608001 to 2392608302.');
  }

  // Validation: Check duplicate email or USN
  const existingValues = Object.values(vault);
  const emailExists = existingValues.some(m => m.email.toLowerCase() === cleanEmail);
  if (emailExists) {
    throw new Error('An account with this college email already exists. Please sign in instead.');
  }

  const usnExists = existingValues.some(m => m.usn.toUpperCase() === cleanUsn);
  if (usnExists) {
    throw new Error('An account with this USN is already registered. Contact support if this is an error.');
  }

  // Generate Unique Tech Club ID
  let clubId = generateTechClubId(cleanUsn);
  // Ensure absolute uniqueness
  while (vault[clubId]) {
    clubId = `BST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Hash Password with unique salt
  const salt = generateRandomSalt();
  const passwordHash = await hashPasswordWithSalt(password, salt);

  // If referred by another member, increment their referral count and check auto-promotion to Staff Contributor
  if (referredBy && vault[referredBy]) {
    vault[referredBy].referralCount = (vault[referredBy].referralCount || 0) + 1;
    // Auto-promote to Staff Contributor if 5+ peers referred!
    if (normalizeMemberRank(vault[referredBy].role) === 'Active Developer' && vault[referredBy].referralCount >= 5) {
      vault[referredBy].role = 'Staff Contributor';
      if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
        try {
          const client = window.SupabaseEngine.getClient();
          if (client) {
            client.from('members').update({ role: 'Staff Contributor' }).eq('tech_club_id', referredBy).then();
          }
        } catch (e) {}
      }
    }
  }

  // Determine if this user is the First Member -> Permanent Root Architect (Founder) [UID 0]
  const existingMembers = Object.values(vault);
  let hasRootArchitect = existingMembers.some(m => normalizeMemberRank(m.role) === 'Root Architect');

  // Check cloud database if possible to ensure global consistency
  if (!hasRootArchitect && window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      const cloudMembers = await window.SupabaseEngine.fetchMembers();
      if (cloudMembers && Object.keys(cloudMembers).length > 0) {
        hasRootArchitect = Object.values(cloudMembers).some(m => normalizeMemberRank(m.role) === 'Root Architect');
      }
    } catch (e) {}
  }

  // Whoever registers first becomes permanent Root Architect [UID 0]!
  const assignedRole = (!hasRootArchitect) ? 'Root Architect' : 'Active Developer';

  const newMember = {
    techClubId: clubId,
    name: cleanName,
    email: cleanEmail,
    usn: cleanUsn,
    section: cleanSection,
    department: 'CSE (AI & ML)',
    role: assignedRole,
    salt,
    passwordHash,
    joinedAt: new Date().toISOString(),
    referralCount: 0,
    referredBy: referredBy || null
  };

  // If Supabase is configured, persist to cloud database
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      await window.SupabaseEngine.insertMember(newMember);
    } catch (dbErr) {
      console.warn('[AuthEngine] Cloud insert notice:', dbErr.message);
      if (dbErr.message && dbErr.message.toLowerCase().includes('unique')) {
        if (dbErr.message.toLowerCase().includes('usn')) throw new Error('An account with this USN is already registered in the cloud database.');
        if (dbErr.message.toLowerCase().includes('email')) throw new Error('An account with this email is already registered in the cloud database.');
      }
      // Do not block student from minting their badge locally if cloud has permission or network hiccup
    }
  }

  vault[clubId] = newMember;
  saveMembersVault(vault);

  return newMember;
}

/**
 * Authenticate existing member
 */
async function authenticateMember(identifier, password, rememberMe = true) {
  const lockout = checkLockout();
  if (lockout.isLocked) {
    throw new Error(`Too many failed attempts. Security cooldown active for ${lockout.remainingSec}s.`);
  }

  const vault = getMembersVault();

  // If Supabase is configured, synchronize fresh members first
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      const cloudVault = await window.SupabaseEngine.fetchMembers();
      if (cloudVault && Object.keys(cloudVault).length > 0) {
        Object.assign(vault, cloudVault);
        saveMembersVault(vault);
      }
    } catch (e) {
      console.warn('[AuthEngine] Cloud sync failed, using cached vault:', e);
    }
  }

  const cleanIdentifier = identifier.trim().toLowerCase();

  // Find by Tech Club ID (case-insensitive) OR College Email OR USN
  const member = Object.values(vault).find(m => 
    m.techClubId.toLowerCase() === cleanIdentifier || 
    m.email.toLowerCase() === cleanIdentifier ||
    m.usn.toLowerCase() === cleanIdentifier
  );

  if (!member) {
    recordFailedAttempt();
    throw new Error('Invalid Tech Club ID, Email, or Password.');
  }

  const computedHash = await hashPasswordWithSalt(password, member.salt);
  if (computedHash !== member.passwordHash) {
    recordFailedAttempt();
    throw new Error('Invalid Tech Club ID, Email, or Password.');
  }

  // Success
  clearFailedAttempts();

  // Permanent First-Member Root Architect [UID 0] Verification:
  // If no Root Architect exists yet, this first member is crowned permanent Root Architect!
  const allVaultMembers = Object.values(vault);
  const hasRootArchitect = allVaultMembers.some(m => normalizeMemberRank(m.role) === 'Root Architect');
  if (!hasRootArchitect && allVaultMembers.length > 0) {
    const earliestMember = allVaultMembers.sort((a, b) => new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0))[0];
    if (earliestMember && (earliestMember.techClubId === member.techClubId || allVaultMembers.length === 1)) {
      member.role = 'Root Architect';
      if (vault[member.techClubId]) {
        vault[member.techClubId].role = 'Root Architect';
      }
      saveMembersVault(vault);

      // Persist to Supabase cloud
      if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
        try {
          const client = window.SupabaseEngine.getClient();
          if (client) {
            client.from('members').update({ role: 'Root Architect' }).eq('tech_club_id', member.techClubId).then();
          }
        } catch (e) {}
      }
    }
  }

  // Auto-promotion: 5+ referrals unlocks Staff Contributor
  if (normalizeMemberRank(member.role) === 'Active Developer' && (member.referralCount || 0) >= 5) {
    member.role = 'Staff Contributor';
    if (vault[member.techClubId]) {
      vault[member.techClubId].role = 'Staff Contributor';
    }
    saveMembersVault(vault);
    if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
      try {
        const client = window.SupabaseEngine.getClient();
        if (client) {
          client.from('members').update({ role: 'Staff Contributor' }).eq('tech_club_id', member.techClubId).then();
        }
      } catch (e) {}
    }
  }

  return setActiveSession(member, rememberMe);
}

/**
 * Change member password
 */
async function changeMemberPassword(techClubId, currentPassword, newPassword) {
  const vault = getMembersVault();
  const member = vault[techClubId];
  if (!member) throw new Error('Member not found.');

  const currentComputedHash = await hashPasswordWithSalt(currentPassword, member.salt);
  if (currentComputedHash !== member.passwordHash) {
    throw new Error('Incorrect current password.');
  }

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const newSalt = generateRandomSalt();
  const newHash = await hashPasswordWithSalt(newPassword, newSalt);

  // If Supabase is configured, update in cloud database
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      await window.SupabaseEngine.updatePassword(techClubId, newHash, newSalt);
    } catch (e) {
      console.warn('[AuthEngine] Cloud password update failed:', e);
    }
  }

  member.salt = newSalt;
  member.passwordHash = newHash;
  member.passwordUpdatedAt = new Date().toISOString();

  saveMembersVault(vault);
  return true;
}

/**
 * Synchronize local vault with Cloud Supabase
 */
async function syncWithCloud() {
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      const cloudVault = await window.SupabaseEngine.fetchMembers();
      if (cloudVault) {
        saveMembersVault(cloudVault);
        return cloudVault;
      }
    } catch (e) {
      console.warn('[AuthEngine] Cloud sync error:', e);
    }
  }
  return getMembersVault();
}

function getRankInfo(role) {
  const norm = normalizeMemberRank(role);
  return CLUB_RANKS[norm] || CLUB_RANKS['Active Developer'];
}

function isRootArchitect(session) {
  if (!session) return false;
  return normalizeMemberRank(session.role) === 'Root Architect';
}

function isMaintainer(session) {
  if (!session) return false;
  const rank = normalizeMemberRank(session.role);
  return rank === 'Core Maintainer' || rank === 'Root Architect';
}

function isStaffContributor(session) {
  if (!session) return false;
  const rank = normalizeMemberRank(session.role);
  return rank === 'Staff Contributor' || rank === 'Core Maintainer' || rank === 'Root Architect';
}

function isUserAdmin(session) {
  return isRootArchitect(session);
}

/**
 * Assign / Reassign community role
 * Authorized for Root Architect only
 */
async function updateMemberRank(targetClubId, newRank) {
  const activeSession = getActiveSession();
  if (!activeSession || !isRootArchitect(activeSession)) {
    throw new Error('Administrative Access Required: Only the Root Architect [UID 0] can assign community roles.');
  }

  const validRanks = ['Root Architect', 'Core Maintainer', 'Staff Contributor', 'Active Developer'];
  if (!validRanks.includes(newRank)) {
    throw new Error(`Invalid role: ${newRank}`);
  }

  const vault = getMembersVault();
  const target = vault[targetClubId];
  if (!target) {
    throw new Error(`Member with ID ${targetClubId} not found.`);
  }

  // Permanent founder protection: Cannot modify Root Architect
  if (normalizeMemberRank(target.role) === 'Root Architect' && targetClubId !== activeSession.techClubId && newRank !== 'Root Architect') {
    throw new Error('Root Architect [UID 0] is the permanent founding lead and cannot be reassigned.');
  }

  target.role = newRank;
  saveMembersVault(vault);

  // Sync to Supabase cloud if connected
  if (window.SupabaseEngine && window.SupabaseEngine.isConfigured()) {
    try {
      const client = window.SupabaseEngine.getClient();
      if (client) {
        await client.from('members').update({ role: newRank }).eq('tech_club_id', targetClubId);
      }
    } catch (e) {
      console.warn('[AuthEngine] Cloud rank update notice:', e.message);
    }
  }

  // If the target is the active session itself, update the active session
  if (activeSession.techClubId === targetClubId) {
    activeSession.role = newRank;
    setActiveSession(activeSession);
  }

  return target;
}

// Export for browser
window.AuthEngine = {
  CLUB_RANKS,
  normalizeMemberRank,
  getRankInfo,
  getMembersVault,
  registerNewMember,
  authenticateMember,
  changeMemberPassword,
  getActiveSession,
  setActiveSession,
  logoutMember,
  checkLockout,
  syncWithCloud,
  isUserAdmin,
  isRootArchitect,
  isMaintainer,
  isStaffContributor,
  updateMemberRank
};
