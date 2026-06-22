// WinScene.js — shows win OR lose state. Confetti + score count-up on win.
// Win banner says "Show this screen to claim your prize." (NO photocard/TXT mention.)

window.WinScene = class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  create() {
    UI.autoCleanup(this);
    const won = window.GameState.won;
    const finalScore = window.GameState.finalScore;

    UI.gradientBg(this, won ? 0x1a0840 : 0x14101f, won ? 0x3b0a6b : 0x0a0014);
    if (won) this._makeConfettiTexture();

    // Title.
    const title = this.add.text(window.GAME_W / 2, 120, won ? 'YOU REACHED\nTHE STARS!' : 'GAME OVER', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: won ? '40px' : '38px',
      color: '#ffffff', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    title.setStroke(won ? '#fde68a' : '#7c3aed', 6);

    // ASSET: on win, replace this with this.add.image(GAME_W/2, 230, 'win_star')
    if (won) {
      const star = this.add.star(window.GAME_W / 2, 235, 5, 22, 48, 0xfde68a).setStrokeStyle(3, 0xffffff, 0.8);
      if (window.gsap) gsap.to(star, { angle: 360, duration: 6, repeat: -1, ease: 'none' });
      if (window.gsap) gsap.to(star, { scale: 1.12, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    // Score label + animated count-up.
    this.add.text(window.GAME_W / 2, 320, 'SCORE', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '14px', color: '#a78bfa',
    }).setOrigin(0.5);
    const scoreText = this.add.text(window.GAME_W / 2, 352, '0', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '46px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    if (window.gsap) {
      const counter = { v: 0 };
      gsap.to(counter, { v: finalScore, duration: 1.2, ease: 'power2.out',
        onUpdate: () => scoreText.setText(Math.floor(counter.v).toLocaleString()) });
    } else {
      scoreText.setText(finalScore.toLocaleString());
    }

    // Win banner (prize text — no photocard/TXT).
    if (won) {
      const banner = this.add.rectangle(window.GAME_W / 2, 410, 340, 50, 0xfde68a, 0.18).setStrokeStyle(2, 0xfde68a);
      this.add.text(window.GAME_W / 2, 410, 'Show this screen to claim your prize.', {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#fde68a', fontStyle: 'bold',
        align: 'center', wordWrap: { width: 320 },
      }).setOrigin(0.5);
      if (window.gsap) gsap.to(banner, { alpha: 0.32, duration: 0.9, yoyo: true, repeat: -1 });
    } else {
      this.add.text(window.GAME_W / 2, 410, 'So close! Try again?', {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#c4b5fd',
      }).setOrigin(0.5);
    }

    // Buttons.
    UI.button(this, window.GAME_W / 2, 480, 'Play Again', () => this.scene.start('GameScene'), { w: 200, h: 48 });
    UI.button(this, window.GAME_W / 2 - 80, 540, 'Leaderboard', () => {
      window.Leaderboard.submit({
        player_name: window.GameState.playerName || 'PLAYER',
        character_role: (window.GameState.selectedCharacter || {}).role || 'The Mage',
        score: finalScore, zone_reached: window.GameState.zoneReached,
      });
      this.scene.start('LeaderboardScene');
    }, { w: 150, h: 44, fontSize: 16, fill: 0x4c1d95 });
    UI.button(this, window.GAME_W / 2 + 80, 540, 'Menu', () => this.scene.start('TitleScene'),
      { w: 130, h: 44, fontSize: 16, fill: 0x4c1d95 });

    UI.disclaimer(this);

    if (won && window.gsap) this._confettiBursts();
  }

  _makeConfettiTexture() {
    if (this.textures.exists('confetti')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 8, 6); g.generateTexture('confetti', 8, 6); g.destroy();
  }

  // 5 staggered confetti bursts.
  _confettiBursts() {
    const tints = [0xf87171, 0xfbbf24, 0x34d399, 0x60a5fa, 0xc084fc, 0xf472b6];
    const emitter = this.add.particles(0, 0, 'confetti', {
      x: { min: 0, max: window.GAME_W }, y: -10,
      lifespan: 2500, speedY: { min: 120, max: 260 }, speedX: { min: -80, max: 80 },
      angle: { min: 0, max: 360 }, rotate: { min: 0, max: 360 },
      scale: { min: 0.6, max: 1.4 }, gravityY: 200, tint: tints,
      frequency: -1, quantity: 30,
    }).setDepth(800);
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 100, () => emitter.emitParticleAt(Phaser.Math.Between(40, window.GAME_W - 40), -10, 30));
    }
  }
};
