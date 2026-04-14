import { WordObject } from './WordObject.js';

export class WordManager {
  constructor(scene, dataStore) {
    this.scene = scene;
    this.dataStore = dataStore;
    this.words = new Map(); // id -> WordObject
  }

  loadExistingWords() {
    const entries = this.dataStore.getAllWords();
    for (const entry of entries) {
      const wordObj = new WordObject(entry, this.scene);
      wordObj.updatePosition(0);
      this.words.set(entry.id, wordObj);
    }
  }

  addWord(text, connectionIds = []) {
    const { entry, isNew } = this.dataStore.addWord(text, connectionIds);

    if (isNew) {
      const wordObj = new WordObject(entry, this.scene);
      wordObj.updatePosition(0);
      wordObj.spawnAnimation();
      this.words.set(entry.id, wordObj);
      return { wordObj, entry, isNew: true };
    }

    // Word already exists - just update the entry reference
    const existing = this.words.get(entry.id);
    if (existing) {
      existing.entry = entry;
    }
    return { wordObj: existing, entry, isNew: false };
  }

  update(delta) {
    for (const wordObj of this.words.values()) {
      wordObj.updatePosition(delta);
    }
  }

  getWordById(id) {
    return this.words.get(id) || null;
  }

  getWordByText(text) {
    for (const wordObj of this.words.values()) {
      if (wordObj.entry.text === text) return wordObj;
    }
    return null;
  }

  getAllWordObjects() {
    return Array.from(this.words.values());
  }

  getAllHitboxes() {
    return this.getAllWordObjects().map(w => w.hitbox);
  }

  getAllTexts() {
    return this.getAllWordObjects().map(w => w.entry.text);
  }

  refreshEntry(id) {
    const wordObj = this.words.get(id);
    if (!wordObj) return;
    const freshEntry = this.dataStore.getWordById(id);
    if (freshEntry) wordObj.entry = freshEntry;
  }

  dispose() {
    for (const wordObj of this.words.values()) {
      wordObj.dispose();
    }
    this.words.clear();
  }
}
