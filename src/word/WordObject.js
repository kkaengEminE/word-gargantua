import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import gsap from 'gsap';
import { ORBIT } from '../utils/constants.js';

export class WordObject {
  constructor(entry, scene) {
    this.entry = entry;
    this.scene = scene;
    this.isSelected = false;

    this.orbitRadius = entry.orbit.radius;
    this.orbitAngle = entry.orbit.angle;
    this.orbitSpeed = entry.orbit.speed;
    this.orbitInclination = entry.orbit.inclination;
    this.yOffset = entry.orbit.yOffset;

    this._currentRadius = this.orbitRadius;

    this._createLabel();
    this._createHitbox();
  }

  _createLabel() {
    const div = document.createElement('div');
    div.className = 'word-label';
    div.textContent = this.entry.text;
    this.labelElement = div;

    this.label = new CSS2DObject(div);
    this.label.layers.set(0);
    this.scene.add(this.label);
  }

  _createHitbox() {
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      visible: false,
    });
    this.hitbox = new THREE.Mesh(geometry, material);
    this.hitbox.userData.wordObject = this;
    this.scene.add(this.hitbox);
  }

  spawnAnimation() {
    this._currentRadius = ORBIT.spawnRadius;
    this.labelElement.style.opacity = '0';
    this.labelElement.style.transform = 'scale(0.5)';

    gsap.to(this.labelElement, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });

    gsap.to(this.labelElement, {
      scale: 1,
      duration: 1.0,
      ease: 'power2.out',
    });

    gsap.to(this, {
      _currentRadius: this.orbitRadius,
      duration: 1.5,
      ease: 'power2.out',
    });
  }

  updatePosition(delta) {
    this.orbitAngle += this.orbitSpeed * delta;

    const x = Math.cos(this.orbitAngle) * this._currentRadius;
    const z = Math.sin(this.orbitAngle) * this._currentRadius;
    const y = this.yOffset + Math.sin(this.orbitAngle * 0.5) * this.orbitInclination * this._currentRadius;

    this.label.position.set(x, y, z);
    this.hitbox.position.set(x, y, z);
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.hitbox.getWorldPosition(pos);
    return pos;
  }

  select() {
    this.isSelected = true;
    this.labelElement.classList.add('selected');
  }

  deselect() {
    this.isSelected = false;
    this.labelElement.classList.remove('selected');
  }

  dispose() {
    this.scene.remove(this.label);
    this.scene.remove(this.hitbox);
    this.hitbox.geometry.dispose();
    this.hitbox.material.dispose();
  }
}
