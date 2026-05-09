from flask import Blueprint, request, jsonify
from services.groq_client import analyze_risk_event, chat_about_event, describe_event, recommend_actions, generate_report
import datetime

api_bp = Blueprint('api', __name__)


@api_bp.route('/analyze', methods=['POST'])
def analyze_event():
    data = request.json
    if not data or 'description' not in data:
        return jsonify({'error': 'Description is required'}), 400
    try:
        result = analyze_risk_event(
            title=data.get('title', ''),
            description=data.get('description', ''),
            category=data.get('category', 'Unknown'),
            severity=data.get('severity', 'UNKNOWN'),
            status=data.get('status', 'OPEN')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/describe', methods=['POST'])
def describe():
    data = request.json
    if not data or 'description' not in data:
        return jsonify({'error': 'Description is required'}), 400
    try:
        result = describe_event(
            title=data.get('title', ''),
            description=data.get('description', ''),
            category=data.get('category', 'Unknown')
        )
        result['generated_at'] = datetime.datetime.utcnow().isoformat() + 'Z'
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    if not data or 'description' not in data:
        return jsonify({'error': 'Description is required'}), 400
    try:
        result = recommend_actions(
            title=data.get('title', ''),
            description=data.get('description', ''),
            category=data.get('category', 'Unknown'),
            severity=data.get('severity', 'MEDIUM')
        )
        result['generated_at'] = datetime.datetime.utcnow().isoformat() + 'Z'
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/generate-report', methods=['POST'])
def generate_report_endpoint():
    data = request.json
    if not data or 'events' not in data:
        return jsonify({'error': 'events array is required'}), 400
    try:
        result = generate_report(data.get('events', []))
        result['generated_at'] = datetime.datetime.utcnow().isoformat() + 'Z'
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data or 'event' not in data:
        return jsonify({'error': 'message and event context are required'}), 400
    try:
        reply = chat_about_event(
            event_context=data.get('event', {}),
            conversation_history=data.get('history', []),
            user_message=data['message']
        )
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    data = request.json
    if not data or 'events' not in data:
        return jsonify({'error': 'events array is required'}), 400
    results = []
    for event in data['events'][:5]:
        try:
            result = analyze_risk_event(
                title=event.get('title', ''),
                description=event.get('description', ''),
                category=event.get('category', 'Unknown'),
                severity=event.get('severity', 'UNKNOWN'),
                status=event.get('status', 'OPEN')
            )
            results.append({'id': event.get('id'), 'analysis': result})
        except Exception as e:
            results.append({'id': event.get('id'), 'error': str(e)})
    return jsonify({'results': results})
