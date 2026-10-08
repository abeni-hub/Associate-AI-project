import requests

from src.assistant import ai


def test_ask_ai_success(monkeypatch):
    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": "Python is a programming language."
                        }
                    }
                ],
                "usage": {
                    "prompt_tokens": 10,
                    "completion_tokens": 7,
                },
            }

    def fake_post(*args, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(requests, "post", fake_post)

    messages = [
        {
            "role": "user",
            "content": "What is Python?",
        }
    ]

    response, usage = ai.ask_ai(messages)

    assert response == "Python is a programming language."
    assert usage["prompt_tokens"] == 10
    assert usage["completion_tokens"] == 7

def test_ask_ai_timeout(monkeypatch):
    def fake_post(*args, **kwargs):
        raise requests.exceptions.Timeout()

    monkeypatch.setattr(requests, "post", fake_post)

    messages = [
        {
            "role": "user",
            "content": "Hello",
        }
    ]

    response, usage = ai.ask_ai(messages)

    assert response == "Error: The request timed out. Please try again."
    assert usage == {}


def test_ask_ai_rate_limit(monkeypatch):
    class FakeResponse:
        status_code = 429

    def fake_post(*args, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(requests, "post", fake_post)

    messages = [
        {
            "role": "user",
            "content": "Hello",
        }
    ]

    response, usage = ai.ask_ai(messages)

    assert response == "Error: Too many requests. Please try again later."
    assert usage == {}