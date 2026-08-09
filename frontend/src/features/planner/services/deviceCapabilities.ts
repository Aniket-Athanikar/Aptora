/**
 * Device Capability Detection Engine for ExamForge AI Focus Timer 2.0
 * Safely inspects browser support across Mobile, Desktop, iOS, Android, Chrome, Safari, Firefox.
 */

export function supportsHaptics(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return "vibrate" in navigator && typeof navigator.vibrate === "function";
}

export function supportsNotifications(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window && typeof window.Notification !== "undefined";
}

export function supportsAudio(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window.AudioContext || (window as any).webkitAudioContext) !== "undefined";
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
