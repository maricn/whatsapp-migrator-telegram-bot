export class Queue<T> {
  private store: T[] = [];

  push(val: T) {
    this.store.push(val);
  }

  pop(): T | undefined {
    return this.store.shift();
  }
}
