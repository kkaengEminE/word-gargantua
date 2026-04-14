export class ConnectionManager {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  addConnection(wordIdA, wordIdB) {
    if (wordIdA === wordIdB) return;
    this.dataStore.addConnection(wordIdA, wordIdB);
  }

  getConnections(wordId) {
    const entry = this.dataStore.getWordById(wordId);
    if (!entry) return [];
    return entry.connections;
  }

  hasConnections(wordId) {
    return this.getConnections(wordId).length > 0;
  }
}
