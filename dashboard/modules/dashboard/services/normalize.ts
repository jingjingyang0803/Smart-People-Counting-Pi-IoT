import type { LiveDashboardState, LiveTelemetryMessage } from "../types";

export function normalizeLiveTelemetry(
  msg: LiveTelemetryMessage,
): LiveDashboardState {
  const derivedOccupancy = (msg.people_in ?? 0) - (msg.people_out ?? 0);
  const reportedOccupancy = msg.occupancy ?? 0;

  return {
    timestamp: msg.timestamp ?? new Date().toISOString(),

    deviceId: msg.device_id ?? "unknown",
    zoneName: msg.zone ?? "unknown",

    peopleIn: msg.people_in ?? 0,
    peopleOut: msg.people_out ?? 0,

    occupancy: reportedOccupancy,

    fps: msg.fps ?? null,
    cpu: msg.cpu ?? null,
    cpuTemp: msg.cpu_temp ?? null,

    motionScore: msg.motion_score ?? null,
    brightness: msg.brightness ?? null,

    crowdLevel: msg.crowd_level ?? null,
    capacity: msg.capacity ?? null,

    occupancyMismatch: derivedOccupancy !== reportedOccupancy,
  };
}
