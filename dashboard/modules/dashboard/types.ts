export type Point = [number, number];

export type CrossingEvent = {
  type: "crossing";
  ts: string;
  direction: "in" | "out";
  trackId: string;
  confidence: number;
  snapshot?: { path: string };
};

export type Bucket = { ts: string; in: number; out: number };

export type Payload = {
  schemaVersion: string;
  siteId: string;
  sensorId: string;
  zone: {
    name: string;
    line: { id: string; a: Point; b: Point; insideHint: string };
  };
  generatedAt: string;
  window: { start: string; end: string };
  events: CrossingEvent[];
  aggregates: {
    total: { in: number; out: number; net: number };
    byMinute?: Bucket[];
    byHour?: Bucket[];
    occupancyEstimate?: { current: number; method: "net_count" };
  };
  health: {
    lastFrameTs: string;
    fps: number;
    cpuTempC: number;
    uptimeSec: number;
  };
};

/** MQTT raw realtime message */
export type LiveTelemetryMessage = {
  timestamp: string;
  device_id: string;
  zone: string;
  people_in: number;
  people_out: number;
  occupancy: number;
  fps?: number;
  cpu?: number;
  cpu_temp?: number;
  motion_score?: number;
  brightness?: number;
  crowd_level?: "low" | "medium" | "crowded";
  capacity?: number;
};

/** frontend-friendly live state */
export type LiveDashboardState = {
  timestamp: string;
  deviceId: string;
  zoneName: string;
  peopleIn: number;
  peopleOut: number;
  occupancy: number;
  fps: number | null;
  cpu: number | null;
  cpuTemp: number | null;
  motionScore: number | null;
  brightness: number | null;
  crowdLevel: "low" | "medium" | "crowded" | null;
  capacity: number | null;
  occupancyMismatch: boolean;
};

export type Mode = "technical" | "business" | "analytics";
