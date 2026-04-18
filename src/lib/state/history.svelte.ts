export class History<T> {
  #past: T[] = $state([]);
  #future: T[] = $state([]);
  #present: T = $state() as T;
  #cap: number;
  #txnStart: T | null = null;

  constructor(initial: T, cap = 100) {
    this.#present = initial;
    this.#cap = cap;
  }

  get present(): T {
    return this.#present;
  }

  get canUndo(): boolean {
    return this.#past.length > 0 && this.#txnStart === null;
  }

  get canRedo(): boolean {
    return this.#future.length > 0 && this.#txnStart === null;
  }

  get inTransaction(): boolean {
    return this.#txnStart !== null;
  }

  commit(next: T): void {
    if (this.#txnStart !== null) {
      this.#present = next;
      return;
    }
    this.#past.push(this.#present);
    if (this.#past.length > this.#cap) this.#past.shift();
    this.#future.length = 0;
    this.#present = next;
  }

  setPresent(next: T): void {
    this.#present = next;
  }

  beginTransaction(): void {
    if (this.#txnStart !== null) return;
    this.#txnStart = this.#present;
  }

  commitTransaction(next: T): void {
    if (this.#txnStart === null) {
      this.commit(next);
      return;
    }
    const start = this.#txnStart;
    this.#txnStart = null;
    this.#past.push(start);
    if (this.#past.length > this.#cap) this.#past.shift();
    this.#future.length = 0;
    this.#present = next;
  }

  abortTransaction(): void {
    if (this.#txnStart === null) return;
    this.#present = this.#txnStart;
    this.#txnStart = null;
  }

  undo(): void {
    if (!this.canUndo) return;
    const prev = this.#past.pop()!;
    this.#future.push(this.#present);
    this.#present = prev;
  }

  redo(): void {
    if (!this.canRedo) return;
    const next = this.#future.pop()!;
    this.#past.push(this.#present);
    this.#present = next;
  }

  clear(): void {
    this.#past.length = 0;
    this.#future.length = 0;
    this.#txnStart = null;
  }
}
