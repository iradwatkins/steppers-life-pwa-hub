// Simple EventEmitter replacement for browser compatibility
export class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  addEventListener(listener: Function) {
    // For backward compatibility
    this.on('inventory-updated', listener);
    this.on('hold-created', listener);
    this.on('hold-released', listener);
    this.on('purchase-completed', listener);
    this.on('alert-created', listener);
  }

  removeEventListener(listener: Function) {
    // For backward compatibility - simplified removal
    this.listeners.forEach((listeners, event) => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    });
  }
} 