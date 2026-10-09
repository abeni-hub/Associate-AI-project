
import os

from dotenv import load_dotenv

load_dotenv()

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

GROQ_TIMEOUT_SECONDS = 30.0
GROQ_MAX_RETRIES = 2