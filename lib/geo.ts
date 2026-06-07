// ============================================
// FREE GEO HELPERS — no API key, no cost
// Distance: Haversine (pure math)
// Nearby facilities: OpenStreetMap Overpass API
// OSM data © OpenStreetMap contributors (ODbL) — attribution required.
// ============================================

// Great-circle distance between two lat/lng points, in kilometres.
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type OsmFacility = {
  id: string;
  name: string;
  amenity: string; // hospital | clinic | doctors | pharmacy
  lat: number;
  lon: number;
  phone: string;
  opening_hours: string;
  address: string;
  isGovt: boolean;
};

// Query OpenStreetMap (Overpass) for health facilities near a coordinate.
// Returns [] on any failure — callers always have a fallback.
export async function fetchNearbyFacilities(
  lat: number,
  lon: number,
  radiusMeters = 10000
): Promise<OsmFacility[]> {
  const query = `[out:json][timeout:15];
(
  node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radiusMeters},${lat},${lon});
  way["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radiusMeters},${lat},${lon});
);
out center 50;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass fair-use policy requires an identifying User-Agent.
        "User-Agent": "ArogyaVaani/1.0 (rural health finder; contact: hello@trixo.in)",
      },
      body: "data=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();

    const out: OsmFacility[] = [];
    for (const el of data.elements || []) {
      const t = el.tags || {};
      const name: string | undefined = t.name || t["name:en"] || t["name:hi"];
      if (!name) continue;
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (typeof elLat !== "number" || typeof elLon !== "number") continue;

      const address = [t["addr:street"], t["addr:city"], t["addr:district"]].filter(Boolean).join(", ");
      const blob = `${name} ${t.operator || ""} ${t["operator:type"] || ""}`.toLowerCase();
      const isGovt = /govt|government|public|phc|chc|district|civil|sarkari|nhm/.test(blob);

      out.push({
        id: String(el.id),
        name,
        amenity: t.amenity || "clinic",
        lat: elLat,
        lon: elLon,
        phone: t.phone || t["contact:phone"] || "",
        opening_hours: t.opening_hours || "",
        address: address || name,
        isGovt,
      });
    }
    return out;
  } catch {
    return [];
  }
}
