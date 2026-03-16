import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const TEMP_DIR = join(process.cwd(), "tmp", "watermark");
const PYTHON_SCRIPT = join(
  process.cwd(),
  "tools",
  "watermark",
  "watermark_tool.py"
);

async function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

async function cleanup(...files: string[]) {
  for (const f of files) {
    try {
      if (existsSync(f)) await unlink(f);
    } catch {
      /* best effort */
    }
  }
}

export async function POST(request: NextRequest) {
  await ensureTempDir();

  const id = randomUUID();
  const inputPath = join(TEMP_DIR, `${id}-input.mp4`);
  const outputPath = join(TEMP_DIR, `${id}-output.mp4`);
  const watermarkPath = join(TEMP_DIR, `${id}-watermark.png`);
  const filesToClean = [inputPath, outputPath, watermarkPath];

  try {
    const formData = await request.formData();

    const videoBlob = formData.get("video") as File | null;
    if (!videoBlob) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    await writeFile(inputPath, videoBuffer);

    const mode = (formData.get("mode") as string) || "pipeline";

    const args: string[] = ["python3", PYTHON_SCRIPT];

    if (mode === "remove") {
      const region = JSON.parse(
        (formData.get("region") as string) || '{"x":10,"y":10,"w":200,"h":60}'
      );
      const method = (formData.get("removalMethod") as string) || "delogo";

      args.push(
        "remove",
        inputPath,
        outputPath,
        "--region",
        String(region.x),
        String(region.y),
        String(region.w),
        String(region.h),
        "--method",
        method
      );
    } else if (mode === "add") {
      const watermarkType =
        (formData.get("watermarkType") as string) || "text";
      const position =
        (formData.get("position") as string) || "bottom-right";
      const opacity = (formData.get("opacity") as string) || "0.5";

      args.push("add", inputPath, outputPath);

      if (watermarkType === "text") {
        const text = (formData.get("text") as string) || "Watermark";
        const fontSize = (formData.get("fontSize") as string) || "36";
        const color = (formData.get("color") as string) || "white";
        args.push(
          "--text",
          text,
          "--fontsize",
          fontSize,
          "--color",
          color
        );
      } else {
        const wmImageBlob = formData.get("watermarkImage") as File | null;
        if (wmImageBlob) {
          const wmBuffer = Buffer.from(await wmImageBlob.arrayBuffer());
          await writeFile(watermarkPath, wmBuffer);
          args.push("--image", watermarkPath);
        } else {
          return NextResponse.json(
            { error: "No watermark image provided" },
            { status: 400 }
          );
        }
      }

      args.push("--position", position, "--opacity", opacity);
    } else if (mode === "pipeline") {
      const region = JSON.parse(
        (formData.get("region") as string) || '{"x":10,"y":10,"w":200,"h":60}'
      );
      const removeMethod =
        (formData.get("removalMethod") as string) || "delogo";
      const watermarkType =
        (formData.get("watermarkType") as string) || "text";
      const position =
        (formData.get("position") as string) || "bottom-right";
      const opacity = (formData.get("opacity") as string) || "0.5";

      args.push(
        "pipeline",
        inputPath,
        outputPath,
        "--region",
        String(region.x),
        String(region.y),
        String(region.w),
        String(region.h),
        "--remove-method",
        removeMethod
      );

      if (watermarkType === "text") {
        const text = (formData.get("text") as string) || "Watermark";
        const fontSize = (formData.get("fontSize") as string) || "36";
        const color = (formData.get("color") as string) || "white";
        args.push(
          "--text",
          text,
          "--fontsize",
          fontSize,
          "--color",
          color
        );
      } else {
        const wmImageBlob = formData.get("watermarkImage") as File | null;
        if (wmImageBlob) {
          const wmBuffer = Buffer.from(await wmImageBlob.arrayBuffer());
          await writeFile(watermarkPath, wmBuffer);
          args.push("--image", watermarkPath);
        } else {
          return NextResponse.json(
            { error: "No watermark image provided" },
            { status: 400 }
          );
        }
      }

      args.push("--position", position, "--opacity", opacity);
    }

    const [command, ...commandArgs] = args;
    const { stdout, stderr } = await execFileAsync(command, commandArgs, {
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr) {
      console.log("[watermark] stderr:", stderr);
    }
    if (stdout) {
      console.log("[watermark] stdout:", stdout);
    }

    if (!existsSync(outputPath)) {
      return NextResponse.json(
        { error: "Processing failed - no output generated" },
        { status: 500 }
      );
    }

    const outputBuffer = await readFile(outputPath);

    await cleanup(...filesToClean);

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="watermarked-video.mp4"',
        "Content-Length": String(outputBuffer.length),
      },
    });
  } catch (error) {
    await cleanup(...filesToClean);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[watermark] Error:", message);

    return NextResponse.json(
      { error: `Processing failed: ${message}` },
      { status: 500 }
    );
  }
}
