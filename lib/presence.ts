"use client";

// Who else is in the greenhouse right now, and where.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { isPublicPath } from "./public";
import { UserName } from "./types";

export interface PresenceEntry {
  user: string;
  path: string;
}

export function usePresence(user: UserName): PresenceEntry[] {
  const pathname = usePathname();
  const [others, setOthers] = useState<PresenceEntry[]>([]);
  const chanRef = useRef<RealtimeChannel | null>(null);
  const meRef = useRef({ user, path: pathname });
  meRef.current = { user, path: pathname };

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    // Visitors on public pages are not "in the greenhouse."
    if (isPublicPath(window.location.pathname)) return;
    const key = crypto.randomUUID();
    const channel = sb.channel("greenhouse-presence", {
      config: { presence: { key } },
    });
    chanRef.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceEntry>();
      const list: PresenceEntry[] = [];
      for (const [k, metas] of Object.entries(state)) {
        if (k === key) continue;
        const m = metas[0];
        if (m?.user) list.push({ user: m.user, path: m.path ?? "/" });
      }
      setOthers(list);
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") channel.track(meRef.current);
    });
    return () => {
      sb.removeChannel(channel);
      chanRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-announce when identity or page changes
  useEffect(() => {
    chanRef.current?.track({ user, path: pathname });
  }, [user, pathname]);

  return others;
}
