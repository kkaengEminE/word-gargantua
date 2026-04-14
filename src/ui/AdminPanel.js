import { BLACK_HOLE, ORBIT, CAMERA, BLOOM, STARS } from '../utils/constants.js';

export class AdminPanel {
  constructor({ sceneManager, blackHole, accretionDisk, starField, wordManager }) {
    this.sceneManager = sceneManager;
    this.blackHole = blackHole;
    this.accretionDisk = accretionDisk;
    this.starField = starField;
    this.wordManager = wordManager;

    this.panel = document.getElementById('admin-panel');
    this.toggle = document.getElementById('admin-toggle');
    this.isOpen = false;

    this._buildUI();
    this._bindToggle();
  }

  _bindToggle() {
    this.toggle.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.panel.classList.toggle('hidden', !this.isOpen);
      this.toggle.classList.toggle('active', this.isOpen);
    });
  }

  _buildUI() {
    this.panel.innerHTML = '';

    const sections = [
      this._blackHoleSection(),
      this._orbitSection(),
      this._cameraSection(),
      this._bloomSection(),
      this._starsSection(),
      this._inputSection(),
    ];

    for (const section of sections) {
      this.panel.appendChild(section);
    }
  }

  _createSection(title, rows) {
    const section = document.createElement('div');
    section.className = 'admin-section';

    const titleEl = document.createElement('div');
    titleEl.className = 'admin-section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);

    for (const row of rows) {
      section.appendChild(row);
    }

    return section;
  }

  _createSliderRow(label, { min, max, step, value, onChange }) {
    const row = document.createElement('div');
    row.className = 'admin-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'admin-label';
    labelEl.textContent = label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'admin-slider';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const valueEl = document.createElement('span');
    valueEl.className = 'admin-value';
    valueEl.textContent = this._formatValue(value, step);

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      valueEl.textContent = this._formatValue(v, step);
      onChange(v);
    });

    row.appendChild(labelEl);
    row.appendChild(slider);
    row.appendChild(valueEl);

    return row;
  }

  _formatValue(value, step) {
    if (step >= 1) return String(Math.round(value));
    const decimals = String(step).split('.')[1]?.length || 1;
    return value.toFixed(decimals);
  }

  // --- Sections ---

  _blackHoleSection() {
    const bh = this.blackHole;
    const disk = this.accretionDisk;

    return this._createSection('Black Hole', [
      this._createSliderRow('Event Horizon', {
        min: 0.5, max: 5.0, step: 0.1, value: BLACK_HOLE.eventHorizonRadius,
        onChange: (v) => {
          BLACK_HOLE.eventHorizonRadius = v;
          bh.eventHorizonMesh.scale.setScalar(v / 1.5);
        },
      }),
      this._createSliderRow('Photon Ring', {
        min: 0.5, max: 6.0, step: 0.1, value: BLACK_HOLE.photonRingRadius,
        onChange: (v) => {
          BLACK_HOLE.photonRingRadius = v;
          bh.photonRingMesh.scale.setScalar(v / 2.0);
        },
      }),
      this._createSliderRow('Disk Inner R', {
        min: 1.0, max: 8.0, step: 0.1, value: BLACK_HOLE.diskInnerRadius,
        onChange: (v) => {
          BLACK_HOLE.diskInnerRadius = v;
          disk.diskUniforms.uInnerRadius.value = v;
          disk.rebuildDisk();
        },
      }),
      this._createSliderRow('Disk Outer R', {
        min: 3.0, max: 15.0, step: 0.1, value: BLACK_HOLE.diskOuterRadius,
        onChange: (v) => {
          BLACK_HOLE.diskOuterRadius = v;
          disk.diskUniforms.uOuterRadius.value = v;
          disk.rebuildDisk();
        },
      }),
      this._createSliderRow('Glow Radius', {
        min: 2.0, max: 20.0, step: 0.5, value: BLACK_HOLE.glowRadius,
        onChange: (v) => {
          BLACK_HOLE.glowRadius = v;
          bh.outerGlowMesh.scale.setScalar(v / 8.0);
        },
      }),
      this._createSliderRow('Particles', {
        min: 500, max: 10000, step: 500, value: BLACK_HOLE.particleCount,
        onChange: (v) => {
          BLACK_HOLE.particleCount = v;
          disk.rebuildParticles();
        },
      }),
    ]);
  }

  _orbitSection() {
    return this._createSection('Orbit & Words', [
      this._createSliderRow('Min Radius', {
        min: 2.0, max: 10.0, step: 0.5, value: ORBIT.minRadius,
        onChange: (v) => { ORBIT.minRadius = v; },
      }),
      this._createSliderRow('Max Radius', {
        min: 4.0, max: 15.0, step: 0.5, value: ORBIT.maxRadius,
        onChange: (v) => { ORBIT.maxRadius = v; },
      }),
      this._createSliderRow('Orbit Speed', {
        min: 0.01, max: 1.0, step: 0.01, value: ORBIT.baseSpeed,
        onChange: (v) => {
          const ratio = v / ORBIT.baseSpeed;
          ORBIT.baseSpeed = v;
          for (const wordObj of this.wordManager.getAllWordObjects()) {
            wordObj.orbitSpeed *= ratio;
          }
        },
      }),
      this._createSliderRow('Word Font', {
        min: 8, max: 32, step: 1, value: 13,
        onChange: (v) => {
          document.querySelectorAll('.word-label').forEach(el => {
            el.style.fontSize = `${v}px`;
          });
        },
      }),
    ]);
  }

  _cameraSection() {
    const cam = this.sceneManager.camera;
    const ctrl = this.sceneManager.controls;

    return this._createSection('Camera', [
      this._createSliderRow('FOV', {
        min: 30, max: 120, step: 1, value: CAMERA.fov,
        onChange: (v) => {
          cam.fov = v;
          cam.updateProjectionMatrix();
        },
      }),
      this._createSliderRow('Min Distance', {
        min: 2, max: 15, step: 0.5, value: CAMERA.minDistance,
        onChange: (v) => { ctrl.minDistance = v; },
      }),
      this._createSliderRow('Max Distance', {
        min: 10, max: 50, step: 1, value: CAMERA.maxDistance,
        onChange: (v) => { ctrl.maxDistance = v; },
      }),
      this._createSliderRow('Auto Rotate', {
        min: 0, max: 3, step: 0.1, value: CAMERA.autoRotateSpeed,
        onChange: (v) => { ctrl.autoRotateSpeed = v; },
      }),
    ]);
  }

  _bloomSection() {
    const pp = this.sceneManager.postProcessing;

    return this._createSection('Bloom & Effects', [
      this._createSliderRow('Strength', {
        min: 0, max: 5, step: 0.1, value: BLOOM.strength,
        onChange: (v) => { pp.bloomPass.strength = v; },
      }),
      this._createSliderRow('Radius', {
        min: 0, max: 2, step: 0.05, value: BLOOM.radius,
        onChange: (v) => { pp.bloomPass.radius = v; },
      }),
      this._createSliderRow('Threshold', {
        min: 0, max: 1.5, step: 0.05, value: BLOOM.threshold,
        onChange: (v) => { pp.bloomPass.threshold = v; },
      }),
      this._createSliderRow('Vignette', {
        min: 0, max: 3, step: 0.1, value: 0.4,
        onChange: (v) => { pp.vignettePass.uniforms.darkness.value = v; },
      }),
    ]);
  }

  _starsSection() {
    const sf = this.starField;

    return this._createSection('Stars', [
      this._createSliderRow('Count', {
        min: 0, max: 10000, step: 500, value: STARS.count,
        onChange: (v) => {
          STARS.count = v;
          sf.rebuild();
        },
      }),
      this._createSliderRow('Size', {
        min: 0.5, max: 5.0, step: 0.1, value: STARS.size,
        onChange: (v) => {
          STARS.size = v;
          if (sf.material) sf.material.uniforms.uSize.value = v;
        },
      }),
      this._createSliderRow('Sphere R', {
        min: 30, max: 200, step: 10, value: STARS.sphereRadius,
        onChange: (v) => {
          STARS.sphereRadius = v;
          sf.rebuild();
        },
      }),
    ]);
  }

  _inputSection() {
    const input = document.getElementById('word-input');

    return this._createSection('Input', [
      this._createSliderRow('Font Size', {
        min: 10, max: 36, step: 1, value: 18,
        onChange: (v) => { input.style.fontSize = `${v}px`; },
      }),
      this._createSliderRow('Width', {
        min: 100, max: 600, step: 10, value: 300,
        onChange: (v) => { input.style.width = `${v}px`; },
      }),
    ]);
  }
}
