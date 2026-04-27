/**
 * getClientIp — Extract the real client IP address from an Express request.
 *
 * Priority order:
 *   1. X-Forwarded-For header (set by Nginx / load balancers / proxies)
 *      — can be a comma-separated list; we take the FIRST entry (originating client)
 *   2. X-Real-IP header (set by some Nginx configurations)
 *   3. req.ip  (Express's built-in, works when trust proxy is configured)
 *   4. req.socket.remoteAddress  (raw TCP socket fallback)
 *
 * The ::ffff: prefix is stripped from IPv4-mapped IPv6 addresses so the
 * stored value is always a clean IPv4 string (e.g. "192.168.1.5").
 */
export function getClientIp(req) {
  // 1. X-Forwarded-For (most reliable behind reverse proxy)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first.replace(/^::ffff:/, "");
  }

  // 2. X-Real-IP (Nginx alternative)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp.trim().replace(/^::ffff:/, "");
  }

  // 3. Express req.ip (respects trust proxy setting)
  if (req.ip) {
    return req.ip.replace(/^::ffff:/, "");
  }

  // 4. Raw socket address
  const socketAddr = req.socket?.remoteAddress;
  if (socketAddr) {
    return socketAddr.replace(/^::ffff:/, "");
  }

  return "unknown";
}
