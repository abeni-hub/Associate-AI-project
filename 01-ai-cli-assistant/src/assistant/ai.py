import logging

import requests

from .config import GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL


logger = logging.getLogger(__name__)


def ask_ai(messages: list[dict[str, str]]) -> tuple[str, dict]:
    logger.info("Sending request to Groq API")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
    }

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )

        if response.status_code == 401:
            logger.error("Groq API authentication failed")
            return "Error: Invalid Groq API key.", {}

        if response.status_code == 404:
            logger.error("Groq API model or endpoint not found")
            return "Error: AI model or API endpoint was not found.", {}

        if response.status_code == 429:
            logger.warning("Groq API rate limit reached")
            return "Error: Too many requests. Please try again later.", {}

        if response.status_code >= 500:
            logger.error(
                "Groq server error: status=%s",
                response.status_code,
            )
            return "Error: Groq's server is temporarily unavailable.", {}

        response.raise_for_status()

        data = response.json()

        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})

        logger.info(
            "Groq request successful: input_tokens=%s output_tokens=%s",
            usage.get("prompt_tokens", 0),
            usage.get("completion_tokens", 0),
        )

        return content, usage

    except requests.exceptions.Timeout:
        logger.error("Groq request timed out")
        return "Error: The request timed out. Please try again.", {}

    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to Groq")
        return "Error: Could not connect to the AI service.", {}

    except requests.exceptions.RequestException:
        logger.exception("Groq request failed")
        return "Error: The AI request failed.", {}

    except (KeyError, IndexError, TypeError):
        logger.exception("Unexpected Groq API response")
        return "Error: Received an unexpected response from the AI service.", {}