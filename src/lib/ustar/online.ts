// Oddiy xotira (in-memory) onlayn foydalanuvchilar trekeri.
// Har bir sessiyadan "yurak urishi" (heartbeat) kelib turadi; oxirgi 2 daqiqada
// ko'rilgan sessiyalar onlayn deb hisoblanadi.

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

const globalForOnline = globalThis as unknown as {
  __ustarOnline?: Map<string, number>;
};

const sessions: Map<string, number> = globalForOnline.__ustarOnline ?? new Map<string, number>();
globalForOnline.__ustarOnline = sessions;

export function heartbeat(sessionId: string): void {
  if (!sessionId) return;
  sessions.set(sessionId, Date.now());
  // Eski yozuvlarni tozalash
  if (sessions.size > 5000) {
    const now = Date.now();
    for (const [sid, last] of sessions) {
      if (now - last > ONLINE_WINDOW_MS) sessions.delete(sid);
    }
  }
}

export function getOnlineCount(): number {
  const now = Date.now();
  let count = 0;
  for (const last of sessions.values()) {
    if (now - last <= ONLINE_WINDOW_MS) count++;
  }
  return count;
}
