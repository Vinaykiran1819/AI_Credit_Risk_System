# test_agent_chain.py
import json
from graph.state import GraphState

# Import all the agents you want to test
from agents.risk_scoring.scorer import risk_scoring_agent
from agents.decision_making.handler import decision_making_agent
from agents.explainability.handler import explainability_agent # Assuming this is the correct path

def run_agent_chain_test():
    """
    Tests the full chain of AI agents in the correct order.
    """
    print("--- RUNNING AGENT CHAIN TEST ---")

    # 1. Define the initial state
    sample_state = GraphState(
        ingested_data={
            "loan_amnt": "30000",
            "annual_inc": "100000",
            "term": "60 months",
            "grade": "B",
            "purpose": "debt_consolidation",
            "emp_length": "7 years",
            "home_ownership": "MORTGAGE",
            "verification_status": "Verified",
            "open_acc": "10",
            "pub_rec": "0",
            "revol_bal": "15686",
            "revol_util": "58.3",
            "total_acc": "25",
            "existing_monthly_debt": "0",
        },
        mock_data_used={
            "int_rate": 12.5,
            "fico_range_low": 690,
            "inq_last_6mths": 1,
        }
    )

    # --- STEP 1: Run Risk Scoring Agent ---
    print("\n[1] Running Risk Scoring Agent...")
    scorer_result = risk_scoring_agent(sample_state)
    sample_state.update(scorer_result)

    if 'decision' in scorer_result:
        print("Scorer failed and made an early decision. Halting test.")
    else:
        # --- STEP 2: Run Decision Making Agent (MUST RUN BEFORE EXPLAINER) ---
        print("\n[2] Running Decision Making Agent...")
        decision_result = decision_making_agent(sample_state)
        sample_state.update(decision_result)

        # --- STEP 3: Run Explainability Agent ---
        print("\n[3] Running Explainability Agent...")
        explainer_result = explainability_agent(sample_state)
        sample_state.update(explainer_result)

    # --- FINAL RESULT ---
    print("\n--- TEST COMPLETE: FINAL STATE ---")
    print(json.dumps(sample_state, indent=2))


if __name__ == "__main__":
    run_agent_chain_test()