// ============================================
// ASHA WORKER — reference data (India)
// National Immunization Schedule (NIS) milestones + home-visit types.
// Source: India NIS (MoHFW). Reference for ASHA workers — confirm locally.
// ============================================

export const VISIT_TYPES = [
  { key: "Pregnancy (ANC) home visit", icon: "🤰", label: "Pregnancy (ANC)" },
  { key: "Newborn / postnatal (HBNC) visit", icon: "👶", label: "Newborn (HBNC)" },
  { key: "Child under-5 growth & nutrition visit", icon: "🧒", label: "Child <5" },
  { key: "General family health visit", icon: "👪", label: "General" },
];

export type Vaccine = { age: string; vaccines: string };

export const IMMUNIZATION: Vaccine[] = [
  { age: "Janm par (Birth)", vaccines: "BCG, OPV-0, Hepatitis B-0" },
  { age: "6 hafte", vaccines: "OPV-1, Pentavalent-1, Rotavirus-1, PCV-1, fIPV-1" },
  { age: "10 hafte", vaccines: "OPV-2, Pentavalent-2, Rotavirus-2" },
  { age: "14 hafte", vaccines: "OPV-3, Pentavalent-3, Rotavirus-3, PCV-2, fIPV-2" },
  { age: "9-12 mahine", vaccines: "Measles-Rubella (MR)-1, JE-1, PCV-Booster, Vitamin A-1" },
  { age: "16-24 mahine", vaccines: "MR-2, JE-2, DPT-Booster-1, OPV-Booster, Vitamin A (2)" },
  { age: "5-6 saal", vaccines: "DPT-Booster-2" },
  { age: "10 saal & 16 saal", vaccines: "TT / Td" },
];
