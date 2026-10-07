import requests

from .config import GROQ_API_KEY


API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"


def ask_ai(messages: list[dict[str, str]]) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
    }

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )

        if response.status_code == 401:
            return "Error: Invalid Groq API key."

        if response.status_code == 404:
            return "Error: AI model or API endpoint was not found."

        if response.status_code == 429:
            return "Error: Too many requests. Please try again later."

        if response.status_code >= 500:
            return "Error: Groq's server is temporarily unavailable."

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]

    except requests.exceptions.Timeout:
        return "Error: The request timed out. Please try again."

    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to the AI service."

    except requests.exceptions.RequestException:
        return "Error: The AI request failed."

    except (KeyError, IndexError, TypeError):
        return "Error: Received an unexpected response from the AI service."