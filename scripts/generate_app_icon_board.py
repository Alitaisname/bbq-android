from __future__ import annotations

from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


PRIMARY = (8, 145, 178)
SECONDARY = (34, 211, 238)
ACCENT = (5, 150, 105)
BG = (236, 254, 255)
INK = (22, 78, 99)
WHITE = (250, 255, 255)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def blend(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def gradient_fill(size: int, c1: tuple[int, int, int], c2: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        color = blend(c1, c2, t) + (255,)
        draw.line([(0, y), (size, y)], fill=color)
    return img


def rounded_bg(size: int, c1: tuple[int, int, int], c2: tuple[int, int, int]) -> Image.Image:
    bg = gradient_fill(size, c1, c2)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=56, fill=255)
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(bg, (0, 0), mask)
    return icon


def draw_chopsticks(draw: ImageDraw.ImageDraw, p1: tuple[float, float], p2: tuple[float, float], width: int, color):
    draw.line([p1, p2], fill=color, width=width)
    draw.line([(p1[0] + 12, p1[1]), (p2[0] + 12, p2[1])], fill=color, width=width)


def icon_1(size: int) -> Image.Image:
    icon = rounded_bg(size, PRIMARY, SECONDARY)
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle((48, 66, 198, 176), radius=40, fill=WHITE, outline=(210, 240, 248), width=3)
    d.polygon([(110, 176), (138, 176), (118, 204)], fill=WHITE)
    draw_chopsticks(d, (128, 86), (184, 44), 8, (7, 99, 122))
    d.arc((78, 102, 166, 166), start=205, end=330, fill=ACCENT, width=7)
    d.arc((70, 112, 152, 176), start=210, end=320, fill=ACCENT, width=6)
    return icon


def icon_2(size: int) -> Image.Image:
    icon = rounded_bg(size, (4, 120, 150), (34, 197, 175))
    d = ImageDraw.Draw(icon)
    d.ellipse((42, 104, 214, 212), fill=WHITE, outline=(198, 234, 240), width=4)
    d.ellipse((70, 120, 186, 192), fill=(233, 251, 253), outline=(185, 227, 236), width=3)
    d.arc((72, 126, 184, 194), start=190, end=350, fill=(8, 145, 178), width=6)
    d.arc((88, 98, 180, 162), start=230, end=320, fill=WHITE, width=6)
    d.arc((110, 88, 194, 146), start=235, end=315, fill=WHITE, width=5)
    return icon


def icon_3(size: int) -> Image.Image:
    icon = rounded_bg(size, (37, 99, 235), (14, 165, 233))
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle((44, 44, 212, 212), radius=46, fill=(255, 255, 255, 34), outline=(255, 255, 255, 92), width=2)
    d.polygon([(64, 62), (108, 62), (128, 106), (149, 62), (193, 62), (152, 132), (152, 194), (103, 194), (103, 132)], fill=WHITE)
    d.rounded_rectangle((108, 138, 146, 194), radius=10, fill=(14, 165, 233))
    return icon


def icon_4(size: int) -> Image.Image:
    icon = rounded_bg(size, (14, 116, 144), (45, 212, 191))
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle((52, 52, 204, 204), radius=36, fill=WHITE, outline=(188, 232, 238), width=4)
    for x in (100, 148):
        d.line([(x, 72), (x, 184)], fill=(186, 221, 228), width=4)
    for y in (104, 136):
        d.line([(72, y), (184, y)], fill=(186, 221, 228), width=4)
    d.line([(88, 154), (112, 176), (170, 112)], fill=ACCENT, width=9, joint="curve")
    return icon


def icon_5(size: int) -> Image.Image:
    icon = rounded_bg(size, (3, 105, 161), (6, 182, 212))
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle((56, 120, 200, 194), radius=28, fill=WHITE, outline=(185, 226, 236), width=4)
    d.arc((68, 66, 188, 162), start=190, end=350, fill=WHITE, width=11)
    d.rounded_rectangle((114, 84, 142, 100), radius=7, fill=WHITE)
    d.polygon([(184, 62), (190, 78), (206, 84), (190, 90), (184, 106), (178, 90), (162, 84), (178, 78)], fill=(220, 250, 255))
    return icon


def icon_6(size: int) -> Image.Image:
    icon = rounded_bg(size, (8, 145, 178), (6, 182, 212))
    d = ImageDraw.Draw(icon)
    d.polygon([(128, 46), (198, 116), (128, 208), (58, 116)], fill=WHITE, outline=(190, 232, 240))
    d.ellipse((92, 80, 164, 152), fill=(231, 250, 252), outline=(173, 217, 226), width=3)
    d.line([(92, 126), (164, 126)], fill=(127, 176, 190), width=3)
    d.line([(114, 88), (114, 150)], fill=(127, 176, 190), width=3)
    d.ellipse((122, 108, 134, 120), fill=ACCENT)
    return icon


def icon_7(size: int) -> Image.Image:
    icon = rounded_bg(size, (8, 145, 178), (5, 150, 105))
    d = ImageDraw.Draw(icon)
    d.rounded_rectangle((52, 62, 206, 182), radius=38, fill=WHITE, outline=(181, 224, 229), width=4)
    d.polygon([(110, 182), (138, 182), (118, 210)], fill=WHITE)
    bolt = [(122, 86), (96, 136), (124, 136), (108, 176), (162, 120), (132, 120), (150, 86)]
    d.polygon(bolt, fill=(8, 145, 178))
    d.ellipse((66, 86, 90, 110), fill=(34, 211, 238))
    d.ellipse((168, 136, 188, 156), fill=(5, 150, 105))
    return icon


def icon_8(size: int) -> Image.Image:
    icon = rounded_bg(size, (15, 118, 110), (34, 197, 94))
    d = ImageDraw.Draw(icon)
    d.ellipse((48, 48, 208, 208), outline=WHITE, width=10)
    d.ellipse((78, 78, 178, 178), outline=(219, 248, 237), width=8)
    d.ellipse((106, 106, 150, 150), fill=WHITE)
    d.arc((58, 58, 198, 198), start=30, end=130, fill=(197, 248, 227), width=9)
    d.arc((58, 58, 198, 198), start=210, end=300, fill=(197, 248, 227), width=9)
    return icon


def add_shadow(icon: Image.Image) -> Image.Image:
    size = icon.size[0]
    canvas = Image.new("RGBA", (size + 24, size + 28), (0, 0, 0, 0))
    mask = icon.split()[3]
    shadow = Image.new("RGBA", icon.size, (12, 53, 71, 115))
    canvas.paste(shadow, (12, 14), mask)
    canvas = canvas.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(icon, (0, 0), icon)
    return canvas


def build_board(out_path: Path):
    icon_size = 256
    card_w = 300
    card_h = 348
    cols = 4
    rows = 2
    gap = 24
    margin = 34

    width = margin * 2 + cols * card_w + (cols - 1) * gap
    height = margin * 2 + rows * card_h + (rows - 1) * gap
    board = Image.new("RGBA", (width, height), BG + (255,))
    draw = ImageDraw.Draw(board)
    font = ImageFont.load_default()

    icon_fns: list[Callable[[int], Image.Image]] = [icon_1, icon_2, icon_3, icon_4, icon_5, icon_6, icon_7, icon_8]

    for idx, fn in enumerate(icon_fns):
        r = idx // cols
        c = idx % cols
        x = margin + c * (card_w + gap)
        y = margin + r * (card_h + gap)

        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=28, fill=(255, 255, 255), outline=(205, 234, 239), width=2)
        draw.rounded_rectangle((x + 12, y + 12, x + 66, y + 40), radius=12, fill=(8, 145, 178, 28))
        draw.text((x + 25, y + 20), f"{idx + 1}", fill=INK, font=font, anchor="mm")

        icon = add_shadow(fn(icon_size))
        ix = x + (card_w - icon.width) // 2
        iy = y + 52
        board.paste(icon, (ix, iy), icon)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    board.convert("RGB").save(out_path, "PNG")


if __name__ == "__main__":
    output = Path("docs/design/app_icon_candidates_8up.png")
    build_board(output)
    print(output.resolve())
