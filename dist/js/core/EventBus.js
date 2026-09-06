class EventBus extends EventTarget {
  emit(type, detail = null) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on(type, listener) {
    const wrapped = event => listener(event.detail);
    this.addEventListener(type, wrapped);
    return () => this.removeEventListener(type, wrapped);
  }
}

export const gameEvents = new EventBus();

