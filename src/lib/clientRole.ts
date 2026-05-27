export type ClientRole = "controller" | "tv" | "admin" | "unknown";

/** Which UI surface is running (by URL path). Used to gate minigame simulation. */
export function getClientRole(): ClientRole {
  if (typeof window === "undefined") return "unknown";
  const path = window.location.pathname.toLowerCase();
  if (path.includes("/controller")) return "controller";
  if (path.includes("/tv")) return "tv";
  if (path.includes("/admin")) return "admin";
  return "unknown";
}

export function isControllerClient(): boolean {
  return getClientRole() === "controller";
}

export function isTvClient(): boolean {
  return getClientRole() === "tv";
}

/** Only controller/admin may push local state to Supabase. TV subscribes only. */
export function shouldPushGameStateToRoom(): boolean {
  const role = getClientRole();
  return role === "controller" || role === "admin";
}
