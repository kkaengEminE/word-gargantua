export const COLORS = {
  background: 0x030108,
  eventHorizon: 0x010103,
  diskInner: 0xFFD9A0,
  diskMid: 0xFF7A1A,
  diskOuter: 0xCC3305,
  wordText: '#FFC896',
  wordSelected: '#FFFFFF',
  connectionLine: 0x66CCFF,
  uiAccent: '#FFB84D',
};

export const BLACK_HOLE = {
  eventHorizonRadius: 2.0,
  photonRingRadius: 2.1,
  diskInnerRadius: 4.0,
  diskOuterRadius: 6.9,
  glowRadius: 6.5,
  particleCount: 1500,
};

export const ORBIT = {
  minRadius: 3.5,
  maxRadius: 5.0,
  baseSpeed: 0.17,
  maxInclination: 0.15,
  maxYOffset: 0.3,
  spawnRadius: 1.8,
};

export const CAMERA = {
  fov: 45,
  near: 0.1,
  far: 200,
  initialPosition: [0, 5, 12],
  minDistance: 7.5,
  maxDistance: 25,
  autoRotateSpeed: 2.0,
  dampingFactor: 0.08,
};

export const BLOOM = {
  strength: 1.0,
  radius: 0.6,
  threshold: 0.5,
};

export const STARS = {
  count: 3000,
  size: 2.0,
  sphereRadius: 100,
};

export const STORAGE_KEY = 'word-gargantua-data';
