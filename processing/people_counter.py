import cv2

class PeopleCounter:
    def __init__(self, frame_height):
        self.occupancy = 0
        self.people_in = 0
        self.people_out = 0
        self.line_y = frame_height // 2
        self.prev_centroids = []

    def update(self, frame):
        annotated = frame.copy()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (21, 21), 0)

        if not hasattr(self, "background"):
            self.background = blur

            cv2.line(annotated, (0, self.line_y), (annotated.shape[1], self.line_y), (0, 255, 255), 2)
            cv2.putText(
                annotated,
                "Counting Line",
                (10, self.line_y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2,
            )

            return self.people_in, self.people_out, self.occupancy, annotated

        frame_delta = cv2.absdiff(self.background, blur)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)

        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        current_centroids = []

        for contour in contours:
            if cv2.contourArea(contour) < 500:
                continue

            x, y, w, h = cv2.boundingRect(contour)
            cx = x + w // 2
            cy = y + h // 2
            current_centroids.append((cx, cy))

            # bounding box
            cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # centroid
            cv2.circle(annotated, (cx, cy), 4, (0, 0, 255), -1)

        for cx, cy in current_centroids:
            for px, py in self.prev_centroids:
                if abs(cx - px) < 50:
                    if py < self.line_y and cy >= self.line_y:
                        self.people_in += 1
                        self.occupancy += 1
                    elif py > self.line_y and cy <= self.line_y:
                        self.people_out += 1
                        self.occupancy = max(0, self.occupancy - 1)

        self.prev_centroids = current_centroids

        # counting line
        cv2.line(annotated, (0, self.line_y), (annotated.shape[1], self.line_y), (0, 255, 255), 2)
        cv2.putText(
            annotated,
            "Counting Line",
            (10, self.line_y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 255),
            2,
        )

        # stats overlay
        cv2.putText(
            annotated,
            f"In: {self.people_in}  Out: {self.people_out}  Occupancy: {self.occupancy}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 0, 0),
            2,
        )

        return self.people_in, self.people_out, self.occupancy, annotated
