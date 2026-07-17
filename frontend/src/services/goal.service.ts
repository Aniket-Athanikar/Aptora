import { GoalData, HistorySnapshot, WizardState } from "@/types/goal.types";
import { StorageAdapter, LocalStorageAdapter } from "./storage-adapter";

export class GoalService {
  private storage: StorageAdapter;
  private readonly GOAL_KEY = "ef_active_goal";
  private readonly HISTORY_KEY = "ef_goal_history";
  private readonly WIZARD_KEY = "ef_wizard_state";

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  // --- Wizard Draft State ---
  getWizardState(): WizardState | null {
    return this.storage.getItem<WizardState>(this.WIZARD_KEY);
  }

  saveWizardState(state: WizardState): void {
    this.storage.setItem(this.WIZARD_KEY, state);
  }

  clearWizardState(): void {
    this.storage.removeItem(this.WIZARD_KEY);
  }

  // --- Active Goal Operations ---
  getActiveGoal(): GoalData | null {
    return this.storage.getItem<GoalData>(this.GOAL_KEY);
  }

  saveActiveGoal(goal: GoalData, changeDescription: string): void {
    const currentGoal = this.getActiveGoal();

    // Save to local storage active goal
    this.storage.setItem(this.GOAL_KEY, goal);

    // Track in History Versioning
    this.addHistorySnapshot(goal, changeDescription);
  }

  deleteActiveGoal(): void {
    this.storage.removeItem(this.GOAL_KEY);
    this.storage.removeItem(this.HISTORY_KEY);
    this.clearWizardState();
  }

  // --- History Snapshots ---
  getHistory(): HistorySnapshot[] {
    return this.storage.getItem<HistorySnapshot[]>(this.HISTORY_KEY) || [];
  }

  private addHistorySnapshot(goal: GoalData, changeDescription: string): void {
    const history = this.getHistory();
    const nextVersion = history.length > 0 ? Math.max(...history.map(h => h.version)) + 1 : 1;

    const newSnapshot: HistorySnapshot = {
      version: nextVersion,
      timestamp: new Date().toISOString(),
      changeDescription,
      goalData: JSON.parse(JSON.stringify(goal)), // Deep clone
    };

    this.storage.setItem(this.HISTORY_KEY, [newSnapshot, ...history]);
  }

  deleteHistoryVersion(version: number): void {
    const history = this.getHistory();
    const updated = history.filter((h) => h.version !== version);
    this.storage.setItem(this.HISTORY_KEY, updated);
  }

  restoreVersion(version: number): GoalData | null {
    const history = this.getHistory();
    const snapshot = history.find((h) => h.version === version);
    if (!snapshot) return null;

    const restoredGoal = JSON.parse(JSON.stringify(snapshot.goalData));
    restoredGoal.updatedAt = new Date().toISOString();

    // Set restored goal as active and push a history log for restoration
    this.storage.setItem(this.GOAL_KEY, restoredGoal);
    this.addHistorySnapshot(restoredGoal, `Restored Version #${version}`);
    return restoredGoal;
  }
}

export const goalService = new GoalService();
