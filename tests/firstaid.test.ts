import { describe, it, expect } from "vitest";
import { FIRST_AID } from "../lib/firstaid";

describe("FIRST_AID data integrity", () => {
  it("every entry has a title, steps and donts", () => {
    for (const f of FIRST_AID) {
      expect(f.title).toBeTruthy();
      expect(f.steps.length).toBeGreaterThan(0);
      expect(f.donts.length).toBeGreaterThan(0);
    }
  });

  it("snakebite warns against cutting / sucking / tight binding", () => {
    const sb = FIRST_AID.find(f => f.id === "snakebite");
    expect(sb).toBeTruthy();
    const donts = sb!.donts.join(" ").toLowerCase();
    expect(donts).toMatch(/kaato|chuso|baandho/);
  });

  it("burns warns against ghee/toothpaste/ice", () => {
    const b = FIRST_AID.find(f => f.id === "burns");
    expect(b!.donts.join(" ").toLowerCase()).toMatch(/ghee|toothpaste|ice/);
  });
});
