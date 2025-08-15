# agents/risk_scoring/train.py
import pandas as pd
import joblib
import os
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, 'data', 'CRA_Data_processed.csv')
ARTIFACTS_DIR = os.path.join(SCRIPT_DIR, 'artifacts')
MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'xgb_model.pkl')
SCALER_PATH = os.path.join(ARTIFACTS_DIR, 'scaler.pkl')
FEATURE_COLUMNS_PATH = os.path.join(ARTIFACTS_DIR, 'feature_columns.pkl')
EXPLAINER_PATH = os.path.join(ARTIFACTS_DIR, 'explainer.pkl')

from .model_utils import preprocess_data

def train_model(data_path):
    """Trains the XGBoost model using a more robust method for handling imbalanced data."""
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found at {data_path}.")

    df_raw = pd.read_csv(data_path)
    df_processed = preprocess_data(df_raw)

    if 'loan_default_risk' not in df_processed.columns:
        raise KeyError("The target column 'loan_default_risk' was not found.")

    X = df_processed.drop('loan_default_risk', axis=1)
    y = df_processed['loan_default_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    print(f"Calculated scale_pos_weight for imbalance: {scale_pos_weight:.2f}")

    print("Training the XGBoost model...")
    xgb_classifier = xgb.XGBClassifier(
        objective='binary:logistic',
        eval_metric='logloss',
        use_label_encoder=False,
        scale_pos_weight=scale_pos_weight, # Use the calculated weight
        random_state=42
    )
    xgb_classifier.fit(X_train_scaled, y_train)
    print("Model training complete.")

    # --- (The rest of the script remains the same) ---
    print("Creating SHAP explainer...")
    explainer = shap.TreeExplainer(xgb_classifier)
    print("SHAP explainer created.")

    print("Saving model, scaler, feature columns, and explainer...")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    joblib.dump(xgb_classifier, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(X.columns, FEATURE_COLUMNS_PATH)
    joblib.dump(explainer, EXPLAINER_PATH)
    print(f"Artifacts saved successfully to '{ARTIFACTS_DIR}/'")

if __name__ == "__main__":
    train_model(DATA_PATH)
