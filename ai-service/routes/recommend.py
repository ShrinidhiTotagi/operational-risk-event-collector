from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from services.groq_client import call_groq
from services.validator import validate_event_input, sanitize_string
import os

recommend_bp = Blueprint('recommend', __name__)

SYSTEM_PROMPT = open(os.path.join(os.path.dirname(__file__), '../prompts/recommend_system.txt')).read()

@recommend_bp.post('/api/ai/recommend')
def recommend():
    data = request.get_json(silent=True) or {}
    error = validate_event_input(data)
    if error:
        return jsonify({"error": error}), 400

    payload = {
        "title": sanitize_string(data.get("title", "")),
        "category": sanitize_string(data.get("category", "")),
        "status": sanitize_string(data.get("status", "")),
        "inherent_risk_score": data.get("inherent_risk_score"),
        "residual_risk_score": data.get("residual_risk_score"),
        "loss_amount": data.get("loss_amount"),
        "root_cause": sanitize_string(data.get("root_cause", "")),
        "control_failures": sanitize_string(data.get("control_failures", "")),
    }

    user_prompt = f"Event data: {payload}"
    result = call_groq(SYSTEM_PROMPT, user_prompt, "recommend", payload)

    if result.get("is_fallback") and "error" in result:
        return jsonify({
            "recommendations": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_fallback": True
        }), 200

    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return jsonify(result), 200
