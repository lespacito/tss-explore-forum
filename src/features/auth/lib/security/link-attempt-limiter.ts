import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";

/** Local, enforced independently of Arcjet DRY_RUN. Counters reset on process
 * restart and are not shared across replicas. No raw email/IP/password is retained.
 * Never evict live counters: saturation fails closed rather than renewing quotas.
 */
export function createLinkAttemptLimiter(options: { maxKeys?: number; now?: () => number } = {}) {
  const secret = randomBytes(32);
  const counters = new Map<string, { count: number; expires: number }>();
  const now = options.now ?? (() => performance.now());
  const maxKeys = options.maxKeys ?? 4096;
  const windowMs = 15 * 60 * 1000;
  const key = (kind: string, value: string) => createHmac("sha256", secret).update(kind).update("\0").update(value).digest("hex");
  return (destination: string, transportIP: string | undefined): boolean => {
    const time = now();
    for (const [key, counter] of counters) if (counter.expires <= time) counters.delete(key);
    const limits: [string, number][] = [
      [key("global", "link"), 200],
      [key("destination", destination.toLowerCase()), 5],
      // Only a transport address supplied by the server runtime is eligible.
      // Missing/invalid transport info gets ONE shared conservative quota.
      transportIP && isIP(transportIP)
        ? [key("ip", transportIP), 20]
        : [key("missing-ip", "link"), 5],
    ];
    if (limits.some(([key, limit]) => (counters.get(key)?.count ?? 0) >= limit)) return false;
    const newKeys = limits.filter(([key]) => !counters.has(key)).length;
    if (counters.size + newKeys > maxKeys) return false;
    for (const [key] of limits) {
      const counter = counters.get(key);
      if (counter) counter.count++;
      else counters.set(key, { count: 1, expires: time + windowMs });
    }
    return true;
  };
}
export const consumeLinkAttempt = createLinkAttemptLimiter();
