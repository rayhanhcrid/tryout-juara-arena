import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { coverPhotoOf, monogram } from "@/components/catalog-cover";
import { COVER_PHOTO_LIST } from "@/lib/cover-photos";

describe("cover photos", () => {
  it("picks the subtes before the selection", () => {
    expect(coverPhotoOf("Latihan TWK: Pilar Negara")?.src).toBe("/covers/pancasila.webp");
    expect(coverPhotoOf("SKD · TIU Deret Angka")?.src).toBe("/covers/matematika.webp");
    expect(coverPhotoOf("Paket Harian SKD #1")?.src).toBe("/covers/sejarah.webp");
    expect(coverPhotoOf("ODP Bank: Bahasa Inggris")?.src).toBe("/covers/bahasa-inggris.webp");
    expect(coverPhotoOf("Rekrutmen BUMN: TKD")?.src).toBe("/covers/ekonomi.webp");
  });

  it("has no photo for an unknown subject", () => {
    expect(coverPhotoOf("Seni Budaya")).toBeNull();
  });

  it("monograms the first meaningful word", () => {
    expect(monogram("Paket Harian Psikologi")).toBe("P");
    expect(monogram("Paket #3 Wawancara")).toBe("W");
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
