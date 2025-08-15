# tools/utils.py
"""Utility functions for the project."""
import json
import os
from datetime import datetime
from typing import Dict, Any

def append_to_json_log(file_path: str, data: Dict[str, Any]):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    data_to_log = data.copy()
    data_to_log["log_timestamp_utc"] = datetime.utcnow().isoformat()
    try:
        with open(file_path, 'r+') as f:
            log_content = json.load(f)
            log_content.append(data_to_log)
            f.seek(0)
            f.truncate()
            json.dump(log_content, f, indent=4)
    except (FileNotFoundError, json.JSONDecodeError):
        with open(file_path, 'w') as f:
            json.dump([data_to_log], f, indent=4)