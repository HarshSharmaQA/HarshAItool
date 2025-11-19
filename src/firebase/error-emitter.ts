import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// Create a typed event emitter class
class TypedEventEmitter extends EventEmitter {
  on<TEvent extends keyof Events>(event: TEvent, listener: Events[TEvent]): this {
    return super.on(event, listener);
  }
  
  off<TEvent extends keyof Events>(event: TEvent, listener: Events[TEvent]): this {
    return super.off(event, listener);
  }
  
  emit<TEvent extends keyof Events>(event: TEvent, ...args: Parameters<Events[TEvent]>): boolean {
    return super.emit(event, ...args);
  }
}

// Create a singleton instance of the event emitter
export const errorEmitter = new TypedEventEmitter();