import { supportsAudio } from "./deviceCapabilities";
import { FocusEventType, FocusPreferences, AmbienceType } from "../types/focus2";

class SoundManagerEngine {
  private ctx: AudioContext | null = null;
  private ambienceNode: AudioNode | null = null;
  private ambienceGain: GainNode | null = null;

  private getAudioContext(): AudioContext | null {
    if (!supportsAudio()) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playEventSound(eventType: FocusEventType, prefs: FocusPreferences) {
    if (!prefs.soundEnabled || prefs.doNotDisturb || prefs.soundPreset === "Silent") {
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const volume = Math.min(Math.max(prefs.volume, 0.05), 1.0);

    // Apply preset multipliers
    let presetPitchMultiplier = 1.0;
    if (prefs.soundPreset === "Minimal") presetPitchMultiplier = 0.85;
    if (prefs.soundPreset === "Nature") presetPitchMultiplier = 1.15;
    if (prefs.soundPreset === "Focus") presetPitchMultiplier = 1.05;

    switch (eventType) {
      case "SESSION_STARTED":
        this.playToneChain(ctx, [440 * presetPitchMultiplier, 554.37 * presetPitchMultiplier], 0.18, volume * 0.4);
        break;
      case "SESSION_PAUSED":
        this.playTone(ctx, 350 * presetPitchMultiplier, 0.12, "sine", volume * 0.35);
        break;
      case "SESSION_RESUMED":
        this.playToneChain(ctx, [330 * presetPitchMultiplier, 440 * presetPitchMultiplier], 0.15, volume * 0.35);
        break;
      case "MILESTONE_25":
      case "MILESTONE_50":
      case "MILESTONE_75":
        if (prefs.feedbackMode !== "Completion Only") {
          this.playTone(ctx, 659.25 * presetPitchMultiplier, 0.2, "sine", volume * 0.25);
        }
        break;
      case "FIVE_MINUTES_LEFT":
        this.playToneChain(ctx, [440 * presetPitchMultiplier, 493.88 * presetPitchMultiplier], 0.2, volume * 0.3);
        break;
      case "ONE_MINUTE_LEFT":
        this.playToneChain(ctx, [523.25 * presetPitchMultiplier, 659.25 * presetPitchMultiplier], 0.25, volume * 0.35);
        break;
      case "SESSION_COMPLETED":
        // 4-note uplifting completion chime (C5 -> E5 -> G5 -> C6) with warm resonance
        this.playToneChain(
          ctx,
          [
            523.25 * presetPitchMultiplier,
            659.25 * presetPitchMultiplier,
            783.99 * presetPitchMultiplier,
            1046.5 * presetPitchMultiplier,
          ],
          0.32,
          volume * 0.55
        );
        break;
      case "BREAK_STARTED":
        this.playToneChain(ctx, [392 * presetPitchMultiplier, 523.25 * presetPitchMultiplier], 0.25, volume * 0.35);
        break;
      case "BREAK_ENDING":
        this.playToneChain(ctx, [523.25 * presetPitchMultiplier, 659.25 * presetPitchMultiplier], 0.2, volume * 0.35);
        break;
      case "GOAL_COMPLETED":
      case "ACHIEVEMENT_UNLOCKED":
        // 4-note celebration chime
        this.playToneChain(
          ctx,
          [523.25 * presetPitchMultiplier, 659.25 * presetPitchMultiplier, 783.99 * presetPitchMultiplier, 1046.5 * presetPitchMultiplier],
          0.35,
          volume * 0.5
        );
        break;
      case "ERROR":
        this.playToneChain(ctx, [220, 196], 0.15, volume * 0.4);
        break;
    }
  }

  public previewSound(preset: FocusPreferences["soundPreset"], volume: number) {
    const dummyPrefs: FocusPreferences = {
      soundEnabled: true,
      hapticEnabled: false,
      notificationsEnabled: false,
      completionCelebration: true,
      finalFiveMinAlert: true,
      doNotDisturb: false,
      volume,
      soundPreset: preset,
      ambience: "None",
      feedbackMode: "All Feedback",
    };
    this.playEventSound("SESSION_COMPLETED", dummyPrefs);
  }

  public setAmbience(type: AmbienceType, volume: number) {
    this.stopAmbience();
    if (type === "None") return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "Rain" || type === "Soft Ambient") {
        // Soft low-pass filtered rain simulation
        b0 = 0.95 * b0 + white * 0.05;
        output[i] = b0 * 0.6;
      } else if (type === "Brown Noise") {
        // Brown noise synthesis algorithm
        b0 = (b0 + 0.02 * white) / 1.02;
        output[i] = b0 * 3.5;
      } else {
        // White noise
        output[i] = white * 0.15;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = Math.min(volume * 0.2, 0.25);

    whiteNoise.connect(this.ambienceGain);
    this.ambienceGain.connect(ctx.destination);
    whiteNoise.start();

    this.ambienceNode = whiteNoise;
  }

  public stopAmbience() {
    if (this.ambienceNode) {
      try {
        (this.ambienceNode as any).stop?.();
        this.ambienceNode.disconnect();
      } catch {}
      this.ambienceNode = null;
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    vol: number = 0.3
  ) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Clean sound production using linear ramp down to prevent click/pops or browser exceptions
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Failed to produce focus timer sound tone:", e);
    }
  }

  private playToneChain(
    ctx: AudioContext,
    freqs: number[],
    noteDuration: number,
    vol: number = 0.3
  ) {
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(ctx, freq, noteDuration, "sine", vol);
      }, idx * (noteDuration * 750));
    });
  }
}

export const SoundManager = new SoundManagerEngine();
