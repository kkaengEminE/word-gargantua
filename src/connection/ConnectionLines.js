import * as THREE from 'three';
import gsap from 'gsap';

export class ConnectionLines {
  constructor(scene) {
    this.scene = scene;
    this.lines = [];
    this.sourceWord = null;
    this.targetWords = [];
  }

  show(sourceWordObj, targetWordObjs) {
    this.hide();

    this.sourceWord = sourceWordObj;
    this.targetWords = targetWordObjs;

    for (const target of targetWordObjs) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6); // 2 points * 3 coords
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x66CCFF,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.lines.push({ line, target, material });

      // Fade in
      gsap.to(material, {
        opacity: 0.5,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    this._updatePositions();
  }

  hide() {
    for (const { line, material } of this.lines) {
      gsap.killTweensOf(material);
      this.scene.remove(line);
      line.geometry.dispose();
      material.dispose();
    }
    this.lines = [];
    this.sourceWord = null;
    this.targetWords = [];
  }

  update() {
    if (this.lines.length === 0) return;
    this._updatePositions();
  }

  _updatePositions() {
    if (!this.sourceWord) return;

    const srcPos = this.sourceWord.getWorldPosition();

    for (const { line, target } of this.lines) {
      const tgtPos = target.getWorldPosition();
      const positions = line.geometry.attributes.position.array;

      positions[0] = srcPos.x;
      positions[1] = srcPos.y;
      positions[2] = srcPos.z;
      positions[3] = tgtPos.x;
      positions[4] = tgtPos.y;
      positions[5] = tgtPos.z;

      line.geometry.attributes.position.needsUpdate = true;
    }
  }
}
