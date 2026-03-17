"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

type RemovalMethod = "delogo" | "blur" | "both";
type WatermarkType = "text" | "image";
type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

const positions: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const OVERLAY_POSITION_MAP: Record<Position, string> = {
  "top-left": "10:10",
  "top-center": "(W-w)/2:10",
  "top-right": "W-w-10:10",
  center: "(W-w)/2:(H-h)/2",
  "bottom-left": "10:H-h-10",
  "bottom-center": "(W-w)/2:H-h-10",
  "bottom-right": "W-w-10:H-h-10",
};

function createTextWatermarkPNG(
  text: string,
  fontSize: number,
  color: string,
  opacity: number
): Uint8Array {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const metrics = ctx.measureText(text);
  const pad = 20;
  canvas.width = Math.ceil(metrics.width) + pad * 2;
  canvas.height = fontSize + pad * 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const colorMap: Record<string, string> = {
    white: "255,255,255",
    black: "0,0,0",
    red: "255,0,0",
    green: "0,255,0",
    blue: "0,0,255",
    yellow: "255,255,0",
    gray: "128,128,128",
  };
  const rgb = colorMap[color.toLowerCase()] || "255,255,255";

  const shadow = Math.max(1, Math.floor(fontSize / 20));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;
  ctx.fillText(text, pad + shadow, pad + fontSize * 0.8 + shadow);
  ctx.fillStyle = `rgba(${rgb},${opacity})`;
  ctx.fillText(text, pad, pad + fontSize * 0.8);

  const dataUrl = canvas.toDataURL("image/png");
  const bin = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export default function WatermarkPage() {
  // Video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ w: 0, h: 0 });

  // Old watermark
  const [oldWatermarkText, setOldWatermarkText] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [removalMethod, setRemovalMethod] = useState<RemovalMethod>("both");
  const [frameImageUrl, setFrameImageUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // New watermark
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState("white");

  // State
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);

  // ── FFmpeg Loading ──
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegLoaded) return;
    setFfmpegLoading(true);
    setError(null);

    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => console.log("[ffmpeg]", message));
      ffmpeg.on("progress", ({ progress: p }) => {
        if (p > 0 && p <= 1) setProgress(`Processing... ${Math.round(p * 100)}%`);
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError("Failed to load the video engine. Click Retry or refresh the page.");
    } finally {
      setFfmpegLoading(false);
      setProgress("");
    }
  }, [ffmpegLoaded]);

  useEffect(() => { loadFFmpeg(); }, [loadFFmpeg]);

  // ── Extract first frame for region selection ──
  const extractFrame = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.src = url;

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0.5;
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      setVideoDimensions({ w: video.videoWidth, h: video.videoHeight });
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
      setFrameImageUrl(canvas.toDataURL("image/jpeg", 0.9));
      URL.revokeObjectURL(url);
    });
  }, []);

  // ── Video Upload ──
  const handleVideoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setVideoFile(file);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(URL.createObjectURL(file));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
      setError(null);
      setRegions([]);
      setCurrentRegion(null);
      extractFrame(file);
    },
    [videoPreviewUrl, resultUrl, extractFrame]
  );

  const handleWatermarkImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setWatermarkImageFile(file);
      if (watermarkImagePreview) URL.revokeObjectURL(watermarkImagePreview);
      setWatermarkImagePreview(URL.createObjectURL(file));
    },
    [watermarkImagePreview]
  );

  // ── Region Drawing on Frame ──
  const getScaledCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = frameCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = videoDimensions.w / rect.width;
    const scaleY = videoDimensions.h / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getScaledCoords(e);
    setDrawStart(coords);
    setCurrentRegion(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getScaledCoords(e);
    const x = Math.min(drawStart.x, coords.x);
    const y = Math.min(drawStart.y, coords.y);
    const w = Math.abs(coords.x - drawStart.x);
    const h = Math.abs(coords.y - drawStart.y);
    setCurrentRegion({ x, y, w, h });
    drawAllRegions([...regions, { x, y, w, h }]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRegion && currentRegion.w > 10 && currentRegion.h > 10) {
      setRegions((prev) => [...prev, currentRegion]);
    }
    setCurrentRegion(null);
    setIsDrawing(false);
  };

  const removeRegion = (index: number) => {
    const updated = regions.filter((_, i) => i !== index);
    setRegions(updated);
    drawAllRegions(updated);
  };

  const clearAllRegions = () => {
    setRegions([]);
    setCurrentRegion(null);
    drawAllRegions([]);
  };

  const REGION_COLORS = ["#ff0000", "#ff8800", "#cc00ff", "#0088ff", "#00cc44"];

  const drawAllRegions = (regionsToDraw: Region[]) => {
    const canvas = frameCanvasRef.current;
    if (!canvas || !frameImageUrl) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = frameImageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      regionsToDraw.forEach((r, i) => {
        if (r.w > 0 && r.h > 0) {
          const color = REGION_COLORS[i % REGION_COLORS.length];
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(r.x, r.y, r.w, r.h);
          ctx.setLineDash([]);
          ctx.fillStyle = color + "25";
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.fillStyle = color;
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`#${i + 1} (${r.w}x${r.h})`, r.x + 4, r.y - 8);
        }
      });
    };
  };

  useEffect(() => {
    if (frameImageUrl && frameCanvasRef.current) {
      const img = new Image();
      img.src = frameImageUrl;
      img.onload = () => {
        const canvas = frameCanvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [frameImageUrl]);

  // ── Processing ──
  const handleProcess = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    const ffmpeg = ffmpegRef.current;

    setProcessing(true);
    setProgress("Reading video...");
    setError(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    try {
      const videoData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", videoData);

      const hasRegions = regions.length > 0;

      // Step 1: Remove old watermarks (process each region)
      if (hasRegions) {
        for (let i = 0; i < regions.length; i++) {
          const { x, y, w, h } = regions[i];
          setProgress(`Removing watermark ${i + 1} of ${regions.length}...`);

          if (removalMethod === "delogo") {
            await ffmpeg.exec([
              "-i", "input.mp4",
              "-vf", `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`,
              "-c:a", "copy", "-preset", "ultrafast",
              "step_out.mp4",
            ]);
          } else if (removalMethod === "blur") {
            const sigma = 20;
            await ffmpeg.exec([
              "-i", "input.mp4",
              "-filter_complex",
              `split[main][blur];[blur]crop=${w}:${h}:${x}:${y},gblur=sigma=${sigma}[blurred];[main][blurred]overlay=${x}:${y}`,
              "-c:a", "copy", "-preset", "ultrafast",
              "step_out.mp4",
            ]);
          } else {
            await ffmpeg.exec([
              "-i", "input.mp4",
              "-vf", `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`,
              "-c:a", "copy", "-preset", "ultrafast",
              "delogoed.mp4",
            ]);
            const sigma = 12;
            await ffmpeg.exec([
              "-i", "delogoed.mp4",
              "-filter_complex",
              `split[main][blur];[blur]crop=${w}:${h}:${x}:${y},gblur=sigma=${sigma}[blurred];[main][blurred]overlay=${x}:${y}`,
              "-c:a", "copy", "-preset", "ultrafast",
              "step_out.mp4",
            ]);
            await ffmpeg.deleteFile("delogoed.mp4").catch(() => {});
          }

          await ffmpeg.deleteFile("input.mp4");
          await ffmpeg.rename("step_out.mp4", "input.mp4");
        }
      }

      // Step 2: Add new watermark
      const hasNewWatermark =
        (watermarkType === "text" && watermarkText.trim()) ||
        (watermarkType === "image" && watermarkImageFile);

      if (hasNewWatermark) {
        setProgress("Adding your watermark...");
        const pos = OVERLAY_POSITION_MAP[position];

        if (watermarkType === "text") {
          const wmData = createTextWatermarkPNG(watermarkText, fontSize, textColor, opacity);
          await ffmpeg.writeFile("watermark.png", wmData);
        } else if (watermarkImageFile) {
          const wmData = await fetchFile(watermarkImageFile);
          await ffmpeg.writeFile("watermark.png", wmData);
        }

        const opacityFilter = watermarkType === "text" ? "" : `,colorchannelmixer=aa=${opacity}`;

        await ffmpeg.exec([
          "-i", "input.mp4",
          "-i", "watermark.png",
          "-filter_complex",
          `[1:v]format=rgba${opacityFilter}[wm];[0:v][wm]overlay=${pos}[out]`,
          "-map", "[out]", "-map", "0:a?",
          "-c:a", "copy", "-preset", "ultrafast", "-movflags", "+faststart",
          "output.mp4",
        ]);

        const data = await ffmpeg.readFile("output.mp4");
        const bytes = new Uint8Array(data as Uint8Array);
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
        setResultUrl(URL.createObjectURL(blob));
      } else {
        // Only removal, no new watermark
        const data = await ffmpeg.readFile("input.mp4");
        const bytes = new Uint8Array(data as Uint8Array);
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
        setResultUrl(URL.createObjectURL(blob));
      }

      setProgress("Done!");
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "Processing failed. Try a shorter or smaller video.");
    } finally {
      setProcessing(false);
      try {
        await ffmpeg.deleteFile("input.mp4").catch(() => {});
        await ffmpeg.deleteFile("step_out.mp4").catch(() => {});
        await ffmpeg.deleteFile("delogoed.mp4").catch(() => {});
        await ffmpeg.deleteFile("output.mp4").catch(() => {});
        await ffmpeg.deleteFile("watermark.png").catch(() => {});
      } catch { /* cleanup */ }
    }
  };

  const canProcess = () => {
    if (!videoFile || !ffmpegLoaded) return false;
    const hasRegions = regions.length > 0;
    const hasNewWatermark =
      (watermarkType === "text" && watermarkText.trim()) ||
      (watermarkType === "image" && watermarkImageFile);
    return hasRegions || hasNewWatermark;
  };

  const getButtonLabel = () => {
    if (processing) return progress;
    if (!ffmpegLoaded && ffmpegLoading) return "Loading FFmpeg engine...";
    if (!ffmpegLoaded) return "FFmpeg engine not loaded";
    if (!videoFile) return "Upload a video first";
    const hasRegions = regions.length > 0;
    const hasNewWatermark =
      (watermarkType === "text" && watermarkText.trim()) ||
      (watermarkType === "image" && watermarkImageFile);
    if (!hasRegions && !hasNewWatermark) return "Draw boxes around old watermarks or add a new one";
    if (hasRegions && hasNewWatermark) return `Remove ${regions.length} Area${regions.length > 1 ? "s" : ""} & Add New Watermark`;
    if (hasRegions) return `Remove ${regions.length} Watermark Area${regions.length > 1 ? "s" : ""}`;
    return "Add New Watermark";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Video Watermark Tool
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Remove & replace
              <br />
              <span className="text-gray-400">watermarks</span>
            </h1>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Select the old watermark on your video, remove it, and add your own.
              Everything runs in your browser — nothing is uploaded.
            </p>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="pb-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {ffmpegLoading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading video engine (first load may take a moment)...
            </div>
          )}
          {ffmpegLoaded && !processing && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              Ready to process videos
            </div>
          )}
          {!ffmpegLoaded && !ffmpegLoading && error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
              <span>{error}</span>
              <button onClick={() => { setError(null); loadFFmpeg(); }} className="ml-4 px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-medium hover:bg-red-800 shrink-0">Retry</button>
            </div>
          )}
        </div>
      </section>

      {/* Main */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-4">Upload Video</h2>
            {!videoPreviewUrl ? (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full aspect-video max-h-64 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                <span className="text-sm text-gray-500 font-medium">Click to upload a video</span>
                <span className="text-xs text-gray-400">MP4, MOV, AVI, WebM</span>
              </button>
            ) : (
              <div className="relative">
                <video src={videoPreviewUrl} className="w-full rounded-xl max-h-64 object-contain bg-black" controls muted />
                <button
                  onClick={() => {
                    setVideoFile(null);
                    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                    setVideoPreviewUrl(null);
                    setFrameImageUrl(null);
                    setRegions([]);
                    setCurrentRegion(null);
                    if (resultUrl) URL.revokeObjectURL(resultUrl);
                    setResultUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
                {videoDimensions.w > 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                    {videoDimensions.w} x {videoDimensions.h}
                  </span>
                )}
              </div>
            )}
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
          </div>

          {videoFile && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* ── STEP 1: Old Watermark ── */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold">1</span>
                    <h2 className="font-bold text-lg">Old Watermark to Remove</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        What does the old watermark say?
                      </label>
                      <input
                        type="text"
                        value={oldWatermarkText}
                        onChange={(e) => setOldWatermarkText(e.target.value)}
                        placeholder="e.g. StockFootage.com, Shutterstock, etc."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <p className="text-xs text-gray-400 mt-1">For your reference — helps you identify it on the frame below.</p>
                    </div>

                    {frameImageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Draw a box around the old watermark
                        </label>
                        <div ref={frameContainerRef} className="relative rounded-xl overflow-hidden border-2 border-gray-200 cursor-crosshair">
                          <canvas
                            ref={frameCanvasRef}
                            className="w-full h-auto"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Click and drag on the image above to select the watermark area. The red box shows what will be removed.
                        </p>
                      </div>
                    )}

                    {regions.length > 0 && (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Selected areas ({regions.length})</span>
                            <button onClick={clearAllRegions} className="text-xs text-red-500 hover:text-red-700 underline">Clear all</button>
                          </div>
                          <div className="space-y-1.5">
                            {regions.map((r, i) => (
                              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }} />
                                <span className="text-sm font-medium">Area {i + 1}</span>
                                <span className="font-mono text-xs text-gray-500">{r.w}x{r.h} at ({r.x},{r.y})</span>
                                <button onClick={() => removeRegion(i)} className="ml-auto text-gray-400 hover:text-red-500">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Draw more boxes to select additional watermark areas.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Removal Method</label>
                          <div className="space-y-2">
                            {([
                              { value: "both" as const, label: "Delogo + Blur (recommended)", desc: "Two-pass removal for thorough cleaning" },
                              { value: "delogo" as const, label: "Delogo only", desc: "Fast, good for simple watermarks" },
                              { value: "blur" as const, label: "Blur only", desc: "Heavy blur over the area" },
                            ]).map((m) => (
                              <label key={m.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${removalMethod === m.value ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                                <input type="radio" name="removalMethod" value={m.value} checked={removalMethod === m.value} onChange={() => setRemovalMethod(m.value)} className="mt-0.5 accent-black" />
                                <div>
                                  <span className="text-sm font-medium">{m.label}</span>
                                  <p className="text-xs text-gray-500">{m.desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── STEP 2: New Watermark ── */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">2</span>
                    <h2 className="font-bold text-lg">Your New Watermark</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button onClick={() => setWatermarkType("text")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${watermarkType === "text" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Text</button>
                      <button onClick={() => setWatermarkType("image")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${watermarkType === "image" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Image</button>
                    </div>

                    {watermarkType === "text" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                          <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="GovconCommandCenter.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                            <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 36)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <select value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10">
                              {["white", "black", "red", "blue", "green", "yellow", "gray"].map((c) => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Image</label>
                        {!watermarkImagePreview ? (
                          <button onClick={() => imageInputRef.current?.click()} className="w-full py-8 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                            <span className="text-sm text-gray-500">Upload logo / watermark image</span>
                            <span className="text-xs text-gray-400">PNG with transparency recommended</span>
                          </button>
                        ) : (
                          <div className="relative inline-block">
                            <img src={watermarkImagePreview} alt="Watermark" className="max-h-24 rounded-lg border border-gray-200" />
                            <button onClick={() => { setWatermarkImageFile(null); if (watermarkImagePreview) URL.revokeObjectURL(watermarkImagePreview); setWatermarkImagePreview(null); }} className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        )}
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleWatermarkImageSelect} />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {positions.map((p) => (
                          <button key={p.value} onClick={() => setPosition(p.value)} className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${position === p.value ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p.label}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                      <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          {videoFile && (
            <Button size="lg" className="w-full" disabled={!canProcess() || processing} onClick={handleProcess}>
              {(processing || ffmpegLoading) && (
                <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              )}
              {getButtonLabel()}
            </Button>
          )}

          {error && ffmpegLoaded && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
          )}

          {/* Result */}
          {resultUrl && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-lg mb-4">Result</h2>
              <video src={resultUrl} className="w-full rounded-xl" controls />
              <a href={resultUrl} download="watermarked-video.mp4" className="mt-4 w-full inline-flex">
                <Button className="w-full">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download Result
                </Button>
              </a>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p><strong>Privacy:</strong> All processing happens in your browser. Your video never leaves your device.</p>
            <p><strong>Tip:</strong> For best results, draw the selection box tightly around the old watermark text. Use &quot;Delogo + Blur&quot; for thorough removal.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
