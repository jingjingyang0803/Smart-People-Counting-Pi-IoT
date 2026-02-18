def compute_peak_occupancy(data_list):
    return max(item.get("occupancy", 0) for item in data_list)

def compute_average_fps(data_list):
    fps_values = [item.get("fps", 0) for item in data_list]
    return sum(fps_values) / len(fps_values) if fps_values else 0