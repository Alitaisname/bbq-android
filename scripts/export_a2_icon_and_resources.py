from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


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
    md.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255)
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(bg, (0, 0), mask)
    return icon


def load_brand_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("docs/design/fonts/ZCOOLKuaiLe-Regular.ttf"),
        Path(r"C:\Windows\Fonts\simkai.ttf"),
    ]
    for path in candidates:
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_a2_foreground(size: int) -> Image.Image:
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(fg)

    plate_left = int(size * 0.23)
    plate_top = int(size * 0.23)
    plate_right = int(size * 0.77)
    plate_bottom = int(size * 0.77)
    radius = int(size * 0.15)

    d.rounded_rectangle(
        (plate_left, plate_top, plate_right, plate_bottom),
        radius=radius,
        fill=(255, 255, 255, 232),
        outline=(214, 236, 241, 255),
        width=max(2, size // 85),
    )

    font = load_brand_font(int(size * 0.45))
    cx, cy = size // 2, int(size * 0.51)
    d.text((cx + size * 0.01, cy + size * 0.016), "点", font=font, fill=(8, 66, 86, 110), anchor="mm")
    d.text(
        (cx, cy),
        "点",
        font=font,
        fill=(29, 193, 114),  # #1dc172
        anchor="mm",
        stroke_width=max(1, size // 180),
        stroke_fill=(230, 250, 253),
    )
    return fg


def create_a2_icon(size: int) -> Image.Image:
    # Blue-cyan body as overall icon base.
    c1, c2 = (4, 120, 150), (34, 197, 175)
    icon = rounded_bg(size, c1, c2)
    icon.alpha_composite(draw_a2_foreground(size))
    return icon


def create_a2_icon_with_safe_padding(size: int, inset_ratio: float = 0.14) -> Image.Image:
    # Keep transparent safe area to reduce launcher mask clipping on some devices.
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner = max(1, int(size * (1.0 - inset_ratio * 2)))
    icon = create_a2_icon(inner)
    offset = (size - inner) // 2
    canvas.paste(icon, (offset, offset), icon)
    return canvas


def main() -> None:
    single_out = Path("docs/design/app_icon_a2_single.png")
    android_full_out = Path("mobile/android_shell_v2/app/src/main/res/drawable-nodpi/ic_launcher_a2_full.png")
    res_root = Path("mobile/android_shell_v2/app/src/main/res")
    single_out.parent.mkdir(parents=True, exist_ok=True)
    android_full_out.parent.mkdir(parents=True, exist_ok=True)

    # Design preview asset: final icon look.
    icon_1024 = create_a2_icon(1024)
    icon_1024.convert("RGBA").save(single_out, "PNG")

    # Android launcher full image (use whole icon image directly).
    icon_432 = create_a2_icon(432)
    icon_432.convert("RGBA").save(android_full_out, "PNG")

    # Legacy launcher icon set for launchers that ignore adaptive icons.
    legacy_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, px in legacy_sizes.items():
        out_dir = res_root / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        icon = create_a2_icon(px).convert("RGBA")
        icon.save(out_dir / "ic_launcher.png", "PNG")
        icon.save(out_dir / "ic_launcher_round.png", "PNG")
        # v2 names to bypass launcher icon cache and enforce updated asset.
        safe_icon = create_a2_icon_with_safe_padding(px).convert("RGBA")
        safe_icon.save(out_dir / "ic_launcher_v2.png", "PNG")
        safe_icon.save(out_dir / "ic_launcher_round_v2.png", "PNG")

    print(single_out.resolve())
    print(android_full_out.resolve())


if __name__ == "__main__":
    main()
