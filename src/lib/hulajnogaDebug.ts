const ENABLED = import.meta.env.DEV;

export function hulajnogaDebug(...args: unknown[]) {
  if (ENABLED) console.log("[hulajnoga]", ...args);
}
