import { describe, it, expect } from "vitest";
import { langInstruction, LANGUAGES } from "../lib/lang";

describe("langInstruction", () => {
  it("returns an instruction for a known language", () =>
    expect(langInstruction("tamil")).toContain("Tamil"));
  it("returns empty string for an unknown code", () =>
    expect(langInstruction("klingon")).toBe(""));
  it("offers 12 languages", () => expect(LANGUAGES.length).toBe(12));
});
