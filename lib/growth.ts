// ============================================
// CHILD GROWTH — WHO Child Growth Standards (median reference)
//
// Classification uses the "% of the median" field method:
//   - Weight-for-age  → Gomez   (underweight)
//   - Height-for-age  → Waterlow (stunting)
// This needs only the WHO MEDIAN values (well established), not fabricated
// SD/z-score coefficients, so it stays honest. It is a SCREENING aid for
// under-5 children — confirm at an Anganwadi / ICDS centre.
// ============================================

type Ref = { age: number; w: number; h: number }; // age in months, w=kg, h=cm

// WHO median weight (kg) & length/height (cm) at anchor ages (0–60 months).
const BOYS: Ref[] = [
  { age: 0, w: 3.3, h: 49.9 }, { age: 6, w: 7.9, h: 67.6 }, { age: 12, w: 9.6, h: 75.7 },
  { age: 24, w: 12.2, h: 87.1 }, { age: 36, w: 14.3, h: 96.1 }, { age: 48, w: 16.3, h: 103.3 },
  { age: 60, w: 18.3, h: 110.0 },
];
const GIRLS: Ref[] = [
  { age: 0, w: 3.2, h: 49.1 }, { age: 6, w: 7.3, h: 65.7 }, { age: 12, w: 8.9, h: 74.0 },
  { age: 24, w: 11.5, h: 85.7 }, { age: 36, w: 13.9, h: 95.1 }, { age: 48, w: 16.1, h: 102.7 },
  { age: 60, w: 18.2, h: 109.4 },
];

function interp(refs: Ref[], ageM: number, key: "w" | "h"): number {
  const a = Math.max(refs[0].age, Math.min(refs[refs.length - 1].age, ageM));
  for (let i = 0; i < refs.length - 1; i++) {
    const lo = refs[i], hi = refs[i + 1];
    if (a >= lo.age && a <= hi.age) {
      const t = hi.age === lo.age ? 0 : (a - lo.age) / (hi.age - lo.age);
      return lo[key] + t * (hi[key] - lo[key]);
    }
  }
  return refs[refs.length - 1][key];
}

export type GrowthResult = {
  ageMonths: number;
  medianWeight: number;
  medianHeight: number;
  weightPctMedian: number; // weight as % of WHO median-for-age
  heightPctMedian: number; // height as % of WHO median-for-age
  underweight: "normal" | "mild" | "moderate" | "severe"; // Gomez (weight-for-age)
  stunting: "normal" | "mild" | "moderate" | "severe";    // Waterlow (height-for-age)
};

export function assessGrowth(
  sex: "male" | "female",
  ageMonths: number,
  weightKg: number,
  heightCm: number
): GrowthResult {
  const refs = sex === "female" ? GIRLS : BOYS;
  const age = Math.max(0, Math.min(60, ageMonths));

  const medianWeight = interp(refs, age, "w");
  const medianHeight = interp(refs, age, "h");
  const weightPctMedian = (weightKg / medianWeight) * 100;
  const heightPctMedian = (heightCm / medianHeight) * 100;

  // Gomez weight-for-age classification.
  const underweight =
    weightPctMedian < 60 ? "severe" :
    weightPctMedian < 75 ? "moderate" :
    weightPctMedian < 90 ? "mild" : "normal";

  // Waterlow stunting (height-for-age): <85 severe, <90 moderate, <95 mild.
  const stunting =
    heightPctMedian < 85 ? "severe" :
    heightPctMedian < 90 ? "moderate" :
    heightPctMedian < 95 ? "mild" : "normal";

  return {
    ageMonths: age,
    medianWeight: Math.round(medianWeight * 10) / 10,
    medianHeight: Math.round(medianHeight * 10) / 10,
    weightPctMedian: Math.round(weightPctMedian),
    heightPctMedian: Math.round(heightPctMedian),
    underweight,
    stunting,
  };
}
