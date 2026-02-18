# Processing Module

## Responsibility

- Motion detection
- Basic people counting logic
- ROI-based processing (future extension)
- Generate structured JSON output

## Input

Frame data from camera module.

## Current Implementation

- Frame difference based motion detection
- Simple counter update logic

## Example Usage

Import detect_motion() and update_count() into main pipeline.

## Output Format

Data must follow shared schema:
../shared/data_schema_example.json

Example:
{
"people_in": 3,
"people_out": 1,
"occupancy": 12
}

## Future Extension

- YOLO object detection
- Direction-based counting
- Multi-zone support
