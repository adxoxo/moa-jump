// main.js — global constants, shared game state, physics tuning.
// Loaded first. Defines everything on window scope so all scenes/entities share it.
// boot.js (loaded last) actually constructs the Phaser.Game.

// ---- Canvas dimensions ----
window.GAME_W = 420;
window.GAME_H = 680;

// ---- Win condition ----
window.PRIZE_SCORE = 8000;

// ---- Physics constants (tuned for Doodle Jump feel — see CLAUDE.md) ----
// These are BASE values for Zone 0. ZoneManager overrides per zone.
window.PHYSICS = {
  GRAVITY: 1800,        // px/s^2
  JUMP_POWER: -750,     // px/s (negative = up)
  PLAYER_SPEED: 280,    // px/s horizontal
  SPRING_MULT: 1.6,     // spring platform launch multiplier
};

// Player scrolls the camera when above this screen Y.
window.SCROLL_THRESHOLD = window.GAME_H * 0.40;

// Score awarded per pixel scrolled upward.
window.SCORE_MULTIPLIER = 0.75;

// Enemy contact penalty + hurt-state duration.
window.ENEMY_PENALTY = 100;
window.HURT_DURATION = 3500; // ms the player flashes in the DANGER state after a hit;
                            // touching another enemy during this window is fatal.

// ---- Shared, mutable game state passed between scenes ----
window.GameState = {
  selectedCharacter: null,   // { id, name, role, color, hex } — set in CharacterSelectScene
  finalScore: 0,
  zoneReached: 0,
  playerName: '',
  won: false,                // true if last run reached PRIZE_SCORE
};

window.DISCLAIMER = 'Fan-made game · Not affiliated with HYBE or TXT';

// Reset per-run state (called when a new game starts).
window.resetRunState = function () {
  window.GameState.finalScore = 0;
  window.GameState.zoneReached = 0;
  window.GameState.won = false;
};

// ---- Shared UI helpers used across scenes ----
window.UI = {
  // Vertical gradient fill behind a scene. Returns the Graphics object.
  gradientBg(scene, topColor, bottomColor) {
    const g = scene.add.graphics();
    g.setDepth(-100);
    UI.paintGradient(g, topColor, bottomColor);
    return g;
  },

  paintGradient(g, topColor, bottomColor) {
    g.clear();
    const top = Phaser.Display.Color.IntegerToColor(topColor);
    const bot = Phaser.Display.Color.IntegerToColor(bottomColor);
    const steps = 32;
    const stepH = window.GAME_H / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bot, 1, t);
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(0, i * stepH, window.GAME_W, stepH + 1);
    }
  },

  // Kill all GSAP tweens when a scene shuts down, so infinite/looping tweens
  // (idle bob, banner pulse, star spin) can't fire onUpdate against destroyed
  // Phaser objects on the next scene. Only one scene runs at a time and the
  // incoming scene creates its tweens AFTER this fires, so clearing is safe.
  autoCleanup(scene) {
    scene.events.once('shutdown', () => { if (window.gsap) gsap.globalTimeline.clear(); });
  },

  // Small disclaimer pinned to the bottom-center of every scene.
  disclaimer(scene) {
    return scene.add.text(window.GAME_W / 2, window.GAME_H - 14, window.DISCLAIMER, {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#9aa3b2',
    }).setOrigin(0.5).setDepth(1000);
  },

  // A rounded pill button with hover/press feedback. onClick is required.
  button(scene, x, y, label, onClick, opts = {}) {
    const w = opts.w || 200;
    const h = opts.h || 56;
    const fill = opts.fill !== undefined ? opts.fill : 0x7c3aed;
    const container = scene.add.container(x, y).setDepth(500);

    // IMPORTANT: feedback animations scale `visual`, NOT the container. The container
    // carries the interactive hit area, so the tap target never moves or resizes while
    // the button wobbles — taps near the edge can't "fall off" mid-animation.
    const visual = scene.add.container(0, 0);
    const bg = scene.add.graphics();
    const draw = (c) => { bg.clear(); bg.fillStyle(c, 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      bg.lineStyle(2, 0xffffff, 0.35); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14); };
    draw(fill);

    const txt = scene.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: (opts.fontSize || 22) + 'px',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    visual.add([bg, txt]);
    container.add(visual);
    container.setSize(w, h);
    // Generous fixed hit area (12px padding) + hand cursor for reliable taps on small/scaled screens.
    const pad = 12;
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2),
      Phaser.Geom.Rectangle.Contains
    );
    container.input.cursor = 'pointer';

    const bright = Phaser.Display.Color.IntegerToColor(fill).brighten(20).color;
    let fired = false;
    container.on('pointerover', () => { draw(bright); if (window.gsap) gsap.to(visual, { scale: 1.05, duration: 0.15 }); });
    container.on('pointerout',  () => { draw(fill);   if (window.gsap) gsap.to(visual, { scale: 1, duration: 0.15 }); fired = false; });
    // Fire on pointerDOWN so a tap registers immediately. Defer the actual onClick to the
    // next tick so we never tear down the scene from inside Phaser's input dispatch
    // (which can leave the input manager in a bad state for the following tap).
    container.on('pointerdown', () => {
      if (fired) return;
      fired = true;
      draw(fill);
      if (window.gsap) gsap.to(visual, { scale: 0.94, duration: 0.07, yoyo: true, repeat: 1 });
      scene.time.delayedCall(0, onClick);
    });

    return container;
  },
};
