import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPublicPath } from "@/lib/public";

// Everything except the public meadow (/welcome, /rsvp, /gate) requires the
// studio cookie. If GREENHOUSE_GATE_KEY is unset (local demo), the door is open.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname) || pathname.startsWith("/api/gate")) {
    return NextResponse.next();
  }
  const expected = process.env.GREENHOUSE_GATE_KEY;
  if (!expected) return NextResponse.next();
  if (req.cookies.get("gh_gate")?.value === expected) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/welcome";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and any file with an extension (logo, brand assets…)
  matcher: ["/((?!_next|.*\\..*).*)"],
};
