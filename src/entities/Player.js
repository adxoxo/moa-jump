// Player.js — defines window.CHARACTERS and the Player class.
// Physics are MANUAL and screen-space (no Phaser arcade body). GameScene drives update().

// Five original archetypes. No real member names (see CLAUDE.md / ARCHITECTURE.md).
window.CHARACTERS = [
  { id: 'mage',   name: 'The Mage',   role: 'The Mage',   color: 0x3b82f6, hex: '#3b82f6', blurb: 'Dramatic. Overthinks everything.' },
  { id: 'bard',   name: 'The Bard',   role: 'The Bard',   color: 0xa855f7, hex: '#a855f7', blurb: 'Tall, awkward, secretly cool.' },
  { id: 'jester', name: 'The Jester', role: 'The Jester', color: 0xf97316, hex: '#f97316', blurb: 'Pure chaos. Always grinning.' },
  { id: 'knight', name: 'The Knight', role: 'The Knight', color: 0xec4899, hex: '#ec4899', blurb: 'Intense. Accidentally cool.' },
  { id: 'sage',   name: 'The Sage',   role: 'The Sage',   color: 0x22d3ee, hex: '#22d3ee', blurb: 'Soft, shy, secretly powerful.' },
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

    // ASSET: replace this Container of shapes with this.scene.add.sprite(x, y, 'character_' + this.character.id)
    // ASSET: spritesheet key = 'character_<id>', frameWidth: 64, frameHeight: 80
    // ASSET: animations: '<id>_idle' (frames 0-3, loop), '<id>_jump' (frames 4-5, once on jump)
    const body = this.scene.add.rectangle(0, 0, this.w, this.h, c).setStrokeStyle(3, 0xffffff, 0.9);
    body.setOrigin(0.5);

    // Simple face so the placeholder reads as a character.
    const eyeL = this.scene.add.circle(-9, -6, 4, 0xffffff);
    const eyeR = this.scene.add.circle(9, -6, 4, 0xffffff);
    const pupL = this.scene.add.circle(-9, -6, 2, 0x111111);
    const pupR = this.scene.add.circle(9, -6, 2, 0x111111);
    const mouth = this.scene.add.rectangle(0, 10, 16, 3, 0x111111);

    this.container = this.scene.add.container(this.x, this.y, [body, eyeL, eyeR, pupL, pupR, mouth]);
    this.container.setDepth(20);
    this.body = body;

    // Gentle idle bob on the body only (does not affect physics position).
    if (window.gsap) {
      gsap.to(body, { y: -3, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
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

  hurt() {
    if (this.invincible || !this.alive) return false;
    this.invincible = true;
    // AUDIO: this.scene.sound.play('sfx_hurt') — swap in when assets/audio/hurt.mp3 ready
    if (window.gsap) {
      gsap.to(this.body, {
        duration: 0.12, repeat: 9, yoyo: true,
        onUpdate: () => {},
        onStart: () => this.body.setFillStyle(0xff2244),
        onComplete: () => this.body.setFillStyle(this.character.color),
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
