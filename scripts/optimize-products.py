#!/usr/bin/env python3
"""Generate website WebPs from supplied posters. Requires Pillow; originals stay intact."""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'aseets/products'
IMAGES = {
    'Pastel pink Raspberry Pi case showcase-1.png': 'pi-zero-pink-case',
    'Mekanto Arduino Uno case showcase.png': 'arduino-uno-case',
    'Mekanto 3D Floral Wall Décor.png': 'floral-wall-decor',
    'Mekanto orange clamp-on desk hook.png': 'clamp-on-desk-hook',
    'Premium ESP32 super mini cases.png': 'esp32-super-mini-cases',
    'Mekanto custom 3D-printed design showcase.png': 'custom-design-showcase',
    'Yellow honeycomb Raspberry Pi case.png': 'pi-zero-honeycomb-case',
    'Meet Ottoky_ Custom 3D-Printed Robot.png': 'ottoky-robot',
    'Mekanto 3D robotic arm showcase.png': 'robotic-arm',
    'Raspberry Pi Zero 2 W enclosure-2.png': 'pi-zero-heatsink-case',
    'Bright Orange Custom Raspberry Pi Enclosure.png': 'pi-zero-orange-case',
    'Corrected Mekanto cable holder poster (1).png': 'desk-cable-holder',
}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cutouts', action='store_true', help='Optimize generated transparent product images instead of original posters.')
    args = parser.parse_args()
    output = SOURCE / ('cutouts' if args.cutouts else 'optimized')
    output.mkdir(exist_ok=True)
    original_bytes = optimized_bytes = 0
    for filename, slug in IMAGES.items():
        source = SOURCE / 'generated' / f'{slug}.png' if args.cutouts else SOURCE / filename
        original_bytes += source.stat().st_size
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert('RGBA' if args.cutouts else 'RGB')
            for width in (480, 960):
                resized = image.copy()
                resized.thumbnail((width, width if args.cutouts else round(width * 1.25)), Image.Resampling.LANCZOS)
                target = output / f'{slug}{"-480" if width == 480 else ""}.webp'
                resized.save(target, 'WEBP', quality=88 if args.cutouts else 82, method=6)
                optimized_bytes += target.stat().st_size
    print(f'{len(IMAGES)} unique {"cutouts" if args.cutouts else "posters"}, 24 WebPs: {original_bytes:,} → {optimized_bytes:,} bytes (including both sizes).')

if __name__ == '__main__':
    main()
