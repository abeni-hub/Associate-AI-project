from .ai import ask_ai


def main() -> None:
    response = ask_ai("Explain what an API is in one sentence.")
    print(response)


if __name__ == "__main__":
    main()