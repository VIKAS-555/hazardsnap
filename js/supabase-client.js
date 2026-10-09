/**
 * BST Tech Club - Supabase Cloud Synchronization & Realtime Engine
 * Department: Computer Science & Engineering (AI & ML)
 * Provides seamless cross-device synchronization with graceful local fallback.
 */

(function () {
  const DEFAULT_CONFIG = {
    url: '',
    anonKey: ''
  };

  // Read config from localStorage override or window config
  function getCredentials() {
    const storedUrl = localStorage.getItem('bst_supabase_url');
    const storedKey = localStorage.getItem('bst_supabase_anon_key');
    const windowConfig = window.SUPABASE_CONFIG || {};

    return {
      url: storedUrl || windowConfig.url || DEFAULT_CONFIG.url,
      anonKey: storedKey || windowConfig.anonKey || DEFAULT_CONFIG.anonKey
    };
  }

  function isConfigured() {
    const creds = getCredentials();
    return Boolean(
      creds.url && 
      creds.anonKey && 
      creds.url.startsWith('https://') && 
      creds.url.includes('.supabase.co') &&
      creds.anonKey.length > 20
    );
  }

  let clientInstance = null;

  function getClient() {
    if (!isConfigured()) return null;
    if (clientInstance) return clientInstance;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      const creds = getCredentials();
      clientInstance = window.supabase.createClient(creds.url, creds.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return clientInstance;
    }
    return null;
  }

  // --- Realtime Cloud Client Engine ---
  const SupabaseEngine = {
    isConfigured,
    getClient,

    setCredentials(url, anonKey) {
      if (url) localStorage.setItem('bst_supabase_url', url.trim());
      if (anonKey) localStorage.setItem('bst_supabase_anon_key', anonKey.trim());
      clientInstance = null; // Re-initialize
      return isConfigured();
    },

    clearCredentials() {
      localStorage.removeItem('bst_supabase_url');
      localStorage.removeItem('bst_supabase_anon_key');
      clientInstance = null;
    },

    // 1. Members Cloud Operations
    async fetchMembers() {
      const client = getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('members')
        .select('*');

      if (error) {
        console.warn('[Supabase] Failed to fetch members:', error.message);
        return null;
      }

      // Format as vault dictionary keyed by techClubId
      const vault = {};

      (data || []).forEach(row => {
        if (!row.tech_club_id) return;

        // Skip any legacy expelled markers
        if (row.role === 'EXPELLED' || row.name === '[EXPELLED]') {
          return;
        }

        vault[row.tech_club_id] = {
          techClubId: row.tech_club_id,
          name: row.name,
          usn: row.usn,
          section: row.section,
          email: row.email,
          department: row.department,
          role: row.role,
          passwordHash: row.password_hash,
          salt: row.salt,
          referralCount: row.referral_count || 0,
          referredBy: row.referred_by || null,
          joinedAt: row.created_at
        };
      });
      return vault;
    },

    async insertMember(member) {
      const client = getClient();
      if (!client) return false;

      const row = {
        tech_club_id: member.techClubId,
        name: member.name,
        usn: member.usn,
        section: member.section,
        email: member.email,
        department: member.department || 'CSE (AI & ML)',
        role: member.role || 'Member',
        password_hash: member.passwordHash,
        salt: member.salt,
        referral_count: member.referralCount || 0,
        referred_by: member.referredBy || null
      };

      const { data, error } = await client
        .from('members')
        .insert([row])
        .select();

      if (error) {
        throw new Error(error.message || 'Database registration failed.');
      }

      // If referred, increment referrer's count in database
      if (member.referredBy) {
        try {
          const { data: referrerData } = await client
            .from('members')
            .select('referral_count')
            .eq('tech_club_id', member.referredBy)
            .single();

          if (referrerData) {
            await client
              .from('members')
              .update({ referral_count: (referrerData.referral_count || 0) + 1 })
              .eq('tech_club_id', member.referredBy);
          }
        } catch (refErr) {
          console.warn('[Supabase] Could not increment referral count:', refErr);
        }
      }

      return true;
    },

    async updatePassword(techClubId, newHash, newSalt) {
      const client = getClient();
      if (!client) return false;

      const { error } = await client
        .from('members')
        .update({
          password_hash: newHash,
          salt: newSalt
        })
        .eq('tech_club_id', techClubId);

      if (error) throw new Error(error.message);
      return true;
    },

    async deleteMember(techClubId) {
      const client = getClient();
      if (!client) return false;

      let deleteOk = false;

      // 1. Delete associated event RSVPs
      try {
        await client
          .from('event_rsvps')
          .delete()
          .eq('tech_club_id', techClubId);
      } catch (e) {
        console.warn('[Supabase] Could not delete event RSVPs for member:', e);
      }

      // 2. Delete projects authored by this member
      try {
        await client
          .from('projects')
          .delete()
          .eq('author_id', techClubId);
      } catch (e) {
        console.warn('[Supabase] Could not delete projects for member:', e);
      }

      // 3. Direct hard delete from members table (total eradication)
      try {
        const { error: delErr } = await client
          .from('members')
          .delete()
          .eq('tech_club_id', techClubId);
        if (!delErr) {
          deleteOk = true;
        } else {
          console.warn('[Supabase] Delete query notice:', delErr.message);
        }
      } catch (delErr) {
        console.warn('[Supabase] Direct delete exception:', delErr);
      }

      // 4. Clean up any lingering legacy test markers
      try {
        await client
          .from('members')
          .delete()
          .eq('role', 'EXPELLED');
      } catch (e) {}

      return deleteOk;
    },

    // 2. Events Cloud Operations
    async fetchEvents() {
      const client = getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Failed to fetch events:', error.message);
        return null;
      }

      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        category: row.category,
        status: row.status,
        seatsTotal: row.seats || 90,
        seatsLeft: row.seats || 90,
        date: row.date,
        time: row.time,
        venue: row.venue,
        speakerName: row.speaker_name,
        speakerRole: row.speaker_role,
        speaker: {
          name: row.speaker_name || 'BST Tech Coordinator',
          role: row.speaker_role || 'Technical Lead',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        },
        rsvpOpen: row.status === 'Upcoming',
        description: row.description
      }));
    },

    async saveEvent(evt) {
      const client = getClient();
      if (!client) return false;

      const row = {
        id: evt.id,
        title: evt.title,
        type: evt.type,
        category: evt.category,
        status: evt.status,
        seats: evt.seatsTotal || evt.seats || 90,
        date: evt.date,
        time: evt.time,
        venue: evt.venue,
        speaker_name: evt.speaker?.name || evt.speakerName || '',
        speaker_role: evt.speaker?.role || evt.speakerRole || '',
        description: evt.description
      };

      const { error } = await client
        .from('events')
        .upsert([row]);

      if (error) throw new Error(error.message);
      return true;
    },

    async deleteEvent(eventId) {
      const client = getClient();
      if (!client) return false;

      const { error } = await client
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw new Error(error.message);
      return true;
    },

    // 3. RSVPs Cloud Operations
    async fetchRsvps() {
      const client = getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('event_rsvps')
        .select('*');

      if (error) return null;

      const rsvps = {};
      (data || []).forEach(row => {
        rsvps[row.event_id] = {
          ticketId: row.verification_code || row.tech_club_id,
          eventId: row.event_id,
          studentName: row.student_name,
          studentEmail: row.student_email,
          studentId: row.student_usn,
          name: row.student_name,
          usn: row.student_usn,
          techClubId: row.tech_club_id,
          verificationCode: row.verification_code,
          registeredAt: row.created_at
        };
      });
      return rsvps;
    },

    async insertRsvp(rsvp) {
      const client = getClient();
      if (!client) return false;

      const row = {
        event_id: rsvp.eventId,
        tech_club_id: rsvp.techClubId || rsvp.ticketId || '',
        student_name: rsvp.studentName || rsvp.name || '',
        student_usn: rsvp.studentId || rsvp.usn || '',
        student_email: rsvp.studentEmail || rsvp.email || '',
        student_section: rsvp.year || rsvp.section || '',
        verification_code: rsvp.ticketId || rsvp.verificationCode || ''
      };

      const { error } = await client
        .from('event_rsvps')
        .insert([row]);

      if (error) throw new Error(error.message);
      return true;
    },

    async testConnection() {
      const client = getClient();
      if (!client) return { success: false, message: 'Supabase credentials not configured' };
      try {
        const { count, error } = await client
          .from('members')
          .select('*', { count: 'exact', head: true });
        if (error) return { success: false, message: error.message };
        return { success: true, count: count !== null ? count : 0 };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    // 4. Projects Cloud Operations
    async fetchProjects() {
      const client = getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return null;

      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        tagline: row.tagline || '',
        category: row.category,
        badge: row.badge || '',
        tech: row.tech ? row.tech.split(',').map(t => t.trim()) : [],
        description: row.description,
        github: row.github || '',
        demo: row.demo || ''
      }));
    },

    async saveProject(proj) {
      const client = getClient();
      if (!client) return false;

      const row = {
        id: proj.id,
        title: proj.title,
        tagline: proj.tagline || '',
        category: proj.category,
        badge: proj.badge || '',
        tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : (proj.tech || ''),
        description: proj.description,
        github: proj.github || '',
        demo: proj.demo || ''
      };

      const { error } = await client
        .from('projects')
        .upsert([row]);

      if (error) throw new Error(error.message);
      return true;
    },

    async deleteProject(projectId) {
      const client = getClient();
      if (!client) return false;

      const { error } = await client
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw new Error(error.message);
      return true;
    },

    // 5. Realtime Subscriptions (Live Cross-Device Updates)
    setupRealtimeSubscriptions({ onMembersUpdate, onEventsUpdate, onProjectsUpdate, onRsvpsUpdate }) {
      const client = getClient();
      if (!client) return null;

      try {
        const channel = client.channel('bst_live_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
            if (typeof onMembersUpdate === 'function') onMembersUpdate();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
            if (typeof onEventsUpdate === 'function') onEventsUpdate();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
            if (typeof onProjectsUpdate === 'function') onProjectsUpdate();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, () => {
            if (typeof onRsvpsUpdate === 'function') onRsvpsUpdate();
          })
          .subscribe();

        return channel;
      } catch (err) {
        console.warn('[Supabase Realtime] Could not subscribe:', err);
        return null;
      }
    }
  };

  window.SupabaseEngine = SupabaseEngine;
})();
