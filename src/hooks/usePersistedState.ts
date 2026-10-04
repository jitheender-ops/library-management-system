import { useEffect, useState, Dispatch, SetStateAction } from "react";

const STORAGE_PREFIX = "lms:v1:";

/**
 * useState that persists to localStorage so borrowed books, reservations,
 * streaks etc. survive a page refresh. Fails safe if storage is unavailable
 * (private mode, quota exceeded) or the stored JSON is corrupt.
 */
export function usePersistedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore storage errors */
    }
  }, [key, value]);

  return [value, setValue];
}
