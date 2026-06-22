// TitleScene.js — animated star bg, logo, bouncing character previews, PLAY button.

window.TitleScene = class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    UI.autoCleanup(this);
    UI.gradientBg(this, 0x0a0014, 0x1a0840);

    // Twinkling star field.
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      const s = this.add.circle(
        Math.random() * window.GAME_W,
        Math.random() * window.GAME_H,
        Math.random() * 1.6 + 0.5, 0xffffff, Math.random() * 0.6 + 0.2
      );
      if (window.gsap) gsap.to(s, { alpha: 0.1, duration: 1 + Math.random() * 2, yoyo: true, repeat: -1, delay: Math.random() });
      this.stars.push(s);
    }

    // ASSET: replace logo text with this.add.image(GAME_W/2, 150, 'logo_moajump')
    const logo = this.add.text(window.GAME_W / 2, 160, 'MOA JUMP', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '52px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    logo.setStroke('#7c3aed', 8);
    logo.setShadow(0, 4, '#000000', 8, true, true);

    this.add.text(window.GAME_W / 2, 210, 'Jump to the Stars', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#c084fc',
    }).setOrigin(0.5);

    if (window.gsap) gsap.to(logo, { y: 150, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // Bouncing chibi previews (placeholder rects, one per character).
    const startX = window.GAME_W / 2 - (window.CHARACTERS.length - 1) * 35 / 2;
    window.CHARACTERS.forEach((ch, i) => {
      // ASSET: replace rect with this.add.sprite(x, y, 'character_' + ch.id)
      const r = this.add.rectangle(startX + i * 35, 330, 28, 36, ch.color).setStrokeStyle(2, 0xffffff, 0.8);
      if (window.gsap) gsap.to(r, { y: 312, duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.12 });
    });

    UI.button(this, window.GAME_W / 2, 470, 'PLAY', () => {
      this.scene.start('CharacterSelectScene');
    });

    UI.disclaimer(this);
  }
};
