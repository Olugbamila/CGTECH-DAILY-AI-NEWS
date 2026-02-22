from pathlib import Path
from PIL import Image

# 1. Paths
BASE_DIR = Path(__file__).resolve().parents[1]  # points to CGAINEWS/
TEMPLATES_DIR = BASE_DIR / "templates"
OUTPUT_DIR = BASE_DIR / "output" / "test_run"

TEMPLATE_PATH = TEMPLATES_DIR / "image_template.png"
OUTPUT_IMAGE_PATH = OUTPUT_DIR / "image_test.png"


def main():
    # Ensure output folder exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load template
    img = Image.open(TEMPLATE_PATH).convert("RGBA")

    # For now, just save a copy
    img.save(OUTPUT_IMAGE_PATH)

    print(f"Saved test image to: {OUTPUT_IMAGE_PATH}")


if __name__ == "__main__":
    main()
