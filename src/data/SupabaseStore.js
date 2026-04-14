import { createClient } from '@supabase/supabase-js';
import { ORBIT } from '../utils/constants.js';

export class SupabaseStore {
  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    this._supabase = (url && key) ? createClient(url, key) : null;
    this._cache = new Map();
  }

  async init() {
    if (this._supabase) {
      try {
        await this._loadFromSupabase();
      } catch (err) {
        console.warn('Supabase load failed:', err);
      }
    }
  }

  // --- Synchronous read methods (from cache) ---

  getAllWords() {
    return Array.from(this._cache.values());
  }

  getWordById(id) {
    return this._cache.get(id) || null;
  }

  getWordByText(text) {
    for (const word of this._cache.values()) {
      if (word.text === text) return word;
    }
    return null;
  }

  // --- Synchronous write methods (cache + async Supabase sync) ---

  addWord(text, connections = []) {
    const existing = this.getWordByText(text);

    if (existing) {
      existing.count++;
      existing.lastEntered = new Date().toISOString();
      connections.forEach(cid => {
        if (!existing.connections.includes(cid)) {
          existing.connections.push(cid);
        }
      });
      this._syncWordToSupabase(existing);
      connections.forEach(cid => this._syncConnectionToSupabase(existing.id, cid));
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

    this._cache.set(entry.id, entry);
    this._syncWordToSupabase(entry);
    connections.forEach(cid => this._syncConnectionToSupabase(entry.id, cid));
    return { entry, isNew: true };
  }

  addConnection(wordIdA, wordIdB) {
    const wordA = this._cache.get(wordIdA);
    const wordB = this._cache.get(wordIdB);

    if (wordA && !wordA.connections.includes(wordIdB)) {
      wordA.connections.push(wordIdB);
    }
    if (wordB && !wordB.connections.includes(wordIdA)) {
      wordB.connections.push(wordIdA);
    }
    this._syncConnectionToSupabase(wordIdA, wordIdB);
  }

  updateWordOrbit(id, orbitData) {
    const word = this._cache.get(id);
    if (word) {
      Object.assign(word.orbit, orbitData);
      this._syncWordToSupabase(word);
    }
  }

  // Legacy compatibility
  load() {
    return { version: 1, words: this.getAllWords() };
  }

  save() {}

  // --- Private: Supabase fire-and-forget sync ---

  _syncWordToSupabase(entry) {
    if (!this._supabase) return;
    this._supabase
      .from('words')
      .upsert({
        id: entry.id,
        text: entry.text,
        first_created: entry.firstCreated,
        last_entered: entry.lastEntered,
        count: entry.count,
        orbit_radius: entry.orbit.radius,
        orbit_angle: entry.orbit.angle,
        orbit_speed: entry.orbit.speed,
        orbit_inclination: entry.orbit.inclination,
        orbit_y_offset: entry.orbit.yOffset,
      })
      .then(({ error }) => {
        if (error) console.error('Supabase word sync error:', error);
      });
  }

  _syncConnectionToSupabase(idA, idB) {
    if (!this._supabase) return;
    const [word_a_id, word_b_id] = idA < idB ? [idA, idB] : [idB, idA];
    this._supabase
      .from('connections')
      .upsert(
        { word_a_id, word_b_id },
        { onConflict: 'word_a_id,word_b_id' }
      )
      .then(({ error }) => {
        if (error) console.error('Supabase connection sync error:', error);
      });
  }

  // --- Private: Load from Supabase ---

  async _loadFromSupabase() {
    const { data: words, error: wErr } = await this._supabase
      .from('words')
      .select('*');
    if (wErr) throw wErr;

    const { data: conns, error: cErr } = await this._supabase
      .from('connections')
      .select('*');
    if (cErr) throw cErr;

    // Build bidirectional connection map
    const connMap = new Map();
    for (const conn of conns) {
      if (!connMap.has(conn.word_a_id)) connMap.set(conn.word_a_id, new Set());
      if (!connMap.has(conn.word_b_id)) connMap.set(conn.word_b_id, new Set());
      connMap.get(conn.word_a_id).add(conn.word_b_id);
      connMap.get(conn.word_b_id).add(conn.word_a_id);
    }

    this._cache.clear();
    for (const w of words) {
      const entry = {
        id: w.id,
        text: w.text,
        firstCreated: w.first_created,
        lastEntered: w.last_entered,
        count: w.count,
        orbit: {
          radius: w.orbit_radius,
          angle: w.orbit_angle,
          speed: w.orbit_speed,
          inclination: w.orbit_inclination,
          yOffset: w.orbit_y_offset,
        },
        connections: Array.from(connMap.get(w.id) || []),
      };
      this._cache.set(entry.id, entry);
    }
  }
}
