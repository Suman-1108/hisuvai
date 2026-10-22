import os
import sys
from PIL import Image

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets'))
PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public'))

print("Assets Dir:", ASSETS_DIR)

# 1. Unused files to delete
DELETE_FILES = [
    "index-cgynw2db.js",
    "index-ct6tzrd2.css",
    "suvai3.jpg",
    "suvai4.jpg",
    "suvai5.jpg",
    "suvai6.jpg",
    "mobile portait hero22.png"
]

for f in DELETE_FILES:
    p = os.path.join(ASSETS_DIR, f)
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted: {f}")
    else:
        print(f"Already gone: {f}")

# 2. Rename files with spaces
RENAME_MAP = {
    "footer background-_mgjedfg.png": "footer-bg-1.png",
    "footer background-_mgjedfgb.png": "footer-bg-2.png",
    "footer background-_mgjedfgc.png": "footer-bg-3.png",
    "mobile portait hero1.png": "mobile-portrait-hero1.png",
    "mobile portait hero2.png": "mobile-portrait-hero2.png",
}

for old_name, new_name in RENAME_MAP.items():
    old_p = os.path.join(ASSETS_DIR, old_name)
    new_p = os.path.join(ASSETS_DIR, new_name)
    if os.path.exists(old_p):
        if os.path.exists(new_p):
            os.remove(new_p)
        os.rename(old_p, new_p)
        print(f"Renamed: {old_name} -> {new_name}")
    elif os.path.exists(new_p):
        print(f"Already renamed: {new_name}")
    else:
        print(f"Not found: {old_name}")

# 3. Create a real multi-resolution favicon.ico
logo_path = os.path.join(ASSETS_DIR, "logo.png")
if os.path.exists(logo_path):
    with Image.open(logo_path) as img:
        img_rgb = img.convert("RGBA")
        fav_path = os.path.join(PUBLIC_DIR, "favicon.ico")
        img_rgb.save(fav_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
        print(f"Created real favicon.ico: {os.path.getsize(fav_path)} bytes")

# 4. Convert images to WebP under 400KB
TARGET_EXTS = ['.png', '.jpg', '.jpeg']
MAX_BYTES = 400 * 1024  # 400 KB

converted_count = 0
for fname in sorted(os.listdir(ASSETS_DIR)):
    base, ext = os.path.splitext(fname)
    ext_lower = ext.lower()
    if ext_lower not in TARGET_EXTS:
        continue
    if base.startswith('.'):
        continue

    src_path = os.path.join(ASSETS_DIR, fname)
    webp_name = f"{base}.webp"
    dest_path = os.path.join(ASSETS_DIR, webp_name)

    try:
        with Image.open(src_path) as im:
            # Handle alpha channel
            mode = im.mode
            if mode not in ('RGB', 'RGBA'):
                im = im.convert('RGBA' if 'A' in mode else 'RGB')

            # Determine best max dimensions if image is huge (e.g. > 1920)
            orig_w, orig_h = im.size
            max_dim = 1920
            if max(orig_w, orig_h) > max_dim:
                scale = max_dim / max(orig_w, orig_h)
                new_w = int(orig_w * scale)
                new_h = int(orig_h * scale)
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Compress to WebP iteratively to ensure under 400KB
            quality = 85
            for attempt in range(5):
                im.save(dest_path, format="WEBP", quality=quality, method=6)
                size = os.path.getsize(dest_path)
                if size <= MAX_BYTES or quality <= 45:
                    break
                quality -= 10

            size_kb = os.path.getsize(dest_path) / 1024
            print(f"Converted {fname} -> {webp_name} ({size_kb:.1f} KB, quality={quality})")
            converted_count += 1
    except Exception as e:
        print(f"Failed to convert {fname}: {e}")

print(f"\nDone! Converted {converted_count} images to WebP under 400KB.")
