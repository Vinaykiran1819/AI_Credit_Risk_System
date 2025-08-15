# tools/bureau_service.py
from sqlalchemy.orm import Session
from database import BureauRecord
from config import BUREAU_SERVICE_MODE # We will add this config setting next

# --- Implementation 1: Mock Database ---
def _get_from_mock_db(ssn_last4: str, db: Session) -> dict:
    """Queries the local PostgreSQL mock bureau table using SSN."""
    print(f"   > [Bureau Service] Querying MOCK database for SSN ending in {ssn_last4}...")
    if not ssn_last4:
        return None
    record = db.query(BureauRecord).filter_by(ssn_last4=ssn_last4).first()
    
    if not record:
        print(f"   > [Bureau Service] No mock record found for SSN.")
        return None
    
    return {
        "fico_range_low": record.fico_range_low,
        "fico_range_high": record.fico_range_high,
        "inquiries_6m": record.inquiries_6m,
        "revolving_balance": record.revolving_balance,
        "revolving_utilization": record.revolving_utilization,
        "delinquencies_2y": record.delinquencies_2y,
        "public_record_bankruptcies": record.public_record_bankruptcies,
        "total_accounts": record.total_accounts,
    }

# --- Implementation 2: Real API (Placeholder) ---
def _get_from_real_api(applicant_name: str) -> dict:
    """
    Placeholder for a real credit bureau API call.
    YOU WOULD ADD YOUR REAL API LOGIC HERE.
    """
    print("   > [Bureau Service] Calling REAL API... (placeholder)")
    # In the future, you would use a library like 'requests' to call the API:
    # try:
    #     response = requests.post(
    #         "https://api.experian.com/v1/credit-report",
    #         json={"name": applicant_name, ...},
    #         headers={"Authorization": "Bearer YOUR_API_KEY"}
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except Exception as e:
    #     print(f"   > [Bureau Service] Real API call failed: {e}")
    #     return None
    
    # For now, we'll just return a failure message.
    print("   > [Bureau Service] REAL API not implemented. Returning None.")
    return None


# --- The Main Service Class (The "Outlet") ---
class BureauService:
    def __init__(self):
        # The mode ('mock' or 'real') is set in your config file.
        self.mode = BUREAU_SERVICE_MODE
        print(f"Bureau Service initialized in '{self.mode}' mode.")

    def get_bureau_data(self, ssn_last4: str, db: Session) -> dict:
        """
        The single entry point to get bureau data.
        It decides whether to call the mock DB or the real API.
        """
        if self.mode == 'mock':
            return _get_from_mock_db(ssn_last4, db)
        elif self.mode == 'real':
            return _get_from_real_api(ssn_last4)
        else:
            raise ValueError(f"Invalid BUREAU_SERVICE_MODE: {self.mode}")