# ARCHITECTURE.md — MOA JUMP

## Overview
MOA JUMP is a single-file browser game built on Phaser 3.
Vertical platformer, Doodle Jump mechanics, three world zones, leaderboard.
Fan-made. Not affiliated with HYBE or TXT.

---

## Characters
Five original archetypes. Chibi art style. No real member names used.

| Key | Role | Color | Personality / Meme energy |
|-----|------|-------|--------------------------|
| `mage` | The Mage | #3b82f6 Blue | Dramatic, overthinks everything, main character syndrome |
| `bard` | The Bard | #a855f7 Purple | Tall, awkward, surprisingly cool when it counts |
| `jester` | The Jester | #f97316 Orange | Pure chaos, breaks the fourth wall, always grinning |
| `knight` | The Knight | #ec4899 Pink | Intense, focused, accidentally does cool things seriously |
| `sage` | The Sage | #22d3ee Cyan | Soft, shy, hiding behind bangs, surprisingly powerful |

Each character has:
- Idle animation (4 frames, slight bob)
- Jump animation (2 frames, squash on launch, stretch mid-air)
- Hurt flash (no separate frames needed, red tint overlay)
- Unique particle trail color matching their color

---

## Zone System

### Zone 0 — The Real World (0–999 pts)
- **Vibe:** Bright, cheerful, ordinary life. School rooftop, city skyline, blue sky.
- **BG colors:** Top `#1a1a2e` → Bottom `#16213e`
- **Platform style:** Concrete ledges, rooftop AC units, trampolines
- **Passive obstacles only:** Pigeons, crumbling platforms, wind gusts
- **Physics:** Gravity 1800, Jump -750, Platform speed 1.0x
- **Difficulty:** Gentle. Mostly normal platforms. Few moving, rare breakable.

### Zone 1 — The Chaos (1000–1999 pts)
- **Vibe:** Reality breaking. Glitchy dreamscape, distorted colors, floating debris.
- **BG colors:** Top `#2d0060` → Bottom `#1a0030`
- **Platform style:** Glowing dream tiles, floating broken slabs, bouncy mushrooms
- **Mixed obstacles:** Glitch blocks that disappear, dream creatures drifting side to side, fake platforms
- **Physics:** Gravity 1850, Jump -760, Platform speed 1.35x
- **Difficulty:** Medium. More moving platforms. Fake platforms introduced.

### Zone 2 — The Star (2000–3000 pts)
- **Vibe:** Deep space, constellations, final frontier. Dark and epic.
- **BG colors:** Top `#000010` → Bottom `#0a0030`
- **Platform style:** Asteroids, satellite dishes, rocket launch pads
- **Active enemies:** Horizontal space debris, alien that chases player X, black hole pull zones
- **Physics:** Gravity 1900, Jump -770, Platform speed 1.7x
- **Difficulty:** Hard. Many moving/breakable platforms. Active enemies throughout.

### Zone Transition
- Flash overlay (zone color, 300ms)
- Zone name + subtitle text flies in, holds 1s, fades out
- Background color tweens over 800ms
- Particle color swaps to new zone
- BGM crossfades (stubbed until audio assets ready)

---

## Platform Types

| Type | Behavior | Visual cue | Per zone |
|------|----------|-----------|----------|
| `normal` | Static | Solid color rect | All zones |
| `moving` | Horizontal drift, wraps at edges | Amber/orange tint | Zone 1+ |
| `spring` | Launches player 1.6x jump height | Green + small spring indicator on top | All zones |
| `break` | Crumbles 100ms after first land | Red tint, falls away with tween | Zone 0+ |
| `fake` | Looks normal, player falls through | Slightly desaturated | Zone 1+ |

Platform spawn density per zone:
- Zone 0: gap ~65px, mostly normal
- Zone 1: gap ~68px, more moving + break
- Zone 2: gap ~72px, fewer platforms, more moving

---

## Enemy Types

### Zone 0 — Passive
| Enemy | Behavior | Damage |
|-------|----------|--------|
| `pigeon` | Sits on platform, drifts sideways slightly. Knocks player left/right on contact. | -100 score, brief hurt state |

### Zone 1 — Mixed
| Enemy | Behavior | Damage |
|-------|----------|--------|
| `glitch_block` | Floats at fixed Y, randomly blinks in and out of existence | -100 score if visible on contact |
| `dream_creature` | Sine wave horizontal drift across screen | -100 score on contact |

### Zone 2 — Active
| Enemy | Behavior | Damage |
|-------|----------|--------|
| `debris` | Flies horizontally at high speed, wraps edges | -100 score on contact |
| `alien` | Slowly tracks player's X position, moves toward them | -100 score on contact |
| `blackhole` | Stationary, pulls player sideways if within 90px radius | No direct damage, positional hazard |

