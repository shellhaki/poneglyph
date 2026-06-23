"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "./types";

const KEY = "poneglyph.sessions";
const listeners = new Set<() => void>();

const EMPTY: Session[] = [];
let cacheRaw: string | null = null;
let cacheValue: Session[] = EMPTY;

function read(): Session[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cacheValue;
  cacheRaw = raw;
  try {
    cacheValue = raw ? (JSON.parse(raw) as Session[]) : EMPTY;
  } catch {
    cacheValue = EMPTY;
  }
  return cacheValue;
}

function write(sessions: Session[]) {
  window.localStorage.setItem(KEY, JSON.stringify(sessions));
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSessions(): Session[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addSession(session: Session) {
  write([...read(), session]);
}

export function removeSession(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function renameSession(id: string, label: string) {
  write(read().map((s) => (s.id === id ? { ...s, label } : s)));
}

export function newId() {
  return `s_${Math.random().toString(36).slice(2, 10)}`;
}
