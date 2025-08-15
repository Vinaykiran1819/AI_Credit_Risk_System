from graph.state import GraphState
from tools.utils import append_to_json_log
from config import COMPLIANCE_LOG_FILE
from pydantic import BaseModel

def compliance_agent(state: GraphState) -> GraphState:
    print("--- AGENT: Compliance ---")

    app_data = state['application_data']
    if isinstance(app_data, BaseModel):
        app_data = app_data.model_dump()

    log_data = {
        "loan_application": app_data,                      # schema (model) features
        "document_extracted": state.get("doc_extracted", {}),  # doc-only fields like verified_income
        "decision": state['decision'],
        "risk_score_probability": state['risk_score'],
        "explanation": state.get('explanation', 'N/A for manual review cases'),
    }
    append_to_json_log(COMPLIANCE_LOG_FILE, log_data)
    confirmation = f"Decision logged successfully to {COMPLIANCE_LOG_FILE}"
    print(f"  > {confirmation}")
    return {"compliance_confirmation": confirmation}
