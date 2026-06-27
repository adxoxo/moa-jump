// Player.js — defines window.CHARACTERS and the Player class.
// Physics are MANUAL and screen-space (no Phaser arcade body). GameScene drives update().

// Five original archetypes. No real member names shown in UI (disclaimer-safe).
// Each is paired with a character art file whose persona matches the role:
//   The Mage   <- yj (dramatic, main-character energy)
//   The Bard   <- sb (tall, awkward, secretly cool — the leader)
//   The Jester <- bg (pure chaos, always grinning)
//   The Knight <- ty (intense, focused, works out)
//   The Sage   <- hk (soft maknae, secretly powerful)
// Colors are tuned to each character's actual art so trails/UI feel cohesive.
window.CHARACTERS = [
  { id: 'mage',   name: 'The Mage',   role: 'The Mage',   color: 0xf5c518, hex: '#f5c518', blurb: 'Dramatic. Overthinks everything.', img: 'yj' },
  { id: 'bard',   name: 'The Bard',   role: 'The Bard',   color: 0x3b82f6, hex: '#3b82f6', blurb: 'Tall, awkward, secretly cool.',     img: 'sb' },
  { id: 'jester', name: 'The Jester', role: 'The Jester', color: 0xec4899, hex: '#ec4899', blurb: 'Pure chaos. Always grinning.',       img: 'bg' },
  { id: 'knight', name: 'The Knight', role: 'The Knight', color: 0x9ca3af, hex: '#9ca3af', blurb: 'Intense. Accidentally cool.',        img: 'ty' },
  { id: 'sage',   name: 'The Sage',   role: 'The Sage',   color: 0xa855f7, hex: '#a855f7', blurb: 'Soft, shy, secretly powerful.',      img: 'hk' },
];

window.PLAYER_W = 44;
window.PLAYER_H = 56;

window.Player = class Player {
  constructor(scene, x, y, character) {
    this.scene = scene;
    this.character = character || window.CHARACTERS[0];

    // Screen-space position + velocity (manual physics).
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.w = window.PLAYER_W;
    this.h = window.PLAYER_H;

    this.invincible = false;
    this.alive = true;

    this._buildSprite();
  }

  _buildSprite() {
    const c = this.character.color;
    const img = this.character.img;

    // If this character has a real image asset loaded, use it. Otherwise fall back to
    // the placeholder rectangle + face. (hk.png is a single static image, not a sheet.)
    if (img && this.scene.textures.exists(img)) {
      this.isImage = true;
      const body = this.scene.add.image(0, 0, img).setOrigin(0.5);
      // Fit to ~64px tall, keeping aspect; collision box stays w x h.
      body.setScale(64 / body.height);
      this.container = this.scene.add.container(this.x, this.y, [body]);
      this.container.setDepth(20);
      this.body = body;
      this._baseScale = body.scaleX; // remember for hurt/idle without distorting aspect
    } else {
      this.isImage = false;
      // ASSET: replace this Container of shapes with this.scene.add.sprite(x, y, 'character_' + this.character.id)
      // ASSET: spritesheet key = 'character_<id>', frameWidth: 64, frameHeight: 80
      const body = this.scene.add.rectangle(0, 0, this.w, this.h, c).setStrokeStyle(3, 0xffffff, 0.9);
      body.setOrigin(0.5);
      const eyeL = this.scene.add.circle(-9, -6, 4, 0xffffff);
      const eyeR = this.scene.add.circle(9, -6, 4, 0xffffff);
      const pupL = this.scene.add.circle(-9, -6, 2, 0x111111);
      const pupR = this.scene.add.circle(9, -6, 2, 0x111111);
      const mouth = this.scene.add.rectangle(0, 10, 16, 3, 0x111111);
      this.container = this.scene.add.container(this.x, this.y, [body, eyeL, eyeR, pupL, pupR, mouth]);
      this.container.setDepth(20);
      this.body = body;
    }

    // Gentle idle bob on the body only (does not affect physics position).
    if (window.gsap) {
      gsap.to(this.body, { y: -3, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  }

  // Launch upward. mult>1 for spring platforms.
  jump(mult = 1) {
    const power = this.scene.physicsVals ? this.scene.physicsVals.JUMP_POWER : window.PHYSICS.JUMP_POWER;
    this.vy = power * mult;
    this._squashStretch(mult > 1.2);
    // AUDIO: this.scene.sound.play(mult > 1.2 ? 'sfx_spring' : 'sfx_jump') — swap in when assets/audio ready
  }

  _squashStretch(big) {
    if (!window.gsap) return;
    const s = big ? 0.6 : 0.8;
    gsap.killTweensOf(this.container);
    this.container.scaleX = 1.3;
    this.container.scaleY = s;
    gsap.to(this.container, { scaleX: 1, scaleY: 1, duration: 0.25, ease: 'back.out(2)' });
  }

  // Apply gravity + horizontal motion. dt in seconds.
  update(dt) {
    const G = this.scene.physicsVals ? this.scene.physicsVals.GRAVITY : window.PHYSICS.GRAVITY;
    this.vy += G * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen-edge wrap (exit right -> enter left).
    if (this.x < -this.w / 2) this.x = window.GAME_W + this.w / 2;
    else if (this.x > window.GAME_W + this.w / 2) this.x = -this.w / 2;

    // Face the direction of travel slightly.
    if (this.vx > 5) this.container.scaleX = Math.abs(this.container.scaleX);
    else if (this.vx < -5) this.container.scaleX = -Math.abs(this.container.scaleX);

    this._syncSprite();
  }

  _syncSprite() {
    this.container.x = this.x;
    this.container.y = this.y;
  }

  // Shift down by scrollDelta during camera scroll (screen-space system).
  shiftDown(scrollDelta) {
    this.y += scrollDelta;
  }

  get feetY() { return this.y + this.h / 2; }

  // Briefly freeze steering (sasaeng camera flash). GameScene checks this.stunned.
  stun(ms = 500) {
    this.stunned = true;
    this.scene.time.delayedCall(ms, () => { this.stunned = false; });
  }

  hurt() {
    if (this.invincible || !this.alive) return false;
    this.invincible = true;
    // AUDIO: this.scene.sound.play('sfx_hurt') — swap in when assets/audio/hurt.mp3 ready
    const tintOn = () => this.isImage ? this.body.setTint(0xff2244) : this.body.setFillStyle(0xff2244);
    const tintOff = () => this.isImage ? this.body.clearTint() : this.body.setFillStyle(this.character.color);
    if (window.gsap) {
      // Blink red a few times during invincibility.
      tintOn();
      gsap.to(this.container, {
        alpha: 0.4, duration: 0.12, repeat: 9, yoyo: true,
        onComplete: () => { this.container.alpha = 1; tintOff(); },
      });
    }
    this.scene.time.delayedCall(window.HURT_DURATION, () => { this.invincible = false; });
    return true;
  }

  destroy() {
    if (window.gsap) gsap.killTweensOf([this.container, this.body]);
    this.container.destroy();
  }
};
