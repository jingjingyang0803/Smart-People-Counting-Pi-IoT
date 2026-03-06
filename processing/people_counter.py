import cv2

class PeopleCounter:
    def __init__(self, frame_height):
        self.occupancy = 0
        self.people_in = 0
        self.people_out = 0

        # horizontal counting line
        self.line_y = frame_height // 2

        # store previous centroid positions
        self.prev_centroids = []

    def update(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (21, 21), 0)

        if not hasattr(self, "background"):
            self.background = blur
            return self.people_in, self.people_out, self.occupancy

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

            (x, y, w, h) = cv2.boundingRect(contour)
            cx = x + w // 2
            cy = y + h // 2
            current_centroids.append((cx, cy))

        # compare with previous centroids
        for (cx, cy) in current_centroids:
            for (px, py) in self.prev_centroids:

                # crossing downward → entering
                if py < self.line_y and cy >= self.line_y:
                    self.people_in += 1
                    self.occupancy += 1

                # crossing upward → leaving
                elif py > self.line_y and cy <= self.line_y:
                    self.people_out += 1
                    self.occupancy = max(0, self.occupancy - 1)

        self.prev_centroids = current_centroids

        return self.people_in, self.people_out, self.occupancy
