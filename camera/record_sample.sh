#!/bin/bash

mkdir -p samples

libcamera-vid -t 15000 \
  --width 640 \
  --height 480 \
  --framerate 30 \
  -o samples/sample_640x480_30fps.h264

echo "Sample video recorded."