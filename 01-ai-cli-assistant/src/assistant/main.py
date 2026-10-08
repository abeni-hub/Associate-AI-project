from .cli import run_cli
from .logging_config import setup_logging


def main() -> None:
    setup_logging()
    run_cli()


if __name__ == "__main__":
    main()