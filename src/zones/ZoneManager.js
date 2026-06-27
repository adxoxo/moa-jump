// ZoneManager.js — defines window.ZONES and drives zone transitions in GameScene.
// Three zones by score: 0 (0-999), 1 (1000-1999), 2 (2000+).

window.ZONES = [
  {
    id: 0,
    name: 'The Real World',
    subtitle: 'Jump to the rooftops',
    bgTop: 0x1a1a2e, bgBottom: 0x16213e,
    accent: 0x60a5fa,
    physics: { GRAVITY: 1800, JUMP_POWER: -750, PLATFORM_SPEED: 1.0 },
    gap: 65,
    // platform type weights
    platformWeights: { normal: 0.62, spring: 0.12, moving: 0.13, break: 0.13, fake: 0.0 },
    enemies: ['pigeon', 'company_building', 'sasaeng'],
    enemyChance: 0.16,
    particle: 'dust',
  },
  {
    id: 1,
    name: 'The Chaos',
    subtitle: 'Reality is breaking',
    bgTop: 0x2d0060, bgBottom: 0x1a0030,
    accent: 0xc084fc,
    physics: { GRAVITY: 1850, JUMP_POWER: -760, PLATFORM_SPEED: 1.35 },
    gap: 68,
    platformWeights: { normal: 0.40, spring: 0.12, moving: 0.20, break: 0.16, fake: 0.12 },
    enemies: ['manager', 'bad_review', 'fan_wave'],
    enemyChance: 0.27,
    particle: 'glitch',
  },
  {
    id: 2,
    name: 'The Star',
    subtitle: 'The final frontier',
    bgTop: 0x000010, bgBottom: 0x0a0030,
    accent: 0xfde68a,
    physics: { GRAVITY: 1900, JUMP_POWER: -770, PLATFORM_SPEED: 1.7 },
    gap: 72,
    platformWeights: { normal: 0.34, spring: 0.11, moving: 0.23, break: 0.18, fake: 0.14 },
    enemies: ['rival_ship', 'cease_desist', 'antifan_meteor', 'blackhole'],
    enemyChance: 0.36,
    particle: 'star',
  },
];

// Zones split the run into thirds of PRIZE_SCORE, so the three worlds stay
// spread across the whole game regardless of the prize target.
window.zoneForScore = function (score) {
  const third = window.PRIZE_SCORE / 3;
  if (score >= third * 2) return 2;
  if (score >= third) return 1;
  return 0;
};

// Weighted random platform type for a zone.
window.pickPlatformType = function (zone) {
  const w = zone.platformWeights;
  const r = Math.random();
  let acc = 0;
  for (const type of ['normal', 'spring', 'moving', 'break', 'fake']) {
    acc += (w[type] || 0);
    if (r < acc) return type;
  }
  return 'normal';
};
