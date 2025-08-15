# agents/data_ingestion/handler.py

import random
from graph.state import GraphState
from tools.bureau_service import BureauService

def simulate_document_processing(documents: list) -> dict:
    """Simulates processing uploaded documents to extract data."""
    print("   > Simulating document processing...")
    extracted_data = {}
    for doc_url in documents:
        filename = doc_url.split('/')[-1].lower()
        if 'payslip' in filename:
            extracted_data['verified_income'] = random.randint(80000, 95000)
            print(f"     - Found payslip, extracted mock verified income: {extracted_data['verified_income']}")
        elif 'w2' in filename:
            extracted_data['tax_form_type'] = 'W2'
            print("     - Found W2 form.")
    return extracted_data

def data_ingestion_agent(state: GraphState) -> dict:
    """
    Ingests initial data, processes documents, and pulls credit data from the bureau service.
    """
    print("--- AGENT: Data Ingestion ---")

    db = state.get('db')

    application_model = state['application_data']

    ssn_last4 = application_model.ssn_last4

    
    # Use the Bureau Service to get credit data
    bureau_data = {}
    # Add a safety check to ensure the db session exists
    if ssn_last4 and db:
        bureau_service = BureauService()
        fetched_bureau_data = bureau_service.get_bureau_data(ssn_last4, db)
        if fetched_bureau_data:
            bureau_data = fetched_bureau_data
            print(f"   > Successfully pulled bureau data using SSN.")
        else:
            print(f"   > Could not find bureau data for SSN. Proceeding with defaults.")
    else:
        if not ssn_last4:
            print("   > No SSN provided in application. Skipping bureau pull.")
        if not db:
            print("   > Database session not found in state. Skipping bureau pull.")
    
    # --- Process documents ---
    documents = state.get('document_urls', [])
    doc_extracted_data = {}
    if documents:
        doc_extracted_data = simulate_document_processing(documents)
        print("   > Enriched application with simulated document data.")

    # --- Combine all data sources ---
    combined_data = {
        **application_model.model_dump(),
        **bureau_data,
        **doc_extracted_data
    }

    return {
        "application_data": combined_data,
        "ingested_data": combined_data,
    }