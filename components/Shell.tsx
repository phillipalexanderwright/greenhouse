"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { UserName } from "@/lib/types";
import { usePresence, PresenceEntry } from "@/lib/presence";
import Toasts from "@/components/Toasts";
import Vine from "@/components/Vine";

const nav = [
  { href: "/", label: "This Month", mark: "✶" },
  { href: "/box", label: "The Box", mark: "✉" },
  { href: "/garden", label: "The Garden", mark: "❀" },
  { href: "/people", label: "People", mark: "☙" },
  { href: "/pollinate", label: "Pollinate", mark: "✺" },
  { href: "/todos", label: "To-Dos", mark: "✓" },
  { href: "/projects", label: "Projects", mark: "⚘" },
  { href: "/ideas", label: "Compost Pile", mark: "✿" },
  { href: "/ledger", label: "The Ledger", mark: "❖" },
  { href: "/resources", label: "Resources", mark: "❧" },
  { href: "/wiki", label: "Wiki", mark: "✒" },
  { href: "/agents", label: "Agents", mark: "✳" },
];

function Logo({ size = "h-24 w-24" }: { size?: string }) {
  const [logoMissing, setLogoMissing] = useState(false);
  if (logoMissing) {
    return (
      <div className="mx-auto flex h-16 w-14 items-center justify-center rounded-xl border border-olive/60 bg-cream font-display text-2xl font-semibold text-olive-deep">
        2N
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="2N botanical monogram"
      className={`mx-auto object-contain ${size}`}
      onError={() => setLogoMissing(true)}
    />
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const active =
          n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`gh-navlink flex items-center gap-3 rounded-full px-4 py-2 text-sm ${
              active ? "bg-olive-deep text-cream" : "text-ink hover:bg-sage/70"
            }`}
          >
            <span className="gh-mark w-4 text-center">{n.mark}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function PresenceLine({ others }: { others: PresenceEntry[] }) {
  if (others.length === 0) return null;
  const labelFor = (path: string) =>
    nav.find((n) =>
      n.href === "/" ? path === "/" : path.startsWith(n.href)
    )?.label ?? "wandering";
  return (
    <div className="mt-3 space-y-1 rounded-xl border border-olive/30 bg-sage/40 px-3 py-2 text-center text-[11px] text-ink/70">
      {others.map((o, i) => (
        <div key={i}>
          <span className="gh-pulse mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-olive-deep align-middle" />
          {o.user} is in the greenhouse · {labelFor(o.path)}
        </div>
      ))}
    </div>
  );
}

function UserToggle() {
  const { user, setUser, live } = useStore();
  return (
    <div className="space-y-3">
      <div className="label-caps text-center">Working as</div>
      <div className="flex rounded-full border border-earth/40 bg-cream p-1">
        {(["Phillip", "Hank"] as UserName[]).map((u) => (
          <button
            key={u}
            onClick={() => setUser(u)}
            className={`flex-1 rounded-full py-1 text-sm transition-colors ${
              user === u ? "bg-olive-deep text-cream" : "hover:bg-sage/60"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-ink/45">
        {live ? "● Live — synced via Supabase" : "◦ Demo mode — local only"}
      </p>
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready, user } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublic = pathname.startsWith("/rsvp");

  const raw = usePresence(user);
  const others = useMemo(() => {
    const seen = new Set<string>();
    return raw.filter(
      (o) => o.user !== user && !seen.has(o.user) && !!seen.add(o.user)
    );
  }, [raw, user]);

  // Close the drawer on route change and lock body scroll while open
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-earth/30 bg-sage/40 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-semibold tracking-wide">
            THE GREENHOUSE
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-full border border-earth/40 bg-cream px-3 py-1.5 text-sm"
        >
          ☰ Menu
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="gh-backdrop absolute inset-0 bg-ink/30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="gh-drawer absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-earth/30 bg-cream px-5 py-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-xl font-semibold tracking-wide">
                THE GREENHOUSE
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-earth/40 px-2.5 py-1 text-sm"
              >
                ×
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto space-y-5 pt-6">
              <Vine />
              <UserToggle />
              <PresenceLine others={others} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-earth/30 bg-sage/30 px-5 py-8 lg:flex">
        <div className="mb-10 text-center">
          <div className="gh-breathe mb-3">
            <Logo />
          </div>
          <div className="font-display text-xl font-semibold tracking-wide">
            THE GREENHOUSE
          </div>
          <div className="label-caps mt-1">Plants · Spaces · People</div>
        </div>

        <NavLinks pathname={pathname} />

        <div className="mt-auto space-y-5">
          <Vine />
          <UserToggle />
          <PresenceLine others={others} />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {ready ? children : null}
      </main>

      <Toasts />
    </div>
  );
}
