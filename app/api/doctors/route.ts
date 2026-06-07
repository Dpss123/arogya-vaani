import { NextRequest, NextResponse } from "next/server";

type Card = {
  id: string; name: string; speciality: string; clinic: string; address: string;
  distance: string; timing: string; phone: string; ayushman: boolean; free: boolean; rating: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district") || "Haridwar";
  const speciality = searchParams.get("speciality") || "all";
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);

  try {
    // Verified doctors from our DB (no coordinates stored → distance shown as "—").
    const { getDoctorsByDistrict } = await import("@/lib/supabase");
    const dbRows = await getDoctorsByDistrict(district, speciality);
    const fromDb: Card[] = (dbRows || []).map((d: Record<string, unknown>, i: number) => ({
      id: "db-" + String(d.id ?? i),
      name: String(d.name ?? "Doctor"),
      speciality: String(d.speciality ?? "General Physician"),
      clinic: String(d.clinic_address ?? "Clinic"),
      address: String(d.clinic_address ?? ""),
      distance: "—",
      timing: "—",
      phone: String(d.phone ?? ""),
      ayushman: Boolean(d.accepts_ayushman),
      free: Boolean(d.accepts_ayushman),
      rating: 4.7,
    }));

    // Real nearby facilities from OpenStreetMap, sorted by true distance.
    let nearby: Card[] = [];
    if (hasGeo) {
      try {
        const { fetchNearbyFacilities, haversineKm } = await import("@/lib/geo");
        const typeLabel: Record<string, string> = {
          hospital: "Hospital", clinic: "Clinic", doctors: "Doctor", pharmacy: "Pharmacy",
        };
        const facilities = await fetchNearbyFacilities(lat, lng);
        nearby = facilities
          .map(f => ({ f, km: haversineKm(lat, lng, f.lat, f.lon) }))
          .sort((a, b) => a.km - b.km)
          .map(({ f, km }) => ({
            id: "osm-" + f.id,
            name: f.name,
            speciality: typeLabel[f.amenity] || "Clinic",
            clinic: f.name,
            address: f.address,
            distance: km.toFixed(1) + " km",
            timing: f.opening_hours || "—",
            phone: f.phone,
            ayushman: false,
            free: f.isGovt,
            rating: 0,
          }));
      } catch { /* OSM optional — DB still returned */ }
    }

    return NextResponse.json({ doctors: [...nearby, ...fromDb], located: hasGeo });
  } catch {
    return NextResponse.json({ doctors: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registerDoctor } = await import("@/lib/supabase");
    const doctor = await registerDoctor(body);
    return NextResponse.json({ doctor });
  } catch (err) {
    console.error("Doctor register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
