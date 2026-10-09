
from abc import ABC, abstractmethod


class AIProviderError(Exception):
    """Raised when an AI provider fails."""


class AIProvider(ABC):
    """Interface shared by AI provider implementations."""

    @abstractmethod
    def generate_json(self, prompt: str) -> dict:
        """Generate and return a JSON object from a prompt."""
        raise NotImplementedError