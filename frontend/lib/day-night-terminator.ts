export function nightHemisphereGeoJSON() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;

  const features = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const lng = -180 + (360 * i) / steps;
    const lat = 23.44 * Math.sin(((dayOfYear - 81) / 365) * 2 * Math.PI) * Math.cos((hour / 12) * Math.PI);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
