// LeaderboardScene.js — top 8 scores, staggered row animation, gold/silver/bronze top 3.
// Uses mock data while USE_LEADERBOARD is false (see services/leaderboard.js).

window.LeaderboardScene = class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene'); }

  create() {
    UI.autoCleanup(this);
    UI.gradientBg(this, 0x0a0014, 0x1a0840);

    this.add.text(window.GAME_W / 2, 50, 'LEADERBOARD', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setStroke('#7c3aed', 5);

    this.loading = this.add.text(window.GAME_W / 2, 250, 'Loading...', {
      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#c4b5fd',
    }).setOrigin(0.5);

    window.Leaderboard.fetchTop(8).then((rows) => this._renderRows(rows));

    UI.button(this, window.GAME_W / 2 - 80, 600, 'Play Again', () => this.scene.start('GameScene'),
      { w: 150, h: 44, fontSize: 16 });
    UI.button(this, window.GAME_W / 2 + 80, 600, 'Menu', () => this.scene.start('TitleScene'),
      { w: 130, h: 44, fontSize: 16, fill: 0x4c1d95 });

    UI.disclaimer(this);
  }

  _renderRows(rows) {
    this.loading.destroy();
    const medals = [0xfde68a, 0xd1d5db, 0xcd7f32]; // gold, silver, bronze
    const startY = 100;
    const rowH = 56;

    rows.forEach((row, i) => {
      const y = startY + i * rowH;
      const isTop3 = i < 3;
      const accent = isTop3 ? medals[i] : 0x4c1d95;

      const container = this.add.container(window.GAME_W / 2, y);
      const bg = this.add.rectangle(0, 0, window.GAME_W - 36, rowH - 8, 0x2a1a4a, isTop3 ? 0.9 : 0.55)
        .setStrokeStyle(2, accent);
      const rank = this.add.text(-(window.GAME_W / 2) + 30, 0, '#' + (i + 1), {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      const name = this.add.text(-(window.GAME_W / 2) + 70, -8, row.player_name, {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '17px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      const role = this.add.text(-(window.GAME_W / 2) + 70, 10, row.character_role, {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#c4b5fd',
      }).setOrigin(0, 0.5);
      const score = this.add.text((window.GAME_W / 2) - 30, 0, (row.score || 0).toLocaleString(), {
        fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px',
        color: isTop3 ? '#fde68a' : '#ffffff', fontStyle: 'bold',
      }).setOrigin(1, 0.5);

      container.add([bg, rank, name, role, score]);

      // Staggered slide-in.
      if (window.gsap) {
        container.x = window.GAME_W + 200;
        gsap.to(container, { x: window.GAME_W / 2, duration: 0.4, ease: 'back.out(1.4)', delay: i * 0.07 });
      }
    });
  }
};
