"use client";

import { useEffect, useRef, useState } from "react";

export type OnlineUser = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  lastSeen: string;
};

export type BlockLock = {
  blockId: string;
  userId: string;
  lockedAt: string;
};

type PresenceResponse = {
  online: OnlineUser[];
  locks: BlockLock[];
};

const POLL_INTERVAL_MS = 5_000;
const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Poll de presença de colaboradores numa página.
 * - Faz heartbeat a cada 15s pra se marcar como online
 * - Pega lista de colaboradores online + locks de bloco a cada 5s
 */
export function useCollabPresence(pageId: string, enabled: boolean) {
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [locks, setLocks] = useState<BlockLock[]>([]);
  const aborted = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setOnline([]);
      setLocks([]);
      return;
    }
    aborted.current = false;

    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

    async function pollOnce() {
      try {
        const res = await fetch(`/api/collab/presence?pageId=${encodeURIComponent(pageId)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json: PresenceResponse = await res.json();
        if (aborted.current) return;
        setOnline(json.online ?? []);
        setLocks(json.locks ?? []);
      } catch {
        // ignora erro transiente
      }
    }

    async function heartbeatOnce() {
      try {
        await fetch("/api/collab/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId }),
        });
      } catch {
        // ignora
      }
    }

    function schedulePoll() {
      pollTimer = setTimeout(async () => {
        if (aborted.current) return;
        await pollOnce();
        schedulePoll();
      }, POLL_INTERVAL_MS);
    }

    function scheduleHeartbeat() {
      heartbeatTimer = setTimeout(async () => {
        if (aborted.current) return;
        await heartbeatOnce();
        scheduleHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    }

    heartbeatOnce();
    pollOnce();
    scheduleHeartbeat();
    schedulePoll();

    return () => {
      aborted.current = true;
      if (pollTimer) clearTimeout(pollTimer);
      if (heartbeatTimer) clearTimeout(heartbeatTimer);
    };
  }, [pageId, enabled]);

  return { online, locks };
}

export async function lockBlock(blockId: string) {
  try {
    await fetch("/api/collab/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId }),
    });
  } catch {}
}

export async function unlockBlock(blockId: string) {
  try {
    await fetch(`/api/collab/lock?blockId=${encodeURIComponent(blockId)}`, {
      method: "DELETE",
    });
  } catch {}
}
