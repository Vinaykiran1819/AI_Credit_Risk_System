import uvicorn
import json
from fastapi import FastAPI, APIRouter, Header, UploadFile, File, Form, Depends, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from sqlalchemy.orm import Session
from azure.storage.blob import BlobServiceClient
import uuid
from datetime import datetime

# --- Local Imports ---
from database import SessionLocal, LoanApplicationDB, create_tables
from graph.builder import app as loan_processing_app
from config import AZURE_STORAGE_CONNECTION_STRING
from tools.mock_data_service import get_current_settings, update_settings

from graph.state import LoanApplication
from pydantic import ValidationError

# --- FastAPI Application Setup ---
api = FastAPI(
    title="AI Retail Loan System API",
    description="Handles loan applications, document uploads, and underwriting reviews.",
    version="1.0.0"
)

# --- CORS Middleware ---
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Azure Blob Storage Client ---
def get_blob_service_client():
    if not AZURE_STORAGE_CONNECTION_STRING:
        raise HTTPException(status_code=500, detail="Azure Storage connection string is not configured.")
    return BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

def sanitize_application_data(data: dict) -> dict:
    """
    Cleans and converts application data fields to proper numeric types so they validate
    against the LoanApplication Pydantic model.
    """
    sanitized_data = data.copy()

    # Floats
    float_keys = [
        'loan_amnt', 'annual_inc', 'dti', 'revol_bal', 'revol_util',
        'existing_monthly_debt', 'int_rate', 'installment'
    ]
    # Ints
    int_keys = ['open_acc', 'pub_rec', 'total_acc']

    for key in float_keys:
        value = sanitized_data.get(key)
        if value is None:
            continue
        try:
            cleaned_value = str(value).replace('$', '').replace(',', '').strip()
            sanitized_data[key] = float(cleaned_value) if cleaned_value != '' else 0.0
        except (ValueError, TypeError):
            sanitized_data[key] = 0.0

    for key in int_keys:
        value = sanitized_data.get(key)
        if value is None:
            continue
        try:
            cleaned_value = str(value).replace(',', '').strip()
            # allow "10" or 10.0 → 10
            sanitized_data[key] = int(float(cleaned_value)) if cleaned_value != '' else 0
        except (ValueError, TypeError):
            sanitized_data[key] = 0

    return sanitized_data

# --- API Endpoints ---

@api.on_event("startup")
def on_startup():
    print("Application startup: Creating database tables...")
    create_tables()

