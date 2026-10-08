import json

import requests
from pydantic import ValidationError

from .config import GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL
from .models import DocumentData


def extract_document(text: str) -> DocumentData:
    prompt = f"""
Extract the following information from the document.

Return ONLY valid JSON with these fields:

- name
- email
- phone
- company
- role
- location

If a field is not present, use null.

Document:
{text}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a document extraction assistant. "
                    "Return only valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "temperature": 0,
    }

    response = requests.post(
        GROQ_API_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    response.raise_for_status()

    data = response.json()

    content = data["choices"][0]["message"]["content"]

    try:
        extracted_data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("AI returned invalid JSON.") from exc

    try:
        return DocumentData(**extracted_data)
    except ValidationError as exc:
        raise ValueError("AI returned invalid document data.") from exc