/**
 * Computes the current solar terminator (day/night boundary) as a closed
 * GeoJSON polygon covering the night hemisphere.
 *
 * Must return a Polygon, not Points/LineString — Globe.tsx renders this
 * source with a `type: 'fill'` layer, and MapLibre fill layers only draw
 * Polygon/MultiPolygon geometry. A Point FeatureCollection here will
 * compile fine but silently render nothing.
 */
export function nightHemisphereGeoJSON(date: Date = new Date()): GeoJSON.Feature<GeoJSON.Polygon> {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  // Solar declination approximation (degrees).
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const decRad = (declination * Math.PI) / 180;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const subsolarLng = (12 - utcHours) * 15;

  const ring: [number, number][] = [];
  for (let lng = -180; lng <= 180; lng += 2) {
    const lngRad = ((lng - subsolarLng) * Math.PI) / 180;
    const lat = (Math.atan(-Math.cos(lngRad) / Math.tan(decRad)) * 180) / Math.PI;
    ring.push([lng, lat]);
  }
  // Close the polygon around whichever pole is currently dark.
  const darkPole = declination >= 0 ? -90 : 90;
  ring.push([180, darkPole], [-180, darkPole], ring[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}