@api.post("/applications/submit")
async def submit_application(
    applicant_name: str = Form(...),
    application_data_json: str = Form(...),
    documents: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    blob_service_client: BlobServiceClient = Depends(get_blob_service_client)
):
    try:
        application_data = json.loads(application_data_json)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid application data format: {e}")

    container_name = "loan-documents"
    document_urls = []
    try:
        container_client = blob_service_client.get_container_client(container_name)
        if not container_client.exists():
            container_client.create_container()
        for doc in documents:
            blob_name = f"{uuid.uuid4()}_{doc.filename}"
            blob_client = container_client.get_blob_client(blob_name)
            contents = await doc.read()
            blob_client.upload_blob(contents, overwrite=True)
            document_urls.append(blob_client.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload documents: {e}")

    new_application = LoanApplicationDB(
        applicant_name=applicant_name,
        application_data=application_data,  # stored as dict in DB (fine)
        document_urls=document_urls,
        status="Submitted"
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return {"message": "Application data received and is ready for processing.", "application_id": new_application.id}

@api.post("/applications/{application_id}/process")
async def process_application(
    application_id: int,
    db: Session = Depends(get_db) # It now only needs the application_id and db session
):

    application = db.query(LoanApplicationDB).filter(LoanApplicationDB.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.status = "Pending AI Review"
    db.commit()

    # --- START OF DEBUGGING LOGS ---
    print("\n--- DEBUGGING LIVE DATA ---")
    print("1. RAW DATA loaded from the database:")
    print(application.application_data)
    # --- END OF DEBUGGING LOGS ---

    try:
        clean_application_data = sanitize_application_data(application.application_data)

        # Add the applicant's name to the dictionary for the agent to use
        clean_application_data['applicant_name'] = application.applicant_name

        # --- MORE DEBUGGING LOGS ---
        print("\n2. SANITIZED DATA (This is what the AI will see):")
        print(clean_application_data)
        print("---------------------------\n")
        # --- END OF DEBUGGING LOGS ---

        # NEW: instantiate Pydantic model so the graph receives a model, not a dict
        try:
            application_model = LoanApplication(**clean_application_data)
        except ValidationError as ve:
            raise HTTPException(status_code=400, detail=f"Application validation failed: {ve.errors()}")

        workflow_input = {
            "messages": [{"role": "system", "content": "Start the loan application process."}],
            "application_data": application_model,          # pass model (consistent with agents)
            "document_urls": application.document_urls,
            "db": db
        }

        # This streams the graph and gets the final state
        final_state = {}
        for chunk in loan_processing_app.stream(workflow_input, {"recursion_limit": 50}):
            final_state.update(chunk.get(list(chunk.keys())[0], {}))

        if not final_state:
            raise ValueError("Graph stream did not return a valid final state.")

        # Update the application in the database with the AI's results
        ai_decision = final_state.get("decision")
        if not ai_decision:
            raise ValueError("AI agent graph finished without providing a decision.")

        application.application_data = final_state.get('ingested_data', application.application_data)

        application.risk_score = final_state.get('risk_score')
        application.explanation = final_state.get('explanation')
        application.decision = ai_decision
        application.status = "Pending Manual Review" if ai_decision == 'Manual Review' else ai_decision
        application.bureau_data = final_state.get('bureau_data') # Persist the pulled bureau data
        
        db.commit()

    except HTTPException:
        # bubble up validation / client errors
        raise
    except Exception as e:
        import traceback
        print("--- REAL TRACEBACK ---")
        traceback.print_exc()
        print("----------------------")
        application.status = "Error during AI Processing"
        application.decision = "Manual Review"
        application.explanation = f"An error occurred during AI processing, please review manually. Details: {str(e)}"
        db.commit()
        print(f"Error processing application {application_id}: {e}")
        return {"message": f"Application {application_id} failed AI processing and was routed for manual review."}

    return {"message": f"Application {application_id} processed successfully."}

@api.get("/applications/inbox")
def get_inbox(db: Session = Depends(get_db)):
    applications_query = db.query(
        LoanApplicationDB.id,
        LoanApplicationDB.applicant_name,
        LoanApplicationDB.status,
        LoanApplicationDB.submitted_at,
        LoanApplicationDB.decision,
        LoanApplicationDB.referral_source
    ).order_by(LoanApplicationDB.submitted_at.desc()).all()
    return [dict(row._mapping) for row in applications_query]

@api.get("/applications/{application_id}")
def get_application_details(application_id: int, db: Session = Depends(get_db)):
    app = db.query(LoanApplicationDB).filter(LoanApplicationDB.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return {
        "id": app.id,
        "applicant_name": app.applicant_name,
        "status": app.status,
        "submitted_at": app.submitted_at,
        "decision": app.decision,
        "risk_score": app.risk_score,
        "explanation": app.explanation,              # <-- UI will read this
        "application_data": app.application_data,
        "document_urls": app.document_urls,
        "mock_data_used": app.mock_data_used,
        # only if you decided to persist it; otherwise omit
        # "doc_extracted": getattr(app, "doc_extracted", None),
        "reviewed_at": getattr(app, "reviewed_at", None),
    }

@api.post("/applications/{application_id}/review")
def review_application(
    application_id: int,
    final_decision: str = Query(..., pattern="^(Approved|Declined)$"),
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplicationDB).filter(LoanApplicationDB.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.decision = f"UW {final_decision}"
    application.status = f"Completed - {final_decision}"
    application.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(application)
    return {"message": f"Application {application_id} updated with final decision: {final_decision}"}

@api.post("/applications/{application_id}/request_manual_review")
def request_manual_review(
    application_id: int,
    source: str = Query(..., description="The original AI decision, e.g., 'Approved' or 'Rejected'"),
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplicationDB).filter(LoanApplicationDB.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.decision = "Manual Review"
    application.status = "Pending Manual Review"
    application.referral_source = f"From AI {source}" # Store the source

    db.commit()
    db.refresh(application)
    return {"message": f"Application {application_id} moved to Manual Review queue."}

@api.get("/settings")
def get_settings():
    return get_current_settings()

@api.post("/settings")
def save_settings(new_settings: Dict = Body(...)):
    if update_settings(new_settings):
        return {"message": "Settings updated successfully."}
    else:
        raise HTTPException(status_code=500, detail="Failed to update settings.")


# api.py (add after your other routes / before __main__)
mock_bureau = APIRouter(prefix="/mock_bureau", tags=["mock_bureau"])

def _require_api_key(x_api_key: str | None = Header(None)):
    if x_api_key != BUREAU_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@mock_bureau.post("/report")
def mock_bureau_report(
    payload: dict,
    db: Session = Depends(get_db),
    _=Depends(_require_api_key)
):
    consumer = payload.get("consumer", {}) or {}
    fn = (consumer.get("firstName") or "").strip().lower()
    ln = (consumer.get("lastName") or "").strip().lower()
    dob = (consumer.get("dob") or "").strip()
    ssn4 = (consumer.get("ssn") or "")[-4:]
    addr = consumer.get("address") or {}
    zipc = (addr.get("postalCode") or "").strip()

    q = db.query(BureauRecord).filter(
        BureauRecord.first_name.ilike(fn),
        BureauRecord.last_name.ilike(ln),
        BureauRecord.dob == dob
    )
    if ssn4:
        q = q.filter(BureauRecord.ssn_last4 == ssn4)
    elif zipc:
        q = q.filter(BureauRecord.address_zip == zipc)

    rec = q.first()
    if not rec:
        raise HTTPException(status_code=404, detail="No bureau record found for consumer")

    return {
        "referenceId": f"BR-{rec.id}",
        "scores": [{"type": "fico", "value": rec.fico_score}],
        "inquiriesLast6Months": rec.inquiries_6m,
        "revolvingBalance": rec.revolving_balance,
        "revolvingUtilization": rec.revolving_utilization,
        "delinquenciesLast2Years": rec.delinquencies_2y,
        "publicRecordBankruptcies": rec.public_record_bankruptcies,
        "totalAccounts": rec.total_accounts,
    }

api.include_router(mock_bureau)


if __name__ == "__main__":
    uvicorn.run("api:api", host="0.0.0.0", port=8000, reload=True)
