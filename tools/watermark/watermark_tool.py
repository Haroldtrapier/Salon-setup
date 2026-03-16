#!/usr/bin/env python3
"""
Video Watermark Tool
====================
Remove existing watermarks from videos and add your own custom watermark.

Methods for watermark removal:
  - delogo:   FFmpeg's delogo filter (fast, good for solid-color watermarks)
  - blur:     Gaussian blur over the watermark region
  - inpaint:  OpenCV inpainting (best quality, slower)

Watermark addition supports:
  - Image watermarks (PNG with transparency recommended)
  - Text watermarks with customizable font, size, color, and opacity

Usage examples:
  # Remove a watermark from a region (x, y, width, height)
  python watermark_tool.py remove input.mp4 output.mp4 --region 10 10 200 60

  # Remove watermark using inpainting for better quality
  python watermark_tool.py remove input.mp4 output.mp4 --region 10 10 200 60 --method inpaint

  # Add an image watermark (bottom-right, 30% opacity)
  python watermark_tool.py add input.mp4 output.mp4 --image logo.png --position bottom-right --opacity 0.3

  # Add a text watermark
  python watermark_tool.py add input.mp4 output.mp4 --text "My Brand" --position bottom-right --fontsize 36 --color white --opacity 0.5

  # Full pipeline: remove old watermark then add yours
  python watermark_tool.py pipeline input.mp4 output.mp4 \
      --region 10 10 200 60 --remove-method inpaint \
      --text "My Brand" --position bottom-right --opacity 0.5
"""

import argparse
import os
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


def run_ffmpeg(args: list[str], description: str = "Processing"):
    """Run an FFmpeg command with error handling."""
    cmd = ["ffmpeg", "-y"] + args
    print(f"  [ffmpeg] {description}...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [error] FFmpeg failed:\n{result.stderr[:1000]}")
        sys.exit(1)
    return result


def get_video_info(path: str) -> dict:
    """Get video dimensions and FPS using ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_streams", "-show_format", path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error reading video info: {result.stderr[:500]}")
        sys.exit(1)

    import json
    data = json.loads(result.stdout)
    for stream in data.get("streams", []):
        if stream.get("codec_type") == "video":
            fps_parts = stream.get("r_frame_rate", "30/1").split("/")
            fps = float(fps_parts[0]) / float(fps_parts[1]) if len(fps_parts) == 2 else 30.0
            return {
                "width": int(stream["width"]),
                "height": int(stream["height"]),
                "fps": fps,
                "duration": float(data.get("format", {}).get("duration", 0)),
                "codec": stream.get("codec_name", "h264"),
            }
    print("Error: No video stream found.")
    sys.exit(1)


# ─── Watermark Removal ──────────────────────────────────────────────────────────

def remove_watermark_delogo(input_path: str, output_path: str, region: tuple[int, int, int, int]):
    """Remove watermark using FFmpeg's delogo filter (fast)."""
    x, y, w, h = region
    run_ffmpeg(
        ["-i", input_path, "-vf", f"delogo=x={x}:y={y}:w={w}:h={h}:show=0",
         "-c:a", "copy", output_path],
        f"Removing watermark at ({x},{y}) {w}x{h} using delogo"
    )


def remove_watermark_blur(input_path: str, output_path: str, region: tuple[int, int, int, int],
                           blur_strength: int = 15):
    """Remove watermark by applying a Gaussian blur over the region."""
    x, y, w, h = region
    sigma = max(1, blur_strength)
    crop_filter = f"split[main][blur];[blur]crop={w}:{h}:{x}:{y},gblur=sigma={sigma}[blurred];[main][blurred]overlay={x}:{y}"
    run_ffmpeg(
        ["-i", input_path, "-filter_complex", crop_filter, "-c:a", "copy", output_path],
        f"Blurring watermark region at ({x},{y}) {w}x{h}"
    )


