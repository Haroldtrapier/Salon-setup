"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

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
    setError(null);

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

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
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
        "Failed to load the video engine. Click Retry or refresh the page."
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
            "-i", "input.mp4",
            "-vf", `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`,
            "-c:a", "copy",
            "-preset", "ultrafast",
            "removed.mp4",
          ]);
        } else {
          const sigma = 15;
          await ffmpeg.exec([
            "-i", "input.mp4",
            "-filter_complex",
            `split[main][blur];[blur]crop=${w}:${h}:${x}:${y},gblur=sigma=${sigma}[blurred];[main][blurred]overlay=${x}:${y}`,
            "-c:a", "copy",
            "-preset", "ultrafast",
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
          watermarkType === "text" ? "" : `,colorchannelmixer=aa=${opacity}`;

        await ffmpeg.exec([
          "-i", "input.mp4",
          "-i", "watermark.png",
          "-filter_complex",
          `[1:v]format=rgba${opacityFilter}[wm];[0:v][wm]overlay=${pos}[out]`,
          "-map", "[out]",
          "-map", "0:a?",
          "-c:a", "copy",
          "-preset", "ultrafast",
          "-movflags", "+faststart",
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
        err instanceof Error
          ? err.message
          : "Processing failed. Try a shorter or smaller video."
      );
    } finally {
      setProcessing(false);
      try {
        await ffmpeg.deleteFile("input.mp4").catch(() => {});
        await ffmpeg.deleteFile("removed.mp4").catch(() => {});
        await ffmpeg.deleteFile("output.mp4").catch(() => {});
        await ffmpeg.deleteFile("watermark.png").catch(() => {});
      } catch {
        /* cleanup */
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

  const getButtonLabel = () => {
    if (processing) return progress;
    if (!ffmpegLoaded && ffmpegLoading) return "Loading FFmpeg engine...";
    if (!ffmpegLoaded) return "FFmpeg engine not loaded";
    if (!videoFile) return "Upload a video first";
    if ((mode === "add" || mode === "pipeline") && watermarkType === "text" && !watermarkText.trim())
      return "Enter watermark text";
    if ((mode === "add" || mode === "pipeline") && watermarkType === "image" && !watermarkImageFile)
      return "Upload a watermark image";
    if (mode === "remove") return "Remove Watermark";
    if (mode === "add") return "Add Watermark";
    return "Remove & Add Watermark";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 12 6 12.504 6 13.125M6 13.125v1.5" /></svg>
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
          </div>
        </div>
      </section>

      {/* Status Banner */}
      <section className="pb-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {ffmpegLoading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading FFmpeg engine (first load may take a moment)...
            </div>
          )}
          {ffmpegLoaded && !processing && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              FFmpeg engine loaded — ready to process videos
            </div>
          )}
          {!ffmpegLoaded && !ffmpegLoading && error && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                {error}
              </div>
              <button onClick={() => { setError(null); loadFFmpeg(); }} className="ml-4 px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-medium hover:bg-red-800 shrink-0">
                Retry
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Tool */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Mode Selector */}
          <div className="mb-8">
            <div className="flex rounded-xl bg-gray-100 p-1 max-w-md mx-auto">
              {([
                { value: "remove" as const, label: "Remove" },
                { value: "add" as const, label: "Add" },
                { value: "pipeline" as const, label: "Both" },
              ]).map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === m.value
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
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
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                    <span className="text-sm text-gray-500">Click to upload a video</span>
                    <span className="text-xs text-gray-400">MP4, MOV, AVI, WebM</span>
                  </button>
                ) : (
                  <div className="relative">
                    <video src={videoPreviewUrl} className="w-full rounded-xl" controls muted />
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                        setVideoPreviewUrl(null);
                        if (resultUrl) URL.revokeObjectURL(resultUrl);
                        setResultUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                  </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              </div>

              {/* Result */}
              {resultUrl && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Result
                  </h3>
                  <video src={resultUrl} className="w-full rounded-xl" controls />
                  <a href={resultUrl} download="watermarked-video.mp4" className="mt-4 w-full inline-flex">
                    <Button className="w-full">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                      Download Result
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Settings */}
            <div className="space-y-6">
              {/* Removal Settings */}
              {(mode === "remove" || mode === "pipeline") && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Watermark Removal
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Removal Method</label>
                      <div className="space-y-2">
                        {removalMethods.map((m) => (
                          <label
                            key={m.value}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              removalMethod === m.value ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input type="radio" name="removalMethod" value={m.value} checked={removalMethod === m.value} onChange={() => setRemovalMethod(m.value)} className="mt-0.5 accent-black" />
                            <div>
                              <span className="text-sm font-medium">{m.label}</span>
                              <p className="text-xs text-gray-500">{m.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Region (pixels)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["x", "y", "w", "h"] as const).map((key) => (
                          <div key={key}>
                            <label className="text-xs text-gray-400 uppercase">{key}</label>
                            <input
                              type="number"
                              value={region[key]}
                              onChange={(e) => setRegion({ ...region, [key]: parseInt(e.target.value) || 0 })}
                              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        X,Y is the top-left corner of the watermark. W,H is its width and height. Take a screenshot and measure in an image editor.
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
                      <button onClick={() => setWatermarkType("text")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${watermarkType === "text" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>
                        Text
                      </button>
                      <button onClick={() => setWatermarkType("image")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${watermarkType === "image" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>
                        Image
                      </button>
                    </div>

                    {watermarkType === "text" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                          <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Your Brand Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
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
                            <button
                              onClick={() => { setWatermarkImageFile(null); if (watermarkImagePreview) URL.revokeObjectURL(watermarkImagePreview); setWatermarkImagePreview(null); }}
                              className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full"
                            >
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
                          <button key={p.value} onClick={() => setPosition(p.value)} className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${position === p.value ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opacity: {Math.round(opacity * 100)}%
                      </label>
                      <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-black" />
                    </div>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <Button size="lg" className="w-full" disabled={!canProcess() || processing} onClick={handleProcess}>
                {(processing || ffmpegLoading) && (
                  <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                )}
                {getButtonLabel()}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                <p><strong>Privacy:</strong> All processing happens in your browser. Your video never leaves your device.</p>
                <p><strong>Tip:</strong> For best performance, use shorter clips (under 2 minutes). Larger videos may take longer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
