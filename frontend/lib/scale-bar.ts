export interface ScaleBar {
  widthPx: number;
  label: string;
}

export function computeScaleBar(zoom: number, lat: number): ScaleBar {
  const circumference = 40075017;
  const metersPerPx = (circumference * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
  const targetMeters = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000].find(
    (m) => m / metersPerPx >= 60
  ) || 1000000;

  return {
    widthPx: Math.max(40, Math.min(160, targetMeters / metersPerPx)),
    label: targetMeters >= 1000 ? `${targetMeters / 1000} km` : `${targetMeters} m`,
  };
}
