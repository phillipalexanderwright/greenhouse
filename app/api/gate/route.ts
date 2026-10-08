import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  const expected = process.env.GREENHOUSE_GATE_KEY;
  if (!expected || !key || key !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("gh_gate", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
