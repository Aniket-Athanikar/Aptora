import os
from PIL import Image, ImageDraw

def draw_aptora_logo(size, bg_color=None, padding_ratio=0.08):
    # Oversample for smooth antialiasing
    scale = 4
    canvas_size = size * scale
    
    img = Image.new("RGBA", (canvas_size, canvas_size), bg_color if bg_color else (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # viewBox was 32x32
    # Apply padding
    pad = canvas_size * padding_ratio
    usable_size = canvas_size - 2 * pad

    def transform(x, y):
        tx = pad + (x / 32.0) * usable_size
        ty = pad + (y / 32.0) * usable_size
        return (tx, ty)

    # Outer polygon path: M16 3 L4 27 H11.5 L16 17.5 L20.5 27 H28 L16 3 Z
    outer_pts_32 = [
        (16, 3),
        (4, 27),
        (11.5, 27),
        (16, 17.5),
        (20.5, 27),
        (28, 27),
    ]
    outer_pts = [transform(x, y) for x, y in outer_pts_32]

    # Inner polygon path: M16 11 L12.5 19 H19.5 L16 11 Z
    inner_pts_32 = [
        (16, 11),
        (12.5, 19),
        (19.5, 19),
    ]
    inner_pts = [transform(x, y) for x, y in inner_pts_32]

    # Colors
    emerald = (8, 76, 56, 255) # #084c38
    white = (255, 255, 255, 255) # #ffffff

    # Draw outer emerald shape
    draw.polygon(outer_pts, fill=emerald)

    # Draw inner white triangle
    draw.polygon(inner_pts, fill=white)

    # Downsample with LANCZOS for high quality antialiasing
    resampled = img.resize((size, size), Image.Resampling.LANCZOS)
    return resampled

def main():
    frontend_dir = os.path.abspath("c:/Users/mruna/Downloads/Examp_Forge/frontend")
    public_dir = os.path.join(frontend_dir, "public")
    app_dir = os.path.join(frontend_dir, "src", "app")

    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(app_dir, exist_ok=True)

    # 1. Generate PNG sizes
    img_512 = draw_aptora_logo(512)
    img_512.save(os.path.join(public_dir, "favicon.png"), "PNG")

    img_180 = draw_aptora_logo(180, bg_color=(250, 249, 246, 255)) # Warm off-white #FAF9F6 for Apple Touch Icon
    img_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

    # 2. Generate multi-size ICO
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_imgs = [draw_aptora_logo(s[0]) for s in ico_sizes]
    
    ico_path = os.path.join(public_dir, "favicon.ico")
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_imgs[1:]
    )

    # 3. SVG Content
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <path d="M16 3L4 27H11.5L16 17.5L20.5 27H28L16 3Z" fill="#084c38" />
  <path d="M16 11L12.5 19H19.5L16 11Z" fill="#ffffff" />
</svg>
'''
    with open(os.path.join(public_dir, "favicon.svg"), "w", encoding="utf-8") as f:
      f.write(svg_content)

    with open(os.path.join(app_dir, "icon.svg"), "w", encoding="utf-8") as f:
      f.write(svg_content)

    with open(os.path.join(app_dir, "apple-icon.svg"), "w", encoding="utf-8") as f:
      f.write(svg_content)

    print("Successfully generated all favicons for Aptora!")

if __name__ == "__main__":
    main()
