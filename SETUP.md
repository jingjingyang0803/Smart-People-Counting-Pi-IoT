# 🚀 Setup & Quick Start

Raspberry Pi–Based Edge People Counting System

# 🎯 This Setup Enables

- Cross-device development
- Parallel team workflow
- Stable edge processing
- Real-time dashboard
- Easy reproducibility

# 1️⃣ Raspberry Pi Setup (Edge Device)

## Step 1 — Update System

```bash
sudo apt update
sudo apt full-upgrade -y
```

## Step 2 — Enable Camera

```bash
sudo raspi-config
```

Navigate to:

```
Interface Options → Camera
```

Reboot:

```bash
sudo reboot
```

## Step 3 — Install System Dependencies

```bash
sudo apt install -y python3-pip python3-venv
sudo apt install -y python3-picamera2
sudo apt install -y mosquitto mosquitto-clients
```

## Step 4 — Clone Repository

## Step 5 — Create Virtual Environment

```bash
cd people-counting-system
python3 -m venv venv
source venv/bin/activate
```

## Step 6 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

If no `requirements.txt`:

```bash
pip install paho-mqtt psutil numpy opencv-python
```

## Step 7 — Start MQTT Broker

```bash
sudo systemctl start mosquitto
```

Check:

```bash
sudo systemctl status mosquitto
```

## Step 8 — Run Camera Module

```bash
python camera/capture.py --width 640 --height 480 --fps 30
```

Default configuration:

```
640 × 480 @ 30 FPS
```

# 2️⃣ macOS Setup (Dashboard + Optional Broker)

## Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Install Node.js

```bash
brew install node
```

Verify:

```bash
node -v
npm -v
```

## Install MQTT Broker (Optional)

```bash
brew install mosquitto
brew services start mosquitto
```

## Run Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

# 3️⃣ Windows Setup (Dashboard + Optional Broker)

## Install Python 3.9+

Download:

https://www.python.org/downloads/

⚠️ During installation, check:

```
☑ Add Python to PATH
```

Verify:

```bash
python --version
```

---

## Install Node.js

Download:

[https://nodejs.org](https://nodejs.org/)

Verify:

```bash
node -v
npm -v
```

## Install Mosquitto (Optional Broker)

Download installer from:

https://mosquitto.org/download/

Run and start service.

## Run Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

# 🔗 Connecting Raspberry Pi to Mac/Windows Broker

If broker runs on your computer instead of Pi:

### On Mac:

```bash
ifconfig
```

### On Windows:

```bash
ipconfig
```

Find your local IP address, example:

```
192.168.1.15
```

On Raspberry Pi, update MQTT config:

```python
BROKER = "192.168.1.15"
```

Now:

```
Pi publishes → Your computer broker → Dashboard subscribes
```

# 🧪 Test MQTT Communication

On subscriber machine:

```bash
mosquitto_sub -t people_counting/data
```

You should see JSON messages like:

```json
{
  "occupancy": 12,
  "people_in": 2,
  "people_out": 1,
  "fps": 29.5,
  "cpu": 40.2
}
```

# Cross-Platform Capability

| Feature        | Raspberry Pi | macOS     | Windows   |
| -------------- | ------------ | --------- | --------- |
| Camera capture | ✅           | ❌        | ❌        |
| Processing     | ✅           | ✅ (mock) | ✅ (mock) |
| MQTT Broker    | ✅           | ✅        | ✅        |
| Dashboard      | ✅           | ✅        | ✅        |

# 📌 Important Notes

- Real camera capture must run on Raspberry Pi.
- macOS/Windows can run dashboard, analytics, and MQTT broker.
- Use virtual environment for Python dependencies.
- Default resolution: 640×480 @ 30 FPS (optimized for Pi 3B+).
