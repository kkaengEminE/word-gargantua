import { TagAutocomplete } from './TagAutocomplete.js';

export class InputController {
  constructor(wordManager, connectionManager, dataStore) {
    this.wordManager = wordManager;
    this.connectionManager = connectionManager;
    this.dataStore = dataStore;
    this._isComposing = false;

    this.input = document.getElementById('word-input');
    this.tagAutocomplete = new TagAutocomplete(this.input, wordManager);

    this._bindEvents();
  }

  _bindEvents() {
    this.input.addEventListener('compositionstart', () => {
      this._isComposing = true;
    });

    this.input.addEventListener('compositionend', () => {
      this._isComposing = false;
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.isComposing || this._isComposing) return;
        e.preventDefault();
        if (this.tagAutocomplete.isOpen && this.tagAutocomplete.hasSelection()) {
          this.tagAutocomplete.confirmSelection();
          return;
        }
        this._submit();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (this.tagAutocomplete.isOpen) {
          e.preventDefault();
          this.tagAutocomplete.navigate(e.key === 'ArrowDown' ? 1 : -1);
        }
      } else if (e.key === 'Escape') {
        this.tagAutocomplete.close();
      }
    });

    this.input.addEventListener('input', () => {
      if (this._isComposing) return;
      this.tagAutocomplete.onInput();
    });

    // Clicking on the canvas area should not steal focus permanently
    // but allow input to be easily re-focused
    document.addEventListener('keydown', (e) => {
      if (document.activeElement !== this.input &&
          !e.ctrlKey && !e.metaKey && !e.altKey &&
          e.key.length === 1) {
        this.input.focus();
      }
    });
  }

  _submit() {
    const raw = this.input.value.trim();
    if (!raw) return;

    // Parse text and @tags
    const parts = raw.split(/\s+/);
    const textParts = [];
    const tagTexts = [];

    for (const part of parts) {
      if (part.startsWith('@') && part.length > 1) {
        tagTexts.push(part.slice(1));
      } else {
        textParts.push(part);
      }
    }

    const mainText = textParts.join(' ');
    if (!mainText) {
      this.input.value = '';
      return;
    }

    // Resolve tag texts to word IDs
    const connectionIds = [];
    for (const tagText of tagTexts) {
      const entry = this.dataStore.getWordByText(tagText);
      if (entry) {
        connectionIds.push(entry.id);
      }
    }

    // Add the main word
    const { entry } = this.wordManager.addWord(mainText, connectionIds);

    // Create bidirectional connections
    for (const connId of connectionIds) {
      this.connectionManager.addConnection(entry.id, connId);
    }

    // Refresh cached entries so both sides show the connection
    this.wordManager.refreshEntry(entry.id);
    for (const connId of connectionIds) {
      this.wordManager.refreshEntry(connId);
    }

    this.input.value = '';
    this.tagAutocomplete.close();
  }
}
