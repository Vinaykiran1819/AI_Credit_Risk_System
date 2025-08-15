from typing import TypedDict, Optional, Dict, Any, List
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session # <--- 1. ADDED THIS IMPORT

class LoanApplication(BaseModel):
    ssn_last4: Optional[str] = Field(None, example="1234")
    loan_amnt: float = Field(..., example=10000)
    term: str = Field(..., example="36 months")
    int_rate: float = Field(..., example=11.89)
    installment: float = Field(..., example=331.67)
    grade: str = Field(..., example="B")
    emp_length: str = Field(..., example="10+ years")
    home_ownership: str = Field(..., example="RENT")
    annual_inc: float = Field(..., example=85000)
    verification_status: str = Field(..., example="Verified")
    purpose: str = Field(..., example="debt_consolidation")
    dti: float = Field(..., example=19.48)
    # open_acc: int = Field(..., example=10)
    pub_rec: int = Field(..., example=0)
    revol_bal: float = Field(..., example=15686)
    revol_util: float = Field(..., example=58.3)
    total_acc: int = Field(..., example=25)
    applicant_name: Optional[str] = Field(None)
    dob: Optional[str] = Field(None)
    address_street: Optional[str] = Field(None)
    address_apt: Optional[str] = Field(None)
    address_city: Optional[str] = Field(None)
    address_county: Optional[str] = Field(None)
    address_state: Optional[str] = Field(None)
    address_zip: Optional[str] = Field(None)
    employment_status: Optional[str] = Field(None)
    employer: Optional[str] = Field(None)
    employer_address: Optional[str] = Field(None)
    existing_monthly_debt: Optional[float] = Field(0.0)

class GraphState(TypedDict):
    # Inputs
    application_data: Dict[str, Any] | LoanApplication
    document_urls: List[str]
    mock_data_used: Dict[str, Any]

    # --- 2. ADDED DATABASE SESSION ---
    # This carries the per-request DB session through the workflow
    db: Optional[Session]

    # NEW: identity + bureau data
    identity_data: Optional[Dict[str, Any]]
    bureau_data: Optional[Dict[str, Any]]
    bureau_pull_status: Optional[str]

    # Pipeline
    ingested_data: Optional[Dict[str, Any]]
    risk_score: Optional[float]
    shap_data: Optional[Dict[str, Any]]
    decision: Optional[str]
    explanation: Optional[str]
    compliance_confirmation: Optional[str]
    next_action: Optional[str]