Hurt state: 1200ms invincibility after taking damage. Red flash tween. Score floors at 0.

---

## Coordinate System

**Pure screen-space.** This is the fix for the double-shift physics bug.

```
Every frame:
1. Player moves by velocity * delta
2. If player.y < SCROLL_THRESHOLD (GAME_H * 0.40):
     scrollDelta = SCROLL_THRESHOLD - player.y
     player.y = SCROLL_THRESHOLD
     score += scrollDelta * SCORE_MULTIPLIER
     ALL other objects (platforms, enemies, particles): y += scrollDelta
3. Physics: player.vy += GRAVITY * delta
4. Collision: check platforms in screen coords directly
```

No separate cameraY variable. No offset math. Everything is always in screen coords.

---

## Scoring

| Action | Score |
|--------|-------|
| Rising (per px scrolled) | +0.75 pts |
| Hit by enemy | -100 pts (floor 0) |
| Win condition | score >= 3000 |

Score display: integer, `.toLocaleString()` formatting.
Progress bar: fills left to right, color shifts purple → gold as score approaches 3000.

---

## HUD Layout
```
┌─────────────────────────────┐
│ SCORE          ROLE NAME    │
│ 1,240          The Mage     │
│ SCORE          Zone: Chaos  │
│                             │
│         [game area]         │
│                             │
│ ████████░░░░░░  1240/3000  │ ← progress bar
└─────────────────────────────┘
```

---

## Scene Responsibilities

### TitleScene
- Animated star background
- Game logo "MOA JUMP"
- Subtitle "Jump to the Stars"
- Bouncing chibi previews (placeholder rects until art ready)
- Single PLAY button
- Disclaimer text bottom center
- Preloads all assets

### CharacterSelectScene
- 5 character cards in a row
- Tap to select, selected card scales up + border highlights
- Detail panel below shows role name
- Prize banner: "Reach 3,000 to win!" (no photocard mention)
- "Let's Go!" button starts GameScene

### GameScene
- Full game loop (see Coordinate System above)
- Zone transitions via ZoneManager
- HUD overlay (score, zone, progress bar)
- ESC key → triggers game over (dev only, remove in prod)
- On score >= 3000: triggerWin()
- On player off bottom of screen: triggerGameOver()

### WinScene
- Confetti burst particles
- "You reached the stars!" title
- Score counter animation (tween from 0 to final)
- **Win banner: "Show this screen to claim your prize."** (NO photocard/TXT mention)
- Play Again → GameScene
- Leaderboard → LeaderboardScene (submits score first)
- Menu → TitleScene

### LeaderboardScene
- Fetches top 8 from Supabase (or mock data if USE_LEADERBOARD=false)
- Rows animate in with stagger
- Top 3 highlighted in gold/silver/bronze
- Filterable by character role (optional, Phase 2)
- Play Again + Menu buttons

---

## Leaderboard DB Schema (Supabase)

```sql
create table scores (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  character_role text not null,
  score integer not null,
  zone_reached integer not null default 0,
  created_at timestamptz default now()
);

-- Index for leaderboard queries
create index on scores (score desc);
```

---

## Audio System (Stubbed)

All audio calls are commented out. Slot in files when ready.

| Key | File | Usage |
|-----|------|-------|
| `bgm_zone0` | assets/audio/zone0_bgm.mp3 | Zone 0 background loop |
| `bgm_zone1` | assets/audio/zone1_bgm.mp3 | Zone 1 background loop |
| `bgm_zone2` | assets/audio/zone2_bgm.mp3 | Zone 2 background loop |
| `sfx_jump` | assets/audio/jump.mp3 | On every jump |
| `sfx_land` | assets/audio/land.mp3 | On platform land |
| `sfx_hurt` | assets/audio/hurt.mp3 | On enemy hit |
| `sfx_spring` | assets/audio/spring.mp3 | On spring platform |
| `sfx_win` | assets/audio/win.mp3 | Win screen |
| `sfx_zone` | assets/audio/zone_transition.mp3 | Zone change |

---

## Deployment Checklist

- [ ] Game tested on mobile Chrome (Android/iOS)
- [ ] Touch controls working (tap left/right half of screen)
- [ ] Tilt controls working (deviceorientation)
- [ ] USE_LEADERBOARD flipped to true
- [ ] SUPABASE_URL + SUPABASE_KEY set in Vercel env vars
- [ ] Disclaimer visible on every screen
- [ ] No TXT/HYBE/PPULBATU/member names anywhere in UI text
- [ ] Prize text says "claim your prize" not "free photocard"
- [ ] Domain pointed to Vercel
- [ ] Test on actual booth tablet before event
