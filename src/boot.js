// boot.js — loaded last. Constructs the Phaser.Game once all classes exist.

const config = {
  type: Phaser.AUTO,
  width: window.GAME_W,
  height: window.GAME_H,
  parent: 'game-root',
  backgroundColor: '#0a0014',
  scale: {
    mode: Phaser.Scale.FIT,         // letterbox to fit any screen, keep 420x680 aspect
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.GAME_W,
    height: window.GAME_H,
  },
  // No global arcade physics: GameScene uses a manual screen-space system (see CLAUDE.md).
  scene: [
    window.TitleScene,
    window.CharacterSelectScene,
    window.GameScene,
    window.WinScene,
    window.LeaderboardScene,
  ],
};

window.game = new Phaser.Game(config);
