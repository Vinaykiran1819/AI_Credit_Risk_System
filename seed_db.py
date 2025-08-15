# In seed_db.py
from database import SessionLocal, BureauRecord, create_tables

def seed_database():
    """
    Populates the mock_credit_bureau table with sample data, including SSN.
    """
    print("Ensuring tables exist...")
    create_tables()

    db = SessionLocal()
    print("Database session started.")

    try:
        # --- Define Sample Applicant Data with SSN ---
        sample_records = [
            {
                "applicant_name": "Jane Doe",
                "ssn_last4": "1234",
                "fico_range_low": 720,
                "fico_range_high": 724,
                "inquiries_6m": 1,
                "revolving_balance": 15686.0,
                "revolving_utilization": 58.3,
                "delinquencies_2y": 0,
                "public_record_bankruptcies": 0,
                "total_accounts": 25,
            },
            {
                "applicant_name": "John Smith",
                "ssn_last4": "5678",
                "fico_range_low": 650,
                "fico_range_high": 654,
                "inquiries_6m": 4,
                "revolving_balance": 8500.0,
                "revolving_utilization": 75.1,
                "delinquencies_2y": 1,
                "public_record_bankruptcies": 1,
                "total_accounts": 15,
            },
            {
                "applicant_name": "Emily White",
                "ssn_last4": "9876",
                "fico_range_low": 780,
                "fico_range_high": 784,
                "inquiries_6m": 0,
                "revolving_balance": 5200.0,
                "revolving_utilization": 22.5,
                "delinquencies_2y": 0,
                "public_record_bankruptcies": 0,
                "total_accounts": 35,
            },
            {
                "applicant_name": "Michael Brown",
                "ssn_last4": "5432",
                "fico_range_low": 680,
                "fico_range_high": 684,
                "inquiries_6m": 2,
                "revolving_balance": 12345.0,
                "revolving_utilization": 65.0,
                "delinquencies_2y": 0,
                "public_record_bankruptcies": 0,
                "total_accounts": 22,
            },
            {
                "applicant_name": "Jessica Green",
                "ssn_last4": "1357",
                "fico_range_low": 620,
                "fico_range_high": 624,
                "inquiries_6m": 5,
                "revolving_balance": 4500.0,
                "revolving_utilization": 91.2,
                "delinquencies_2y": 2,
                "public_record_bankruptcies": 0,
                "total_accounts": 12,
            }
        ]

        print(f"Attempting to seed {len(sample_records)} records...")
        for record_data in sample_records:
            # --- UPDATED: Check for existing records using SSN ---
            exists = db.query(BureauRecord).filter_by(ssn_last4=record_data["ssn_last4"]).first()
            if not exists:
                new_record = BureauRecord(**record_data)
                db.add(new_record)
                print(f"  > Adding record for: {record_data['applicant_name']}")
            else:
                print(f"  > Record for ssn_last4 {record_data['ssn_last4']} already exists. Skipping.")

        db.commit()
        print("Seeding complete. Records committed to the database.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()
        print("Database session closed.")
    
    print("\nSeeding script finished.")

if __name__ == "__main__":
    seed_database()