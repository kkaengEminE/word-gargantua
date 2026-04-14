import { STORAGE_KEY, ORBIT } from '../utils/constants.js';

export class DataStore {
  constructor() {
    this._key = STORAGE_KEY;
  }

  load() {
    const raw = localStorage.getItem(this._key);
    if (!raw) return { version: 1, words: [] };
    try {
      return JSON.parse(raw);
    } catch {
      return { version: 1, words: [] };
    }
  }

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  }

  addWord(text, connections = []) {
    const data = this.load();
    const existing = data.words.find(w => w.text === text);

    if (existing) {
      existing.count++;
      existing.lastEntered = new Date().toISOString();
      connections.forEach(cid => {
        if (!existing.connections.includes(cid)) {
          existing.connections.push(cid);
        }
      });
      this.save(data);
      return { entry: existing, isNew: false };
    }

    const now = new Date().toISOString();
    const radius = ORBIT.minRadius + Math.random() * (ORBIT.maxRadius - ORBIT.minRadius);
    const entry = {
      id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      firstCreated: now,
      lastEntered: now,
      count: 1,
      orbit: {
        radius,
        angle: Math.random() * Math.PI * 2,
        speed: ORBIT.baseSpeed / radius,
        inclination: (Math.random() - 0.5) * 2 * ORBIT.maxInclination,
        yOffset: (Math.random() - 0.5) * 2 * ORBIT.maxYOffset,
      },
      connections,
    };

    data.words.push(entry);
    this.save(data);
    return { entry, isNew: true };
  }

  addConnection(wordIdA, wordIdB) {
    const data = this.load();
    const wordA = data.words.find(w => w.id === wordIdA);
    const wordB = data.words.find(w => w.id === wordIdB);

    if (wordA && !wordA.connections.includes(wordIdB)) {
      wordA.connections.push(wordIdB);
    }
    if (wordB && !wordB.connections.includes(wordIdA)) {
      wordB.connections.push(wordIdA);
    }
    this.save(data);
  }

  getWordByText(text) {
    return this.load().words.find(w => w.text === text) || null;
  }

  getWordById(id) {
    return this.load().words.find(w => w.id === id) || null;
  }

  getAllWords() {
    return this.load().words;
  }

  updateWordOrbit(id, orbitData) {
    const data = this.load();
    const word = data.words.find(w => w.id === id);
    if (word) {
      Object.assign(word.orbit, orbitData);
      this.save(data);
    }
  }
}
