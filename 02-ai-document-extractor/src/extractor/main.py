from .extract import extract_document


def main() -> None:
    print("AI Document Extractor")
    print("Paste your document text below.")
    print("Type END on a new line when finished.\n")

    lines = []

    while True:
        line = input()

        if line.strip() == "END":
            break

        lines.append(line)

    document_text = "\n".join(lines).strip()

    if not document_text:
        print("\nError: Document cannot be empty.")
        return

    try:
        result = extract_document(document_text)

        print("\nExtracted Information:")
        print(f"Name: {result.name}")
        print(f"Email: {result.email}")
        print(f"Phone: {result.phone}")
        print(f"Company: {result.company}")
        print(f"Role: {result.role}")
        print(f"Location: {result.location}")

    except ValueError as exc:
        print(f"\nError: {exc}")


if __name__ == "__main__":
    main()