import argparse
import json
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple, List

import cv2
import numpy as np


# ============================================================
# Utility helpers
# ============================================================

def iso_utc_now() -> str:
    """Return current timestamp in ISO 8601 format in UTC."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_roi(roi_str: Optional[str]) -> Optional[Tuple[int, int, int, int]]:
    """Parse ROI string in 'x,y,w,h' pixels."""
    if not roi_str:
        return None
    parts = [p.strip() for p in roi_str.split(",")]
    if len(parts) != 4:
        raise ValueError('ROI must be "x,y,w,h"')
    x, y, w, h = map(int, parts)
    if w <= 0 or h <= 0:
        raise ValueError("ROI width/height must be > 0")
    return x, y, w, h


def crop_roi(frame: np.ndarray, roi: Optional[Tuple[int, int, int, int]]) -> np.ndarray:
    """Crop the frame to ROI; if ROI is None, return full frame. Clamps bounds safely."""
    if roi is None:
        return frame
    x, y, w, h = roi
    H, W = frame.shape[:2]
    x1 = max(0, min(W, x))
    y1 = max(0, min(H, y))
    x2 = max(0, min(W, x + w))
    y2 = max(0, min(H, y + h))
    return frame[y1:y2, x1:x2]


def resize_to_fit(frame: np.ndarray, max_w: int, max_h: int) -> np.ndarray:
    """Resize a frame to fit within (max_w x max_h) while preserving aspect ratio. Preview only."""
    h, w = frame.shape[:2]
    if w <= 0 or h <= 0:
        return frame

    scale = min(max_w / float(w), max_h / float(h))
    if scale >= 1.0:
        return frame

    new_w = int(w * scale)
    new_h = int(h * scale)
    return cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)


# ============================================================
# Feature extraction
# ============================================================

def compute_brightness(frame_bgr: np.ndarray) -> float:
    """Brightness = mean grayscale intensity normalized to [0, 1]."""
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    return float(np.mean(gray) / 255.0)


def compute_motion_mask_and_score(
    frame_bgr: np.ndarray,
    bg_subtractor: cv2.BackgroundSubtractor,
    blur_ksize: int = 5,
    morph_ksize: int = 5,
    min_fg_value: int = 200,
) -> Tuple[float, np.ndarray]:
    """
    Motion detection using MOG2:
      - grayscale -> blur -> bg subtract -> threshold -> morph cleanup
    Returns (motion_score, fg_mask).
    """
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    if blur_ksize > 1:
        gray = cv2.GaussianBlur(gray, (blur_ksize, blur_ksize), 0)

    fg = bg_subtractor.apply(gray)
    _, fg = cv2.threshold(fg, min_fg_value, 255, cv2.THRESH_BINARY)

    if morph_ksize > 1:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (morph_ksize, morph_ksize))
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, k, iterations=1)
        fg = cv2.morphologyEx(fg, cv2.MORPH_DILATE, k, iterations=1)

    motion_score = float(np.count_nonzero(fg) / fg.size)
    return motion_score, fg


def find_motion_centroids(fg_mask: np.ndarray, min_area: int) -> List[Tuple[int, int]]:
    """Find centroids of motion blobs (contours) in the binary mask."""
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    centers: List[Tuple[int, int]] = []

    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue
        M = cv2.moments(c)
        if M["m00"] <= 0:
            continue
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        centers.append((cx, cy))

    return centers


# ============================================================
# Drawing helpers (better overlay readability)
# ============================================================

def draw_text_with_outline(
    img: np.ndarray,
    text: str,
    org: Tuple[int, int],
    font,
    font_scale: float,
    color: Tuple[int, int, int],
    thickness: int,
    outline_thickness: int = 4,
):
    """Draw readable text: black outline + colored foreground."""
    cv2.putText(img, text, org, font, font_scale, (0, 0, 0), outline_thickness, cv2.LINE_AA)
    cv2.putText(img, text, org, font, font_scale, color, thickness, cv2.LINE_AA)


# ============================================================
# Main program
# ============================================================

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Processing Module: motion + brightness + basic in/out + occupancy (lightweight edge logic)"
    )

    parser.add_argument("--source", default="0",
                        help='Video source: "0" for webcam, path to .mp4, or RTSP/HTTP stream URL')

    parser.add_argument("--roi", default=None,
                        help='Entrance ROI: "x,y,w,h" in pixels (recommended: doorway area)')

    parser.add_argument("--max-fps", type=float, default=10.0, help="Limit processing FPS")
    parser.add_argument("--output-jsonl", default=None, help="Optional JSONL output path")

    parser.add_argument("--preview", action="store_true", help="Show preview window with overlays")
    parser.add_argument("--preview-max-width", type=int, default=1100, help="Max preview width")
    parser.add_argument("--preview-max-height", type=int, default=700, help="Max preview height")

    # Presence stabilization
    parser.add_argument("--calib-seconds", type=float, default=3.0, help="Seconds to calibrate baseline motion")
    parser.add_argument("--calib-quantile", type=float, default=20.0, help="Quantile used for baseline noise")
    parser.add_argument("--smooth-window", type=int, default=15, help="Rolling window for smoothing motion score")
    parser.add_argument("--on-mult", type=float, default=2.0, help="Presence turns ON at baseline * on_mult")
    parser.add_argument("--off-mult", type=float, default=1.2, help="Presence turns OFF at baseline * off_mult")
    parser.add_argument("--min-on", type=float, default=0.008, help="Min ON threshold clamp")
    parser.add_argument("--min-off", type=float, default=0.004, help="Min OFF threshold clamp")

    # People counting parameters
    parser.add_argument("--min-blob-area", type=int, default=1200,
                        help="Minimum motion blob area to consider (filters noise). Tune per ROI size.")
    parser.add_argument("--line-pos", type=float, default=0.5,
                        help="Counting line position inside ROI (0.0=top/left, 1.0=bottom/right). Default=0.5.")
    parser.add_argument("--direction", choices=["vertical", "horizontal"], default="horizontal",
                        help=("horizontal = line is horizontal, movement up/down counts in/out. "
                              "vertical = line is vertical, movement left/right counts in/out."))
    parser.add_argument("--in-direction", choices=["positive", "negative"], default="positive",
                        help=("Defines what 'IN' means relative to motion direction across the line. "
                              "For horizontal: positive means top->bottom is IN. "
                              "For vertical: positive means left->right is IN."))
    parser.add_argument("--cooldown-seconds", type=float, default=1.0,
                        help="Minimum time between counts (prevents double-counting).")

    args = parser.parse_args()
    roi = parse_roi(args.roi)

    # Open video source
    src = int(args.source) if args.source.isdigit() else args.source
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video source: {args.source}")

    out_f = None
    if args.output_jsonl:
        Path(args.output_jsonl).parent.mkdir(parents=True, exist_ok=True)
        out_f = open(args.output_jsonl, "w", encoding="utf-8")

    bg = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=16, detectShadows=True)

    # Presence smoothing + baseline calibration
    motion_buf = deque(maxlen=max(3, args.smooth_window))
    baseline_samples: List[float] = []
    baseline: Optional[float] = None
    presence = 0
    calib_start = time.time()

    # People counting state
    people_in = 0
    people_out = 0
    occupancy = 0
    last_centroid: Optional[Tuple[int, int]] = None
    last_side: Optional[int] = None
    last_count_time = 0.0

    # Preview window setup
    window_name = "Processing Module - Part B"
    if args.preview:
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, min(args.preview_max_width, 1100), min(args.preview_max_height, 700))

    # Performance tracking
    last_emit = 0.0
    frame_count = 0
    t0 = time.time()

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame_count += 1

            proc_frame = crop_roi(frame, roi)

            brightness = compute_brightness(proc_frame)
            motion_score, fg_mask = compute_motion_mask_and_score(proc_frame, bg)

            # Presence logic
            motion_buf.append(motion_score)
            motion_smooth = float(np.mean(motion_buf))

            if baseline is None:
                baseline_samples.append(motion_smooth)
                if (time.time() - calib_start) >= args.calib_seconds and len(baseline_samples) >= 5:
                    q = float(np.clip(args.calib_quantile, 0.0, 100.0))
                    baseline = float(np.percentile(baseline_samples, q))
                    baseline = max(baseline, 1e-4)

            if baseline is None:
                on_th = max(args.min_on, 0.02)
                off_th = max(args.min_off, 0.01)
            else:
                on_th = max(args.min_on, baseline * args.on_mult)
                off_th = max(args.min_off, baseline * args.off_mult)

            if off_th > on_th:
                off_th = on_th * 0.9

            if presence == 0 and motion_smooth >= on_th:
                presence = 1
            elif presence == 1 and motion_smooth <= off_th:
                presence = 0

            # People in/out counting
            centers = find_motion_centroids(fg_mask, min_area=args.min_blob_area)

            main = None
            if centers:
                if last_centroid is None:
                    main = centers[0]
                else:
                    lx, ly = last_centroid
                    dists = [(abs(cx - lx) + abs(cy - ly), (cx, cy)) for (cx, cy) in centers]
                    dists.sort(key=lambda t: t[0])
                    main = dists[0][1]

            H, W = proc_frame.shape[:2]
            if args.direction == "horizontal":
                line_y = int(np.clip(args.line_pos, 0.0, 1.0) * H)

                def side_of_line(pt: Tuple[int, int]) -> int:
                    return -1 if pt[1] < line_y else +1
            else:
                line_x = int(np.clip(args.line_pos, 0.0, 1.0) * W)

                def side_of_line(pt: Tuple[int, int]) -> int:
                    return -1 if pt[0] < line_x else +1

            if main is not None:
                current_side = side_of_line(main)

                if last_side is None:
                    last_side = current_side

                crossed = (current_side != last_side)

                now = time.time()
                can_count = (now - last_count_time) >= args.cooldown_seconds

                if crossed and can_count:
                    direction_positive = (last_side == -1 and current_side == +1)
                    is_in = direction_positive if args.in_direction == "positive" else (not direction_positive)

                    if is_in:
                        people_in += 1
                    else:
                        people_out += 1

                    occupancy = max(0, people_in - people_out)
                    last_count_time = now

                last_centroid = main
                last_side = current_side
            else:
                last_centroid = None
                last_side = None

            # JSON output
            payload = {
                "timestamp": iso_utc_now(),
                "motion_score": round(motion_score, 6),
                "people_in": int(people_in),
                "people_out": int(people_out),
                "occupancy": int(occupancy),
                "brightness": round(brightness, 6),
                "presence": int(presence),
                "motion_smooth": round(motion_smooth, 6),
                "baseline": None if baseline is None else round(baseline, 6),
                "on_th": round(on_th, 6),
                "off_th": round(off_th, 6),
            }

            line = json.dumps(payload, ensure_ascii=False)
            print(line)

            if out_f:
                out_f.write(line + "\n")
                out_f.flush()

            # Preview overlays
            if args.preview:
                vis = proc_frame.copy()

                # Larger, clearer overlay settings
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 1.0
                thickness = 2
                line_height = 34
                start_x = 20
                start_y = 45

                presence_text = "Yes" if presence == 1 else "No"

                text_lines = [
                    f"Motion Score: {motion_score:.4f}",
                    f"Smoothed Motion: {motion_smooth:.4f}",
                    f"People Entered: {people_in}",
                    f"People Exited: {people_out}",
                    f"Current Occupancy: {occupancy}",
                    f"Presence Detected: {presence_text}",
                    f"Brightness Level: {brightness:.3f}",
                ]

                # Panel background (auto width based on frame)
                panel_w = min(640, vis.shape[1] - 10)
                panel_h = line_height * len(text_lines) + 30

                overlay = vis.copy()
                cv2.rectangle(overlay, (10, 10), (10 + panel_w, 10 + panel_h), (0, 0, 0), -1)
                alpha = 0.55
                cv2.addWeighted(overlay, alpha, vis, 1 - alpha, 0, vis)

                # Draw text with outline for readability
                for i, text in enumerate(text_lines):
                    y = start_y + i * line_height
                    draw_text_with_outline(vis, text, (start_x, y), font, font_scale, (0, 255, 0), thickness)

                # Draw the counting line (FIXED INDENTATION HERE)
                if args.direction == "horizontal":
                    cv2.line(vis, (0, line_y), (W - 1, line_y), (0, 255, 255), 2)
                else:
                    cv2.line(vis, (line_x, 0), (line_x, H - 1), (0, 255, 255), 2)

                # Draw main centroid
                if last_centroid is not None:
                    cv2.circle(vis, last_centroid, 6, (0, 0, 255), -1)

                # Foreground mask as picture-in-picture (top-right)
                fg_small = cv2.cvtColor(fg_mask, cv2.COLOR_GRAY2BGR)
                fg_small = cv2.resize(fg_small, (vis.shape[1] // 3, vis.shape[0] // 3))
                vis[0:fg_small.shape[0], vis.shape[1] - fg_small.shape[1]:vis.shape[1]] = fg_small

                # Fit preview to screen
                vis_show = resize_to_fit(vis, args.preview_max_width, args.preview_max_height)

                cv2.imshow(window_name, vis_show)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

            # FPS limiting
            if args.max_fps > 0:
                now = time.time()
                min_dt = 1.0 / args.max_fps
                dt = now - last_emit
                if dt < min_dt:
                    time.sleep(min_dt - dt)
                last_emit = time.time()

    finally:
        cap.release()
        if out_f:
            out_f.close()
        if args.preview:
            cv2.destroyAllWindows()

        elapsed = time.time() - t0
        if elapsed > 0:
            print(json.dumps({
                "perf": {
                    "processed_frames": frame_count,
                    "avg_fps": round(frame_count / elapsed, 3),
                    "elapsed_s": round(elapsed, 3),
                }
            }))


if __name__ == "__main__":
    main()