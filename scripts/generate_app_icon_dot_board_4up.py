from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


BG = (236, 254, 255)
CARD_BG = (255, 255, 255)
CARD_LINE = (205, 234, 239)
INK = (22, 78, 99)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def blend(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def gradient_fill(size: int, c1: tuple[int, int, int], c2: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        draw.line([(0, y), (size, y)], fill=blend(c1, c2, t) + (255,))
    return img


def rounded_bg(size: int, c1: tuple[int, int, int], c2: tuple[int, int, int]) -> Image.Image:
    bg = gradient_fill(size, c1, c2)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=56, fill=255)
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(bg, (0, 0), mask)
    return icon


def load_brand_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates: Iterable[Path] = (
        Path("docs/design/fonts/ZCOOLKuaiLe-Regular.ttf"),
        Path(r"C:\Windows\Fonts\simkai.ttf"),
    )
    for path in candidates:
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_dot_glyph(
    canvas: Image.Image,
    fg_color: tuple[int, int, int],
    stroke_color: tuple[int, int, int] | None = None,
    glow: bool = False,
):
    d = ImageDraw.Draw(canvas)
    # Keep icon-3 layout structure: inner rounded plate + centered glyph.
    d.rounded_rectangle(
        (44, 44, 212, 212),
        radius=46,
        fill=(255, 255, 255, 34),
        outline=(255, 255, 255, 90),
        width=2,
    )

    plate = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle((58, 60, 198, 198), radius=38, fill=(255, 255, 255, 232))
    pd.rounded_rectangle((58, 60, 198, 198), radius=38, outline=(214, 236, 241, 255), width=3)
    canvas.alpha_composite(plate)

    font = load_brand_font(114)
    text = "点"
    cx, cy = 128, 130
    # soft shadow for volume
    d.text((cx + 2, cy + 3), text, font=font, fill=(8, 66, 86, 110), anchor="mm")
    if stroke_color is not None:
        d.text(
            (cx, cy),
            text,
            font=font,
            fill=fg_color,
            anchor="mm",
            stroke_width=2,
            stroke_fill=stroke_color,
        )
    else:
        d.text((cx, cy), text, font=font, fill=fg_color, anchor="mm")

    if glow:
        glow_layer = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_layer)
        gd.ellipse((102, 168, 154, 210), fill=(255, 255, 255, 120))
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(6))
        canvas.alpha_composite(glow_layer)


def create_icon(
    c1: tuple[int, int, int],
    c2: tuple[int, int, int],
    fg_color: tuple[int, int, int],
    stroke_color: tuple[int, int, int] | None = None,
    glow: bool = False,
) -> Image.Image:
    icon = rounded_bg(256, c1, c2)
    draw_dot_glyph(icon, fg_color=fg_color, stroke_color=stroke_color, glow=glow)
    return icon


def add_shadow(icon: Image.Image) -> Image.Image:
    size = icon.size[0]
    canvas = Image.new("RGBA", (size + 24, size + 28), (0, 0, 0, 0))
    mask = icon.split()[3]
    shadow = Image.new("RGBA", icon.size, (12, 53, 71, 112))
    canvas.paste(shadow, (12, 14), mask)
    canvas = canvas.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(icon, (0, 0), icon)
    return canvas


def build_board(out_path: Path):
    # Palette A: like old icon #2 (teal-cyan)
    p2_a = ((4, 120, 150), (34, 197, 175))
    # Palette B: like old icon #7 (cyan-green)
    p7_a = ((8, 145, 178), (5, 150, 105))

    variants = [
        ("A1", create_icon(*p2_a, fg_color=(7, 92, 115), stroke_color=(225, 247, 252))),
        ("A2", create_icon(*p2_a, fg_color=(29, 193, 114), stroke_color=(230, 250, 253), glow=True)),
        ("B1", create_icon(*p7_a, fg_color=(9, 94, 120), stroke_color=(227, 250, 252))),
        ("B2", create_icon(*p7_a, fg_color=(5, 134, 95), stroke_color=(231, 255, 242), glow=True)),
    ]

    card_w = 332
    card_h = 372
    cols = 2
    rows = 2
    gap = 26
    margin = 34
    width = margin * 2 + cols * card_w + (cols - 1) * gap
    height = margin * 2 + rows * card_h + (rows - 1) * gap

    board = Image.new("RGBA", (width, height), BG + (255,))
    d = ImageDraw.Draw(board)
    tag_font = ImageFont.load_default()
    hint_font = ImageFont.load_default()

    for idx, (tag, icon) in enumerate(variants):
        r = idx // cols
        c = idx % cols
        x = margin + c * (card_w + gap)
        y = margin + r * (card_h + gap)

        d.rounded_rectangle((x, y, x + card_w, y + card_h), radius=28, fill=CARD_BG, outline=CARD_LINE, width=2)
        d.rounded_rectangle((x + 14, y + 14, x + 74, y + 44), radius=12, fill=(8, 145, 178, 30))
        d.text((x + 44, y + 29), tag, fill=INK, font=tag_font, anchor="mm")

        with_shadow = add_shadow(icon)
        ix = x + (card_w - with_shadow.width) // 2
        iy = y + 56
        board.paste(with_shadow, (ix, iy), with_shadow)

        d.text((x + card_w // 2, y + card_h - 22), "点 · 品牌字形", fill=(70, 102, 114), font=hint_font, anchor="mm")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    board.convert("RGB").save(out_path, "PNG")


if __name__ == "__main__":
    output = Path("docs/design/app_icon_dot_candidates_4up.png")
    build_board(output)
    print(output.resolve())
