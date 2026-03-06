# processing/people_counter.py
class PeopleCounter:
    def __init__(self):
        self.occupancy = 0
        self.people_in = 0
        self.people_out = 0
        self._cooldown = 0  # simple debounce

    def update(self, motion_detected: bool):
        """
        Very simple placeholder logic:
        - If motion detected and not in cooldown, treat it as one 'entry'
        - This is NOT real counting yet, but good enough for demo pipeline.
        """
        if self._cooldown > 0:
            self._cooldown -= 1

        if motion_detected and self._cooldown == 0:
            self.people_in += 1
            self.occupancy += 1
            self._cooldown = 10  # ~10 frames cooldown to avoid spamming

        return self.people_in, self.people_out, self.occupancy
