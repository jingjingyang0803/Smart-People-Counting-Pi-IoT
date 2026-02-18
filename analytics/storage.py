import json

def load_json_log(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f]