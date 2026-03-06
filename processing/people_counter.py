# processing/people_counter.py

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np
import time

from .motion_detection import (
    ROI,
    crop_roi,
    compute_brightness,
    create_bg_subtractor,
    motion_mask_mog2,
    find_motion_objects,
)


@dataclass
class CounterConfig:
    """
    Configuration parameters for the people counting algorithm.
    """

    roi: Optional[ROI] = None            # Region of interest (entrance area)
    direction: str = "horizontal"        # "horizontal" or "vertical" counting line
    line_pos: float = 0.5                # Position of the counting line inside ROI (0.0–1.0)
    in_direction: str = "positive"       # Defines which crossing direction counts as "IN"
    min_blob_area: int = 1200            # Minimum contour area to consider as a moving object
    cooldown_seconds: float = 1.0        # Minimum time between two counts (avoid double counting)
    match_dist: int = 80                 # Maximum centroid distance for matching tracks


class PeopleCounter:
    """
    Edge-based people counting module.

    The algorithm works as follows:

    1. Apply background subtraction (MOG2)
    2. Extract motion blobs
    3. Track centroid movement
    4. Detect line crossing
    5. Update people_in / people_out counters
    """

    def __init__(self, config: CounterConfig):
        self.cfg = config
        self.bg = create_bg_subtractor()

        self.people_in = 0
        self.people_out = 0
        self.occupancy = 0

        self.last_centroid: Optional[Tuple[int, int]] = None
        self.last_side: Optional[int] = None
        self.last_count_time: float = 0.0

    def _line_and_side_fn(self, H: int, W: int):
        """
        Create the counting line and a helper function that determines
        which side of the line a point lies on.
        """

        if self.cfg.direction == "horizontal":

            line_y = int(np.clip(self.cfg.line_pos, 0.0, 1.0) * H)

            def side(point: Tuple[int, int]) -> int:
                return -1 if point[1] < line_y else +1

            return ("horizontal", line_y, side)

        else:

            line_x = int(np.clip(self.cfg.line_pos, 0.0, 1.0) * W)

            def side(point: Tuple[int, int]) -> int:
                return -1 if point[0] < line_x else +1

            return ("vertical", line_x, side)

    def update(self, frame_bgr: np.ndarray):
        """
        Process a new frame and update the counting statistics.

        Returns:
            people_in
            people_out
            occupancy
            motion_score
            brightness
            annotated_frame
        """

        current_time = time.time()

        # Apply ROI if configured
        roi_frame = crop_roi(frame_bgr, self.cfg.roi)
        annotated = roi_frame.copy()

        # Compute brightness level
        brightness = compute_brightness(roi_frame)

        # Motion detection
        motion_score, fg_mask = motion_mask_mog2(roi_frame, self.bg)

        # Detect motion objects
        objects = find_motion_objects(
            fg_mask, min_area=self.cfg.min_blob_area
        )

        main_centroid = None

        if objects:

            if self.last_centroid is None:

                _, main_centroid = objects[0]

            else:

                lx, ly = self.last_centroid

                best = None

                for bbox, (cx, cy) in objects:

                    dist = abs(cx - lx) + abs(cy - ly)

                    if best is None or dist < best[0]:

                        best = (dist, bbox, (cx, cy))

                if best is not None:

                    _, bbox, main_centroid = best

        # Counting line configuration
        H, W = roi_frame.shape[:2]
        mode, line_pos_px, side_fn = self._line_and_side_fn(H, W)

        # Draw counting line
        if mode == "horizontal":

            cv2.line(
                annotated,
                (0, line_pos_px),
                (W - 1, line_pos_px),
                (0, 255, 255),
                2,
            )

        else:

            cv2.line(
                annotated,
                (line_pos_px, 0),
                (line_pos_px, H - 1),
                (0, 255, 255),
                2,
            )

        # Draw detected motion objects
        for (x, y, w, h), (cx, cy) in objects:

            cv2.rectangle(
                annotated,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2,
            )

            cv2.circle(
                annotated,
                (cx, cy),
                4,
                (0, 0, 255),
                -1,
            )

        # Line crossing logic
        if main_centroid is not None:

            current_side = side_fn(main_centroid)

            if self.last_side is None:

                self.last_side = current_side

            crossed = current_side != self.last_side

            can_count = (
                current_time - self.last_count_time
                >= self.cfg.cooldown_seconds
            )

            if self.last_centroid is not None:

                dx = abs(main_centroid[0] - self.last_centroid[0])
                dy = abs(main_centroid[1] - self.last_centroid[1])

                same_track = (dx + dy) <= self.cfg.match_dist

            else:

                same_track = True

            if crossed and can_count and same_track:

                direction_positive = (
                    self.last_side == -1 and current_side == +1
                )

                is_in = (
                    direction_positive
                    if self.cfg.in_direction == "positive"
                    else not direction_positive
                )

                if is_in:

                    self.people_in += 1

                else:

                    self.people_out += 1

                self.occupancy = max(
                    0, self.people_in - self.people_out
                )

                self.last_count_time = current_time

            self.last_centroid = main_centroid
            self.last_side = current_side

        else:

            self.last_centroid = None
            self.last_side = None

        # Overlay statistics
        cv2.putText(
            annotated,
            f"In: {self.people_in}  Out: {self.people_out}  Occ: {self.occupancy}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 0, 0),
            2,
            cv2.LINE_AA,
        )

        return (
            self.people_in,
            self.people_out,
            self.occupancy,
            motion_score,
            brightness,
            annotated,
        )
