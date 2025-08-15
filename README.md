# AI Retail Loan System
An end-to-end, explainable AI (XAI) platform designed to automate the retail loan underwriting process with a human-in-the-loop (HITL) workflow.

## Overview
Traditional loan underwriting is a manual, time-consuming, and often inconsistent process. This project addresses these challenges by building a modern, fully automated AI system that serves as a powerful assistant to human underwriters.

The application orchestrates a workflow of specialized AI agents to ingest customer applications, enrich them with credit bureau data, and generate a clear, explainable recommendation. The final output is presented in a professional dashboard, empowering underwriters to make faster, more informed, and more consistent final decisions. This project demonstrates a production-ready MVP that successfully balances automation with essential human oversight.

## Key Features
- End-to-End Automation: A seamless, fully automated workflow from the moment a customer submits their application to the final analysis being ready for an underwriter.

- Explainable AI (XAI): The system moves beyond opaque "black box" scores. It provides a detailed narrative summary and visual charts that explain why the AI made its recommendation, highlighting the key factors that influenced the decision.

- Human-in-the-Loop (HITL) by Design: The platform is built to assist, not replace, human expertise. The intuitive underwriter dashboard provides all the necessary tools for a human to perform a final review and make the ultimate decision.

- Modular & Scalable Architecture: Built with a modern microservices-style approach, the system is reliable, easy to maintain, and ready to be deployed in a cloud environment.

## Live Demo Screenshots
### Customer Application Form
A clean, multi-step interface guides the customer through the application process.

(INSERT YOUR SCREENSHOT OF THE CUSTOMER APPLICATION FORM HERE)

### Underwriter Dashboard
The final analysis is presented in a professional dashboard with a risk gauge, factor analysis charts, and a detailed AI-generated narrative.

(INSERT YOUR SCREENSHOT OF THE FINAL, POLISHED UNDERWRITER DASHBOARD HERE)

## System Architecture
The application is built on a robust, three-tier architecture that separates concerns for scalability and maintainability.

- Frontend (User Interface): A responsive web application built in React. It serves both the customer application form and the internal underwriter dashboard.

- Backend (API Server): A high-performance API built with Python and FastAPI. It handles all requests, manages the database, and serves as the communication hub.

- AI Core (Agentic Workflow): The "brain" of the system, built with LangGraph. It orchestrates the sequence of AI agents that process each application.

## AI Agent Workflow
The AI Core employs a multi-agent architecture where each agent is a small, specialized program with a single, well-defined task. A supervisor agent directs the application data through this workflow, ensuring each step is completed in the correct order.

Workflow Sequence: Data Ingestion -> Risk Scoring -> Decision Making -> Explainability -> Compliance

1. **Supervisor Agent:** The "project manager" of the workflow; directs the application to the correct agent at each step.

2. **Data Ingestion Agent:** Takes the initial application, validates it, and automatically enriches it by querying the mock credit bureau database using the applicant's SSN.

3. **Risk Scoring Agent:** Uses a pre-trained XGBoost model to calculate a precise probability of default.

4. **Decision Making Agent:** Applies business rules to the risk score to determine an initial decision (Approved, Rejected, or Manual Review).

5. **Explainability Agent:** Analyzes the model's output using SHAP to generate the structured JSON for the visual dashboard and the detailed narrative summary.

6. **Compliance Agent:** The final checkpoint; logs the final AI decision for auditing and regulatory purposes.

## Technology Stack
- AI & Workflow: LangChain & LangGraph
- Machine Learning: XGBoost, SHAP, scikit-learn
- Backend: Python, FastAPI
- Frontend: React, Vite, Tailwind CSS
- Database: PostgreSQL
- Cloud Storage: Azure Blob Storage

## Getting Started: How to Run Locally
Follow these steps to set up and run the project on your local machine.

### Prerequisites
Python 3.10+

Node.js 18+

A running PostgreSQL instance.

## 1. Backend Setup
Bash

## Clone the repository
```
git clone https://github.com/VinayKiranFundae13/AI-Retail-Loan-System.git
cd AI_Retail_Loan_System
```

### Create and activate a virtual environment
```
python -m venv .venv
source .venv/bin/activate # On Windows, use: .venv\Scripts\activate
```

Create your .env file
Copy the contents of .env.example into a new file named .env
and fill in your PostgreSQL and Azure Blob Storage connection strings.

### Install Python dependencies
```
pip install -r requirements.txt
```

### Train the ML model (this only needs to be run once)
```
python -m agents.risk_scoring.train
```

### Seed the mock credit bureau database (this only needs to be run once)
```
python seed_db.py
```

### Run the backend server
```
uvicorn api:api --reload
```
The backend will now be running at http://127.0.0.1:8000.

## 2. Frontend Setup
Bash

Open a new, separate terminal

### Navigate to the frontend directory
```
cd frontend
```

### Install Node.js dependencies
```
npm install
```

### Run the frontend development server
```
npm run dev
```
The frontend will now be running at http://localhost:5173. You can open this URL in your browser to use the application.

## Future Enhancements
This MVP serves as a strong foundation. Future work could focus on making the system fully production-ready by implementing:

Containerization: Using Docker and Kubernetes to manage the application at scale.

CI/CD Pipelines: To automate testing and deployment.

Real API Integration: Replacing the mock credit bureau with a live API from a provider like Experian or Equifax.

Enhanced Monitoring: Integrating tools like OpenTelemetry and Grafana to monitor the system's health and performance in real-time.
