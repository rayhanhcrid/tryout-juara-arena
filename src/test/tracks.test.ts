import { describe, expect, it } from "vitest";

import { isTrackFilter, matchesTrack, toTrack } from "@/lib/tracks";

describe("tracks", () => {
  it("falls back to umum for anything unknown", () => {
    expect(toTrack("cpns")).toBe("cpns");
    expect(toTrack("SMA")).toBe("umum");
    expect(toTrack(undefined)).toBe("umum");
  });

  it("shows umum only under Semua", () => {
    expect(matchesTrack("umum", "semua")).toBe(true);
    expect(matchesTrack("umum", "cpns")).toBe(false);
    expect(matchesTrack("bumn", "bumn")).toBe(true);
    expect(isTrackFilter("odp")).toBe(true);
    expect(isTrackFilter("umum")).toBe(false);
  });
});
