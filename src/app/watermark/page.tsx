"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import {
  Upload,
  Play,
  Download,
  Trash2,
  Plus,
  Loader2,
  Film,
  Type,
  Image as ImageIcon,
  Move,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type WatermarkMode = "remove" | "add" | "pipeline";
type RemovalMethod = "delogo" | "blur";
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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

const removalMethods: { value: RemovalMethod; label: string; desc: string }[] =
  [
    {
      value: "delogo",
      label: "Delogo",
      desc: "FFmpeg filter — good for solid-color watermarks",
    },
    {
      value: "blur",
      label: "Blur",
      desc: "Gaussian blur over the region",
    },
  ];

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
    grey: "128,128,128",
  };
  const rgb = colorMap[color.toLowerCase()] || "255,255,255";

  const shadowOffset = Math.max(1, Math.floor(fontSize / 20));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;
  ctx.fillText(text, pad + shadowOffset, pad + fontSize * 0.8 + shadowOffset);

  ctx.fillStyle = `rgba(${rgb},${opacity})`;
  ctx.fillText(text, pad, pad + fontSize * 0.8);

  const dataUrl = canvas.toDataURL("image/png");
  const binaryString = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function WatermarkPage() {
  const [mode, setMode] = useState<WatermarkMode>("pipeline");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(
    null
  );
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<
    string | null
  >(null);

  const [region, setRegion] = useState<Region>({
    x: 10,
    y: 10,
    w: 200,
    h: 60,
  });
  const [removalMethod, setRemovalMethod] = useState<RemovalMethod>("delogo");

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState("white");

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegLoaded) return;
    setFfmpegLoading(true);
    setProgress("Loading FFmpeg engine...");

    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => {
        console.log("[ffmpeg]", message);
      });
      ffmpeg.on("progress", ({ progress: p }) => {
        if (p > 0 && p <= 1) {
          setProgress(`Processing... ${Math.round(p * 100)}%`);
        }
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError(
        "Failed to load FFmpeg engine. Please make sure your browser supports WebAssembly."
      );
    } finally {
      setFfmpegLoading(false);
      setProgress("");
    }
  }, [ffmpegLoaded]);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

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
    },
    [videoPreviewUrl, resultUrl]
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

      if (mode === "remove" || mode === "pipeline") {
        setProgress("Removing watermark...");
        const { x, y, w, h } = region;

        if (removalMethod === "delogo") {
          await ffmpeg.exec([
            "-i",
            "input.mp4",
            "-vf",
            `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`,
            "-c:a",
            "copy",
            "-preset",
            "ultrafast",
            "removed.mp4",
          ]);
        } else {
          const sigma = 15;
          await ffmpeg.exec([
            "-i",
            "input.mp4",
            "-filter_complex",
            `split[main][blur];[blur]crop=${w}:${h}:${x}:${y},gblur=sigma=${sigma}[blurred];[main][blurred]overlay=${x}:${y}`,
            "-c:a",
            "copy",
            "-preset",
            "ultrafast",
            "removed.mp4",
          ]);
        }

        if (mode === "remove") {
          const data = await ffmpeg.readFile("removed.mp4");
          const bytes = new Uint8Array(data as Uint8Array);
          const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
          setResultUrl(URL.createObjectURL(blob));
          setProgress("Done!");
          setProcessing(false);
          return;
        }

        await ffmpeg.deleteFile("input.mp4");
        await ffmpeg.rename("removed.mp4", "input.mp4");
      }

      if (mode === "add" || mode === "pipeline") {
        setProgress("Adding watermark...");
        const pos = OVERLAY_POSITION_MAP[position];

        if (watermarkType === "text") {
          const wmData = createTextWatermarkPNG(
            watermarkText,
            fontSize,
            textColor,
            opacity
          );
          await ffmpeg.writeFile("watermark.png", wmData);
        } else if (watermarkImageFile) {
          const wmData = await fetchFile(watermarkImageFile);
          await ffmpeg.writeFile("watermark.png", wmData);
        }

        const opacityFilter =
          watermarkType === "text"
            ? ""
            : `,colorchannelmixer=aa=${opacity}`;

        await ffmpeg.exec([
          "-i",
          "input.mp4",
          "-i",
          "watermark.png",
          "-filter_complex",
          `[1:v]format=rgba${opacityFilter}[wm];[0:v][wm]overlay=${pos}[out]`,
          "-map",
          "[out]",
          "-map",
          "0:a?",
          "-c:a",
          "copy",
          "-preset",
          "ultrafast",
          "-movflags",
          "+faststart",
          "output.mp4",
        ]);

        const data = await ffmpeg.readFile("output.mp4");
        const bytes = new Uint8Array(data as Uint8Array);
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
        setResultUrl(URL.createObjectURL(blob));
        setProgress("Done!");
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError(
        err instanceof Error ? err.message : "Processing failed. Try a shorter or smaller video."
      );
    } finally {
      setProcessing(false);
      try {
        await ffmpeg.deleteFile("input.mp4").catch(() => {});
        await ffmpeg.deleteFile("removed.mp4").catch(() => {});
        await ffmpeg.deleteFile("output.mp4").catch(() => {});
        await ffmpeg.deleteFile("watermark.png").catch(() => {});
      } catch {
        /* cleanup best effort */
      }
    }
  };

  const canProcess = () => {
    if (!videoFile || !ffmpegLoaded) return false;
    if (mode === "add" || mode === "pipeline") {
      if (watermarkType === "text" && !watermarkText.trim()) return false;
      if (watermarkType === "image" && !watermarkImageFile) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
              <Film className="h-4 w-4" />
              Video Watermark Tool
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Remove & add
              <br />
              <span className="text-gray-400">watermarks</span>
            </h1>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Remove existing watermarks from your videos and add your own
              custom branding. Runs entirely in your browser — nothing is
              uploaded to any server.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FFmpeg Status */}
      <section className="pb-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {ffmpegLoading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading FFmpeg engine (first load may take a moment)...
            </div>
          )}
          {ffmpegLoaded && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              FFmpeg engine loaded — ready to process videos
            </div>
          )}
          {error && !processing && !ffmpegLoading && !ffmpegLoaded && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Main Tool */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Mode Selector */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex rounded-xl bg-gray-100 p-1 max-w-md mx-auto">
              {(
                [
                  { value: "remove", label: "Remove", icon: Trash2 },
                  { value: "add", label: "Add", icon: Plus },
                  { value: "pipeline", label: "Both", icon: Settings2 },
                ] as const
              ).map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === m.value
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Upload & Preview */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Video Upload */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                  Input Video
                </h3>
                {!videoPreviewUrl ? (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload a video
                    </span>
                    <span className="text-xs text-gray-400">
                      MP4, MOV, AVI, WebM
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    <video
                      src={videoPreviewUrl}
                      className="w-full rounded-xl"
                      controls
                      muted
                    />
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        if (videoPreviewUrl)
                          URL.revokeObjectURL(videoPreviewUrl);
                        setVideoPreviewUrl(null);
                        if (resultUrl) URL.revokeObjectURL(resultUrl);
                        setResultUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                />
              </div>

              {/* Result */}
              {resultUrl && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Result
                  </h3>
                  <video
                    src={resultUrl}
                    className="w-full rounded-xl"
                    controls
                  />
                  <a
                    href={resultUrl}
                    download="watermarked-video.mp4"
                    className="mt-4 w-full inline-flex"
                  >
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Result
                    </Button>
                  </a>
                </div>
              )}
            </motion.div>

            {/* Right: Settings */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Removal Settings */}
              {(mode === "remove" || mode === "pipeline") && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Watermark Removal
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Removal Method
                      </label>
                      <div className="space-y-2">
                        {removalMethods.map((m) => (
                          <label
                            key={m.value}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              removalMethod === m.value
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="removalMethod"
                              value={m.value}
                              checked={removalMethod === m.value}
                              onChange={() => setRemovalMethod(m.value)}
                              className="mt-0.5 accent-black"
                            />
                            <div>
                              <span className="text-sm font-medium">
                                {m.label}
                              </span>
                              <p className="text-xs text-gray-500">{m.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Move className="h-3.5 w-3.5 inline mr-1" />
                        Watermark Region (pixels)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["x", "y", "w", "h"] as const).map((key) => (
                          <div key={key}>
                            <label className="text-xs text-gray-400 uppercase">
                              {key}
                            </label>
                            <input
                              type="number"
                              value={region[key]}
                              onChange={(e) =>
                                setRegion({
                                  ...region,
                                  [key]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        X,Y is the top-left corner of the watermark. W,H is its
                        width and height in pixels. Tip: take a screenshot and
                        measure in an image editor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Addition Settings */}
              {(mode === "add" || mode === "pipeline") && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Your Watermark
                  </h3>

                  <div className="space-y-4">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button
                        onClick={() => setWatermarkType("text")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                          watermarkType === "text"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <Type className="h-3.5 w-3.5" />
                        Text
                      </button>
                      <button
                        onClick={() => setWatermarkType("image")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                          watermarkType === "image"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Image
                      </button>
                    </div>

                    {watermarkType === "text" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Watermark Text
                          </label>
                          <input
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Your Brand Name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Font Size
                            </label>
                            <input
                              type="number"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value) || 36)
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <select
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                            >
                              {[
                                "white",
                                "black",
                                "red",
                                "blue",
                                "green",
                                "yellow",
                                "gray",
                              ].map((c) => (
                                <option key={c} value={c}>
                                  {c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Watermark Image
                        </label>
                        {!watermarkImagePreview ? (
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full py-8 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Upload logo / watermark image
                            </span>
                            <span className="text-xs text-gray-400">
                              PNG with transparency recommended
                            </span>
                          </button>
                        ) : (
                          <div className="relative inline-block">
                            <img
                              src={watermarkImagePreview}
                              alt="Watermark"
                              className="max-h-24 rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => {
                                setWatermarkImageFile(null);
                                if (watermarkImagePreview)
                                  URL.revokeObjectURL(watermarkImagePreview);
                                setWatermarkImagePreview(null);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleWatermarkImageSelect}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {positions.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setPosition(p.value)}
                            className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                              position === p.value
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opacity: {Math.round(opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <Button
                size="lg"
                className="w-full"
                disabled={!canProcess() || processing}
                onClick={handleProcess}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {progress}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {mode === "remove"
                      ? "Remove Watermark"
                      : mode === "add"
                        ? "Add Watermark"
                        : "Remove & Add Watermark"}
                  </>
                )}
              </Button>

              {error && !ffmpegLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Privacy:</strong> All processing happens in your
                  browser. Your video never leaves your device.
                </p>
                <p>
                  <strong>Tip:</strong> For best performance, use shorter clips
                  (under 2 minutes). Larger videos may take longer.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
