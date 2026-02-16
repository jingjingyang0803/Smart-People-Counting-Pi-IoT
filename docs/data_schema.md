# Data Schema — Smart People Counting (Entrance Line Crossing) v1.0

This schema represents the _analytics output_ from a Raspberry Pi + Camera edge node.
The camera produces frames (raw pixels). The edge node runs detection/tracking + line-crossing logic,
then outputs structured JSON for the dashboard.

## Concept

- The entrance has a **virtual counting line**.
- Each tracked person gets a temporary `trackId`.
- When a person crosses the line, we generate a `crossing` event with direction `in` or `out`.
- For efficient visualization, we also compute aggregated counts per minute/hour.

## Top-level object

### Required fields

- `schemaVersion` (string) — e.g. "1.0"
- `siteId` (string) — deployment site
- `sensorId` (string) — unique edge device id
- `zone` (object)
  - `name` (string)
  - `line` (object)
    - `id` (string)
    - `a` ([number, number]) — pixel coordinate of line endpoint A
    - `b` ([number, number]) — pixel coordinate of line endpoint B
    - `insideHint` (string) — human-readable definition of "inside" side
- `generatedAt` (ISO8601 string)
- `window` (object)
  - `start` (ISO8601 string)
  - `end` (ISO8601 string)
- `events` (array)
- `aggregates` (object)
- `health` (object)

## events[]

### Event: crossing

- `type`: "crossing"
- `ts`: ISO8601 string
- `direction`: "in" | "out"
- `trackId`: string — local tracking id
- `confidence`: number (0..1)
- `snapshot` (optional):
  - `path`: string — relative path to an evidence image (e.g. "data/evidence/evt_001.jpg")

## aggregates

- `total`:
  - `in`: number
  - `out`: number
  - `net`: number // in - out
- `byMinute` (or `byHour`):
  - `ts`: ISO8601 string (bucket start)
  - `in`: number
  - `out`: number
- `occupancyEstimate` (optional):
  - `current`: number
  - `method`: "net_count" // current = cumulative in - out

## health

- `lastFrameTs`: ISO8601 string
- `fps`: number
- `cpuTempC`: number
- `uptimeSec`: number

## Notes

- Raw video is not stored in JSON due to size and privacy. JSON is the _result_ of edge analytics.
- This schema is intentionally close to real deployments: site/sensor/zone/line + events + aggregates + health.
