// Enemy.js — the Enemy class. Screen-space. Six behaviors per ARCHITECTURE.md.
// pigeon, glitch_block, dream_creature, debris, alien, blackhole.

window.ENEMY_DEFS = {
  pigeon:         { w: 36, h: 28, color: 0xb0b4bd, damage: true,  knock: true },
  glitch_block:   { w: 34, h: 34, color: 0xec4899, damage: true },
  dream_creature: { w: 38, h: 30, color: 0xa78bfa, damage: true },
  debris:         { w: 50, h: 24, color: 0x9ca3af, damage: true },
  alien:          { w: 36, h: 40, color: 0x84cc16, damage: true },
  blackhole:      { w: 56, h: 56, color: 0x4c1d95, damage: false, pull: 90 },
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
    this.visible = true;     // glitch_block toggles this
    this.t = Math.random() * Math.PI * 2; // phase for sine motion

    // Per-type motion setup.
    if (type === 'dream_creature') { this.vx = (Math.random() < 0.5 ? -1 : 1) * 70; this.baseY = y; }
    if (type === 'debris')         { this.vx = (Math.random() < 0.5 ? -1 : 1) * 320; }
    if (type === 'pigeon')         { this.vx = (Math.random() < 0.5 ? -1 : 1) * 25; }
    if (type === 'alien')          { this.vx = 0; }

    this._buildSprite();
  }

  _buildSprite() {
    // ASSET: replace this rectangle with this.scene.add.sprite(x, y, 'enemy_<type>')
    // ASSET: enemy PNGs are static; code handles all movement
    const rect = this.scene.add.rectangle(this.x, this.y, this.w, this.h, this.def.color, 0.95);
    rect.setStrokeStyle(2, 0xffffff, 0.6);
    rect.setDepth(15);
    this.sprite = rect;

    if (this.type === 'blackhole') {
      rect.setStrokeStyle(3, 0x8b5cf6, 0.9);
      // pulsing pull-radius hint
      this.ring = this.scene.add.circle(this.x, this.y, this.def.pull, 0x8b5cf6, 0.07);
      this.ring.setDepth(14);
      if (window.gsap) gsap.to(rect, { angle: 360, duration: 3, repeat: -1, ease: 'none' });
    } else {
      // little eyes so placeholder reads as a creature
      this.eyeL = this.scene.add.circle(this.x - 6, this.y - 3, 2.5, 0x111111).setDepth(16);
      this.eyeR = this.scene.add.circle(this.x + 6, this.y - 3, 2.5, 0x111111).setDepth(16);
    }
  }

  // dt seconds. player passed for tracking/pull behaviors.
  update(dt, player) {
    if (this.dead) return;

    switch (this.type) {
      case 'pigeon':
        this.x += this.vx * dt;
        if (this.x < 20 || this.x > window.GAME_W - 20) this.vx *= -1;
        break;
      case 'glitch_block':
        this.t += dt;
        // blink in/out roughly every ~0.6s
        if (this.t > 0.6) { this.t = 0; this.visible = !this.visible; this.sprite.setVisible(this.visible); }
        break;
      case 'dream_creature':
        this.t += dt * 3;
        this.x += this.vx * dt;
        this.y = this.baseY + Math.sin(this.t) * 18;
        if (this.x < 0 || this.x > window.GAME_W) this.vx *= -1;
        break;
      case 'debris':
        this.x += this.vx * dt;
        if (this.x < -this.w) this.x = window.GAME_W + this.w;
        else if (this.x > window.GAME_W + this.w) this.x = -this.w;
        break;
      case 'alien':
        if (player) {
          const dir = Math.sign(player.x - this.x);
          this.vx = dir * 55; // slow tracking
          this.x += this.vx * dt;
        }
        break;
      case 'blackhole':
        // No motion; pulls the player sideways within radius.
        if (player) {
          const dx = this.x - player.x;
          const dy = this.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist < this.def.pull && dist > 1) {
            const force = (1 - dist / this.def.pull) * 260;
            player.vx += (dx / dist) * force * dt * 60;
          }
        }
        break;
    }
    this._sync();
  }

  shiftDown(scrollDelta) {
    this.y += scrollDelta;
    if (this.type === 'dream_creature') this.baseY += scrollDelta;
    this._sync();
  }

  _sync() {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    if (this.ring) { this.ring.x = this.x; this.ring.y = this.y; }
    if (this.eyeL) { this.eyeL.x = this.x - 6; this.eyeL.y = this.y - 3; }
    if (this.eyeR) { this.eyeR.x = this.x + 6; this.eyeR.y = this.y - 3; }
  }

  // AABB overlap with the player. glitch_block only hits while visible.
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
