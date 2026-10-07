import os

from dotenv import load_dotenv


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")
GROQ_API_URL = os.getenv("GROQ_API_URL")


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not set. "
        "Please add it to your .env file."
    )


if not GROQ_MODEL:
    raise ValueError(
        "GROQ_MODEL is not set. "
        "Please add it to your .env file."
    )


if not GROQ_API_URL:
    raise ValueError(
        "GROQ_API_URL is not set. "
        "Please add it to your .env file."
    )