import { describe, expect, it } from "vitest";
import { createLinkAttemptLimiter } from "../link-attempt-limiter";

describe("linkage sensitive attempt limiter", () => {
  it("limits a stable destination across renewable source sessions and IPs", () => {
    const consume = createLinkAttemptLimiter();
    for (let index = 0; index < 5; index++)
      expect(consume("Destination@EXAMPLE.com", `192.0.2.${index + 1}`)).toBe(true);
    expect(consume("destination@example.com", "192.0.2.99")).toBe(false);
  });
  it("limits a transport IP across different destinations", () => {
    const consume = createLinkAttemptLimiter();
    for (let index = 0; index < 20; index++)
      expect(consume(`destination${index}@example.com`, "192.0.2.1")).toBe(true);
    expect(consume("another@example.com", "192.0.2.1")).toBe(false);
  });
  it("uses an explicit conservative shared quota when transport IP is absent or invalid", () => {
    const consume = createLinkAttemptLimiter();
    for (let index = 0; index < 5; index++)
      expect(consume(`destination${index}@example.com`, undefined)).toBe(true);
    expect(consume("sixth@example.com", "untrusted header")).toBe(false);
    expect(consume("seventh@example.com", undefined)).toBe(false);
  });
  it("expires attempts after the fixed window", () => {
    let now = 0;
    const consume = createLinkAttemptLimiter({ now: () => now });
    for (let index = 0; index < 5; index++) expect(consume("destination@example.com", "192.0.2.1")).toBe(true);
    now = 899_999;
    expect(consume("destination@example.com", "192.0.2.1")).toBe(false);
    now = 900_000;
    expect(consume("destination@example.com", "192.0.2.1")).toBe(true);
  });
  it("fails closed at bounded capacity without evicting live counters", () => {
    let now = 0;
    const consume = createLinkAttemptLimiter({ maxKeys: 3, now: () => now });
    expect(consume("destination@example.com", "192.0.2.1")).toBe(true);
    expect(consume("different@example.com", "192.0.2.2")).toBe(false);
    expect(consume("destination@example.com", "192.0.2.1")).toBe(true);
    now = 900_000;
    expect(consume("different@example.com", "192.0.2.2")).toBe(true);
  });
  it("has a process-wide quota even for distributed destination/IP attempts", () => {
    const consume = createLinkAttemptLimiter();
    for (let index = 0; index < 200; index++) expect(consume(`destination${index}@example.com`, `192.0.2.${index + 1}`)).toBe(true);
    expect(consume("other@example.com", "192.0.2.201")).toBe(false);
  });
});
