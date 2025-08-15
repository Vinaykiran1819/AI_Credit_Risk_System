from langgraph.graph import StateGraph, END
from functools import partial
from .state import GraphState

# Import all the agent handlers
from agents.supervisor.handler import supervisor_agent
from agents.data_ingestion.handler import data_ingestion_agent
from agents.risk_scoring.scorer import risk_scoring_agent
from agents.decision_making.handler import decision_making_agent
from agents.explainability.handler import explainability_agent
from agents.compliance.logger import compliance_agent

workflow = StateGraph(GraphState)

# Add all the necessary nodes to the graph
workflow.add_node("supervisor", supervisor_agent)
workflow.add_node("data_ingestion", data_ingestion_agent)
workflow.add_node("risk_scoring", risk_scoring_agent)
workflow.add_node("decision_making", decision_making_agent)
workflow.add_node("explainability", explainability_agent)
workflow.add_node("compliance", compliance_agent)

def router(state: GraphState):
    """Router function to determine the next node or end the graph."""
    next_action = state.get("next_action")
    
    if next_action in ["data_ingestion", "risk_scoring", "decision_making", "explainability", "compliance"]:
        return next_action
    else:
        return END

# The supervisor is the entry point and the central router.
workflow.set_entry_point("supervisor")

# Define the conditional edges from the supervisor to all other nodes.
workflow.add_conditional_edges(
    "supervisor",
    router,
    {
        "data_ingestion": "data_ingestion",
        "risk_scoring": "risk_scoring",
        "decision_making": "decision_making",
        "explainability": "explainability",
        "compliance": "compliance",
        END: END
    }
)

# After each agent completes its task, control returns to the supervisor.
workflow.add_edge("data_ingestion", "supervisor")
workflow.add_edge("risk_scoring", "supervisor")
workflow.add_edge("decision_making", "supervisor")
workflow.add_edge("explainability", "supervisor")
workflow.add_edge("compliance", "supervisor")

# Compile the workflow.
# Pass the database session into the data_ingestion_agent when the graph is invoked.
# We use partial to pre-fill the 'db' argument of the agent.
# NOTE: This requires a small change in api.py to pass `db` in the initial state.
app = workflow.compile()
print("LangGraph workflow compiled with final architecture.")
