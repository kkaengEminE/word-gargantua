import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { PostProcessing } from './PostProcessing.js';
import { CAMERA, COLORS } from '../utils/constants.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initCSS2DRenderer();
    this._initControls();

    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CAMERA.near,
      CAMERA.far
    );
    this.camera.position.set(...CAMERA.initialPosition);
    this.camera.lookAt(0, 0, 0);
  }

  _initCSS2DRenderer() {
    this.css2dRenderer = new CSS2DRenderer();
    this.css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    this.css2dRenderer.domElement.style.position = 'fixed';
    this.css2dRenderer.domElement.style.top = '0';
    this.css2dRenderer.domElement.style.left = '0';
    this.css2dRenderer.domElement.style.pointerEvents = 'none';
    this.css2dRenderer.domElement.style.zIndex = '1';

    const container = document.getElementById('css2d-container');
    if (container) {
      container.appendChild(this.css2dRenderer.domElement);
    } else {
      document.body.appendChild(this.css2dRenderer.domElement);
    }
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = CAMERA.dampingFactor;
    this.controls.minDistance = CAMERA.minDistance;
    this.controls.maxDistance = CAMERA.maxDistance;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = CAMERA.autoRotateSpeed;
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.css2dRenderer.setSize(w, h);
    this.postProcessing.resize(w, h);
  }

  update() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    this.controls.update();
    return { delta, elapsed };
  }

  render() {
    this.postProcessing.render();
    this.css2dRenderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.controls.dispose();
  }
}