def remove_watermark_inpaint(input_path: str, output_path: str, region: tuple[int, int, int, int],
                              inpaint_radius: int = 5):
    """Remove watermark using OpenCV inpainting (best quality, frame-by-frame)."""
    x, y, w, h = region
    info = get_video_info(input_path)
    margin = 3

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print("Error: Cannot open video file.")
        sys.exit(1)

    tmp_dir = tempfile.mkdtemp()
    tmp_video = os.path.join(tmp_dir, "inpainted.mp4")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(tmp_video, fourcc, info["fps"], (info["width"], info["height"]))

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"  [inpaint] Processing {total} frames...")

    mask = np.zeros((info["height"], info["width"]), dtype=np.uint8)
    y1, y2 = max(0, y - margin), min(info["height"], y + h + margin)
    x1, x2 = max(0, x - margin), min(info["width"], x + w + margin)
    mask[y1:y2, x1:x2] = 255

    frame_num = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_num += 1
        if frame_num % 100 == 0:
            print(f"  [inpaint] Frame {frame_num}/{total} ({100*frame_num//total}%)")

        result = cv2.inpaint(frame, mask, inpaint_radius, cv2.INPAINT_TELEA)
        out.write(result)

    cap.release()
    out.release()

    run_ffmpeg(
        ["-i", tmp_video, "-i", input_path, "-map", "0:v", "-map", "1:a?",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "copy",
         "-movflags", "+faststart", output_path],
        "Re-encoding with original audio"
    )

    shutil.rmtree(tmp_dir, ignore_errors=True)


def remove_watermark(input_path: str, output_path: str, region: tuple[int, int, int, int],
                     method: str = "delogo", **kwargs):
    """Remove watermark using the specified method."""
    print(f"\n{'='*60}")
    print(f"  Watermark Removal ({method})")
    print(f"  Input:  {input_path}")
    print(f"  Output: {output_path}")
    print(f"  Region: x={region[0]}, y={region[1]}, w={region[2]}, h={region[3]}")
    print(f"{'='*60}")

    if method == "delogo":
        remove_watermark_delogo(input_path, output_path, region)
    elif method == "blur":
        remove_watermark_blur(input_path, output_path, region, kwargs.get("blur_strength", 25))
    elif method == "inpaint":
        remove_watermark_inpaint(input_path, output_path, region, kwargs.get("inpaint_radius", 5))
    else:
        print(f"Unknown removal method: {method}")
        sys.exit(1)

    print(f"  Done! Saved to: {output_path}\n")


# ─── Watermark Addition ─────────────────────────────────────────────────────────

POSITION_MAP = {
    "top-left":      "10:10",
    "top-center":    "(W-w)/2:10",
    "top-right":     "W-w-10:10",
    "center":        "(W-w)/2:(H-h)/2",
    "bottom-left":   "10:H-h-10",
    "bottom-center": "(W-w)/2:H-h-10",
    "bottom-right":  "W-w-10:H-h-10",
}


