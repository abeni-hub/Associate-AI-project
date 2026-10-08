import pytest
import requests
from pydantic import ValidationError
from src.extractor import main
from src.extractor import extract
from src.extractor.models import DocumentData


def test_document_data_valid():
    document = DocumentData(
        name="John Doe",
        email="john@example.com",
        phone="+1 555-123-4567",
        company="Acme Corporation",
        role="Senior Software Engineer",
        location="New York",
    )

    assert document.name == "John Doe"
    assert document.email == "john@example.com"
    assert document.company == "Acme Corporation"


def test_document_data_invalid_email():
    with pytest.raises(ValidationError):
        DocumentData(
            name="John Doe",
            email="not-an-email",
        )


def test_document_data_optional_fields():
    document = DocumentData(
        name="John Doe",
        email="john@example.com",
    )

    assert document.phone is None
    assert document.company is None
    assert document.role is None
    assert document.location is None


def test_extract_document(monkeypatch):
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": (
                                '{"name": "John Doe", '
                                '"email": "john@example.com", '
                                '"phone": null, '
                                '"company": "Acme Corporation", '
                                '"role": "Software Engineer", '
                                '"location": "New York"}'
                            )
                        }
                    }
                ]
            }

    def fake_post(*args, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(requests, "post", fake_post)

    result = extract.extract_document(
        "John Doe works at Acme Corporation."
    )

    assert isinstance(result, DocumentData)
    assert result.name == "John Doe"
    assert result.email == "john@example.com"
    assert result.company == "Acme Corporation"
    assert result.role == "Software Engineer"
    assert result.location == "New York"


def test_extract_document_invalid_json(monkeypatch):
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": "This is not valid JSON."
                        }
                    }
                ]
            }

    def fake_post(*args, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(requests, "post", fake_post)

    with pytest.raises(ValueError, match="AI returned invalid JSON"):
        extract.extract_document("Some document text")


def test_extract_document_invalid_data(monkeypatch):
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": (
                                '{"name": "John Doe", '
                                '"email": "not-an-email"}'
                            )
                        }
                    }
                ]
            }

    def fake_post(*args, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(requests, "post", fake_post)

    with pytest.raises(
        ValueError,
        match="AI returned invalid document data",
    ):
        extract.extract_document("Some document text")


def test_cli_empty_document(monkeypatch, capsys):
    inputs = iter(["END"])

    monkeypatch.setattr("builtins.input", lambda: next(inputs))

    main.main()

    captured = capsys.readouterr()

    assert "Error: Document cannot be empty." in captured.out


def test_cli_success(monkeypatch, capsys):
    inputs = iter(
        [
            "John Doe",
            "john@example.com",
            "Acme Corporation",
            "END",
        ]
    )

    monkeypatch.setattr("builtins.input", lambda: next(inputs))

    def fake_extract_document(text):
        return DocumentData(
            name="John Doe",
            email="john@example.com",
            company="Acme Corporation",
        )

    monkeypatch.setattr(
        main,
        "extract_document",
        fake_extract_document,
    )

    main.main()

    captured = capsys.readouterr()

    assert "Extracted Information:" in captured.out
    assert "Name: John Doe" in captured.out
    assert "Email: john@example.com" in captured.out
    assert "Company: Acme Corporation" in captured.out