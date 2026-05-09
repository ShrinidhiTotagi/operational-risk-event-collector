import os
import json
from groq import Groq


def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY is not set or invalid.")
    return Groq(api_key=api_key)


def load_prompt_template():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'analysis_prompt.txt')
    with open(prompt_path, 'r') as f:
        return f.read()


def analyze_risk_event(title, description, category, severity="UNKNOWN", status="OPEN"):
    try:
        client = get_groq_client()
        prompt = load_prompt_template().format(
            title=title, description=description,
            category=category, severity=severity, status=status
        )
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert operational risk analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error in Groq analysis: {e}")
        return {
            "score": 50, "risk_level": "MEDIUM", "likelihood": "POSSIBLE", "impact": "MODERATE",
            "analysis": f"Analysis unavailable. Error: {str(e)[:100]}",
            "root_causes": ["Manual review required"],
            "suggested_actions": [
                {"priority": "IMMEDIATE", "action": "Review manually"},
                {"priority": "SHORT_TERM", "action": "Escalate to risk team"},
                {"priority": "LONG_TERM", "action": "Implement monitoring controls"}
            ],
            "regulatory_flags": [], "estimated_resolution_days": 7,
            "similar_risk_patterns": "Unable to determine", "confidence": 0
        }


def describe_event(title, description, category):
    try:
        client = get_groq_client()
        prompt = (
            "You are an operational risk analyst. Describe the following risk event in professional language.\n\n"
            f"Title: {title}\nCategory: {category}\nDescription: {description}\n\n"
            'Respond ONLY with valid JSON:\n'
            '{"summary": "<2-sentence professional summary>", "risk_type": "<primary risk type>", '
            '"affected_area": "<business area most affected>", '
            '"key_indicators": ["<indicator 1>", "<indicator 2>", "<indicator 3>"], "is_fallback": false}'
        )
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert operational risk analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"summary": f"Description unavailable: {str(e)[:80]}", "risk_type": "Unknown",
                "affected_area": "Unknown", "key_indicators": [], "is_fallback": True}


def recommend_actions(title, description, category, severity):
    try:
        client = get_groq_client()
        prompt = (
            "You are an operational risk analyst. Provide exactly 3 recommendations for this risk event.\n\n"
            f"Title: {title}\nCategory: {category}\nSeverity: {severity}\nDescription: {description}\n\n"
            'Respond ONLY with valid JSON:\n'
            '{"recommendations": ['
            '{"action_type": "IMMEDIATE", "description": "<action>", "priority": "HIGH"},'
            '{"action_type": "SHORT_TERM", "description": "<action>", "priority": "MEDIUM"},'
            '{"action_type": "LONG_TERM", "description": "<action>", "priority": "LOW"}'
            '], "is_fallback": false}'
        )
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert operational risk analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"recommendations": [{"action_type": "IMMEDIATE", "description": "Manual review required", "priority": "HIGH"}],
                "is_fallback": True}


def generate_report(events):
    try:
        client = get_groq_client()
        events_text = "\n".join([
            f"- [{e.get('severity','?')}] {e.get('title','?')}: {e.get('description','?')[:100]}"
            for e in events[:10]
        ])
        prompt = (
            "You are an operational risk manager. Generate a structured risk report for these events.\n\n"
            f"Events:\n{events_text}\n\n"
            'Respond ONLY with valid JSON:\n'
            '{"title": "Operational Risk Assessment Report", "summary": "<2-3 sentence executive summary>", '
            '"overview": "<paragraph describing overall risk posture>", '
            '"key_findings": ["<finding 1>", "<finding 2>", "<finding 3>"], '
            '"recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"], '
            '"risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>", "is_fallback": false}'
        )
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert operational risk manager. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"title": "Risk Report", "summary": "Report generation failed.", "overview": str(e)[:100],
                "key_findings": [], "recommendations": [], "risk_level": "UNKNOWN", "is_fallback": True}


def chat_about_event(event_context, conversation_history, user_message):
    try:
        client = get_groq_client()
        system_prompt = (
            "You are an expert operational risk analyst assistant. "
            "You are helping analyze a specific risk event. Answer questions concisely and professionally.\n\n"
            f"Event Context:\n"
            f"Title: {event_context.get('title', 'N/A')}\n"
            f"Category: {event_context.get('category', 'N/A')}\n"
            f"Severity: {event_context.get('severity', 'N/A')}\n"
            f"Description: {event_context.get('description', 'N/A')}\n"
            f"AI Risk Score: {event_context.get('aiScore', 'Not analyzed')}"
        )
        messages = [{"role": "system", "content": system_prompt}]
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            max_tokens=512
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Chat unavailable: {str(e)[:100]}"
