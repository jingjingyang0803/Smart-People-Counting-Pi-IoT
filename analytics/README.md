# Analytics Module

## Responsibility

The Analytics module transforms raw people counting data into meaningful insights.

Main responsibilities:

- Historical data aggregation
- KPI (Key Performance Indicator) computation
- Occupancy trend analysis
- System performance evaluation
- Support for long-term monitoring

While the Processing module operates in real time, the Analytics module extracts value from accumulated data.

## Role in System Architecture

Analytics operates on stored data rather than live frames.

It provides:

- Historical insights
- Trend visualization
- Performance evaluation
- Decision-support information

## Difference from Processing

| Processing       | Analytics               |
| ---------------- | ----------------------- |
| Real-time        | Historical              |
| Frame-based      | Data-based              |
| Motion detection | Statistical computation |
| Edge-level       | System-level            |

Processing answers:

> “Is someone entering right now?”

Analytics answers:

> “What was the peak occupancy today?”

## Why Analytics Matters in IoT

IoT systems are not just about collecting data —

they are about extracting value from data.

In a people counting scenario, analytics enables:

- Space utilization monitoring
- Peak hour identification
- Resource planning
- System performance tuning

Without analytics, the system only provides real-time numbers.

With analytics, it becomes a decision-support tool.

## Example KPIs

### People Counting KPIs

- Peak occupancy
- Total daily entries
- Total daily exits
- Hourly traffic distribution
- Occupancy trend over time

### System Performance KPIs

- Average FPS
- CPU usage trend
- Latency estimation
- Stability under continuous operation

## Example Metrics

```python
compute_peak_occupancy()
compute_average_fps()
aggregate_hourly_entries()
```

Example output:

```json
{
  "peak_occupancy": 18,
  "daily_entries": 132,
  "average_fps": 28.7,
  "average_cpu": 42.5
}
```

## Data Sources

Analytics can operate on:

- Stored JSON log files
- MQTT message logs
- Future database integration (e.g., cloud storage)

Currently:

- JSON logs are stored locally
- Analytics reads and aggregates them

## Design Considerations

### Lightweight Computation

Since this project runs primarily on Raspberry Pi:

- Aggregation must remain efficient
- Avoid heavy database engines
- Keep computation simple and interpretable

### Scalability

Future extensions may include:

- Cloud-based analytics
- Long-term storage
- Multi-device aggregation
- Cross-zone occupancy comparison

## Value to the Overall System

The Analytics module elevates the project from:

> A simple motion detection demo

to:

> A complete IoT monitoring solution with measurable performance and usage insights.

It demonstrates understanding of:

- Data lifecycle
- Edge-to-insight pipeline
- System-level thinking
