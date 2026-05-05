import os
import json
from groq import Groq

# Initialize Groq client
# The API key will be automatically picked up from the GROQ_API_KEY environment variable
def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY is not set or invalid in environment variables.")
    return Groq(api_key=api_key)

def load_prompt_template():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'analysis_prompt.txt')
    with open(prompt_path, 'r') as file:
        return file.read()

def analyze_risk_event(title, description, category):
    try:
        client = get_groq_client()
        prompt_template = load_prompt_template()
        
        prompt = prompt_template.format(
            title=title,
            description=description,
            category=category
        )
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert operational risk analyst. Respond only with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="mixtral-8x7b-32768", # Using a fast, standard model
            temperature=0.2, # Low temperature for more deterministic analysis
            response_format={"type": "json_object"}
        )
        
        response_content = chat_completion.choices[0].message.content
        return json.loads(response_content)
        
    except Exception as e:
        print(f"Error in Groq analysis: {str(e)}")
        # Fallback response for development without API key
        return {
            "score": 50,
            "analysis": f"Analysis failed or API key not configured. Error: {str(e)[:100]}...",
            "suggested_actions": ["Review manually"]
        }
