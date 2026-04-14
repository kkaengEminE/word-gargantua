import './style.css';
import { SceneManager } from './scene/SceneManager.js';
import { BlackHole } from './blackhole/BlackHole.js';
import { AccretionDisk } from './blackhole/AccretionDisk.js';
import { DataStore } from './data/DataStore.js';
import { WordManager } from './word/WordManager.js';
import { InputController } from './interaction/InputController.js';
import { SelectionManager } from './interaction/SelectionManager.js';
import { ConnectionManager } from './connection/ConnectionManager.js';
import { ConnectionLines } from './connection/ConnectionLines.js';

class App {
  constructor() {
    const canvas = document.getElementById('webgl');
    this.sceneManager = new SceneManager(canvas);

    this.dataStore = new DataStore();

    this.blackHole = new BlackHole();
    this.blackHole.init(this.sceneManager.scene);

    this.accretionDisk = new AccretionDisk();
    this.accretionDisk.init(this.sceneManager.scene);

    this.connectionManager = new ConnectionManager(this.dataStore);

    this.wordManager = new WordManager(
      this.sceneManager.scene,
      this.dataStore
    );
    this.wordManager.loadExistingWords();

    this.connectionLines = new ConnectionLines(this.sceneManager.scene);

    this.selectionManager = new SelectionManager(
      this.sceneManager.camera,
      this.sceneManager.canvas,
      this.sceneManager.controls,
      this.wordManager,
      this.connectionManager,
      this.connectionLines
    );

    this.inputController = new InputController(
      this.wordManager,
      this.connectionManager,
      this.dataStore
    );

    this._hideOnboardingOnFirstInput();
    this._animate();
  }

  _hideOnboardingOnFirstInput() {
    const hint = document.getElementById('onboarding-hint');
    const input = document.getElementById('word-input');
    if (hint && input) {
      const hide = () => {
        hint.classList.add('hidden');
        input.removeEventListener('input', hide);
      };
      input.addEventListener('input', hide);

      if (this.dataStore.getAllWords().length > 0) {
        hint.classList.add('hidden');
      }
    }
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const { delta, elapsed } = this.sceneManager.update();

    this.blackHole.update(elapsed);
    this.accretionDisk.update(delta, elapsed);
    this.wordManager.update(delta);
    this.connectionLines.update();
    this.selectionManager.updateBubblePosition();

    this.sceneManager.render();
  }
}

new App();
