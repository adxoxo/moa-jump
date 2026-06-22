# CLAUDE.md — MOA JUMP
# Instructions for Claude Code

## Project
**MOA JUMP** — a Phaser 3 browser-based vertical platformer (Doodle Jump style).
Fan-made K-pop themed game. Not affiliated with HYBE or TXT.

## Coding Rules (Karpathy's Four)
1. Read the code before changing it
2. Make the smallest change that fixes the problem
3. Test after every change
4. Never guess — if unsure, ask

---

## Tech Stack
- **Phaser 3.60** — game engine (CDN: cdn.jsdelivr.net/npm/phaser@3.60.0)
- **GSAP 3.12** — UI animations (CDN: cdn.jsdelivr.net/npm/gsap@3.12.2)
- **Supabase** — leaderboard backend (flip USE_LEADERBOARD to true when keys are ready)
- **Vanilla JS** — no build step, single HTML file for deployment
- **Vercel** — hosting, point domain here

## Coordinate System — CRITICAL
Use **screen-space coordinates** throughout. Do NOT mix world-space and screen-space.

- Platforms live in screen coords (0 to GAME_H)
- Camera scroll = shift ALL game objects downward by `scrollDelta` each frame
- Player Y is always relative to the screen
- Never apply cameraY offset AND move objects independently — pick one system and stay in it
- The scroll delta per frame = how much the player rose above the scroll threshold

## Physics Values (tuned for Doodle Jump feel)
```
GRAVITY        = 1800   // px/s²
JUMP_POWER     = -750   // px/s (negative = up)
PLAYER_SPEED   = 280    // px/s horizontal
SCROLL_THRESHOLD = GAME_H * 0.40  // player scrolls camera when above this screen Y
```
These are the correct values. Do not reduce gravity to make it feel "smoother" — it will feel floaty and wrong.

## Scene Flow
```
TitleScene → CharacterSelectScene → GameScene → WinScene → LeaderboardScene
                                        ↑__________________________|
```

## File Structure
```
/
├── index.html               (entry point, loads all scripts)
├── src/
│   ├── main.js              (Phaser config, window.GameState, window.GAME_W/H, window.PRIZE_SCORE)
│   ├── scenes/
│   │   ├── TitleScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── GameScene.js
│   │   ├── WinScene.js
│   │   └── LeaderboardScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Platform.js
│   │   └── Enemy.js
│   ├── zones/
│   │   └── ZoneManager.js
│   └── services/
│       └── leaderboard.js
└── assets/
    ├── characters/          (5 chibi sprite sheets, 64x80px per frame)
    ├── backgrounds/         (zone BG layers, 420px wide, tileable vertically)
    ├── platforms/           (3 zones × 3 types = 9 platform sprites)
    ├── enemies/             (8 enemy sprites)
    ├── ui/                  (buttons, cards, win screen graphics)
    └── audio/               (BGM per zone + SFX — all stubbed, swap when ready)
```

## Global Constants (window scope)
```js
window.GAME_W = 420
window.GAME_H = 680
window.PRIZE_SCORE = 3000
window.GameState = {
  selectedCharacter: null,   // { id, name, role, color, hex }
  finalScore: 0,
  zoneReached: 0,
  playerName: ''
}
window.CHARACTERS = [...]    // defined in Player.js
window.ZONES = [...]         // defined in ZoneManager.js
```

## Characters
Five original archetypes. No real member names. No official PPULBATU names.
See ARCHITECTURE.md for full character table.

## Prize / Win Condition
- Win screen says: **"You reached the stars! Show this screen to claim your prize."**
- Do NOT mention "photocard", "TXT", or "free" in the win condition text
- Just: reach PRIZE_SCORE (3000) = win screen appears

## Disclaimer
Must appear on every screen, small text at bottom:
```
Fan-made game · Not affiliated with HYBE or TXT
```

## Audio System
All audio is stubbed. Placeholder comments mark every audio call:
```js
// AUDIO: this.sound.play('sfx_jump') — swap in when assets/audio/jump.mp3 is ready
// AUDIO: this._bgm = this.sound.add('bgm_zone0', { loop: true, volume: 0.4 })
```
Do not remove stubs. Do not add working audio until files exist in assets/audio/.

## Asset Swapping
Every placeholder shape has a comment above it:
```js
// ASSET: replace this.add.rectangle(...) with this.add.sprite(x, y, 'character_mage')
// ASSET: spritesheet key = 'character_mage', frameWidth: 64, frameHeight: 80
// ASSET: animations: 'mage_idle' (frames 0-3), 'mage_jump' (frames 4-5)
```

## Known Issues to Fix
1. **Physics bug** — platforms double-shifting. Root cause: platform Y being moved by
   both initial world offset AND per-frame camera delta. Fix: pure screen-space system,
   scroll by shifting all objects down, never track a separate cameraY offset.

2. **Jump feels floaty** — gravity too low. Use values from Physics Values section above.

3. **Platform spawn** — ensure platforms always exist 1.5 screens ahead of player.
   Spawn threshold: when topmost platform Y > -GAME_H * 0.5, spawn more upward.

## Leaderboard (Supabase)
```js
// src/services/leaderboard.js
const USE_LEADERBOARD = false  // flip to true + add keys when Supabase is ready

// Supabase table schema:
// scores: id, player_name, character_role, score, zone_reached, created_at
```

## Deployment
1. Push to GitHub repo
2. Connect repo to Vercel
3. Set env vars: SUPABASE_URL, SUPABASE_KEY
4. Point domain to Vercel — done
