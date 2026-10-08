# AI CLI Assistant

A command-line AI assistant built with Python and the Groq API.

This project is the first project in my **Associate AI Engineering roadmap**. It focuses on building a practical AI application from the ground up while learning API integration, environment configuration, conversation management, error handling, logging, token tracking, CLI interaction, and automated testing.

---

## Features

* 🤖 AI-powered conversations through the Groq API
* 💬 Conversation history and context
* 🔐 Environment-based API configuration
* ⚡ Interactive command-line interface
* 🧹 Clear conversation history
* 📊 Session token usage tracking
* 📝 Application logging
* 🛡️ API error handling
* ⏱️ Request timeout handling
* 🧪 Automated tests with pytest
* 📦 Clean Python project structure

---

## Technologies

* **Python 3.13**
* **Groq API**
* **Requests** — HTTP API requests
* **python-dotenv** — environment variable management
* **pytest** — automated testing
* **Git / GitHub** — version control

---

## Project Structure

```text
01-ai-cli-assistant/
│
├── src/
│   └── assistant/
│       ├── __init__.py
│       ├── main.py
│       ├── cli.py
│       ├── ai.py
│       ├── config.py
│       └── logging_config.py
│
├── tests/
│   └── test_ai.py
│
├── logs/
│   └── assistant.log
│
├── .env
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

> `.env`, `.venv`, logs, Python cache files, and test cache files are excluded from Git.

---

## Architecture

The application separates responsibilities into different modules:

```text
User
 │
 ▼
CLI
 │
 │ user message
 ▼
AI Service
 │
 │ HTTP request
 ▼
Groq API
 │
 │ AI response + usage
 ▼
AI Service
 │
 ▼
CLI
 │
 ├── Display response
 ├── Store conversation
 └── Track token usage
```

### Module responsibilities

**`main.py`**

Application entry point. Initializes logging and starts the CLI.

**`cli.py`**

Handles user interaction, commands, conversation history, responses, and token usage.

**`ai.py`**

Handles communication with the Groq API and API-related error handling.

**`config.py`**

Loads and validates environment configuration.

**`logging_config.py`**

Configures application logging.

**`tests/test_ai.py`**

Tests AI API behavior without making real API requests.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/abeni-hub/Associate-AI-project.git
```

Navigate to the project:

```bash
cd "Associate AI project/01-ai-cli-assistant"
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project directory:

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

Never commit your real API key to GitHub.

---

## Running the Assistant

Start the application with:

```bash
python -m src.assistant.main
```

You should see:

```text
AI CLI Assistant
Type /help for available commands.
```

You can then enter normal questions:

```text
You: What is Python?

Assistant: Python is a high-level programming language...
```

---

## CLI Commands

The assistant supports the following commands:

| Command  | Description                            |
| -------- | -------------------------------------- |
| `/help`  | Display available commands             |
| `/clear` | Clear the current conversation history |
| `/usage` | Display session token usage            |
| `/exit`  | Exit the application                   |

Example:

```text
You: /usage

Session usage:
Input tokens: 25
Output tokens: 42
Total tokens: 67
```

---

## Conversation Memory

The assistant maintains conversation history during the current session.

For example:

```text
You: What is Python?

Assistant: Python is a programming language...

You: Who created it?

Assistant: Python was created by Guido van Rossum...
```

The second question is sent together with the previous conversation context.

Using:

```text
/clear
```

resets the conversation while keeping the system instructions.

---

## Token Usage

The application tracks token usage returned by the API.

It tracks:

* Input tokens
* Output tokens
* Total tokens

Use:

```text
/usage
```

to view the current session's usage.

---

## Error Handling

The application handles several API failure scenarios gracefully.

### Invalid API key

```text
Error: Invalid Groq API key.
```

### Rate limiting

```text
Error: Too many requests. Please try again later.
```

### Timeout

```text
Error: The request timed out. Please try again.
```

### Connection failure

```text
Error: Could not connect to the AI service.
```

### Server errors

```text
Error: Groq's server is temporarily unavailable.
```

The application avoids crashing the CLI when these errors occur.

---

## Logging

Application events are written to:

```text
logs/assistant.log
```

The log records important events such as:

* API requests
* Successful API responses
* Token usage
* Authentication failures
* Rate limits
* Timeouts
* Connection errors
* Unexpected API responses

Logs are excluded from version control through `.gitignore`.

---

## Testing

The project uses **pytest** for automated testing.

Run:

```bash
pytest
```

Current test coverage includes:

* Successful AI response
* Token usage extraction
* Request timeout handling
* Rate-limit handling

Expected result:

```text
3 passed
```

The tests mock the HTTP request, so they do not require a real API request.

---

## Environment Variables

The application requires:

| Variable       | Purpose                    |
| -------------- | -------------------------- |
| `GROQ_API_KEY` | Authentication with Groq   |
| `GROQ_MODEL`   | AI model used for requests |
| `GROQ_API_URL` | Groq API endpoint          |

These values are loaded using `python-dotenv`.

---

## What I Learned

This project introduced several core AI engineering concepts:

### Python application structure

Organizing an application into modules with clear responsibilities.

### Environment configuration

Keeping API keys and configuration outside source code.

### REST API integration

Sending authenticated HTTP requests and processing JSON responses.

### AI conversation structure

Working with messages using:

```python
{
    "role": "user",
    "content": "..."
}
```

and maintaining conversation context.

### Error handling

Handling timeouts, connection failures, authentication errors, rate limits, and server errors.

### Token tracking

Reading token usage returned by an AI API and tracking usage across a session.

### Logging

Recording application behavior for debugging and monitoring.

### Automated testing

Using pytest and mocked HTTP requests to test application behavior without depending on the external API.

---

## Future Improvements

Possible future improvements include:

* Streaming responses
* Persistent conversation history
* Multiple AI providers
* More comprehensive test coverage
* Configuration through a settings object
* Better CLI formatting
* Conversation export
* Cost estimation

These features will be explored in later projects in the roadmap.

---

## Project Status

**Status: Complete ✅**

The application has been implemented, tested, and verified end-to-end.

### Completed

* [x] Python project structure
* [x] Virtual environment
* [x] Environment configuration
* [x] Groq API integration
* [x] Interactive CLI
* [x] Conversation history
* [x] CLI commands
* [x] Token usage tracking
* [x] API error handling
* [x] Application logging
* [x] Automated tests
* [x] End-to-end verification
* [x] Git version control

---

## AI Engineering Roadmap

This project is **Project 1 of 10**.

1. ✅ AI CLI Assistant
2. ⏳ AI Document Extractor
3. ⏳ Multi-Provider AI Gateway
4. ⏳ Streaming AI Chat API
5. ⏳ Semantic Search Engine
6. ⏳ Document Q&A / RAG API
7. ⏳ AI Customer Support Agent
8. ⏳ AI Business Assistant
9. ⏳ Production AI API
10. ⏳ Production AI Knowledge Platform

---

## Author

**Abeni**

Built as part of a hands-on Associate AI Engineering learning roadmap.
