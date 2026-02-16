# Data folder

This folder contains mock payloads and (optional) evidence files.

## Why JSON exists

The Raspberry Pi camera outputs video frames (raw pixels). The edge node runs:

1. frame sampling (e.g., 5–10 fps)
2. person detection
3. short-term tracking (assign track ids)
4. line-crossing logic (direction IN/OUT)
5. emit structured JSON events + aggregated stats

The dashboard reads JSON only (not raw video), which is common in real systems for bandwidth/privacy reasons.

## Mock data

- `data/mock/sample_1.json` — normal flow: a few IN/OUT events
- `data/mock/sample_2.json` — group crossing: multiple people cross in the same minute

## Evidence images (optional)

- `data/evidence/` may store snapshots referenced by `events[].snapshot.path`.
- For now we keep `.gitkeep` so the folder exists in git.
