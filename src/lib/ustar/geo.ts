// GeoIP, qurilma va referrer aniqlash (analytics uchun)

const globalForGeo = globalThis as unknown as {
  __topbidGeoCache?: Map<string, { city: string; country: string }>;
};
const cache: Map<string, { city: string; country: string }> =
  globalForGeo.__topbidGeoCache ?? new Map();
globalForGeo.__topbidGeoCache = cache;

/** IP dan shahar/mamlakat (ip-api.com, 3s timeout, kesh bilan) */
export async function geoFromIp(ip: string): Promise<{ city: string; country: string }> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168.")) {
    return { city: "", country: "" };
  }
  const cached = cache.get(ip);
  if (cached) return cached;
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country&lang=uz`, {
      signal: AbortSignal.timeout(3000),
    });
    const d = await res.json();
    if (d && d.status === "success") {
      const result = { city: String(d.city || ""), country: String(d.country || "") };
      if (cache.size > 2000) cache.clear();
      cache.set(ip, result);
      return result;
    }
  } catch {
    /* offline yoki timeout */
  }
  return { city: "", country: "" };
}

/** User-Agent dan qurilma turi */
export function deviceFromUA(ua: string): "mobile" | "tablet" | "desktop" {
  const s = (ua || "").toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|android.*mobile|iphone|ipod|phone/.test(s)) return "mobile";
  if (/android/.test(s)) return "tablet"; // Android without "mobile" = tablet
  return "desktop";
}

/** Referer dan host (yoki "direct") */
export function referrerHost(ref: string | null): string {
  if (!ref) return "direct";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
}

/** Request'dan haqiqiy IP (proxy headerlar bilan) */
export function ipFromHeaders(h: Headers): string {
  const xf = h.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return h.get("x-real-ip") || "127.0.0.1";
}
