# tools/mock_data_service.py
import json
import os

SETTINGS_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'settings.json')

def get_current_settings():
    try:
        with open(SETTINGS_FILE_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"decision_thresholds": {}, "mock_data_defaults": {}}

def get_mock_data():
    settings = get_current_settings()
    return settings.get("mock_data_defaults", {})

def update_settings(new_settings: dict):
    try:
        with open(SETTINGS_FILE_PATH, 'w') as f:
            json.dump(new_settings, f, indent=2)
        return True
    except Exception as e:
        print(f"ERROR updating settings.json: {e}")
        return False