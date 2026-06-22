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

// Real-device tap reliability: when the page layout shifts, Phaser's cached canvas
// position (used to map a tap to game coordinates) goes stale and taps land in the
// wrong place — the classic "my taps sometimes don't register" bug. The mobile address
// bar showing/hiding, rotation, zoom, or tab refocus all trigger this.
//
// A single refresh() on the event isn't enough: orientation changes and toolbar slides
// ANIMATE over ~200-300ms, so refreshing immediately reads a layout that's still moving.
// We refresh right away AND on a few trailing ticks so the bounds end up correct once
// the layout settles.
function refreshScale() {
  if (window.game && window.game.scale) window.game.scale.refresh();
}
let refreshTimers = [];
function scheduleRefresh() {
  refreshScale();
  refreshTimers.forEach(clearTimeout);
  refreshTimers = [120, 300, 600].map((d) => setTimeout(refreshScale, d));
}
['resize', 'orientationchange', 'pageshow', 'focus'].forEach((ev) => window.addEventListener(ev, scheduleRefresh));
window.addEventListener('scroll', scheduleRefresh, { passive: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleRefresh(); });
