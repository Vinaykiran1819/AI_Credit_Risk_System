# config.py
"""
Global configuration settings for the loan system.
Loads all sensitive values from the .env file.
"""
import os
from dotenv import load_dotenv

# loads the variables from your .env file into the environment
load_dotenv()

# --- Compliance ---
COMPLIANCE_LOG_FILE = "logs/compliance_log.json"

# --- Azure OpenAI Configuration ---
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

# --- Azure Storage and Database Configuration ---
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
POSTGRES_CONNECTION_STRING = os.getenv("POSTGRES_CONNECTION_STRING")

# --- Bureau Configuration ---
BUREAU_TIMEOUT_SECONDS = int(os.getenv("BUREAU_TIMEOUT_SECONDS"))
BUREAU_SERVICE_MODE = os.getenv("BUREAU_SERVICE_MODE")