"""
Pytest tests for Tool-66 AI Service
Groq API is mocked — tests run without live network access.
Minimum 8 tests required per Demo Day checklist.
"""
import json
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


def mock_groq_response(content_dict):
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps(content_dict)
    return mock_response


# ── Test 1: Health endpoint returns healthy status ──────────────────────────
def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['service'] == 'ai-service'


# ── Test 2: /analyze returns 400 when description is missing ────────────────
def test_analyze_missing_description_returns_400(client):
    response = client.post('/api/analyze',
                           json={'title': 'Test Event'},
                           content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data


# ── Test 3: /analyze returns 400 for empty body ─────────────────────────────
def test_analyze_empty_body_returns_400(client):
    response = client.post('/api/analyze',
                           json={},
                           content_type='application/json')
    assert response.status_code == 400


# ── Test 4: /analyze returns structured JSON with mocked Groq ───────────────
@patch('services.groq_client.get_groq_client')
def test_analyze_returns_structured_response(mock_client, client):
    mock_groq = MagicMock()
    mock_client.return_value = mock_groq
    mock_groq.chat.completions.create.return_value = mock_groq_response({
        "score": 75,
        "risk_level": "HIGH",
        "likelihood": "LIKELY",
        "impact": "MAJOR",
        "analysis": "This is a high risk event.",
        "root_causes": ["Cause 1", "Cause 2"],
        "suggested_actions": [{"priority": "IMMEDIATE", "action": "Fix now"}],
        "regulatory_flags": [],
        "estimated_resolution_days": 3,
        "similar_risk_patterns": "Common IT pattern",
        "confidence": 85
    })

    response = client.post('/api/analyze',
                           json={'title': 'DB Breach', 'description': 'Unauthorized access to production database', 'category': 'IT'},
                           content_type='application/json')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'score' in data
    assert data['score'] == 75
    assert data['risk_level'] == 'HIGH'


# ── Test 5: /describe returns 400 when description is missing ───────────────
def test_describe_missing_description_returns_400(client):
    response = client.post('/api/describe',
                           json={'title': 'Test'},
                           content_type='application/json')
    assert response.status_code == 400


# ── Test 6: /recommend returns structured recommendations with mocked Groq ──
@patch('services.groq_client.get_groq_client')
def test_recommend_returns_three_actions(mock_client, client):
    mock_groq = MagicMock()
    mock_client.return_value = mock_groq
    mock_groq.chat.completions.create.return_value = mock_groq_response({
        "recommendations": [
            {"action_type": "IMMEDIATE", "description": "Isolate affected system", "priority": "HIGH"},
            {"action_type": "SHORT_TERM", "description": "Conduct security audit", "priority": "MEDIUM"},
            {"action_type": "LONG_TERM", "description": "Implement MFA", "priority": "LOW"}
        ],
        "is_fallback": False
    })

    response = client.post('/api/recommend',
                           json={'title': 'Breach', 'description': 'Data breach detected', 'category': 'IT', 'severity': 'CRITICAL'},
                           content_type='application/json')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'recommendations' in data
    assert len(data['recommendations']) == 3
    assert data['recommendations'][0]['action_type'] == 'IMMEDIATE'


# ── Test 7: /generate-report returns 400 when events missing ────────────────
def test_generate_report_missing_events_returns_400(client):
    response = client.post('/api/generate-report',
                           json={'title': 'Report'},
                           content_type='application/json')
    assert response.status_code == 400


# ── Test 8: /generate-report returns structured report with mocked Groq ─────
@patch('services.groq_client.get_groq_client')
def test_generate_report_returns_structured_report(mock_client, client):
    mock_groq = MagicMock()
    mock_client.return_value = mock_groq
    mock_groq.chat.completions.create.return_value = mock_groq_response({
        "title": "Operational Risk Assessment Report",
        "summary": "Three critical events identified this period.",
        "overview": "The organisation faces elevated risk across IT and Finance.",
        "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
        "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
        "risk_level": "HIGH",
        "is_fallback": False
    })

    events = [
        {"title": "DB Breach", "description": "Unauthorized access", "severity": "CRITICAL", "category": "IT"},
        {"title": "Payroll Failure", "description": "Batch job failed", "severity": "HIGH", "category": "FINANCE"}
    ]

    response = client.post('/api/generate-report',
                           json={'events': events},
                           content_type='application/json')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'title' in data
    assert 'summary' in data
    assert 'key_findings' in data
    assert 'generated_at' in data
    assert data['risk_level'] == 'HIGH'
