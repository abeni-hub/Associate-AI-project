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

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() == "exit":
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

        response = ask_ai(messages)

        messages.append(
            {
                "role": "assistant",
                "content": response,
            }
        )

        print(f"\nAssistant: {response}\n")