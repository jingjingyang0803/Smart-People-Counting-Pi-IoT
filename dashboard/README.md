# Smart People Counting (Raspberry Pi + Camera)

## 1. Project Overview

**Smart People Counting** is a low-cost edge-based prototype designed to detect and count people crossing an entrance line.

The system generates:

- Real-time **IN / OUT** crossing events
- Aggregated traffic statistics
- Dashboard-ready structured JSON payloads

This project follows a **data-first architecture**:

1. Define JSON schema
2. Create mock data
3. Build a dashboard module that consumes structured data

The goal is to simulate an entrance monitoring system that can later be deployed on Raspberry Pi with a camera module.

## 2. System Architecture

The system consists of three logical layers:

### Edge Layer (Conceptual)

- Raspberry Pi + Camera
- Line-crossing detection
- Event generation (IN / OUT)

### Data Layer

- JSON schema definition
- Mock payload generation
- Structured event format

### Dashboard Layer (Vite + Frontend)

- Reads JSON mock data
- Visualizes metrics:
  - IN count
  - OUT count
  - Net occupancy
  - Traffic trends

## 3. Repository Structure

```
docs/                      # Documentation
│   data_schema.md         # JSON schema definition
│
data/                      # Mock data and snapshots
│   README.md              # Data explanation
│
├── mock/                  # Example JSON payloads
│   sample_1.json
│   sample_2.json
│
└── evidence/              # Optional event snapshots
│
modules/
└── dashboard/             # Vite-based dashboard UI
```

## 4. Data Schema

The schema is designed for an **entrance line-crossing counting scenario**.

Each event includes:

- `event_id`
- `timestamp`
- `direction` (IN / OUT)
- `camera_id`
- `confidence_score`

See:

```
docs/data_schema.md
```

## 5. Quick Start (Dashboard – Vite)

### Step 1: Navigate to dashboard module

```
cd modules/dashboard
```

### Step 2: Install dependencies

```
npm install
```

### Step 3: Start development server

```
npm run dev
```

### Step 4: Open in browser

Vite will show something like:

```
Local: http://localhost:5173/
```

Open the provided local URL in your browser.

The dashboard reads JSON mock data from:

```
data/mock/
```

## 6. Development Notes

- This dashboard is built using **Vite**
- Data is currently static (mock JSON)
- Designed for easy future replacement with:
  - WebSocket stream
  - REST API
  - Real-time edge data feed

## 7. Future Work

- Integrate real OpenCV line-crossing detection
- Deploy on Raspberry Pi
- Add real-time streaming support
- Add occupancy alerting
- Add hourly/daily aggregation view
