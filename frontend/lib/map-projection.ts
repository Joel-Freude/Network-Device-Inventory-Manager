export type ProjectionMode = 'globe' | 'mercator';

export function setMapProjection(map: any, mode: ProjectionMode) {
  if (mode === 'globe') {
    if (typeof map.setProjection === 'function') {
      map.setProjection({ type: 'globe' });
    }
    map.setPitch(40);
    map.setBearing(0);
  } else {
    if (typeof map.setProjection === 'function') {
      map.setProjection({ type: 'mercator' });
    }
    map.setPitch(0);
    map.setBearing(0);
  }
}
