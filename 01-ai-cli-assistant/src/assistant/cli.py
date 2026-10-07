from .ai import ask_ai


def run_cli() -> None:
    print("AI CLI Assistant")
    print("Type 'exit' to quit.\n")

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() == "exit":
            print("Goodbye!")
            break

        if not user_input:
            continue
         
        response = ask_ai(user_input)

        print(f"\nAssistant: {response}\n")  