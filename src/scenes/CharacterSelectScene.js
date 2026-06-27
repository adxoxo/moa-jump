// CharacterSelectScene.js — 5 cards, tap to select, prize banner, Let's Go button.

window.CharacterSelectScene = class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  preload() {
    window.CHARACTERS.forEach((ch) => {
      if (ch.img && !this.textures.exists(ch.img)) this.load.image(ch.img, 'assets/characters/' + ch.img + '.png');
    });
  }

  create() {
    UI.autoCleanup(this);
    UI.gradientBg(this, 0x0a0014, 0x1a0840);

    this.add.text(window.GAME_W / 2, 50, 'CHOOSE YOUR HERO', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.selectedIndex = 0;
    this.cards = [];

    const cardW = 70, cardH = 100, gap = 8;
    const total = window.CHARACTERS.length * cardW + (window.CHARACTERS.length - 1) * gap;
    const startX = (window.GAME_W - total) / 2 + cardW / 2;
    const cardY = 170;

    window.CHARACTERS.forEach((ch, i) => {
      const x = startX + i * (cardW + gap);
      const container = this.add.container(x, cardY);

      // ASSET: replace card_bg rect with this.add.image(0, 0, 'card_bg') / 'card_selected'
      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x2a1a4a).setStrokeStyle(2, 0x4c1d95);
      let chibi;
      if (ch.img && this.textures.exists(ch.img)) {
        chibi = this.add.image(0, -12, ch.img).setOrigin(0.5);
        chibi.setScale(60 / chibi.height); // fit within card
      } else {
        // ASSET: replace chibi rect with this.add.sprite(0, -10, 'character_' + ch.id)
        chibi = this.add.rectangle(0, -12, 34, 44, ch.color).setStrokeStyle(2, 0xffffff, 0.8);
      }
      const name = this.add.text(0, 30, ch.role.replace('The ', ''), {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '12px', color: '#e9d5ff',
      }).setOrigin(0.5);

      container.add([bg, chibi, name]);
      container.setSize(cardW, cardH);
      container.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
      container.on('pointerdown', () => this.select(i));

      this.cards.push({ container, bg, chibi, ch });
    });

    // Detail panel.
    this.detailName = this.add.text(window.GAME_W / 2, 300, '', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.detailBlurb = this.add.text(window.GAME_W / 2, 332, '', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '14px', color: '#c4b5fd', align: 'center',
      wordWrap: { width: 320 },
    }).setOrigin(0.5);

    // Prize banner (no photocard / TXT mention).
    const banner = this.add.rectangle(window.GAME_W / 2, 410, 280, 44, 0x7c3aed, 0.25).setStrokeStyle(2, 0xc084fc);
    this.add.text(window.GAME_W / 2, 410, 'Reach ' + window.PRIZE_SCORE.toLocaleString() + ' to win!', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#fde68a', fontStyle: 'bold',
    }).setOrigin(0.5);
    if (window.gsap) gsap.to(banner, { alpha: 0.45, duration: 1, yoyo: true, repeat: -1 });

    UI.button(this, window.GAME_W / 2, 490, "Let's Go!", () => {
      window.GameState.selectedCharacter = window.CHARACTERS[this.selectedIndex];
      this.scene.start('GameScene');
    });

    UI.disclaimer(this);
    this.select(0);
  }

  select(i) {
    this.selectedIndex = i;
    this.cards.forEach((card, idx) => {
      const on = idx === i;
      card.bg.setStrokeStyle(on ? 4 : 2, on ? 0xfde68a : 0x4c1d95);
      card.bg.setFillStyle(on ? 0x3b2563 : 0x2a1a4a);
      if (window.gsap) gsap.to(card.container, { scale: on ? 1.15 : 1, duration: 0.2, ease: 'back.out(2)' });
    });
    const ch = window.CHARACTERS[i];
    this.detailName.setText(ch.role).setColor(ch.hex);
    this.detailBlurb.setText(ch.blurb);
  }
};
