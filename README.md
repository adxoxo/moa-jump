# MOA JUMP 🌟

A fan-made, K-pop-themed vertical platformer (Doodle Jump style) built with **Phaser 3**.
Jump across three worlds — The Real World → The Chaos → The Star — and reach **50,000** to win.

> Fan-made game · Not affiliated with HYBE or TXT.

---

## Run it locally

No build step. It's plain HTML + JS (Phaser & GSAP load from CDN). You just need any
static file server (opening `index.html` via `file://` won't work because the scripts
are loaded by path).

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

(Or use `npx serve`, VS Code Live Server, etc.)

---

## Controls

- **Keyboard:** ← / → or A / D to move. (ESC = dev-only instant game over.)
- **Touch:** hold the left / right half of the screen.
- **Tilt:** device orientation (gamma) on mobile.

The player auto-jumps; you only steer left/right and aim for higher platforms.

---

## Hosting on GitHub Pages

**No backend required** — the whole game is static files.

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages → Source: `main` branch, `/ (root)`**.
3. Done — it serves at `https://<user>.github.io/<repo>/`.

The leaderboard is **stubbed** (mock data) so nothing else is needed to ship.
To add a real leaderboard later, see *Leaderboard* below.

---

## Project structure

```
index.html              entry point — loads all scripts in order
src/
  main.js               globals (GAME_W/H, PHYSICS, GameState, UI helpers)
  boot.js               constructs the Phaser.Game (loaded last)
  entities/
    Player.js           Player class + window.CHARACTERS (manual screen-space physics)
    Platform.js         5 platform types: normal/moving/spring/break/fake
    Enemy.js            6 enemy behaviors: pigeon/glitch_block/dream_creature/debris/alien/blackhole
  zones/ZoneManager.js  window.ZONES + per-zone physics, difficulty, transitions
  services/leaderboard.js  Supabase submit/fetch (USE_LEADERBOARD=false → mock data)
  scenes/               Title, CharacterSelect, Game, Win, Leaderboard
assets/                 placeholder shapes in code today; drop real PNGs here later
```

## Coordinate system (important)

Pure **screen-space**. Each frame, when the player rises above 40% screen height, every
object is shifted *down* by the same delta (no separate camera offset). This is the fix
for the double-shift physics bug noted in `CLAUDE.md`.

## Current state vs. BUILDPLAN

- ✅ **Phases 0–6 complete**: physics, all 5 scenes, 3 zones + transitions, 5 platform
  types, 6 enemies + hurt state, particles & polish.
- ⛏️ **Phase 7 (asset swap)**: every placeholder shape has an `// ASSET:` comment above
  it describing the sprite/spritesheet to drop in. Game runs fully on placeholders today.
- 🔇 **Phase 8 (audio)**: all calls stubbed with `// AUDIO:` comments. No audio plays
  until MP3s exist in `assets/audio/`.
- 🗄️ **Phase 9 (leaderboard)**: flip `USE_LEADERBOARD = true` in
  `src/services/leaderboard.js` and add your Supabase URL/key (schema in `ARCHITECTURE.md`).

## Tuning

Physics live in `src/main.js` (`window.PHYSICS`) and per-zone overrides in
`src/zones/ZoneManager.js`. Defaults are tuned for Doodle Jump feel — see `CLAUDE.md`
before changing gravity/jump.
# moa-jump
