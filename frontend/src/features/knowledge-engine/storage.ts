/**
 * Storage adapter for the Knowledge Engine.
 *
 * Wraps localStorage with namespace + JSON safety + future API compatibility.
 * The same interface can be re-implemented with a remote backend (REST/GraphQL)
 * without touching UI code.
 */

const NAMESPACE = "ef_knowledge_v2";

export const STORAGE_KEYS = {
  state: `${NAMESPACE}::state`,
  books: `${NAMESPACE}::books`,
  versions: `${NAMESPACE}::versions`,
  jobs: `${NAMESPACE}::jobs`,
  chapters: `${NAMESPACE}::chapters`,
  formulas: `${NAMESPACE}::formulas`,
  mindmaps: `${NAMESPACE}::mindmaps`,
  flashcards: `${NAMESPACE}::flashcards`,
  questions: `${NAMESPACE}::questions`,
  analytics: `${NAMESPACE}::analytics`,
  downloads: `${NAMESPACE}::downloads`,
  history: `${NAMESPACE}::history`,
  filters: `${NAMESPACE}::filters`,
  ui: `${NAMESPACE}::ui`,
  preferences: `${NAMESPACE}::preferences`,
  folders: `${NAMESPACE}::folders`,
  tags: `${NAMESPACE}::tags`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadFromStorage<T>(key: StorageKey, fallback: T): T {
  const store = safeLocalStorage();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: StorageKey, value: T): void {
  const store = safeLocalStorage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or serialization failed - safe to swallow */
  }
}

export function removeFromStorage(key: StorageKey): void {
  const store = safeLocalStorage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* noop */
  }
}

export function clearAllKnowledgeStorage(): void {
  const store = safeLocalStorage();
  if (!store) return;
  Object.values(STORAGE_KEYS).forEach((k) => {
    try {
      store.removeItem(k);
    } catch {
      /* noop */
    }
  });
}
