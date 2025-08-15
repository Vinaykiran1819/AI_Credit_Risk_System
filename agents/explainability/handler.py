import pandas as pd
import re
from graph.state import GraphState

def format_feature_name(name: str) -> str:
    """Formats technical feature names into human-readable labels."""
    name_map = {
        "dti": "Debt-to-Income Ratio", "revol_util": "Revolving Utilization", "emp_length": "Employment Length", 
        "loan_amnt": "Loan Amount", "int_rate": "Interest Rate", "annual_inc": "Annual Income", 
        "inq_last_6mths": "Inquiries Last 6 Months", "fico_range_low": "FICO Score"
    }
    return name_map.get(name, name.replace('_', ' ').title())

def build_narrative_summary(state: dict, prepared_data: dict) -> str:
    """Constructs a detailed, human-readable text summary based on key factors."""
    decision = prepared_data['outcome']
    risk_score = state['risk_score']
    
    summary = f"The AI model's final recommendation is **{decision.upper()}** with a calculated default risk of **{risk_score:.2%}**. "
    
    if "Leaning" in decision:
        summary += "The risk score falls into a moderate range, indicating a mix of positive and negative factors that require underwriter attention. "
        if "Approve" in decision:
            summary += f"The model leans towards approval, but key risk factors prevent a fully automated decision. "
        else:
            summary += f"The model leans towards rejection, but strong mitigating factors prevent a fully automated decision. "
    elif decision == "Approved":
        summary += "The decision was primarily driven by strong positive credit factors that significantly outweigh the risks. "
    else: # Rejected
        summary += "The decision was primarily driven by several high-risk factors that indicate a significant probability of default. "

    if prepared_data.get('supporting_factors'):
        top_supporter = prepared_data['supporting_factors'][0]
        summary += f"The most significant factor was the applicant's **{top_supporter['factor'].lower()}** (value: {top_supporter['value']}), which accounted for {top_supporter['impact']:.1f}% of the decision weight. "

    if prepared_data.get('opposing_factors'):
        top_opposer = prepared_data['opposing_factors'][0]
        summary += f"This was balanced by the **{top_opposer['factor'].lower()}** (value: {top_opposer['value']}), which provided a strong counter-weight. "
        
    summary += "Please review the detailed factor analysis and applicant data before making a final decision."
    return summary


def explainability_agent(state: GraphState) -> dict:
    """
    Generates a structured JSON object with a more nuanced recommendation for manual reviews.
    """
    print("--- AGENT: Explainability ---")
    
    shap_data = state.get('shap_data')
    risk_score = state.get('risk_score')
    decision = state.get('decision')

    if not shap_data:
        return {
            "explanation": {
                "decision": decision or "Manual Review",
                "risk_score": risk_score or 0,
                "error": "A detailed explanation could not be generated due to a risk scoring error."
            }
        }

    try:
        # --- NEW: Determine the recommendation label ---
        recommendation_label = decision
        if decision == "Manual Review":
            recommendation_label = "Leaning Approve" if risk_score < 0.5 else "Leaning Decline"

        combined_data = state['ingested_data']
        df_shap = pd.DataFrame({'feature': shap_data['feature_names'], 'shap_value': shap_data['values']})
        
        categorical_bases = {m.group(1) for col in df_shap['feature'] if (m := re.match(r"^(purpose|grade|home_ownership|verification_status)_", col))}
        consolidated_shaps = []
        processed_features = set()
        for base in categorical_bases:
            related_features = [f for f in df_shap['feature'] if f.startswith(base + '_')]
            total_shap = df_shap[df_shap['feature'].isin(related_features)]['shap_value'].sum()
            consolidated_shaps.append({"feature_name": format_feature_name(base), "actual_value": combined_data.get(base, "N/A"), "shap_value": total_shap})
            processed_features.update(related_features)
        for _, row in df_shap[~df_shap['feature'].isin(processed_features)].iterrows():
            consolidated_shaps.append({"feature_name": format_feature_name(row['feature']), "actual_value": combined_data.get(row['feature'], "N/A"), "shap_value": row['shap_value']})
        df_final = pd.DataFrame(consolidated_shaps)
        total_abs_shap = df_final['shap_value'].abs().sum()
        df_final['contribution_pct'] = (df_final['shap_value'].abs() / total_abs_shap) * 100 if total_abs_shap > 0 else 0
        
        positive_factors_df = df_final[df_final['shap_value'] > 0].sort_values(by='shap_value', ascending=False).head(3)
        negative_factors_df = df_final[df_final['shap_value'] < 0].sort_values(by='shap_value', ascending=True).head(3)
        
        positive_factors = [{"factor": row['feature_name'], "value": str(row['actual_value']), "impact": row['contribution_pct']} for _, row in positive_factors_df.iterrows()]
        negative_factors = [{"factor": row['feature_name'], "value": str(row['actual_value']), "impact": row['contribution_pct']} for _, row in negative_factors_df.iterrows()]
        
        prepared_data = {
            "outcome": recommendation_label,
            "supporting_factors": positive_factors if "Decline" in recommendation_label or "Rejected" in recommendation_label else negative_factors,
            "opposing_factors": negative_factors if "Decline" in recommendation_label or "Rejected" in recommendation_label else positive_factors
        }
        
        narrative_summary = build_narrative_summary(state, prepared_data)
        
        explanation_json = {
            "decision": decision,
            "recommendation_label": recommendation_label,
            "risk_score": risk_score,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "summary": narrative_summary
        }
        
        print("   > Structured explanation with nuanced recommendation constructed.")
        return {"explanation": explanation_json}
        
    except Exception as e:
        import traceback
        print(f"--- ERROR in Explainability Agent ---")
        traceback.print_exc()
        return {
            "explanation": {
                "decision": decision or "Manual Review",
                "risk_score": risk_score or 0,
                "error": "An error occurred while building the final explanation."
            }
        }
