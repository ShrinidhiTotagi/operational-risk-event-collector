from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from services.groq_client import call_groq
from services.validator import validate_event_input, sanitize_string
import os

report_bp = Blueprint('report', __name__)

SYSTEM_PROMPT = open(os.path.join(os.path.dirname(__file__), '../prompts/report_system.txt')).read()

@report_bp.post('/api/ai/generate-report')
def generate_report():
    data = request.get_json(silent=True) or {}
    error = validate_event_input(data)
    if error:
        return jsonify({"error": error}), 400

    payload = {
        "title": sanitize_string(data.get("title", "")),
        "category": sanitize_string(data.get("category", "")),
        "description": sanitize_string(data.get("description", "")),
        "status": sanitize_string(data.get("status", "")),
        "impact_type": sanitize_string(data.get("impact_type", "")),
        "inherent_risk_score": data.get("inherent_risk_score"),
        "residual_risk_score": data.get("residual_risk_score"),
        "loss_amount": data.get("loss_amount"),
        "root_cause": sanitize_string(data.get("root_cause", "")),
        "action_plan": sanitize_string(data.get("action_plan", "")),
        "related_events": data.get("related_events", []),
    }

    user_prompt = f"Event data: {payload}"
    result = call_groq(SYSTEM_PROMPT, user_prompt, "report", payload)

    if result.get("is_fallback") and "error" in result:
        return jsonify({
            "title": "Report Unavailable",
            "summary": "AI service temporarily unavailable.",
            "overview": "",
            "key_items": [],
            "recommendations": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_fallback": True
        }), 200

    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return jsonify(result), 200
