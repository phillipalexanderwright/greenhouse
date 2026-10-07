"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase, isLive } from "./supabase";
import { Tables, TableName, TABLE_NAMES, UserName } from "./types";
import { seedData } from "./seed";

const LS_DATA_KEY = "greenhouse-data-v1";
const LS_USER_KEY = "greenhouse-user";

const emptyTables: Tables = {
  months: [],
  box_items: [],
  dinners: [],
  guests: [],
  people: [],
  ideas: [],
  projects: [],
  todos: [],
  resources: [],
  agents: [],
  agent_runs: [],
  social_snapshots: [],
  social_posts: [],
  experiments: [],
  digests: [],
};

type AnyRow = { id: string; [key: string]: unknown };

interface StoreCtx {
  data: Tables;
  ready: boolean;
  live: boolean;
  user: UserName;
  setUser: (u: UserName) => void;
  insert: <T extends TableName>(
    table: T,
    row: Omit<Tables[T][number], "id" | "created_at">
  ) => string;
  update: <T extends TableName>(
    table: T,
    rowId: string,
    patch: Partial<Tables[T][number]>
  ) => void;
  remove: (table: TableName, rowId: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Tables>(emptyTables);
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<UserName>("Phillip");

  useEffect(() => {
    const saved = localStorage.getItem(LS_USER_KEY);
    if (saved === "Phillip" || saved === "Hank") setUserState(saved);
  }, []);

  const setUser = useCallback((u: UserName) => {
    setUserState(u);
    localStorage.setItem(LS_USER_KEY, u);
  }, []);

  // ----- demo mode persistence -----
  const persistLocal = useCallback((next: Tables) => {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    // Public pages (guest RSVP) fetch their own narrow data — don't pull the studio.
    if (window.location.pathname.startsWith("/rsvp")) return;
    const sb = supabase;
    if (isLive && sb) {
      let cancelled = false;
      (async () => {
        const next: Tables = { ...emptyTables };
        await Promise.all(
          TABLE_NAMES.map(async (t) => {
            const { data: rows, error } = await sb
              .from(t)
              .select("*")
              .order("created_at", { ascending: true });
            if (!error && rows)
              (next as unknown as Record<string, AnyRow[]>)[t] =
                rows as AnyRow[];
          })
        );
        if (!cancelled) {
          setData(next);
          setReady(true);
        }
      })();

      const channel = sb
        .channel("greenhouse-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public" },
          (payload) => {
            const table = payload.table as TableName;
            if (!TABLE_NAMES.includes(table)) return;
            setData((prev) => {
              const rows = [...(prev[table] as unknown as AnyRow[])];
              if (payload.eventType === "INSERT") {
                const row = payload.new as AnyRow;
                if (!rows.some((r) => r.id === row.id)) rows.push(row);
              } else if (payload.eventType === "UPDATE") {
                const row = payload.new as AnyRow;
                const i = rows.findIndex((r) => r.id === row.id);
                if (i >= 0) rows[i] = row;
              } else if (payload.eventType === "DELETE") {
                const old = payload.old as AnyRow;
                const i = rows.findIndex((r) => r.id === old.id);
                if (i >= 0) rows.splice(i, 1);
              }
              return { ...prev, [table]: rows };
            });
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        sb.removeChannel(channel);
      };
    } else {
      const raw = localStorage.getItem(LS_DATA_KEY);
      if (raw) {
        try {
          setData({ ...emptyTables, ...JSON.parse(raw) });
        } catch {
          setData(seedData);
          persistLocal(seedData);
        }
      } else {
        setData(seedData);
        persistLocal(seedData);
      }
      setReady(true);

      const bc = new BroadcastChannel("greenhouse-sync");
      bc.onmessage = (e) => setData(e.data as Tables);
      return () => bc.close();
    }
  }, [persistLocal]);

  const broadcast = useCallback((next: Tables) => {
    persistLocal(next);
    const bc = new BroadcastChannel("greenhouse-sync");
    bc.postMessage(next);
    bc.close();
  }, [persistLocal]);

  const insert = useCallback(
    <T extends TableName>(
      table: T,
      row: Omit<Tables[T][number], "id" | "created_at">
    ): string => {
      const full = {
        ...row,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      } as AnyRow;
      setData((prev) => {
        const next = {
          ...prev,
          [table]: [...(prev[table] as unknown as AnyRow[]), full],
        };
        if (!isLive) broadcast(next);
        return next;
      });
      if (isLive && supabase) {
        supabase
          .from(table)
          .insert(full)
          .then(({ error }) => {
            if (error) console.error(`insert ${table}:`, error.message);
          });
      }
      return full.id;
    },
    [broadcast]
  );

  const update = useCallback(
    <T extends TableName>(
      table: T,
      rowId: string,
      patch: Partial<Tables[T][number]>
    ) => {
      setData((prev) => {
        const rows = (prev[table] as unknown as AnyRow[]).map((r) =>
          r.id === rowId ? { ...r, ...patch } : r
        );
        const next = { ...prev, [table]: rows };
        if (!isLive) broadcast(next);
        return next;
      });
      if (isLive && supabase) {
        supabase
          .from(table)
          .update(patch as Record<string, unknown>)
          .eq("id", rowId)
          .then(({ error }) => {
            if (error) console.error(`update ${table}:`, error.message);
          });
      }
    },
    [broadcast]
  );

  const remove = useCallback(
    (table: TableName, rowId: string) => {
      setData((prev) => {
        const next = {
          ...prev,
          [table]: (prev[table] as unknown as AnyRow[]).filter(
            (r) => r.id !== rowId
          ),
        };
        if (!isLive) broadcast(next);
        return next;
      });
      if (isLive && supabase) {
        supabase
          .from(table)
          .delete()
          .eq("id", rowId)
          .then(({ error }) => {
            if (error) console.error(`delete ${table}:`, error.message);
          });
      }
    },
    [broadcast]
  );

  const value = useMemo(
    () => ({ data, ready, live: isLive, user, setUser, insert, update, remove }),
    [data, ready, user, setUser, insert, update, remove]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
