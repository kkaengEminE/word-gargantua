import * as THREE from 'three';
import { BLACK_HOLE, COLORS } from '../utils/constants.js';
import {
  accretionDiskVertex,
  accretionDiskVertexVertical,
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
    this.verticalParticleData = null;
  }

  init(scene) {
    this._createDiskMesh();
    this._createVerticalDiskMesh();
    this._createParticles();
    this._createVerticalParticles();
    scene.add(this.group);
  }

  _createDiskMesh() {
    const geometry = new THREE.RingGeometry(
      BLACK_HOLE.diskInnerRadius,
      BLACK_HOLE.diskOuterRadius,
      128,
      4
    );
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

  _createVerticalDiskMesh() {
    const geometry = new THREE.RingGeometry(
      BLACK_HOLE.diskInnerRadius,
      BLACK_HOLE.diskOuterRadius,
      128,
      4
    );
    // No rotation — stays in XY plane (vertical)

    const material = new THREE.ShaderMaterial({
      uniforms: this.diskUniforms,
      vertexShader: accretionDiskVertexVertical,
      fragmentShader: accretionDiskFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      opacity: 0.7,
    });

    this.verticalDiskMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.verticalDiskMesh);
  }

  _createParticles() {
    const count = BLACK_HOLE.particleCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

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

  _createVerticalParticles() {
    const count = Math.floor(BLACK_HOLE.particleCount * 0.5);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    this.verticalParticleData = {
      angles: new Float32Array(count),
      radii: new Float32Array(count),
      speeds: new Float32Array(count),
      zOffsets: new Float32Array(count),
    };

    const innerR = BLACK_HOLE.diskInnerRadius;
    const outerR = BLACK_HOLE.diskOuterRadius;

    for (let i = 0; i < count; i++) {
      const radius = innerR + Math.random() * (outerR - innerR);
      const angle = Math.random() * Math.PI * 2;
      const zOffset = (Math.random() - 0.5) * 0.3;

      this.verticalParticleData.angles[i] = angle;
      this.verticalParticleData.radii[i] = radius;
      this.verticalParticleData.speeds[i] = (0.3 / radius) * (0.8 + Math.random() * 0.4);
      this.verticalParticleData.zOffsets[i] = zOffset;

      // XY plane orbit
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = zOffset;

      const radialNorm = (radius - innerR) / (outerR - innerR);
      sizes[i] = 1.0 + radialNorm * 2.0 + Math.random() * 1.5;
      alphas[i] = (1.0 - radialNorm * 0.6) * (0.2 + Math.random() * 0.5);
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

    this.verticalParticles = new THREE.Points(geometry, material);
    this.group.add(this.verticalParticles);
  }

  rebuildDisk() {
    if (this.diskMesh) {
      this.group.remove(this.diskMesh);
      this.diskMesh.geometry.dispose();
      this.diskMesh.material.dispose();
    }
    this._createDiskMesh();
    if (this.verticalDiskMesh) {
      this.group.remove(this.verticalDiskMesh);
      this.verticalDiskMesh.geometry.dispose();
      this.verticalDiskMesh.material.dispose();
    }
    this._createVerticalDiskMesh();
  }

  rebuildParticles() {
    if (this.particles) {
      this.group.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
    this._createParticles();
    if (this.verticalParticles) {
      this.group.remove(this.verticalParticles);
      this.verticalParticles.geometry.dispose();
      this.verticalParticles.material.dispose();
    }
    this._createVerticalParticles();
  }

  update(delta, elapsed) {
    this.diskUniforms.uTime.value = elapsed;

    // Horizontal particles
    if (this.particleData) {
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

    // Vertical particles (XY plane orbit)
    if (this.verticalParticleData) {
      const vPos = this.verticalParticles.geometry.attributes.position.array;
      const vCount = this.verticalParticleData.angles.length;

      for (let i = 0; i < vCount; i++) {
        this.verticalParticleData.angles[i] += this.verticalParticleData.speeds[i] * delta;
        const angle = this.verticalParticleData.angles[i];
        const radius = this.verticalParticleData.radii[i];

        vPos[i * 3] = Math.cos(angle) * radius;
        vPos[i * 3 + 1] = Math.sin(angle) * radius;
        vPos[i * 3 + 2] = this.verticalParticleData.zOffsets[i];
      }
      this.verticalParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
