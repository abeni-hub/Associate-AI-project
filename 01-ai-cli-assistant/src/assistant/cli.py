from .ai import ask_ai


def print_help() -> None:
    print("\nAvailable commands:")
    print("  /help   - Show available commands")
    print("  /clear  - Clear conversation history")
    print("  /usage  - Show token usage")
    print("  /exit   - Exit the assistant")
    print()


def run_cli() -> None:
    print("AI CLI Assistant")
    print("Type /help for available commands.\n")

    system_message = {
        "role": "system",
        "content": (
            "You are a helpful AI assistant. "
            "Give clear and concise answers."
        ),
    }

    messages: list[dict[str, str]] = [system_message]

    total_input_tokens = 0
    total_output_tokens = 0

    while True:
        user_input = input("You: ").strip()

        if not user_input:
            continue

        # CLI commands
        if user_input.lower() == "/exit":
            print("\nGoodbye!")
            break

        if user_input.lower() == "/help":
            print_help()
            continue

        if user_input.lower() == "/clear":
            messages = [system_message]

            print("\nConversation cleared.\n")
            continue

        if user_input.lower() == "/usage":
            total_tokens = total_input_tokens + total_output_tokens

            print("\nSession usage:")
            print(f"Input tokens: {total_input_tokens}")
            print(f"Output tokens: {total_output_tokens}")
            print(f"Total tokens: {total_tokens}\n")
            continue

        # Normal AI message
        messages.append(
            {
                "role": "user",
                "content": user_input,
            }
        )

        response, usage = ask_ai(messages)

        if response.startswith("Error:"):
            print(f"\n{response}\n")
            messages.pop()
            continue

        messages.append(
            {
                "role": "assistant",
                "content": response,
            }
        )

        total_input_tokens += usage.get("prompt_tokens", 0)
        total_output_tokens += usage.get("completion_tokens", 0)

        print(f"\nAssistant: {response}\n")