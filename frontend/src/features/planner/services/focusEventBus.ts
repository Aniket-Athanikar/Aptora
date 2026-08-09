import { FocusEventType, FocusPreferences } from "../types/focus2";
import { triggerHaptic } from "./hapticFeedback";
import { SoundManager } from "./soundManager";

type EventListener = (eventType: FocusEventType, payload?: any) => void;

class FocusEventBusEngine {
  private listeners: Set<EventListener> = new Set();

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(eventType: FocusEventType, prefs: FocusPreferences, payload?: any) {
    // 1. Trigger Haptic Layer
    triggerHaptic(eventType, prefs);

    // 2. Trigger Sound Layer
    SoundManager.playEventSound(eventType, prefs);

    // 3. Dispatch to UI/Custom Subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(eventType, payload);
      } catch (err) {
        console.error("Error in FocusEventBus listener:", err);
      }
    });
  }
}

export const FocusEventBus = new FocusEventBusEngine();
