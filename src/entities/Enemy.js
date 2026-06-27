// Enemy.js — themed enemy roster matching ASSETS.md / the design docs.
// Names correspond to the art files in assets/enemies/ (enemy_<type>.png).
// Real art is used when the texture is loaded; otherwise a correctly-named placeholder.
//
// Zone 0 (Real World): pigeon, company_building, sasaeng
// Zone 1 (Chaos):      manager, bad_review, fan_wave
// Zone 2 (Star):       rival_ship, cease_desist, antifan_meteor, blackhole
//
// behavior: how it moves. damage: hurts on contact. knock: shoves player sideways.
// stun: briefly freezes player steering. pull: blackhole gravity radius (no contact damage).
window.ENEMY_DEFS = {
  // ---- Zone 0 ----
  pigeon:            { w: 38, h: 30, color: 0xb0b4bd, behavior: 'drift',     speed: 28,  damage: true, knock: true },
  company_building:  { w: 52, h: 72, color: 0x6b7280, behavior: 'descend',   speed: 70,  damage: true, img: true },
  sasaeng:           { w: 40, h: 50, color: 0xfde047, behavior: 'drift',     speed: 55,  damage: true, stun: true, img: true },
  // ---- Zone 1 ----
  manager:           { w: 34, h: 42, color: 0x1f2937, behavior: 'chase',     speed: 55,  damage: true },
  bad_review:        { w: 46, h: 38, color: 0x111111, behavior: 'homing',    speed: 95,  damage: true, img: true },
  fan_wave:          { w: 420, h: 30, color: 0xf472b6, behavior: 'sweep',    speed: 180, damage: true },
  // ---- Zone 2 ----
  rival_ship:        { w: 54, h: 32, color: 0x64748b, behavior: 'flyacross', speed: 300, damage: true },
  cease_desist:      { w: 40, h: 46, color: 0xe5e7eb, behavior: 'diagbounce', speed: 240, damage: true },
  antifan_meteor:    { w: 46, h: 46, color: 0x7f1d1d, behavior: 'diagonal',  speed: 320, damage: true },
  blackhole:         { w: 58, h: 58, color: 0x4c1d95, behavior: 'pull',      speed: 0,   damage: false, pull: 95 },
};

window.Enemy = class Enemy {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type = type;
    const def = window.ENEMY_DEFS[type] || window.ENEMY_DEFS.pigeon;
    this.def = def;
    this.x = x;
    this.y = y;
    this.w = def.w;
    this.h = def.h;
    this.dead = false;
    this.visible = true;

    // Per-behavior initial velocity.
    this.vx = 0; this.vy = 0;
    const s = def.speed;
    const side = Math.random() < 0.5 ? -1 : 1;
    switch (def.behavior) {
      case 'drift':      this.vx = side * s; break;
      case 'descend':    this.vy = s; break;
      case 'flyacross':  this.vx = side * s; break;
      case 'diagonal':   this.vx = side * s * 0.7; this.vy = s; break;
      case 'diagbounce': this.vx = side * s * 0.8; this.vy = s * 0.6; break;
      case 'sweep':      this.x = side < 0 ? -def.w / 2 : window.GAME_W + def.w / 2; this.vx = -side * s; break;
    }

    this._buildSprite();
  }

  _buildSprite() {
    const key = 'enemy_' + this.type;
    if (this.def.img && this.scene.textures.exists(key)) {
      const img = this.scene.add.image(this.x, this.y, key).setOrigin(0.5).setDepth(15);
      const scale = this.h / img.height;
      img.setScale(scale);
      this.w = img.displayWidth;          // collision matches the drawn art
      this.sprite = img;
    } else {
      // ASSET: drop assets/enemies/enemy_<type>.png to auto-replace this placeholder.
      const rect = this.scene.add.rectangle(this.x, this.y, this.w, this.h, this.def.color, 0.95);
      rect.setStrokeStyle(2, 0xffffff, 0.6).setDepth(15);
      this.sprite = rect;
      this.eyeL = this.scene.add.circle(this.x - 6, this.y - 3, 2.5, 0x111111).setDepth(16);
      this.eyeR = this.scene.add.circle(this.x + 6, this.y - 3, 2.5, 0x111111).setDepth(16);
    }

    if (this.type === 'blackhole') {
      this.ring = this.scene.add.circle(this.x, this.y, this.def.pull, 0x8b5cf6, 0.08).setDepth(14);
      if (window.gsap) gsap.to(this.sprite, { angle: 360, duration: 3, repeat: -1, ease: 'none' });
    }
  }

  update(dt, player) {
    if (this.dead) return;
    const def = this.def;

    switch (def.behavior) {
      case 'drift':
        this.x += this.vx * dt;
        if (this.x < 20 || this.x > window.GAME_W - 20) this.vx *= -1;
        break;
      case 'descend':
        this.y += this.vy * dt;
        if (player) this.x += Math.sign(player.x - this.x) * 20 * dt; // slow lean toward player
        break;
      case 'chase':
        if (player) { this.vx = Math.sign(player.x - this.x) * def.speed; this.x += this.vx * dt; }
        break;
      case 'homing':
        if (player) {
          const dx = player.x - this.x, dy = player.y - this.y;
          const d = Math.hypot(dx, dy) || 1;
          this.x += (dx / d) * def.speed * dt;
          this.y += (dy / d) * def.speed * dt;
        }
        break;
      case 'flyacross':
        this.x += this.vx * dt;
        if (this.x < -this.w) this.x = window.GAME_W + this.w;
        else if (this.x > window.GAME_W + this.w) this.x = -this.w;
        break;
      case 'sweep':
        this.x += this.vx * dt;
        if (this.x < -this.w - 4 || this.x > window.GAME_W + this.w + 4) this.dead = true;
        break;
      case 'diagonal':
        this.x += this.vx * dt; this.y += this.vy * dt;
        break;
      case 'diagbounce':
        this.x += this.vx * dt; this.y += this.vy * dt;
        if (this.x < this.w / 2 || this.x > window.GAME_W - this.w / 2) this.vx *= -1;
        break;
      case 'pull':
        if (player) {
          const dx = this.x - player.x, dy = this.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist < def.pull && dist > 1) {
            const force = (1 - dist / def.pull) * 260;
            player.vx += (dx / dist) * force * dt * 60;
          }
        }
        break;
    }
    this._sync();
  }

  shiftDown(scrollDelta) { this.y += scrollDelta; this._sync(); }

  _sync() {
    this.sprite.x = this.x; this.sprite.y = this.y;
    if (this.ring) { this.ring.x = this.x; this.ring.y = this.y; }
    if (this.eyeL) { this.eyeL.x = this.x - 6; this.eyeL.y = this.y - 3; }
    if (this.eyeR) { this.eyeR.x = this.x + 6; this.eyeR.y = this.y - 3; }
  }

  overlaps(player) {
    if (this.dead || !this.visible) return false;
    return Math.abs(this.x - player.x) < (this.w + player.w) / 2 &&
           Math.abs(this.y - player.y) < (this.h + player.h) / 2;
  }

  destroy() {
    if (window.gsap) gsap.killTweensOf(this.sprite);
    this.sprite.destroy();
    if (this.ring) this.ring.destroy();
    if (this.eyeL) this.eyeL.destroy();
    if (this.eyeR) this.eyeR.destroy();
  }
};
