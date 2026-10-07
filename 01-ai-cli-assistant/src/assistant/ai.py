import requests

from .config import GROQ_API_KEY


API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


def ask_ai(message: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": message,
            }
        ],
    }

    response = requests.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    if not response.ok:
        print("\nGroq API error:")
        print(f"Status code: {response.status_code}")
        print(response.text)
        response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"]