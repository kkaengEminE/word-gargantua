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
  eventHorizonRadius: 1.5,
  photonRingRadius: 2.0,
  diskInnerRadius: 2.5,
  diskOuterRadius: 6.0,
  glowRadius: 8.0,
  particleCount: 2500,
};

export const ORBIT = {
  minRadius: 3.5,
  maxRadius: 7.0,
  baseSpeed: 0.15,
  maxInclination: 0.15,
  maxYOffset: 0.3,
  spawnRadius: 1.8,
};

export const CAMERA = {
  fov: 60,
  near: 0.1,
  far: 200,
  initialPosition: [0, 5, 12],
  minDistance: 6,
  maxDistance: 25,
  autoRotateSpeed: 0.3,
  dampingFactor: 0.08,
};

export const BLOOM = {
  strength: 1.5,
  radius: 0.8,
  threshold: 0.4,
};

export const STORAGE_KEY = 'word-gargantua-data';
