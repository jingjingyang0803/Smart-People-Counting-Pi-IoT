# Smart People Counting (Pi + Camera)

A low-cost edge-based people counting prototype that generates entrance IN/OUT crossing events and aggregated traffic statistics for a dashboard.

## What this repo contains

- A data-first project structure: define schema → create mock data → build dashboard on top.
- The JSON schema is designed for an entrance line-crossing counting scenario (IN vs OUT).

## Folder structure

- `docs/` — documentation (data schema, design notes)
- `data/` — mock data & evidence (snapshots)
  - `data/mock/` — sample JSON payloads used by the dashboard
  - `data/evidence/` — (optional) event snapshots referenced by JSON
- `modules/dashboard/` — dashboard UI module (reads mock JSON and visualizes metrics)

## Quick start (data)

Open:

- `docs/data_schema.md` — schema definition
- `data/README.md` — how mock data is organized
- `data/mock/sample_1.json` and `sample_2.json` — example payloads
