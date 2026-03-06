# processing/motion_detection.py
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Tuple

import cv2
import numpy as np


@dataclass
class ROI:
    x: int
    y: int
    w: int
    h: int


def crop_roi(frame: np.ndarray, roi: Optional[ROI]) -> np.ndarray:
    if roi is None:
        return frame
    H, W = frame.shape[:2]
    x1 = max(0, min(W, roi.x))
    y1 = max(0, min(H, roi.y))
    x2 = max(0, min(W, roi.x + roi.w))
    y2 = max(0, min(H, roi.y + roi.h))
    return frame[y1:y2, x1:x2]


def compute_brightness(frame_bgr: np.ndarray) -> float:
    """Return brightness in [0, 1]."""
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    return float(np.mean(gray) / 255.0)


def create_bg_subtractor() -> cv2.BackgroundSubtractor:
    # MOG2 比简单 frame diff 稳定很多
    return cv2.createBackgroundSubtractorMOG2(
        history=300, varThreshold=16, detectShadows=True
    )


def motion_mask_mog2(
    frame_bgr: np.ndarray,
    bg: cv2.BackgroundSubtractor,
    blur_ksize: int = 5,
    min_fg_value: int = 200,
    morph_ksize: int = 5,
) -> Tuple[float, np.ndarray]:
    """
    Returns:
      motion_score: ratio of foreground pixels in [0,1]
      fg_mask: binary mask (0/255)
    """
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    if blur_ksize > 1:
        gray = cv2.GaussianBlur(gray, (blur_ksize, blur_ksize), 0)

    fg = bg.apply(gray)
    _, fg = cv2.threshold(fg, min_fg_value, 255, cv2.THRESH_BINARY)

    if morph_ksize > 1:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (morph_ksize, morph_ksize))
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, k, iterations=1)
        fg = cv2.morphologyEx(fg, cv2.MORPH_DILATE, k, iterations=1)

    motion_score = float(np.count_nonzero(fg) / fg.size)
    return motion_score, fg


def find_motion_objects(
    fg_mask: np.ndarray,
    min_area: int = 1200,
) -> List[Tuple[Tuple[int, int, int, int], Tuple[int, int]]]:
    """
    Returns a list of (bbox, centroid) where:
      bbox = (x,y,w,h), centroid=(cx,cy)
    """
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    objects = []

    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue
        x, y, w, h = cv2.boundingRect(c)
        cx = x + w // 2
        cy = y + h // 2
        objects.append(((x, y, w, h), (cx, cy)))

    return objects
