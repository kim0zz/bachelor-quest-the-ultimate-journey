/** Default shared room for TV, controller, and admin. */
export const DEFAULT_ROOM_CODE = "KAWALER";

const CLIENT_ID_KEY = "bachelor-quest-client-id";

export function getRoomCode(): string {
  if (typeof window === "undefined") return DEFAULT_ROOM_CODE;
  const room = new URLSearchParams(window.location.search)
    .get("room")
    ?.trim()
    .toUpperCase();
  return room || DEFAULT_ROOM_CODE;
}

export function getClientId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `bq-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
