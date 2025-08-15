# database.py
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from datetime import datetime
from config import POSTGRES_CONNECTION_STRING

# --- Database Connection Setup ---
if not POSTGRES_CONNECTION_STRING:
    raise ValueError("POSTGRES_CONNECTION_STRING is not set in the .env file.")

try:
    engine = create_engine(POSTGRES_CONNECTION_STRING)
    print("Database engine created successfully.")
except Exception as e:
    print(f"Error creating database engine: {e}")
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- Table Model Definitions ---

class LoanApplicationDB(Base):
    """
    SQLAlchemy model for the 'loan_applications' table.
    """
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    applicant_name = Column(String, index=True)
    status = Column(String, default="Pending Data Entry", index=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    application_data = Column(JSONB)
    mock_data_used = Column(JSONB, nullable=True)
    risk_score = Column(Float, nullable=True)
    decision = Column(String, nullable=True)
    explanation = Column(JSONB, nullable=True) # From Text to JSONB
    document_urls = Column(JSONB, nullable=True)
    bureau_data = Column(JSON, nullable=True)
    bureau_pull_status = Column(String(32), nullable=True)
    bureau_reference_id = Column(String(64), nullable=True)
    referral_source = Column(String, nullable=True) # e.g., 'AI Approved', 'AI Rejected'


class BureauRecord(Base):
    """
    SQLAlchemy model for the 'bureau_records' table.
    This acts as our mock credit bureau database.
    """
    __tablename__ = "bureau_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # --- UPDATED: Identity fields for matching ---
    applicant_name = Column(String(200)) # Name is still useful for context
    ssn_last4 = Column(String(4), unique=True, index=True) # Our new, unique key

    # Bureau-style attributes
    fico_range_low = Column(Integer)
    fico_range_high = Column(Integer)
    inquiries_6m = Column(Integer)
    revolving_balance = Column(Float)
    revolving_utilization = Column(Float)
    delinquencies_2y = Column(Integer)
    public_record_bankruptcies = Column(Integer)
    total_accounts = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# --- Utility to Create Tables ---
def create_tables():
    """
    Connects to the database and creates all tables if they don't exist.
    """
    if engine:
        try:
            print("Attempting to create tables in the database...")
            Base.metadata.create_all(bind=engine)
            print("Tables created successfully (if they didn't already exist).")
        except Exception as e:
            print(f"An error occurred during table creation: {e}")

# --- Main Execution Block ---
if __name__ == "__main__":
    create_tables()