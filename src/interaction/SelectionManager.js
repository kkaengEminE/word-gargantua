import * as THREE from 'three';
import gsap from 'gsap';

export class SelectionManager {
  constructor(camera, canvas, controls, wordManager, connectionManager, connectionLines) {
    this.camera = camera;
    this.canvas = canvas;
    this.controls = controls;
    this.wordManager = wordManager;
    this.connectionManager = connectionManager;
    this.connectionLines = connectionLines;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedWord = null;
    this.bubble = document.getElementById('speech-bubble');

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      // Ignore if interacting with UI elements
      if (e.target !== this.canvas) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hitboxes = this.wordManager.getAllHitboxes();
      const intersects = this.raycaster.intersectObjects(hitboxes);

      if (intersects.length > 0) {
        const wordObj = intersects[0].object.userData.wordObject;
        if (wordObj) {
          this.selectWord(wordObj);
        }
      } else {
        this.deselectAll();
      }
    });
  }

  selectWord(wordObj) {
    // Deselect previous
    if (this.selectedWord && this.selectedWord !== wordObj) {
      this.selectedWord.deselect();
    }

    this.selectedWord = wordObj;
    wordObj.select();

    // Disable auto-rotate during selection
    this.controls.autoRotate = false;

    // Animate camera to look at word
    const pos = wordObj.getWorldPosition();
    gsap.to(this.controls.target, {
      x: pos.x * 0.5,
      y: pos.y * 0.5,
      z: pos.z * 0.5,
      duration: 1.0,
      ease: 'power2.inOut',
    });

    // Show connection lines
    this._showConnections(wordObj);

    // Show speech bubble
    this._showBubble(wordObj);
  }

  selectWordById(id) {
    const wordObj = this.wordManager.getWordById(id);
    if (wordObj) {
      this.selectWord(wordObj);
    }
  }

  deselectAll() {
    if (this.selectedWord) {
      this.selectedWord.deselect();
      this.selectedWord = null;
    }

    this.controls.autoRotate = true;

    // Animate camera back to center
    gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    this.connectionLines.hide();
    this._hideBubble();
  }

  _showConnections(wordObj) {
    const entry = wordObj.entry;
    const connectedWordObjs = [];

    for (const connId of entry.connections) {
      const connWord = this.wordManager.getWordById(connId);
      if (connWord) {
        connectedWordObjs.push(connWord);
      }
    }

    this.connectionLines.show(wordObj, connectedWordObjs);
  }

  _showBubble(wordObj) {
    const entry = wordObj.entry;

    // Format date
    const date = new Date(entry.firstCreated);
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    // Build connections list
    let connectionsHTML = '';
    if (entry.connections.length > 0) {
      const links = entry.connections.map(connId => {
        const connEntry = this.wordManager.getWordById(connId);
        const text = connEntry ? connEntry.entry.text : '?';
        return `<span class="bubble-link" data-word-id="${connId}">${text}</span>`;
      }).join('');

      connectionsHTML = `
        <div class="bubble-connections">
          <span class="bubble-connection-label">연결</span>
          ${links}
        </div>
      `;
    }

    this.bubble.innerHTML = `
      <div class="bubble-word">${entry.text}</div>
      <div class="bubble-meta">
        ${dateStr} ${timeStr} / ${entry.count}회
      </div>
      ${connectionsHTML}
    `;

    this.bubble.classList.remove('hidden');

    // Bind connection link clicks
    this.bubble.querySelectorAll('.bubble-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const wordId = e.target.dataset.wordId;
        this.selectWordById(wordId);
      });
    });

    this.updateBubblePosition();
  }

  _hideBubble() {
    this.bubble.classList.add('hidden');
  }

  updateBubblePosition() {
    if (!this.selectedWord || this.bubble.classList.contains('hidden')) return;

    const pos = this.selectedWord.getWorldPosition();
    const screenPos = pos.clone().project(this.camera);

    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    this.bubble.style.left = `${x + 24}px`;
    this.bubble.style.top = `${y - 20}px`;

    // Keep bubble within viewport
    const rect = this.bubble.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10) {
      this.bubble.style.left = `${x - rect.width - 24}px`;
    }
    if (rect.bottom > window.innerHeight - 10) {
      this.bubble.style.top = `${y - rect.height + 20}px`;
    }
  }
}
