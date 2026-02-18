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

export type Mode = "business" | "technical";
