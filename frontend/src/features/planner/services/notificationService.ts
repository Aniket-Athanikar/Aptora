import { supportsNotifications } from "./deviceCapabilities";
import { FocusEventType, FocusPreferences } from "../types/focus2";

class FocusNotificationEngine {
  private firedEvents: Set<string> = new Set();

  public async requestPermission(): Promise<boolean> {
    if (!supportsNotifications()) return false;
    try {
      if (Notification.permission === "granted") return true;
      if (Notification.permission !== "denied") {
        const res = await Notification.requestPermission();
        return res === "granted";
      }
    } catch {}
    return false;
  }

  public getPermissionState(): NotificationPermission | "unsupported" {
    if (!supportsNotifications()) return "unsupported";
    return Notification.permission;
  }

  public clearSessionKeys(sessionId: string) {
    for (const key of Array.from(this.firedEvents.keys())) {
      if (key.startsWith(`session:${sessionId}:`)) {
        this.firedEvents.delete(key);
      }
    }
  }

  public sendNotification(
    sessionId: string,
    eventType: FocusEventType,
    title: string,
    body: string,
    prefs: FocusPreferences,
    options?: NotificationOptions
  ) {
    if (!prefs.notificationsEnabled || prefs.doNotDisturb) return;
    if (!supportsNotifications()) return;
    if (Notification.permission !== "granted") return;

    // Deduplication Key
    const eventKey = `session:${sessionId}:${eventType}`;
    if (this.firedEvents.has(eventKey)) return;

    // Filter Priority
    if (eventType === "FIVE_MINUTES_LEFT" && !prefs.finalFiveMinAlert) return;
    if (
      prefs.feedbackMode === "Milestones Only" &&
      !["MILESTONE_25", "MILESTONE_50", "MILESTONE_75", "SESSION_COMPLETED"].includes(eventType)
    ) {
      return;
    }
    if (prefs.feedbackMode === "Completion Only" && eventType !== "SESSION_COMPLETED") {
      return;
    }

    try {
      this.firedEvents.add(eventKey);
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: eventKey,
        ...options,
      });

      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        notification.close();
      };
    } catch (e) {
      console.warn("Could not dispatch browser notification:", e);
    }
  }

  public notifySessionStarted(sessionId: string, subject: string, durationMin: number, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "SESSION_STARTED",
      "🎯 Focus Mode Started",
      `${subject}\n${durationMin}-minute focus session started. Stay focused.`,
      prefs
    );
  }

  public notifyMilestone(sessionId: string, milestone: "25%" | "50%" | "75%", bodyText: string, prefs: FocusPreferences) {
    const title = milestone === "50%" ? "🔥 Halfway There" : milestone === "75%" ? "⚡ Final Stretch" : "🎯 Progress Update";
    const type: FocusEventType = milestone === "25%" ? "MILESTONE_25" : milestone === "50%" ? "MILESTONE_50" : "MILESTONE_75";
    this.sendNotification(sessionId, type, title, bodyText, prefs);
  }

  public notifyFiveMinutesLeft(sessionId: string, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "FIVE_MINUTES_LEFT",
      "⏳ Final 5 Minutes",
      "Your focus session is almost complete. Finish strong.",
      prefs
    );
  }

  public notifyOneMinuteLeft(sessionId: string, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "ONE_MINUTE_LEFT",
      "🏁 One Minute Left",
      "Finish this session strong. Almost done!",
      prefs
    );
  }

  public notifySessionCompleted(sessionId: string, subject: string, durationMin: number, streak: number, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "SESSION_COMPLETED",
      "🎉 Focus Session Complete",
      `${durationMin} minutes focused on ${subject}.\n🔥 ${streak} Day Focus Streak!`,
      prefs
    );
  }

  public notifyBreakStarted(sessionId: string, durationMin: number, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "BREAK_STARTED",
      "☕ Break Started",
      `Relax for ${durationMin} minutes. Unwind and recharge.`,
      prefs
    );
  }

  public notifyBreakEnding(sessionId: string, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "BREAK_ENDING",
      "⏰ Break Ending",
      "Your next focus session starts in 1 minute.",
      prefs
    );
  }

  public notifyDailyGoalReached(sessionId: string, streak: number, prefs: FocusPreferences) {
    this.sendNotification(
      sessionId,
      "GOAL_COMPLETED",
      "🎯 Daily Goal Complete!",
      `You've completed today's study goal.\n🔥 ${streak} Day Focus Streak maintained.`,
      prefs
    );
  }
}

export const NotificationService = new FocusNotificationEngine();
