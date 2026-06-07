import { describe, it, expect } from "vitest";
import { hasEmergencyKeywords, formatPhone, interpretPHQ9 } from "../lib/utils";

describe("hasEmergencyKeywords", () => {
  it("detects chest pain", () => expect(hasEmergencyKeywords("seene mein dard ho raha hai")).toBe(true));
  it("detects breathlessness", () => expect(hasEmergencyKeywords("saans nahi aa rahi")).toBe(true));
  it("detects unconsciousness", () => expect(hasEmergencyKeywords("patient behosh hai")).toBe(true));
  it("ignores mild symptoms", () => expect(hasEmergencyKeywords("halki sardi aur khansi")).toBe(false));
});

describe("formatPhone", () => {
  it("strips non-digits and prefixes a leading 0 with 91", () =>
    expect(formatPhone("09876543210")).toBe("919876543210"));
});

describe("interpretPHQ9", () => {
  it("severe for a high score", () => expect(interpretPHQ9(22).level).toBe("Severe"));
  it("minimal for a low score", () => expect(interpretPHQ9(2).level).toBe("Minimal"));
});
