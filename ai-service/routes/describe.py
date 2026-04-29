from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from services.groq_client import call_groq
from services.validator import validate_event_input, sanitize_string
import os

describe_bp = Blueprint('describe', __name__)

SYSTEM_PROMPT = open(os.path.join(os.path.dirname(__file__), '../prompts/describe_system.txt')).read()

@describe_bp.post('/api/ai/describe')
def describe():
    data = request.get_json(silent=True) or {}
    error = validate_event_input(data)
    if error:
        return jsonify({"error": error}), 400

    payload = {
        "title": sanitize_string(data.get("title", "")),
        "category": sanitize_string(data.get("category", "")),
        "description": sanitize_string(data.get("description", "")),
        "impact_type": sanitize_string(data.get("impact_type", "")),
        "likelihood": data.get("likelihood"),
        "impact": data.get("impact"),
        "loss_amount": data.get("loss_amount"),
    }

    user_prompt = f"Event data: {payload}"
    result = call_groq(SYSTEM_PROMPT, user_prompt, "describe", payload)

    if result.get("is_fallback") and "error" in result:
        return jsonify({
            "description": "AI service temporarily unavailable.",
            "key_risks": [],
            "suggested_kri": "",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_fallback": True
        }), 200

    result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return jsonify(result), 200
