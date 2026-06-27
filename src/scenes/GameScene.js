// GameScene.js — the full game loop. PURE SCREEN-SPACE coordinates (see CLAUDE.md).
// No cameraY offset; scrolling shifts every object downward by scrollDelta each frame.

window.GameScene = class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    // In case GameScene is entered first (e.g. Play Again) before textures cached.
    window.CHARACTERS.forEach((ch) => {
      if (ch.img && !this.textures.exists(ch.img)) this.load.image(ch.img, 'assets/characters/' + ch.img + '.png');
    });
    // Enemy art (only the files that exist will resolve; missing ones fall back to placeholders).
    ['company_building', 'sasaeng', 'bad_review'].forEach((t) => {
      const key = 'enemy_' + t;
      if (!this.textures.exists(key)) this.load.image(key, 'assets/enemies/' + key + '.png');
    });
    // Per-zone background images (the "far" layer is the scrolling backdrop).
    for (let z = 0; z < 3; z++) {
      const key = 'bg_z' + z;
      if (!this.textures.exists(key)) this.load.image(key, 'assets/backgrounds/bg_zone' + z + '_far.png');
    }
    // Don't let one missing file abort the whole load.
    this.load.on('loaderror', (file) => console.warn('asset missing (using placeholder):', file.key));
  }

  create() {
    UI.autoCleanup(this);
    window.resetRunState();

    this.score = 0;
    this.currentZone = -1;          // forces an initial transition to zone 0
    this.physicsVals = { ...window.ZONES[0].physics };
    this.gameOver = false;
    this.platforms = [];
    this.enemies = [];
    this.highestY = window.GAME_H;  // y of the topmost platform (smallest y)

    // ---- Background (per-zone image if available, else gradient + parallax dots) ----
    this.bg = UI.gradientBg(this, window.ZONES[0].bgTop, window.ZONES[0].bgBottom);
    this._buildParallax();
    this._buildZoneBackground();
    this._makeParticleTextures();

    // ---- Player ----
    const ch = window.GameState.selectedCharacter || window.CHARACTERS[0];
    this.player = new window.Player(this, window.GAME_W / 2, window.GAME_H - 140, ch);
    this.player.vy = this.physicsVals.JUMP_POWER; // auto-jump on create

    // ---- Starting platforms (safe: normal type near the bottom) ----
    this._spawnPlatform(window.GAME_W / 2, window.GAME_H - 70, 'normal');
    this.highestY = window.GAME_H - 70;
    this._fillPlatformsUpward();

    // ---- Ambient + trail particles ----
    this._buildParticles(ch);

    // ---- HUD ----
    this._buildHUD();

    // ---- Input ----
    this._buildInput();

    // ---- Kick off zone 0 ----
    this._enterZone(0, true);
  }

  // ---------- Build helpers ----------

  _buildParallax() {
    // ASSET: replace these with this.add.tileSprite(0,0,GAME_W,GAME_H,'bg_zone0_far'/'..._mid')
    // Far layer: faint dots. Mid layer: slightly larger shapes. Both shift on scroll.
    this.parFar = this.add.container(0, 0).setDepth(-50);
    this.parMid = this.add.container(0, 0).setDepth(-40);
    for (let i = 0; i < 30; i++) {
      const s = this.add.circle(Math.random() * window.GAME_W, Math.random() * window.GAME_H * 2 - window.GAME_H,
        Math.random() * 1.5 + 0.5, 0xffffff, 0.4);
      this.parFar.add(s);
    }
    for (let i = 0; i < 12; i++) {
      const s = this.add.rectangle(Math.random() * window.GAME_W, Math.random() * window.GAME_H * 2 - window.GAME_H,
        14, 14, 0xffffff, 0.06);
      this.parMid.add(s);
    }
    this._parFarItems = this.parFar.list.slice();
    this._parMidItems = this.parMid.list.slice();
  }

  // Per-zone full-screen background image as a vertically-tiling parallax layer.
  // Falls back silently to the gradient + dots when the image isn't loaded.
  _buildZoneBackground() {
    this.zoneBgKey = null;
    if (this.textures.exists('bg_z0')) {
      this.zoneBg = this.add.tileSprite(window.GAME_W / 2, window.GAME_H / 2, window.GAME_W, window.GAME_H, 'bg_z0')
        .setDepth(-80);
      // Scale the texture to cover the screen width (images share the screen aspect).
      const tex = this.textures.get('bg_z0').getSourceImage();
      this._bgTileScale = window.GAME_W / tex.width;
      this.zoneBg.setTileScale(this._bgTileScale);
      // Hide the gradient + dots when a real image is present.
      this.bg.setVisible(false);
      this.parFar.setVisible(false);
      this.parMid.setVisible(false);
    }
  }

  _setZoneBackground(z, instant) {
    if (!this.zoneBg) return;
    const key = 'bg_z' + z;
    if (!this.textures.exists(key) || key === this.zoneBgKey) return;
    this.zoneBgKey = key;
    const apply = () => {
      this.zoneBg.setTexture(key);
      const tex = this.textures.get(key).getSourceImage();
      this.zoneBg.setTileScale(window.GAME_W / tex.width);
    };
    if (instant || !window.gsap) { apply(); return; }
    // Crossfade: fade out, swap, fade in.
    gsap.to(this.zoneBg, { alpha: 0, duration: 0.4, onComplete: () => { apply(); gsap.to(this.zoneBg, { alpha: 1, duration: 0.5 }); } });
  }

  _makeParticleTextures() {
    if (this.textures.exists('p_dot')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1); g.fillCircle(5, 5, 5); g.generateTexture('p_dot', 10, 10);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 6, 6); g.generateTexture('p_sq', 6, 6);
    g.destroy();
  }

  _buildParticles(ch) {
    const zone = window.ZONES[0];
    // Ambient emitter (zone-tinted). Recreated per zone in _enterZone.
    this.ambient = this.add.particles(0, 0, 'p_dot', {
      x: { min: 0, max: window.GAME_W },
      y: { min: -10, max: window.GAME_H },
      lifespan: 4000, speedY: { min: 10, max: 30 }, scale: { start: 0.6, end: 0 },
      alpha: { start: 0.5, end: 0 }, frequency: 220, tint: zone.accent,
    }).setDepth(-30);

    // Jump trail follows player; emits in bursts on jump.
    this.trail = this.add.particles(0, 0, 'p_dot', {
      lifespan: 400, speed: { min: 20, max: 60 }, scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 }, tint: ch.color, frequency: -1, quantity: 6,
    }).setDepth(18);
  }

  _buildHUD() {
    const style = { fontFamily: 'Trebuchet MS, sans-serif', color: '#ffffff' };
    this.hudScoreLabel = this.add.text(14, 12, 'SCORE', { ...style, fontSize: '12px', color: '#a78bfa' }).setDepth(900);
    this.hudScore = this.add.text(14, 26, '0', { ...style, fontSize: '26px', fontStyle: 'bold' }).setDepth(900);

    const ch = window.GameState.selectedCharacter || window.CHARACTERS[0];
    this.add.text(window.GAME_W - 14, 12, ch.role, { ...style, fontSize: '16px', fontStyle: 'bold', color: ch.hex })
      .setOrigin(1, 0).setDepth(900);
    this.hudZone = this.add.text(window.GAME_W - 14, 34, 'Zone: The Real World', { ...style, fontSize: '12px', color: '#c4b5fd' })
      .setOrigin(1, 0).setDepth(900);

    // Progress bar (bottom).
    this.barBg = this.add.rectangle(window.GAME_W / 2, window.GAME_H - 34, window.GAME_W - 28, 12, 0x000000, 0.4)
      .setStrokeStyle(1, 0xffffff, 0.3).setDepth(900);
    this.barFill = this.add.graphics().setDepth(901);
    this.hudProgress = this.add.text(window.GAME_W / 2, window.GAME_H - 34, '0/3000',
      { ...style, fontSize: '10px' }).setOrigin(0.5).setDepth(902);
  }

  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');
    // ESC -> dev game over (remove in prod).
    this.input.keyboard.on('keydown-ESC', () => this._triggerGameOver());

    // Touch: hold left/right half of screen.
    this.touchDir = 0;
    this.input.on('pointerdown', (p) => { this.touchDir = p.x < window.GAME_W / 2 ? -1 : 1; });
    this.input.on('pointermove', (p) => { if (p.isDown) this.touchDir = p.x < window.GAME_W / 2 ? -1 : 1; });
    this.input.on('pointerup', () => { this.touchDir = 0; });

    // Tilt (deviceorientation). gamma: left/right tilt in degrees.
    this.tilt = 0;
    this._tiltHandler = (e) => { if (e.gamma != null) this.tilt = Phaser.Math.Clamp(e.gamma / 30, -1, 1); };
    window.addEventListener('deviceorientation', this._tiltHandler);
    this.events.once('shutdown', () => window.removeEventListener('deviceorientation', this._tiltHandler));
  }

  // ---------- Spawning ----------

  _spawnPlatform(x, y, type) {
    const w = Phaser.Math.Between(70, 110);
    const zone = window.ZONES[Math.max(0, this.currentZone)];
    const baseSpeed = 60 * (zone ? zone.physics.PLATFORM_SPEED : 1);
    const p = new window.Platform(this, x, y, w, { type, zone: zone ? zone.id : 0, baseSpeed });
    this.platforms.push(p);
    return p;
  }

  _fillPlatformsUpward() {
    const zone = window.ZONES[Math.max(0, this.currentZone)];
    const gap = zone ? zone.gap : 65;
    // Spawn until the topmost platform sits above -GAME_H*0.5 (1.5 screens ahead).
    while (this.highestY > -window.GAME_H * 0.5) {
      const y = this.highestY - Phaser.Math.Between(gap - 10, gap + 15);
      const x = Phaser.Math.Between(40, window.GAME_W - 40);
      const type = zone ? window.pickPlatformType(zone) : 'normal';
      this._spawnPlatform(x, y, type);
      this.highestY = y;

      // Chance to spawn an enemy near this platform.
      if (zone && Math.random() < zone.enemyChance) {
        const etype = Phaser.Utils.Array.GetRandom(zone.enemies);
        const ex = Phaser.Math.Between(30, window.GAME_W - 30);
        this.enemies.push(new window.Enemy(this, ex, y - Phaser.Math.Between(20, 40), etype));
      }
    }
  }

  // ---------- Main loop ----------

  update(time, delta) {
    if (this.gameOver) return;
    const dt = Math.min(delta / 1000, 0.05); // clamp to avoid tunneling on lag spikes

    // --- Input -> horizontal velocity ---
    const speed = window.PHYSICS.PLAYER_SPEED;
    let dir = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) dir = -1;
    else if (this.cursors.right.isDown || this.keyD.isDown) dir = 1;
    else if (this.touchDir !== 0) dir = this.touchDir;
    else if (Math.abs(this.tilt) > 0.08) dir = this.tilt;
    if (this.player.stunned) dir = 0; // sasaeng flash freezes steering briefly
    this.player.vx = dir * speed;

    // --- Physics ---
    const prevFeetY = this.player.feetY;
    this.player.update(dt);

    // --- Platform collision (only while falling) ---
    if (this.player.vy > 0) {
      for (const p of this.platforms) {
        if (p.dead || !p.landable) continue;
        const topY = p.topY;
        const withinX = Math.abs(this.player.x - p.x) < p.w / 2 + this.player.w * 0.25;
        if (withinX && prevFeetY <= topY + 4 && this.player.feetY >= topY) {
          this.player.y = topY - this.player.h / 2;
          const mult = p.onLand();
          if (mult > 0) {
            this.player.jump(mult);
            this.trail.emitParticleAt(this.player.x, this.player.feetY, 6);
          }
          break;
        }
      }
    }

    // --- Camera scroll (screen-space): shift EVERYTHING down ---
    if (this.player.y < window.SCROLL_THRESHOLD) {
      const scrollDelta = window.SCROLL_THRESHOLD - this.player.y;
      this.player.y = window.SCROLL_THRESHOLD;
      this.score += scrollDelta * window.SCORE_MULTIPLIER;

      for (const p of this.platforms) p.shiftDown(scrollDelta);
      for (const e of this.enemies) e.shiftDown(scrollDelta);
      this.highestY += scrollDelta;
      this._parallaxShift(scrollDelta);
      if (this.zoneBg) this.zoneBg.tilePositionY -= scrollDelta * 0.18; // gentle parallax drift
    }

    // --- Update platforms & enemies ---
    for (const p of this.platforms) p.update(dt);
    for (const e of this.enemies) { e.update(dt, this.player); }

    // --- Enemy collisions: one hit = danger state; a second hit (after getting clear
    //     of all enemies) during that window = game over. ---
    let hitEnemy = null;
    for (const e of this.enemies) {
      if (e.def.damage && e.overlaps(this.player)) { hitEnemy = e; break; }
    }
    if (!hitEnemy) {
      // Clear of every enemy — arm the fatal second-hit check for the current danger window.
      if (this.player.hurtState) this.player.separated = true;
    } else if (!this.player.hurtState) {
      // First hit: enter the flashing danger state, lose score, knock/stun.
      this.player.enterHurt();
      this.score = Math.max(0, this.score - window.ENEMY_PENALTY);
      if (hitEnemy.def.knock) this.player.vx = Math.sign(this.player.x - hitEnemy.x || 1) * 320;
      if (hitEnemy.def.stun) this.player.stun(500);
    } else if (this.player.separated) {
      // Hit again during the danger window after having gotten clear → game over.
      return this._triggerGameOver();
    }

    // --- Despawn off-bottom objects, refill upward ---
    this.platforms = this.platforms.filter((p) => {
      if (p.dead || p.y > window.GAME_H + 60) { p.destroy(); return false; }
      return true;
    });
    this.enemies = this.enemies.filter((e) => {
      if (e.dead || e.y > window.GAME_H + 120) { e.destroy(); return false; }
      return true;
    });
    this._fillPlatformsUpward();

    // --- Zone progression ---
    const z = window.zoneForScore(this.score);
    if (z !== this.currentZone) this._enterZone(z, false);

    // --- HUD ---
    this._updateHUD();

    // --- Win / lose ---
    if (this.score >= window.PRIZE_SCORE) return this._triggerWin();
    if (this.player.y - this.player.h / 2 > window.GAME_H) return this._triggerGameOver();
  }

  _parallaxShift(scrollDelta) {
    const wrap = (item, factor) => {
      item.y += scrollDelta * factor;
      if (item.y > window.GAME_H) item.y -= window.GAME_H * 2;
    };
    for (const it of this._parFarItems) wrap(it, 0.15);
    for (const it of this._parMidItems) wrap(it, 0.35);
  }

  // ---------- Zone transition ----------

  _enterZone(z, instant) {
    this.currentZone = z;
    const zone = window.ZONES[z];
    this.physicsVals = { ...zone.physics };
    window.GameState.zoneReached = z;
    this.hudZone.setText('Zone: ' + zone.name);
    if (this.ambient) this.ambient.setParticleTint(zone.accent);
    this._setZoneBackground(z, instant);

    if (instant) {
      UI.paintGradient(this.bg, zone.bgTop, zone.bgBottom);
      return;
    }

    // AUDIO: this.sound.play('sfx_zone'); crossfade bgm_zone<z> — swap in when audio ready

    // Background color tween (800ms) via an interpolation proxy.
    const from = window.ZONES[Math.max(0, z - 1)];
    const proxy = { t: 0 };
    if (window.gsap) {
      gsap.to(proxy, {
        t: 1, duration: 0.8, onUpdate: () => {
          const a = Phaser.Display.Color.IntegerToColor(from.bgTop);
          const b = Phaser.Display.Color.IntegerToColor(zone.bgTop);
          const a2 = Phaser.Display.Color.IntegerToColor(from.bgBottom);
          const b2 = Phaser.Display.Color.IntegerToColor(zone.bgBottom);
          const top = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 1, proxy.t);
          const bot = Phaser.Display.Color.Interpolate.ColorWithColor(a2, b2, 1, proxy.t);
          UI.paintGradient(this.bg,
            Phaser.Display.Color.GetColor(top.r, top.g, top.b),
            Phaser.Display.Color.GetColor(bot.r, bot.g, bot.b));
        },
      });
    } else {
      UI.paintGradient(this.bg, zone.bgTop, zone.bgBottom);
    }

    // Flash overlay (zone color, 300ms).
    const flash = this.add.rectangle(window.GAME_W / 2, window.GAME_H / 2, window.GAME_W, window.GAME_H, zone.accent, 0.5)
      .setDepth(950);
    if (window.gsap) gsap.to(flash, { alpha: 0, duration: 0.3, onComplete: () => flash.destroy() });
    else flash.destroy();

    // Zone name announcement flies in, holds, fades.
    const title = this.add.text(window.GAME_W / 2, window.GAME_H / 2 - 20, zone.name, {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '34px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(951);
    title.setStroke('#000000', 5);
    const sub = this.add.text(window.GAME_W / 2, window.GAME_H / 2 + 16, zone.subtitle, {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#fde68a',
    }).setOrigin(0.5).setDepth(951);

    if (window.gsap) {
      [title, sub].forEach((t, i) => {
        t.x = -200;
        gsap.to(t, { x: window.GAME_W / 2, duration: 0.5, ease: 'back.out(1.5)', delay: i * 0.08 });
        gsap.to(t, { alpha: 0, duration: 0.4, delay: 1.3 + i * 0.08, onComplete: () => t.destroy() });
      });
      // Particle burst on transition.
      this.ambient.emitParticleAt(window.GAME_W / 2, window.GAME_H / 2, 30);
    } else {
      this.time.delayedCall(1400, () => { title.destroy(); sub.destroy(); });
    }
  }

  // ---------- HUD ----------

  _updateHUD() {
    const s = Math.floor(this.score);
    this.hudScore.setText(s.toLocaleString());
    const ratio = Phaser.Math.Clamp(this.score / window.PRIZE_SCORE, 0, 1);
    this.hudProgress.setText(s.toLocaleString() + '/' + window.PRIZE_SCORE.toLocaleString());

    // Bar fill: color shifts purple -> gold as score approaches the prize.
    const purple = Phaser.Display.Color.IntegerToColor(0x7c3aed);
    const gold = Phaser.Display.Color.IntegerToColor(0xfde68a);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(purple, gold, 1, ratio);
    const color = Phaser.Display.Color.GetColor(c.r, c.g, c.b);

    const w = (window.GAME_W - 28);
    const x = window.GAME_W / 2 - w / 2;
    const y = window.GAME_H - 34;
    this.barFill.clear();
    this.barFill.fillStyle(color, 1);
    this.barFill.fillRoundedRect(x, y - 5, w * ratio, 10, 4);
  }

  // ---------- End states ----------

  _finishRun(won) {
    if (this.gameOver) return;
    this.gameOver = true;
    window.GameState.finalScore = Math.floor(this.score);
    window.GameState.zoneReached = this.currentZone;
    window.GameState.won = won;
    this.time.delayedCall(won ? 200 : 400, () => this.scene.start('WinScene'));
  }

  _triggerWin() {
    // AUDIO: this.sound.play('sfx_win') — swap in when assets/audio/win.mp3 ready
    this._finishRun(true);
  }

  _triggerGameOver() {
    this._finishRun(false);
  }
};
