.DEFAULT_GOAL := images
ART_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
PYTHON ?= python3

.PHONY: images setup check test

images: setup
	@"$(ART_DIR).venv/bin/python" "$(ART_DIR)process_images.py"
	@"$(ART_DIR).venv/bin/python" "$(ART_DIR)process_video.py"
	@"$(ART_DIR).venv/bin/python" "$(ART_DIR)update_gallery.py"

# Recreate dependencies only when requirements change or the environment is absent.
setup:
	@if [ ! -x "$(ART_DIR).venv/bin/python" ] || [ ! -f "$(ART_DIR).venv/.ready" ] || [ "$(ART_DIR)requirements.txt" -nt "$(ART_DIR).venv/.ready" ]; then \
		$(PYTHON) -m venv --system-site-packages "$(ART_DIR).venv" && \
		( "$(ART_DIR).venv/bin/python" -c 'from PIL import Image, ImageCms, features; assert features.check("webp"); assert hasattr(Image, "Resampling")' || \
		  "$(ART_DIR).venv/bin/python" -m pip install -r "$(ART_DIR)requirements.txt" ) && \
		touch "$(ART_DIR).venv/.ready"; \
	fi

check: setup
	@"$(ART_DIR).venv/bin/python" "$(ART_DIR)process_images.py" --dry-run
	@"$(ART_DIR).venv/bin/python" "$(ART_DIR)process_video.py" --dry-run

test: setup
	@"$(ART_DIR).venv/bin/python" -m unittest discover -s "$(ART_DIR)tests" -v
