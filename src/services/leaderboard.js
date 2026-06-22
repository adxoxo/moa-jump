// leaderboard.js — Supabase score submission + fetch. Stubbed until keys are ready.
// Flip USE_LEADERBOARD to true and fill SUPABASE_URL/KEY when the backend exists.

const USE_LEADERBOARD = false;
const SUPABASE_URL = '';
const SUPABASE_KEY = '';

// Mock data shown when USE_LEADERBOARD is false.
const MOCK_SCORES = [
  { player_name: 'STARLIGHT', character_role: 'The Mage',   score: 3120, zone_reached: 2 },
  { player_name: 'NOVA',      character_role: 'The Knight', score: 2890, zone_reached: 2 },
  { player_name: 'COMET',     character_role: 'The Jester', score: 2540, zone_reached: 2 },
  { player_name: 'LUNA',      character_role: 'The Bard',   score: 1980, zone_reached: 1 },
  { player_name: 'ORBIT',     character_role: 'The Sage',   score: 1740, zone_reached: 1 },
  { player_name: 'ASTRO',     character_role: 'The Mage',   score: 1320, zone_reached: 1 },
  { player_name: 'PIXEL',     character_role: 'The Knight', score: 880,  zone_reached: 0 },
  { player_name: 'ECHO',      character_role: 'The Sage',   score: 540,  zone_reached: 0 },
];

window.Leaderboard = {
  // Returns a Promise resolving to an array of top scores (desc).
  async fetchTop(limit = 8) {
    if (!USE_LEADERBOARD || !SUPABASE_URL) {
      return MOCK_SCORES.slice(0, limit);
    }
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/scores?select=*&order=score.desc&limit=${limit}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      return await res.json();
    } catch (e) {
      console.warn('Leaderboard fetch failed, using mock data', e);
      return MOCK_SCORES.slice(0, limit);
    }
  },

  // Submits one score. No-op (resolves) when leaderboard is disabled.
  async submit({ player_name, character_role, score, zone_reached }) {
    if (!USE_LEADERBOARD || !SUPABASE_URL) {
      console.log('[leaderboard stub] would submit:', { player_name, character_role, score, zone_reached });
      return { ok: true, stubbed: true };
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ player_name, character_role, score, zone_reached }),
      });
      return { ok: res.ok };
    } catch (e) {
      console.warn('Leaderboard submit failed', e);
      return { ok: false, error: e };
    }
  },
};
