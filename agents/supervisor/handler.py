# agents/supervisor/handler.py
from graph.state import GraphState
from langgraph.graph import END
import json

def supervisor_agent(state: GraphState) -> dict:
    """
    Acts as a router and now includes a debugging printout of the current state.
    """
    # --- NEW DEBUGGING STEP ---
    # We will pretty-print the current state to the terminal to see what the
    # supervisor is working with. We exclude 'shap_data' because it's very large.
    print("\n--- SUPERVISOR: Peeking at current state ---")
    printable_state = {k: v for k, v in state.items() if k != 'shap_data'}
    print(json.dumps(printable_state, indent=2, default=str))
    print("------------------------------------------\n")
    # --- END DEBUGGING STEP ---

    print("--- SUPERVISOR: Routing workflow ---")
    
    # This is the routing logic from before.
    if state.get('compliance_confirmation'):
        print("  > Route: FINISH")
        return {"next_action": END}  # Use END from langgraph.graph

    if state.get('explanation') and not state.get('compliance_confirmation'):
        print("  > Route: compliance")
        return {"next_action": "compliance"}

    if state.get('decision') and not state.get('explanation'):
        print("  > Route: explainability")
        return {"next_action": "explainability"}
            
    if state.get('risk_score') is not None and not state.get('decision'):
        print("  > Route: decision_making")
        return {"next_action": "decision_making"}

    if state.get('ingested_data') and state.get('risk_score') is None:
        print("  > Route: risk_scoring")
        return {"next_action": "risk_scoring"}

    # After ingestion and before scoring
    if state.get('ingested_data') and not state.get('bureau_data') and not state.get('risk_score'):
        print("  > Route: bureau_enrichment")
        return {"next_action": "bureau_enrichment"}


    print("  > Route: data_ingestion")
    return {"next_action": "data_ingestion"}
