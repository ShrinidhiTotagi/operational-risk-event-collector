import os
import json
import hashlib
import time
import redis
from groq import Groq

_redis_client = None
_response_times = []
_cache_hits = 0
_cache_misses = 0

CACHE_TTL = int(os.getenv('CACHE_TTL_SECONDS', '900'))
MODEL_ID = os.getenv('AI_MODEL_ID', 'llama-3.3-70b-versatile')


def get_redis():
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            decode_responses=True
        )
    return _redis_client


def get_groq_client():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)


def cache_key(prefix: str, payload: dict) -> str:
    normalized = json.dumps(payload, sort_keys=True)
    return f"{prefix}:{hashlib.sha256(normalized.encode()).hexdigest()}"


def call_groq(system_prompt: str, user_prompt: str, cache_prefix: str, payload: dict):
    global _cache_hits, _cache_misses

    key = cache_key(cache_prefix, payload)
    try:
        cached = get_redis().get(key)
        if cached:
            _cache_hits += 1
            result = json.loads(cached)
            result['from_cache'] = True
            return result
    except Exception:
        pass

    _cache_misses += 1

    if not os.getenv('GROQ_API_KEY'):
        return {"error": "GROQ_API_KEY not configured", "is_fallback": True}

    t0 = time.time()
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        elapsed = time.time() - t0
        _response_times.append(elapsed)
        if len(_response_times) > 100:
            _response_times.pop(0)

        content = response.choices[0].message.content
        result = json.loads(content)
        result['is_fallback'] = False

        try:
            get_redis().setex(key, CACHE_TTL, json.dumps(result))
        except Exception:
            pass

        return result

    except Exception as e:
        elapsed = time.time() - t0
        _response_times.append(elapsed)
        return {"error": str(e), "is_fallback": True}


def get_metrics():
    total = _cache_hits + _cache_misses
    return {
        "cache_hits": _cache_hits,
        "cache_misses": _cache_misses,
        "cache_hit_ratio": round(_cache_hits / total, 3) if total > 0 else 0,
        "avg_response_time_seconds": round(sum(_response_times) / len(_response_times), 3) if _response_times else 0
    }
