# agents/decision_making/handler.py
from graph.state import GraphState
from tools.mock_data_service import get_current_settings
import math

def decision_making_agent(state: GraphState) -> dict:
    """
    Applies business rules to the calculated risk score to determine a decision.
    """
    print("--- DECISION MAKER: Applying business rules ---")
    
    risk_score = state.get('risk_score')

    # If the score is missing or not a valid number (e.g., NaN), default to Manual Review.
    if risk_score is None or not math.isfinite(risk_score):
        print(f"   > Invalid or missing risk score ({risk_score}). Defaulting to Manual Review.")
        return {"decision": "Manual Review"}

    # If the score is valid, proceed with the normal logic.
    thresholds = get_current_settings().get('decision_thresholds', {})
    approve_below = thresholds.get('approve_below', 0.3)
    decline_above = thresholds.get('decline_above', 0.7)
    
    if risk_score <= approve_below:
        decision = "Approved"
    elif risk_score >= decline_above:
        decision = "Rejected"
    else:
        decision = "Manual Review"
    
    print(f"   > Score: {risk_score:.4f}, Decision: {decision}")
    
    return {"decision": decision}