from flask import Blueprint, jsonify, current_app
from services.groq_client import get_metrics
import time

health_bp = Blueprint('health', __name__)

@health_bp.get('/api/ai/health')
def health():
    uptime = round(time.time() - current_app.config['START_TIME'], 1)
    metrics = get_metrics()
    return jsonify({
        "status": "ok",
        "uptime_seconds": uptime,
        **metrics
    }), 200
