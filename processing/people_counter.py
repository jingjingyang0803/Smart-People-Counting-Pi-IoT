def update_count(current_count, motion_detected):
    if motion_detected:
        current_count += 1  # example
    return current_count