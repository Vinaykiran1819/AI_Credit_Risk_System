# main.py
"""Main script to run a local test case for the full modular system."""
from graph.builder import app
from graph.state import LoanApplication
import json

if __name__ == "__main__":
    print("Running local test case for Modular AI Retail Loan System...")
    
    sample_application = LoanApplication(
        loan_amnt=18000, term="60 months", int_rate=15.61, installment=434.01,
        grade="D", emp_length="10+ years", home_ownership="MORTGAGE", annual_inc=69000,
        verification_status="Source Verified", purpose="debt_consolidation", dti=33.04,
        open_acc=8, pub_rec=0, revol_bal=9667, revol_util=31.6, total_acc=42
    )
    
    inputs = {"application_data": sample_application}
    final_state = app.invoke(inputs)
    
    print("\n--- WORKFLOW COMPLETE ---")

    # --- FIX ---
    # Before printing, check if the 'application_data' key exists and, if so,
    # convert the LoanApplication object to a JSON-serializable dictionary
    # using its .model_dump() method. This prevents the TypeError.
    if 'application_data' in final_state and final_state['application_data']:
        final_state['application_data'] = final_state['application_data'].model_dump()

    print(json.dumps(final_state, indent=2))
