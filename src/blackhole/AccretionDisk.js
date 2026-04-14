import * as THREE from 'three';
import { BLACK_HOLE, COLORS } from '../utils/constants.js';
import {
  accretionDiskVertex,
  accretionDiskFragment,
  diskParticleVertex,
  diskParticleFragment,
} from './BlackHoleShaders.js';

export class AccretionDisk {
  constructor() {
    this.group = new THREE.Group();
    this.diskUniforms = {
      uTime: { value: 0 },
      uInnerRadius: { value: BLACK_HOLE.diskInnerRadius },
      uOuterRadius: { value: BLACK_HOLE.diskOuterRadius },
    };
    this.particleData = null;
  }

  init(scene) {
    this._createDiskMesh();
    this._createParticles();
    scene.add(this.group);
  }

  _createDiskMesh() {
    const geometry = new THREE.RingGeometry(
      BLACK_HOLE.diskInnerRadius,
      BLACK_HOLE.diskOuterRadius,
      128,
      4
    );
    // Rotate to be horizontal (XZ plane)
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.ShaderMaterial({
      uniforms: this.diskUniforms,
      vertexShader: accretionDiskVertex,
      fragmentShader: accretionDiskFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.diskMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.diskMesh);
  }

  _createParticles() {
    const count = BLACK_HOLE.particleCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    // Store orbital data for animation
    this.particleData = {
      angles: new Float32Array(count),
      radii: new Float32Array(count),
      speeds: new Float32Array(count),
      yOffsets: new Float32Array(count),
    };

    const innerR = BLACK_HOLE.diskInnerRadius;
    const outerR = BLACK_HOLE.diskOuterRadius;

    for (let i = 0; i < count; i++) {
      const radius = innerR + Math.random() * (outerR - innerR);
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.3;

      this.particleData.angles[i] = angle;
      this.particleData.radii[i] = radius;
      this.particleData.speeds[i] = (0.3 / radius) * (0.8 + Math.random() * 0.4);
      this.particleData.yOffsets[i] = yOffset;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = yOffset;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Inner particles are brighter and smaller, outer are dimmer and larger
      const radialNorm = (radius - innerR) / (outerR - innerR);
      sizes[i] = 1.0 + radialNorm * 2.0 + Math.random() * 1.5;
      alphas[i] = (1.0 - radialNorm * 0.6) * (0.3 + Math.random() * 0.7);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xFFAA55) },
      },
      vertexShader: diskParticleVertex,
      fragmentShader: diskParticleFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  rebuildDisk() {
    if (this.diskMesh) {
      this.group.remove(this.diskMesh);
      this.diskMesh.geometry.dispose();
      this.diskMesh.material.dispose();
    }
    this._createDiskMesh();
  }

  rebuildParticles() {
    if (this.particles) {
      this.group.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
    this._createParticles();
  }

  update(delta, elapsed) {
    this.diskUniforms.uTime.value = elapsed;

    if (!this.particleData) return;

    const positions = this.particles.geometry.attributes.position.array;
    const count = this.particleData.angles.length;

    for (let i = 0; i < count; i++) {
      this.particleData.angles[i] += this.particleData.speeds[i] * delta;
      const angle = this.particleData.angles[i];
      const radius = this.particleData.radii[i];

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = this.particleData.yOffsets[i];
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
