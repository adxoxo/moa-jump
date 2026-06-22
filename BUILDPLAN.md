# BUILDPLAN.md — MOA JUMP
# Step-by-step build order for Claude Code

Work top to bottom. Complete each phase before moving to the next.
Run the game in a browser after every phase to verify nothing is broken.

---

## Phase 0 — Setup (do this first)
- [ ] Create folder structure as defined in ARCHITECTURE.md
- [ ] Create `index.html` with Phaser 3 + GSAP CDN scripts
- [ ] Create `src/main.js` with Phaser config and all window globals
- [ ] Verify game canvas renders at 420×680 in browser

---

## Phase 1 — Fix Physics (highest priority)
**Goal: player jumps, falls, lands on platforms. Feels like Doodle Jump.**

- [ ] Implement pure screen-space coordinate system (see CLAUDE.md → Coordinate System)
- [ ] Set physics constants: GRAVITY=1800, JUMP_POWER=-750, PLAYER_SPEED=280
- [ ] Player spawns at bottom center, auto-jumps on create
- [ ] Platform collision: only trigger when player is falling (vy > 0)
- [ ] Player wraps at screen edges (exits right → enters left, vice versa)
- [ ] Camera scroll: when player.y < GAME_H * 0.40, shift everything down
- [ ] Score increments with scroll distance × 0.75
- [ ] Platforms spawn ahead as player climbs, despawn when off bottom
- [ ] Death: player exits bottom of screen → game over

**Test:** Open in browser. Player should feel snappy, bouncy, and never get stuck.

---

## Phase 2 — Core Scenes
**Goal: full scene flow working with placeholder art.**

- [ ] TitleScene: logo text, star background, PLAY button → CharacterSelectScene
- [ ] CharacterSelectScene: 5 character cards (placeholder rects), tap to select, Let's Go → GameScene
- [ ] GameScene: full game loop from Phase 1 + HUD (score, zone label, progress bar)
- [ ] WinScene: score display, win/lose state, "Show this screen to claim your prize" on win, Play Again + Menu buttons
- [ ] LeaderboardScene: mock data table, Play Again + Menu buttons
- [ ] Disclaimer text on every scene: "Fan-made game · Not affiliated with HYBE or TXT"

**Test:** Play full loop. Title → Select → Game → Die → See lose screen → Play Again → Win → See win screen → Leaderboard.

---

## Phase 3 — Zone System
**Goal: three zones with different visuals and difficulty.**

- [ ] Implement ZoneManager with ZONES array (see ARCHITECTURE.md)
- [ ] Score thresholds: Zone 0 = 0–999, Zone 1 = 1000–1999, Zone 2 = 2000+
- [ ] Zone transition: flash overlay + zone name announcement text tween
- [ ] Per-zone background color (tween on transition)
- [ ] Per-zone physics values (gravity, jump power, platform speed)
- [ ] Per-zone platform type probabilities
- [ ] Per-zone enemy spawn list
- [ ] HUD zone label updates on transition

**Test:** Play to 1000. See transition to The Chaos. Play to 2000. See transition to The Star.

---

## Phase 4 — Platform Variety
**Goal: all 5 platform types working correctly.**

- [ ] `normal` — static, always works
- [ ] `moving` — drifts horizontally, wraps at edges, speed scales with zone
- [ ] `spring` — launches player at 1.6x jump power, squash tween on trigger
- [ ] `break` — crumbles 100ms after first contact, falls away with tween
- [ ] `fake` — visually indistinguishable from normal (slightly desaturated), player falls through

**Test:** Can identify all 5 types working in one playthrough.

---

## Phase 5 — Enemy System
**Goal: all 6 enemy types working, hurt state functioning.**

- [ ] Player hurt state: 1200ms invincibility, red flash tween, -100 score (floor 0)
- [ ] `pigeon` — passive drift, sideways knock on contact
- [ ] `glitch_block` — blinks randomly, only damages when visible
- [ ] `dream_creature` — sine wave drift
- [ ] `debris` — fast horizontal, wraps edges
- [ ] `alien` — slowly tracks player X
- [ ] `blackhole` — pull force within 90px radius, no direct damage

**Test:** Each enemy type encountered, hurt state triggers correctly, score deducts.

---

## Phase 6 — Polish & Particles
**Goal: game feels alive with visual feedback.**

- [ ] Per-zone ambient particle emitter (dust / glitch / stardust)
- [ ] Player jump trail particles (color matches character)
- [ ] Zone transition particle burst
- [ ] Win screen confetti burst (5 bursts, staggered 100ms)
- [ ] Platform glow effect (subtle, matches zone color)
- [ ] Score counter animation on WinScene (tween from 0 to final score)
- [ ] Progress bar color shift (purple → gold as score approaches 3000)
- [ ] Character idle bob tween
- [ ] Jump squash + stretch tween on player sprite

**Test:** All visual feedback present. Game feels polished even with placeholder art.

---

## Phase 7 — Asset Swap
**Goal: replace all placeholder shapes with real sprite assets.**

Do this phase only when `/assets/` folder has the actual PNG files.

- [ ] Swap character placeholder rects with sprite sheets + animations
  - idle: frames 0–3, loop
  - jump: frames 4–5, play once on jump trigger
- [ ] Swap platform rects with zone-specific platform images
- [ ] Swap enemy shapes with enemy PNGs
- [ ] Swap background rects with parallax background layers
- [ ] Add particle PNGs to emitters
- [ ] Add UI assets (logo, buttons, badges)

**Test:** Full playthrough with real art. No placeholder shapes visible.

---

## Phase 8 — Audio
**Goal: all sound effects and BGM playing.**

Do this phase only when `/assets/audio/` has the MP3 files.

- [ ] Uncomment all `// AUDIO:` stubs in GameScene, ZoneManager, WinScene
- [ ] BGM loops per zone, crossfades on zone transition
- [ ] SFX: jump, land, spring, hurt, win, zone transition
- [ ] Volume balancing: BGM at 0.4, SFX at 0.7

**Test:** All sounds trigger correctly. BGM doesn't overlap weirdly on scene restart.

---

## Phase 9 — Leaderboard
**Goal: real score submission and display.**

- [ ] Create Supabase project
- [ ] Run schema from ARCHITECTURE.md in Supabase SQL editor
- [ ] Set `USE_LEADERBOARD = true` in `src/services/leaderboard.js`
- [ ] Add SUPABASE_URL and SUPABASE_KEY to Vercel environment variables
- [ ] Test score submission on win/lose
- [ ] Test leaderboard fetch and display

**Test:** Complete a game, check Supabase dashboard to confirm score was written.

---

## Phase 10 — Deployment
**Goal: live at your domain, playable on mobile.**

- [ ] Push repo to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Point domain DNS to Vercel
- [ ] Test on real Android phone (Chrome)
- [ ] Test on real iPhone (Safari)
- [ ] Test tilt controls (deviceorientation)
- [ ] Test touch controls (tap left/right)
- [ ] Load test on booth tablet
- [ ] Confirm disclaimer visible on all screens
- [ ] Confirm no IP-infringing text anywhere

---

## Pre-Event Checklist (June 27)
- [ ] Phases 1–6 complete (playable with placeholder or real art)
- [ ] Hosted at live URL
- [ ] Tested on booth tablet at the venue resolution
- [ ] Difficulty tested by 2–3 people — 3000 is reachable but hard
- [ ] Win screen clearly says how to claim prize
- [ ] Booth person knows: winner shows win screen = they get the prize
- [ ] Have a fallback (offline HTML file on tablet) in case internet drops at venue
