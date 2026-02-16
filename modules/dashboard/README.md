# Dashboard module

This module will render:

- KPI cards: total IN, total OUT, net, occupancy estimate
- Trend: byMinute (or byHour) chart/table
- Recent events list: crossing events with direction + confidence
- Device health: fps, cpu temp, last frame timestamp

Data source (for now):

- `data/mock/sample_1.json`
- `data/mock/sample_2.json`

Later, the same schema can be produced by a Raspberry Pi edge analytics script and uploaded to a server.
