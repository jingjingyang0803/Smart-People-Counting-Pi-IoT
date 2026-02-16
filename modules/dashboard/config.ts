export type ZoneConfig = {
  capacity: number;
  busyPct: number; // >= busyPct => Busy
  overPct: number; // >= overPct => Over capacity
  displayName?: string; // optional, overrides siteId mapping
};

export const SITE_DISPLAY_NAME: Record<string, string> = {
  "tampere-campus-A": "Tampere Campus A",
  "tampere-campus-B": "Tampere Campus B",
};

export const ZONE_CONFIG: Record<string, ZoneConfig> = {
  // key = `${siteId}::${zoneName}`
  "tampere-campus-a::main entrance": {
    capacity: 25,
    busyPct: 70,
    overPct: 90,
  },
  "tampere-campus-a::side entrance": { capacity: 12, busyPct: 70, overPct: 90 },
};
