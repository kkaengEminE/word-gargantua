export const eventHorizonVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const eventHorizonFragment = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  // Simple hash noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    float fresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 2.0);
    float shimmer = noise(vUv * 8.0 + uTime * 0.3) * 0.03;

    vec3 baseColor = vec3(0.005, 0.003, 0.01);
    vec3 edgeColor = vec3(0.15, 0.06, 0.02);

    vec3 color = mix(baseColor, edgeColor, fresnel * 0.5 + shimmer);
    float alpha = 1.0;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const photonRingVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const photonRingFragment = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 3.5);
    float pulse = 1.0 + sin(uTime * 1.5) * 0.08;

    vec3 innerColor = vec3(1.0, 0.6, 0.2);
    vec3 outerColor = vec3(1.0, 0.85, 0.6);
    vec3 color = mix(innerColor, outerColor, fresnel) * pulse;

    float alpha = fresnel * 0.7;
    gl_FragColor = vec4(color, alpha);
  }
`;

export const accretionDiskVertex = `
  varying vec2 vUv;
  varying float vRadius;

  void main() {
    vUv = uv;
    // For RingGeometry, compute radial distance from center
    vRadius = length(position.xz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const accretionDiskFragment = `
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  varying vec2 vUv;
  varying float vRadius;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      val += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  void main() {
    float radialNorm = (vRadius - uInnerRadius) / (uOuterRadius - uInnerRadius);
    radialNorm = clamp(radialNorm, 0.0, 1.0);

    // Angle from UV for turbulence
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float turbulence = fbm(vec2(angle * 3.0 + uTime * 0.15, radialNorm * 6.0 + uTime * 0.05));

    // Color gradient: inner hot white-gold to outer deep red
    vec3 innerColor = vec3(1.0, 0.85, 0.6);
    vec3 midColor = vec3(1.0, 0.5, 0.15);
    vec3 outerColor = vec3(0.8, 0.15, 0.02);

    vec3 color;
    if (radialNorm < 0.4) {
      color = mix(innerColor, midColor, radialNorm / 0.4);
    } else {
      color = mix(midColor, outerColor, (radialNorm - 0.4) / 0.6);
    }

    // Apply turbulence brightness variation
    color *= 0.7 + turbulence * 0.6;

    // Fade edges
    float innerFade = smoothstep(0.0, 0.15, radialNorm);
    float outerFade = 1.0 - smoothstep(0.85, 1.0, radialNorm);
    float alpha = innerFade * outerFade * (0.6 + turbulence * 0.3);

    gl_FragColor = vec4(color, alpha);
  }
`;

export const diskParticleVertex = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const diskParticleFragment = `
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = vAlpha * (1.0 - dist * 2.0);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const outerGlowVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const outerGlowFragment = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 2.0);
    vec3 color = vec3(0.8, 0.35, 0.05);
    float alpha = fresnel * 0.06;
    gl_FragColor = vec4(color, alpha);
  }
`;
