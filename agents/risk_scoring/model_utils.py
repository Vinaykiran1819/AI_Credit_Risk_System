"""Contains data preprocessing functions for the risk scoring model."""
import pandas as pd

def preprocess_data(df: pd.DataFrame, is_scoring: bool = False) -> pd.DataFrame:
    """
    Cleans and prepares loan data for modeling or scoring.
    
    Args:
        df (pd.DataFrame): The raw data.
        is_scoring (bool): If True, it won't expect a target column.
    
    Returns:
        pd.DataFrame: The cleaned and prepared data.
    """
    df_processed = df.copy()

    if 'term' in df_processed.columns:
        df_processed['term'] = df_processed['term'].astype(str).str.replace('months', '').str.strip().astype(int)

    if 'emp_length' in df_processed.columns:
        emp_length_mapping = {
            '10+ years': 10, '9 years': 9, '8 years': 8, '7 years': 7,
            '6 years': 6, '5 years': 5, '4 years': 4, '3 years': 3,
            '2 years': 2, '1 year': 1, '< 1 year': 0.5, 'n/a': 0
        }
        df_processed['emp_length'] = df_processed['emp_length'].map(emp_length_mapping).fillna(0)

    categorical_cols = ['purpose', 'grade', 'verification_status', 'home_ownership']
    df_processed = pd.get_dummies(df_processed, columns=categorical_cols, drop_first=True, dtype=int)
    
    return df_processed
