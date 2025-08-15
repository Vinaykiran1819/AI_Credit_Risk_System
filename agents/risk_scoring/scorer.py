import pandas as pd
import joblib
import os
import math
import traceback
from pydantic import BaseModel
from graph.state import GraphState
from .model_utils import preprocess_data
from tools.mock_data_service import get_current_settings

# --- Load Artifacts ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(SCRIPT_DIR, 'artifacts')
MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'xgb_model.pkl')
SCALER_PATH = os.path.join(ARTIFACTS_DIR, 'scaler.pkl')
FEATURE_COLUMNS_PATH = os.path.join(ARTIFACTS_DIR, 'feature_columns.pkl')
EXPLAINER_PATH = os.path.join(ARTIFACTS_DIR, 'explainer.pkl')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    training_cols = joblib.load(FEATURE_COLUMNS_PATH)
    explainer = joblib.load(EXPLAINER_PATH)
except FileNotFoundError:
    model, scaler, training_cols, explainer = None, None, None, None

def calculate_installment(loan_amnt, int_rate, term_months):
    monthly_rate = (int_rate / 100) / 12
    if monthly_rate == 0: return loan_amnt / term_months
    return round(loan_amnt * (monthly_rate * (1 + monthly_rate)**term_months) / ((1 + monthly_rate)**term_months - 1), 2)

def calculate_dti(monthly_debt, new_installment, annual_income):
    if annual_income == 0: return 999
    return round(((monthly_debt + new_installment) / (annual_income / 12)) * 100, 2)

def risk_scoring_agent(state: GraphState) -> dict:
    print("--- AGENT: Risk Scoring ---")
    print("--> SCORER: [1] Function entered.")
    if model is None:
        print("--> SCORER: [2] Model is None. Returning early.")
        print("   > ERROR: Model artifacts not loaded. Defaulting to manual review.")
        return {"risk_score": None, "shap_data": None, "decision": "Manual Review"}

    try:
        print("--> SCORER: [4] Entered TRY block.")
        # Get model as dict view (don’t overwrite state)
        combined_data = state['ingested_data']

        # Add int_rate to the data
        settings = get_current_settings()
        int_rate = settings.get('mock_data_defaults', {}).get('int_rate', 12.5)
        combined_data['int_rate'] = int_rate # Ensure it's in the data for the model
        print("--> SCORER: [5] Data retrieved from state.")

        # Convert types on local copy
        #Calculations
        loan_amnt = float(combined_data.get('loan_amnt', 0))
        annual_income = float(combined_data.get('annual_inc', 0))
        existing_monthly_debt = float(combined_data.get('existing_monthly_debt', 0))
        term_months = int(str(combined_data.get('term', '36 months')).split()[0])

        combined_data['loan_amnt'] = loan_amnt
        combined_data['annual_inc'] = annual_income
        combined_data['open_acc'] = int(combined_data.get('open_acc', 0))
        combined_data['pub_rec'] = int(combined_data.get('pub_rec', 0))
        combined_data['revol_bal'] = float(combined_data.get('revol_bal', 0))
        combined_data['revol_util'] = float(combined_data.get('revol_util', 0))
        combined_data['total_acc'] = int(combined_data.get('total_acc', 0))
        
        int_rate = float(combined_data.get('int_rate', 12.5))
        print("--> SCORER: [6] Data types converted successfully.")

        # Derived fields added to mock_data (kept as dict intentionally)
        calculated_installment = calculate_installment(loan_amnt, int_rate, term_months)
        combined_data['installment'] = calculated_installment
        print(f"   > Calculated Installment: ${calculated_installment}")

        calculated_dti = calculate_dti(existing_monthly_debt, calculated_installment, annual_income)
        combined_data['dti'] = calculated_dti
        print(f"   > Calculated DTI: {calculated_dti}%")

        # Scoring
        data_df = pd.DataFrame([combined_data])
        processed_df = preprocess_data(data_df, is_scoring=True)
        aligned_df = processed_df.reindex(columns=training_cols, fill_value=0)
        scaled_df = scaler.transform(aligned_df)

        probability = model.predict_proba(scaled_df)[:, 1][0]
        risk_score = float(probability)
        if not math.isfinite(risk_score):
            raise ValueError(f"Model produced an invalid score: {risk_score}")
        print("--> SCORER: [7] Model scoring complete.")
        print(f"   > Model predicted default probability: {risk_score:.4f}")

        shap_values = explainer(scaled_df)
        shap_data = {
            "base_value": float(shap_values.base_values[0]),
            "values": shap_values.values[0].tolist(),
            "feature_names": aligned_df.columns.tolist()
        }
        print("--> SCORER: [8] About to return SUCCESS dictionary.")
        return {"risk_score": risk_score, "shap_data": shap_data}

    except Exception as e:
        import traceback
        print("--- ERROR IN RISK SCORING AGENT ---")
        print("--> SCORER: [E1] Entered EXCEPT block. An error occurred.")
        print(f"   > Error: {str(e)}")
        traceback.print_exc()
        print("--> SCORER: [E2] About to return FAILURE dictionary.")
        return {"risk_score": None, "shap_data": None, "decision": "Manual Review"}
