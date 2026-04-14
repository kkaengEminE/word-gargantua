import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BLOOM } from '../utils/constants.js';

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      texel.rgb *= smoothstep(0.0, 1.0, vignette * (1.0 + darkness));
      gl_FragColor = texel;
    }
  `,
};

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM.strength,
      BLOOM.radius,
      BLOOM.threshold
    );
    this.composer.addPass(this.bloomPass);

    const vignettePass = new ShaderPass(VignetteShader);
    this.composer.addPass(vignettePass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  resize(w, h) {
    this.composer.setSize(w, h);
  }

  render() {
    this.composer.render();
  }
}
