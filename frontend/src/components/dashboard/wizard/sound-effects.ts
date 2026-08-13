/**
 * Dynamic sound effects synthesized directly using the Web Audio API.
 * This avoids latency issues and doesn't require loading external audio files.
 */

// Helper to get or create an AudioContext safely in response to user interaction
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/**
 * Synthesizes a subtle, premium pop click sound for wizard step transitions
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if it was suspended (browser security policies)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  
  // Quick pitch sweep for a dynamic, modern feel
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

  // Smooth gain envelope (prevent clicking artifacts)
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

/**
 * Synthesizes a beautiful ascending success chime arpeggio for calibration completions
 */
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  
  // Ascending major arpeggio notes (C5, E5, G5, C6) for a satisfying accomplishment feel
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const noteDuration = 0.12;

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + (index * noteDuration);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Slight vibrato for premium depth
    osc.frequency.linearRampToValueAtTime(freq + 10, startTime + 0.2);

    // Fade envelope
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.36);
  });
}
