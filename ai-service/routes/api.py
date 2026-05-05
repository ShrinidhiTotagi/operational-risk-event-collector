from flask import Blueprint, request, jsonify
from services.groq_client import analyze_risk_event

api_bp = Blueprint('api', __name__)

@api_bp.route('/analyze', methods=['POST'])
def analyze_event():
    data = request.json
    
    if not data or 'description' not in data:
        return jsonify({'error': 'Description is required'}), 400
        
    title = data.get('title', '')
    description = data.get('description', '')
    category = data.get('category', 'Unknown')
    
    try:
        analysis_result = analyze_risk_event(title, description, category)
        return jsonify(analysis_result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
