export class History<D = unknown> {
  private _initialized = false;
  private _stack: D[] = [];
  private _index = -1;

  get initialized() {
    return this._initialized;
  }

  get stack() {
    return [...this._stack];
  }
  get current() {
    return this._stack[this._index];
  }
  get canUndo() {
    return this._index > 0;
  }
  get canRedo() {
    return this._index < this._stack.length - 1;
  }

  push(data: D) {
    this._stack = this._stack.slice(0, this._index + 1);
    this._stack.push(data);
    this._index++;

    if (!this._initialized) {
      this._initialized = true;
    }
  }
  undo() {
    if (!this.canUndo) {
      return;
    }

    this._index--;
    return this._stack[this._index];
  }
  redo() {
    if (!this.canRedo) {
      return;
    }

    this._index++;
    return this._stack[this._index];
  }
  clear() {
    this._stack = [];
    this._index = -1;
  }
}
