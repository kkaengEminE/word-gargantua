import * as THREE from 'three';
import { BLACK_HOLE } from '../utils/constants.js';
import {
  eventHorizonVertex,
  eventHorizonFragment,
  photonRingVertex,
  photonRingFragment,
  outerGlowVertex,
  outerGlowFragment,
} from './BlackHoleShaders.js';

export class BlackHole {
  constructor() {
    this.group = new THREE.Group();
    this.uniforms = {
      eventHorizon: { uTime: { value: 0 } },
      photonRing: { uTime: { value: 0 } },
    };
  }

  init(scene) {
    this._createEventHorizon();
    this._createPhotonRing();
    this._createOuterGlow();
    scene.add(this.group);
  }

  _createEventHorizon() {
    const geometry = new THREE.SphereGeometry(BLACK_HOLE.eventHorizonRadius, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms.eventHorizon,
      vertexShader: eventHorizonVertex,
      fragmentShader: eventHorizonFragment,
      side: THREE.FrontSide,
    });
    this.eventHorizonMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.eventHorizonMesh);
  }

  _createPhotonRing() {
    const geometry = new THREE.SphereGeometry(BLACK_HOLE.photonRingRadius, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms.photonRing,
      vertexShader: photonRingVertex,
      fragmentShader: photonRingFragment,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.photonRingMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.photonRingMesh);
  }

  _createOuterGlow() {
    const geometry = new THREE.SphereGeometry(BLACK_HOLE.glowRadius, 32, 32);
    const material = new THREE.ShaderMaterial({
      vertexShader: outerGlowVertex,
      fragmentShader: outerGlowFragment,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.outerGlowMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.outerGlowMesh);
  }

  update(elapsed) {
    this.uniforms.eventHorizon.uTime.value = elapsed;
    this.uniforms.photonRing.uTime.value = elapsed;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
