import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Second Nature — Plants · Spaces · People",
  description:
    "A San Diego studio reconnecting people with real life — a monthly box of whimsy and The Garden, a dinner among friends you haven't met yet. A more natural tomorrow.",
};

export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return children;
}
