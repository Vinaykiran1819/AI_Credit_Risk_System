# tools/model_utils.py
"""
Contains data preprocessing functions specific to the ML model.
"""
import pandas as pd

def preprocess_data_for_scoring(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and prepares new, unseen loan data for scoring.
    This function mirrors the preprocessing from the training script.

    Args:
        df (pd.DataFrame): The raw data for one or more new applications.

    Returns:
        pd.DataFrame: The cleaned and prepared data.
    """
    # Make a copy to avoid changing the original data
    df_processed = df.copy()

    # --- Clean up text columns to make them numeric ---
    if 'term' in df_processed.columns:
        df_processed['term'] = df_processed['term'].astype(str).str.replace('months', '').str.strip().astype(int)

    if 'emp_length' in df_processed.columns:
        emp_length_mapping = {
            '10+ years': 10, '9 years': 9, '8 years': 8, '7 years': 7,
            '6 years': 6, '5 years': 5, '4 years': 4, '3 years': 3,
            '2 years': 2, '1 year': 1, '< 1 year': 0.5, 'n/a': 0
        }
        df_processed['emp_length'] = df_processed['emp_length'].map(emp_length_mapping).fillna(0)

    # --- Handle Categorical Features ---
    # Define columns that were one-hot encoded during training
    categorical_cols = ['purpose', 'grade', 'verification_status', 'home_ownership']
    
    # Use one-hot encoding to turn categories into 0s and 1s
    # It's crucial that this list matches the one in the train.py script
    df_processed = pd.get_dummies(df_processed, columns=categorical_cols, drop_first=True, dtype=int)
    
    return df_processed