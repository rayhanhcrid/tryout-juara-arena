import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { coverPhotoOf } from "@/components/catalog-cover";
import { COVER_PHOTO_LIST } from "@/lib/cover-photos";

describe("cover photos", () => {
  it("picks the most specific subject photo", () => {
    expect(coverPhotoOf("TKA Geografi 2025")?.src).toBe("/covers/tka-geografi.webp");
    expect(coverPhotoOf("Geografi")?.src).toBe("/covers/geografi.webp");
    expect(coverPhotoOf("Try Out Matematika Dasar")?.src).toBe("/covers/matematika-dasar.webp");
    expect(coverPhotoOf("Matematika")?.src).toBe("/covers/matematika.webp");
    expect(coverPhotoOf("Pendidikan Pancasila")?.src).toBe("/covers/pancasila.webp");
  });

  it("has no photo for an unknown subject", () => {
    expect(coverPhotoOf("Seni Budaya")).toBeNull();
  });

  it("ships every photo it credits, each with an author and license", () => {
    for (const photo of COVER_PHOTO_LIST) {
      expect(fs.existsSync(path.join(process.cwd(), "public", photo.src))).toBe(true);
      expect(photo.author).not.toBe("");
      expect(photo.license).not.toBe("");
      expect(photo.page).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
});
