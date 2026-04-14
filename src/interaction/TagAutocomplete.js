export class TagAutocomplete {
  constructor(inputElement, wordManager) {
    this.input = inputElement;
    this.wordManager = wordManager;
    this.dropdown = document.getElementById('tag-autocomplete');
    this.isOpen = false;
    this.activeIndex = -1;
    this.filteredWords = [];
    this._tagStart = -1;
  }

  onInput() {
    const value = this.input.value;
    const cursorPos = this.input.selectionStart;

    // Find the last @ before cursor
    const beforeCursor = value.slice(0, cursorPos);
    const lastAtIdx = beforeCursor.lastIndexOf('@');

    if (lastAtIdx === -1) {
      this.close();
      return;
    }

    // Check if there's a space between @ and cursor (means tag is complete)
    const afterAt = beforeCursor.slice(lastAtIdx + 1);
    if (afterAt.includes(' ')) {
      this.close();
      return;
    }

    this._tagStart = lastAtIdx;
    const query = afterAt.toLowerCase();

    // Get all existing word texts and filter
    const allTexts = this.wordManager.getAllTexts();
    this.filteredWords = allTexts.filter(t =>
      t.toLowerCase().includes(query)
    ).slice(0, 20);

    if (this.filteredWords.length === 0) {
      this.close();
      return;
    }

    this._render();
    this.isOpen = true;
    this.activeIndex = 0;
    this._updateActive();
  }

  _render() {
    this.dropdown.innerHTML = '';
    this.dropdown.classList.remove('hidden');

    for (let i = 0; i < this.filteredWords.length; i++) {
      const div = document.createElement('div');
      div.className = 'tag-option';
      div.textContent = this.filteredWords[i];
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.activeIndex = i;
        this.confirmSelection();
      });
      this.dropdown.appendChild(div);
    }
  }

  _updateActive() {
    const options = this.dropdown.querySelectorAll('.tag-option');
    options.forEach((opt, i) => {
      opt.classList.toggle('active', i === this.activeIndex);
    });

    // Scroll active into view
    if (options[this.activeIndex]) {
      options[this.activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  navigate(direction) {
    if (!this.isOpen || this.filteredWords.length === 0) return;
    this.activeIndex = (this.activeIndex + direction + this.filteredWords.length) % this.filteredWords.length;
    this._updateActive();
  }

  hasSelection() {
    return this.activeIndex >= 0 && this.activeIndex < this.filteredWords.length;
  }

  confirmSelection() {
    if (!this.hasSelection()) return;

    const selected = this.filteredWords[this.activeIndex];
    const value = this.input.value;
    const cursorPos = this.input.selectionStart;

    // Replace from @tagStart to cursor with @selectedWord
    const before = value.slice(0, this._tagStart);
    const after = value.slice(cursorPos);
    this.input.value = before + '@' + selected + ' ' + after;

    // Move cursor after the inserted tag
    const newPos = this._tagStart + 1 + selected.length + 1;
    this.input.setSelectionRange(newPos, newPos);

    this.close();
    this.input.focus();
  }

  close() {
    this.isOpen = false;
    this.activeIndex = -1;
    this.filteredWords = [];
    this._tagStart = -1;
    this.dropdown.classList.add('hidden');
    this.dropdown.innerHTML = '';
  }
}