def create_text_watermark_image(text: str, fontsize: int, color: str, width: int, height: int,
                                 opacity: float = 0.5, padding: int = 20) -> str:
    """Render text watermark to a transparent PNG."""
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", fontsize)
    except (OSError, IOError):
        font = ImageFont.load_default()

    tmp = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tmp)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0] + padding * 2
    text_h = bbox[3] - bbox[1] + padding * 2

    img = Image.new("RGBA", (text_w, text_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    color_map = {
        "white": (255, 255, 255), "black": (0, 0, 0), "red": (255, 0, 0),
        "green": (0, 255, 0), "blue": (0, 0, 255), "yellow": (255, 255, 0),
        "gray": (128, 128, 128), "grey": (128, 128, 128),
    }
    rgb = color_map.get(color.lower(), (255, 255, 255))
    alpha = int(255 * opacity)

    shadow_offset = max(1, fontsize // 20)
    draw.text((padding + shadow_offset, padding + shadow_offset - bbox[1]),
              text, font=font, fill=(0, 0, 0, alpha // 2))
    draw.text((padding, padding - bbox[1]), text, font=font, fill=(*rgb, alpha))

    tmp_path = tempfile.mktemp(suffix=".png")
    img.save(tmp_path, "PNG")
    return tmp_path


def add_watermark_image(input_path: str, output_path: str, watermark_path: str,
                        position: str = "bottom-right", opacity: float = 0.3,
                        scale: float | None = None):
    """Add an image watermark to the video."""
    pos = POSITION_MAP.get(position, position)

    scale_filter = ""
    if scale:
        scale_filter = f",scale=iw*{scale}:ih*{scale}"

    vf = (f"movie='{watermark_path}'{scale_filter},format=rgba,"
          f"colorchannelmixer=aa={opacity}[wm];[in][wm]overlay={pos}[out]")

    run_ffmpeg(
        ["-i", input_path, "-vf", vf, "-c:a", "copy",
         "-movflags", "+faststart", output_path],
        f"Adding image watermark at {position}"
    )


def add_watermark_text(input_path: str, output_path: str, text: str,
                       position: str = "bottom-right", opacity: float = 0.5,
                       fontsize: int = 36, color: str = "white", scale: float | None = None):
    """Add a text watermark to the video."""
    info = get_video_info(input_path)
    wm_path = create_text_watermark_image(
        text, fontsize, color, info["width"], info["height"], opacity
    )

    try:
        add_watermark_image(input_path, output_path, wm_path, position, opacity=1.0, scale=scale)
    finally:
        os.unlink(wm_path)


def add_watermark(input_path: str, output_path: str, watermark_image: str | None = None,
                  text: str | None = None, position: str = "bottom-right",
                  opacity: float = 0.5, fontsize: int = 36, color: str = "white",
                  scale: float | None = None):
    """Add a watermark (image or text) to the video."""
    wm_type = "image" if watermark_image else "text"
    wm_label = watermark_image or f'"{text}"'
    print(f"\n{'='*60}")
    print(f"  Watermark Addition ({wm_type})")
    print(f"  Input:    {input_path}")
    print(f"  Output:   {output_path}")
    print(f"  Content:  {wm_label}")
    print(f"  Position: {position}")
    print(f"  Opacity:  {opacity}")
    print(f"{'='*60}")

    if watermark_image:
        add_watermark_image(input_path, output_path, watermark_image, position, opacity, scale)
    elif text:
        add_watermark_text(input_path, output_path, text, position, opacity, fontsize, color, scale)
    else:
        print("Error: Provide either --image or --text for watermark.")
        sys.exit(1)

    print(f"  Done! Saved to: {output_path}\n")


# ─── Pipeline (Remove + Add) ────────────────────────────────────────────────────

def pipeline(input_path: str, output_path: str, region: tuple[int, int, int, int],
             remove_method: str = "delogo", watermark_image: str | None = None,
             text: str | None = None, position: str = "bottom-right",
             opacity: float = 0.5, fontsize: int = 36, color: str = "white",
             scale: float | None = None, **kwargs):
    """Full pipeline: remove existing watermark then add a new one."""
    print(f"\n{'#'*60}")
    print(f"  Full Watermark Pipeline")
    print(f"  Step 1: Remove existing watermark ({remove_method})")
    print(f"  Step 2: Add new watermark")
    print(f"{'#'*60}")

    tmp = tempfile.mktemp(suffix=".mp4")

    try:
        remove_watermark(input_path, tmp, region, remove_method, **kwargs)
        add_watermark(tmp, output_path, watermark_image, text, position, opacity, fontsize, color, scale)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)

    print(f"\n  Pipeline complete! Final output: {output_path}\n")


# ─── Preview / Detection Helper ─────────────────────────────────────────────────

def preview_region(input_path: str, region: tuple[int, int, int, int], output_image: str = "preview.png"):
    """Extract a single frame and draw the watermark region for preview."""
    x, y, w, h = region
    cap = cv2.VideoCapture(input_path)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("Error: Cannot read video frame.")
        sys.exit(1)

    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
    cv2.putText(frame, "Watermark Region", (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    cv2.imwrite(output_image, frame)
    print(f"Preview saved to: {output_image}")
    print(f"Region: x={x}, y={y}, w={w}, h={h}")


# ─── CLI ─────────────────────────────────────────────────────────────────────────

def build_parser():
    parser = argparse.ArgumentParser(
        description="Video Watermark Tool — Remove and add watermarks",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    sub = parser.add_subparsers(dest="command", help="Command to run")

    # Remove
    rm = sub.add_parser("remove", help="Remove an existing watermark")
    rm.add_argument("input", help="Input video file")
    rm.add_argument("output", help="Output video file")
    rm.add_argument("--region", nargs=4, type=int, required=True,
                    metavar=("X", "Y", "W", "H"),
                    help="Watermark region: x y width height (pixels)")
    rm.add_argument("--method", choices=["delogo", "blur", "inpaint"], default="delogo",
                    help="Removal method (default: delogo)")
    rm.add_argument("--blur-strength", type=int, default=25,
                    help="Blur strength for blur method (default: 25)")
    rm.add_argument("--inpaint-radius", type=int, default=5,
                    help="Inpaint radius for inpaint method (default: 5)")

    # Add
    ad = sub.add_parser("add", help="Add a watermark to a video")
    ad.add_argument("input", help="Input video file")
    ad.add_argument("output", help="Output video file")
    wm_group = ad.add_mutually_exclusive_group(required=True)
    wm_group.add_argument("--image", help="Path to watermark image (PNG recommended)")
    wm_group.add_argument("--text", help="Text for watermark")
    ad.add_argument("--position", default="bottom-right",
                    choices=list(POSITION_MAP.keys()),
                    help="Watermark position (default: bottom-right)")
    ad.add_argument("--opacity", type=float, default=0.5,
                    help="Watermark opacity 0.0-1.0 (default: 0.5)")
    ad.add_argument("--fontsize", type=int, default=36,
                    help="Font size for text watermark (default: 36)")
    ad.add_argument("--color", default="white",
                    help="Text color (default: white)")
    ad.add_argument("--scale", type=float, default=None,
                    help="Scale factor for watermark image (e.g. 0.5 for half size)")

    # Pipeline
    pl = sub.add_parser("pipeline", help="Remove existing watermark and add a new one")
    pl.add_argument("input", help="Input video file")
    pl.add_argument("output", help="Output video file")
    pl.add_argument("--region", nargs=4, type=int, required=True,
                    metavar=("X", "Y", "W", "H"),
                    help="Region of watermark to remove: x y width height")
    pl.add_argument("--remove-method", choices=["delogo", "blur", "inpaint"], default="delogo",
                    help="Removal method (default: delogo)")
    wm_group2 = pl.add_mutually_exclusive_group(required=True)
    wm_group2.add_argument("--image", help="Path to watermark image")
    wm_group2.add_argument("--text", help="Text for new watermark")
    pl.add_argument("--position", default="bottom-right",
                    choices=list(POSITION_MAP.keys()),
                    help="New watermark position (default: bottom-right)")
    pl.add_argument("--opacity", type=float, default=0.5,
                    help="Watermark opacity (default: 0.5)")
    pl.add_argument("--fontsize", type=int, default=36,
                    help="Font size for text watermark (default: 36)")
    pl.add_argument("--color", default="white",
                    help="Text color (default: white)")
    pl.add_argument("--scale", type=float, default=None,
                    help="Scale factor for watermark image")

    # Preview
    pv = sub.add_parser("preview", help="Preview a watermark region on a frame")
    pv.add_argument("input", help="Input video file")
    pv.add_argument("--region", nargs=4, type=int, required=True,
                    metavar=("X", "Y", "W", "H"),
                    help="Region to preview: x y width height")
    pv.add_argument("--output", default="preview.png",
                    help="Output preview image (default: preview.png)")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command in ("remove", "add", "pipeline"):
        if not os.path.isfile(args.input):
            print(f"Error: Input file not found: {args.input}")
            sys.exit(1)

    if args.command == "remove":
        remove_watermark(args.input, args.output, tuple(args.region), args.method,
                         blur_strength=args.blur_strength, inpaint_radius=args.inpaint_radius)

    elif args.command == "add":
        add_watermark(args.input, args.output, args.image, args.text,
                      args.position, args.opacity, args.fontsize, args.color, args.scale)

    elif args.command == "pipeline":
        pipeline(args.input, args.output, tuple(args.region), args.remove_method,
                 args.image, args.text, args.position, args.opacity, args.fontsize, args.color,
                 args.scale)

    elif args.command == "preview":
        if not os.path.isfile(args.input):
            print(f"Error: Input file not found: {args.input}")
            sys.exit(1)
        preview_region(args.input, tuple(args.region), args.output)


if __name__ == "__main__":
    main()
