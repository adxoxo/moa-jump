// Platform.js — the Platform class. Screen-space. Five types per ARCHITECTURE.md.
// Types: normal, moving, spring, break, fake.

window.PLATFORM_H = 14;

// Visual cues per type (placeholders — see ASSET comments below).
window.PLATFORM_COLORS = {
  normal: 0x6ee7b7, // overridden by zone tint where useful
  moving: 0xf59e0b, // amber
  spring: 0x22c55e, // green
  break:  0xef4444, // red
  fake:   0x94a3b8, // desaturated grey
};

window.Platform = class Platform {
  // opts: { type, zone, baseSpeed }
  constructor(scene, x, y, w, opts = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = window.PLATFORM_H;
    this.type = opts.type || 'normal';
    this.zone = opts.zone || 0;

    this.dead = false;        // marked for removal
    this.broken = false;      // break type already triggered
    this.landable = this.type !== 'fake';

    // Moving platforms drift horizontally; speed scales with the zone multiplier.
    this.vx = 0;
    if (this.type === 'moving') {
      const baseSpeed = opts.baseSpeed || 60;
      this.vx = (Math.random() < 0.5 ? -1 : 1) * baseSpeed;
    }

    this._buildSprite();
  }

  _buildSprite() {
    let color = window.PLATFORM_COLORS[this.type] || 0x6ee7b7;
    let alpha = 1;
    if (this.type === 'fake') alpha = 0.55; // slightly desaturated/transparent cue

    // ASSET: replace this rectangle with this.scene.add.sprite(x, y, 'platform_z<zone>_<type>')
    // ASSET: platform sprites are 110px wide, 13px tall, scaled down by code as needed
    const rect = this.scene.add.rectangle(this.x, this.y, this.w, this.h, color, alpha);
    rect.setStrokeStyle(2, 0xffffff, this.type === 'fake' ? 0.2 : 0.5);
    rect.setDepth(10);
    this.sprite = rect;

    // Spring indicator: small coil bar on top.
    if (this.type === 'spring') {
      this.indicator = this.scene.add.rectangle(this.x, this.y - this.h / 2 - 3, this.w * 0.5, 5, 0xbbf7d0);
      this.indicator.setDepth(11);
    }

    // Subtle zone-tinted glow placeholder (Phase 6 polish).
    this.sprite.setStrokeStyle(2, color, 0.9);
  }

  update(dt) {
    if (this.dead) return;
    if (this.vx !== 0) {
      this.x += this.vx * dt;
      const half = this.w / 2;
      if (this.x - half < 0) { this.x = half; this.vx *= -1; }
      else if (this.x + half > window.GAME_W) { this.x = window.GAME_W - half; this.vx *= -1; }
    }
    this._sync();
  }

  shiftDown(scrollDelta) {
    this.y += scrollDelta;
    this._sync();
  }

  _sync() {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    if (this.indicator) { this.indicator.x = this.x; this.indicator.y = this.y - this.h / 2 - 3; }
  }

  get topY() { return this.y - this.h / 2; }

  // Called when the player lands. Returns the jump multiplier to apply (0 = no bounce).
  onLand() {
    if (this.type === 'fake') return 0;        // fall through
    if (this.type === 'spring') {
      this._springAnim();
      return window.PHYSICS.SPRING_MULT;        // 1.6x launch
    }
    if (this.type === 'break' && !this.broken) {
      this._crumble();
    }
    // AUDIO: this.scene.sound.play('sfx_land') — swap in when assets/audio/land.mp3 ready
    return 1;
  }

  _springAnim() {
    if (!window.gsap || !this.indicator) return;
    this.indicator.scaleY = 2.2;
    gsap.to(this.indicator, { scaleY: 1, duration: 0.3, ease: 'elastic.out(1,0.4)' });
  }

  // Crumbles 100ms after first contact, then falls away.
  _crumble() {
    this.broken = true;
    this.scene.time.delayedCall(100, () => {
      this.landable = false;
      if (window.gsap) {
        gsap.to(this.sprite, {
          y: this.sprite.y + 200, alpha: 0, angle: 25, duration: 0.5, ease: 'power1.in',
          onComplete: () => { this.dead = true; },
        });
      } else {
        this.dead = true;
      }
    });
  }

  destroy() {
    if (window.gsap) gsap.killTweensOf(this.sprite);
    this.sprite.destroy();
    if (this.indicator) this.indicator.destroy();
  }
};
