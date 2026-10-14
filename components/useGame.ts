"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "@/lib/game";

const POLL_MS = 1000;

/** Polls a live game's state. `offset` converts server timestamps to the local clock. */
export function useGame(pin: string, auth: { playerId?: string | null; hostKey?: string | null }) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playerId, hostKey } = auth;

  const refresh = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      const qs = playerId ? `?playerId=${encodeURIComponent(playerId)}` : "";
      const started = Date.now();
      const res = await fetch(`/api/games/${pin}${qs}`, {
        cache: "no-store",
        headers: hostKey ? { "x-host-key": hostKey } : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load the game.");
        if (res.status === 404) return; // stop polling a dead game
      } else {
        const local = (started + Date.now()) / 2;
        setOffset(data.serverNow - local);
        setState(data);
        setError(null);
      }
    } catch {
      setError("Connection lost — retrying…");
    }
    timer.current = setTimeout(refresh, POLL_MS);
  }, [pin, playerId, hostKey]);

  useEffect(() => {
    refresh();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refresh]);

  /** Convert a server timestamp into the local clock. */
  const toLocal = useCallback((serverTs: number) => serverTs - offset, [offset]);

  return { state, error, refresh, toLocal };
}

export async function postJSON<T = unknown>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — fine */
  }
}
