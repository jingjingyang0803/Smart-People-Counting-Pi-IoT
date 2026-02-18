import json
from collections import defaultdict

def aggregate_hourly(data_list):
    hourly = defaultdict(int)

    for item in data_list:
        hour = item["timestamp"][11:13]
        hourly[hour] += item.get("people_in", 0)

    return dict(hourly)