"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationSetting, UserProfile } from "@/types";

const PROFILE_KEY = "grant-finder-profile";
const BOOKMARKS_KEY = "grant-finder-bookmarks";
const NOTIFICATIONS_KEY = "grant-finder-notifications";

const DEFAULT_PROFILE: UserProfile = {
  companyName: "",
  industry: "IT·소프트웨어",
  companySize: "small",
  region: "서울",
  employeeCount: 15,
  annualRevenue: "10억 미만",
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return { value, setValue: update, hydrated };
}

export function useProfile() {
  return useLocalStorage<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
}

export function useBookmarks() {
  const { value, setValue, hydrated } = useLocalStorage<string[]>(BOOKMARKS_KEY, []);

  const toggle = useCallback(
    (id: string) => {
      setValue((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setValue]
  );

  const isBookmarked = useCallback((id: string) => value.includes(id), [value]);

  return { bookmarks: value, toggle, isBookmarked, hydrated };
}

export function useNotifications() {
  const { value, setValue, hydrated } = useLocalStorage<NotificationSetting[]>(
    NOTIFICATIONS_KEY,
    []
  );

  const toggleNotification = useCallback(
    (grantId: string, email: string) => {
      setValue((prev) => {
        const existing = prev.find((n) => n.grantId === grantId);
        if (existing) {
          return prev.filter((n) => n.grantId !== grantId);
        }
        return [
          ...prev,
          { grantId, daysBefore: [7, 3, 1], email, enabled: true },
        ];
      });
    },
    [setValue]
  );

  const isNotifying = useCallback(
    (grantId: string) => value.some((n) => n.grantId === grantId && n.enabled),
    [value]
  );

  return { notifications: value, toggleNotification, isNotifying, hydrated };
}
