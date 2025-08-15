import random
import time
from typing import Dict, Any

def mock_credit_bureau_api(applicant_id: str) -> Dict[str, Any]:
    """
    Mocks a call to a credit bureau API like Experian.
    In production, this would make a real HTTP request.
    """
    print(f"TOOL: Calling Mock Credit Bureau API for applicant: {applicant_id}")
    time.sleep(1) # Simulate network latency
    credit_scores = [650, 720, 580, 780, 690]
    return {
        "credit_score": random.choice(credit_scores),
        "has_delinquencies": random.choice([True, False]),
        "active_accounts": random.randint(1, 10),
    }

def mock_plaid_api(applicant_id: str) -> Dict[str, Any]:
    """
    Mocks a call to a bank data aggregator like Plaid.
    In production, this would use the Plaid client library.
    """
    print(f"TOOL: Calling Mock Plaid API for applicant: {applicant_id}")
    time.sleep(1.5) # Simulate network latency
    return {
        "avg_monthly_income": random.uniform(3000, 12000),
        "overdrafts_last_90_days": random.randint(0, 5),
        "account_age_months": random.randint(6, 120),
    }