import re

INJECTION_PATTERNS = [
    r'ignore (previous|above|all) instructions',
    r'you are now',
    r'disregard (your|the) (system|instructions)',
    r'act as (a|an)',
    r'jailbreak',
    r'<\s*script',
]

def sanitize_string(value: str) -> str:
    if not isinstance(value, str):
        return str(value)
    clean = re.sub(r'<[^>]+>', '', value)
    return clean.strip()[:2000]

def check_injection(text: str) -> bool:
    lower = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False

def validate_event_input(data: dict) -> str | None:
    required = ['title', 'category']
    for field in required:
        if not data.get(field):
            return f"Missing required field: {field}"
    for field in ['title', 'description', 'category', 'root_cause']:
        val = data.get(field, '')
        if val and check_injection(str(val)):
            return f"Invalid content detected in field: {field}"
    return None
