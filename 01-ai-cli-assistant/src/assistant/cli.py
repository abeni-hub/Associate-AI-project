from .ai import ask_ai


def run_cli() -> None:
    print("AI CLI Assistant")
    print("Type 'exit' to quit.\n")

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are a helpful AI assistant. "
                "Give clear and concise answers."
            ),
        }
    ]

    total_input_tokens = 0
    total_output_tokens = 0

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() == "exit":
            print("\nSession usage:")
            print(f"Input tokens: {total_input_tokens}")
            print(f"Output tokens: {total_output_tokens}")
            print("Goodbye!")
            break

        if not user_input:
            continue

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