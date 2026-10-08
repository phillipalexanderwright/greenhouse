// Routes the outside world may see — no studio shell, no data fetch, no presence.
export const PUBLIC_PREFIXES = ["/rsvp", "/welcome", "/gate"];

export function isPublicPath(path: string) {
  return PUBLIC_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/")
  );
}
