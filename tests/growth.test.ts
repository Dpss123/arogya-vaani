import { describe, it, expect } from "vitest";
import { assessGrowth } from "../lib/growth";

describe("assessGrowth (WHO % of median)", () => {
  it("classifies a child at the median as normal", () => {
    const r = assessGrowth("male", 24, 12.2, 87.1); // ≈ WHO median for 24mo boy
    expect(r.underweight).toBe("normal");
    expect(r.stunting).toBe("normal");
    expect(r.weightPctMedian).toBe(100);
  });

  it("flags severe underweight below 60% of median weight", () => {
    const r = assessGrowth("male", 24, 6.0, 87); // ≈ 49% of 12.2kg
    expect(r.underweight).toBe("severe");
  });

  it("flags moderate stunting between 85–90% of median height", () => {
    const r = assessGrowth("male", 24, 12, 75); // 75/87.1 ≈ 86%
    expect(r.stunting).toBe("moderate");
  });

  it("flags mild stunting between 90–95% of median height", () => {
    const r = assessGrowth("male", 24, 12, 80); // 80/87.1 ≈ 92%
    expect(r.stunting).toBe("mild");
  });

  it("clamps age into the 0–60 month range", () => {
    const r = assessGrowth("female", 200, 18, 110);
    expect(r.ageMonths).toBeLessThanOrEqual(60);
  });

  it("interpolates the median between anchor ages", () => {
    const r = assessGrowth("male", 9, 9, 72); // between 6mo(7.9) and 12mo(9.6)
    expect(r.medianWeight).toBeGreaterThan(7.9);
    expect(r.medianWeight).toBeLessThan(9.6);
  });
});
