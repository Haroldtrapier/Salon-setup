"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

type RemovalMethod = "heavy-blur" | "fill-black" | "fill-white" | "fill-sample" | "pixelate";
type WatermarkType = "text" | "image";
type Position =
  | "top-left" | "top-center" | "top-right"
  | "center"
  | "bottom-left" | "bottom-center" | "bottom-right";

interface Region {
  x: number; y: number; w: number; h: number;
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

const OVERLAY_POS: Record<Position, string> = {
  "top-left": "10:10", "top-center": "(W-w)/2:10", "top-right": "W-w-10:10",
  center: "(W-w)/2:(H-h)/2",
  "bottom-left": "10:H-h-10", "bottom-center": "(W-w)/2:H-h-10", "bottom-right": "W-w-10:H-h-10",
};

const REGION_COLORS = ["#ff0000", "#ff8800", "#cc00ff", "#0088ff", "#00cc44"];

function createTextPNG(text: string, fontSize: number, color: string, opacity: number): Uint8Array {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const m = ctx.measureText(text);
  const pad = 20;
  canvas.width = Math.ceil(m.width) + pad * 2;
  canvas.height = fontSize + pad * 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cm: Record<string, string> = { white:"255,255,255", black:"0,0,0", red:"255,0,0", green:"0,255,0", blue:"0,0,255", yellow:"255,255,0", gray:"128,128,128" };
  const rgb = cm[color.toLowerCase()] || "255,255,255";
  const s = Math.max(1, Math.floor(fontSize / 20));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;
  ctx.fillText(text, pad + s, pad + fontSize * 0.8 + s);
  ctx.fillStyle = `rgba(${rgb},${opacity})`;
  ctx.fillText(text, pad, pad + fontSize * 0.8);
  const url = canvas.toDataURL("image/png");
  const bin = atob(url.split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export default function WatermarkPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDims, setVideoDims] = useState({ w: 0, h: 0 });

  const [oldText, setOldText] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [curRegion, setCurRegion] = useState<Region | null>(null);
  const [removalMethod, setRemovalMethod] = useState<RemovalMethod>("heavy-blur");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  const [wmType, setWmType] = useState<WatermarkType>("text");
  const [wmText, setWmText] = useState("");
  const [wmImage, setWmImage] = useState<File | null>(null);
  const [wmImagePreview, setWmImagePreview] = useState<string | null>(null);
  const [wmPos, setWmPos] = useState<Position>("bottom-right");
  const [wmOpacity, setWmOpacity] = useState(0.5);
  const [wmSize, setWmSize] = useState(36);
  const [wmColor, setWmColor] = useState("white");

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffRef = useRef<FFmpeg | null>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Load FFmpeg ──
  const loadFF = useCallback(async () => {
    if (ffRef.current && loaded) return;
    setLoading(true); setError(null);
    try {
      const ff = new FFmpeg();
      ff.on("log", ({ message }) => console.log("[ff]", message));
      ff.on("progress", ({ progress: p }) => { if (p > 0 && p <= 1) setProgress(`Processing... ${Math.round(p * 100)}%`); });
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ff.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffRef.current = ff; setLoaded(true);
    } catch (e) {
      console.error(e);
      setError("Failed to load video engine. Click Retry or refresh.");
    } finally { setLoading(false); setProgress(""); }
  }, [loaded]);

  useEffect(() => { loadFF(); }, [loadFF]);

  // ── Capture frame from video player ──
  const captureFrame = useCallback(() => {
    const video = vidRef.current;
    if (!video || video.videoWidth === 0) return;
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    setVideoDims({ w: video.videoWidth, h: video.videoHeight });
    c.getContext("2d")!.drawImage(video, 0, 0);
    setFrameUrl(c.toDataURL("image/jpeg", 0.92));
    setPreviewUrl(null);
  }, []);

  // ── Video select ──
  const onVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideoFile(f);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null); setError(null);
    setRegions([]); setCurRegion(null); setFrameUrl(null); setPreviewUrl(null);
  }, [videoUrl, resultUrl]);

  const onWmImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setWmImage(f);
    if (wmImagePreview) URL.revokeObjectURL(wmImagePreview);
    setWmImagePreview(URL.createObjectURL(f));
  }, [wmImagePreview]);

  // Auto-capture first frame when video metadata loads
  const onVideoLoaded = useCallback(() => {
    const video = vidRef.current;
    if (!video) return;
    video.currentTime = 0.5;
  }, []);

  const onVideoSeeked = useCallback(() => {
    captureFrame();
  }, [captureFrame]);

  // ── Drawing ──
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: Math.round((e.clientX - r.left) * (videoDims.w / r.width)), y: Math.round((e.clientY - r.top) * (videoDims.h / r.height)) };
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawStart(getCoords(e)); setCurRegion(null); setIsDrawing(true);
  };
  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const c = getCoords(e);
    const reg = { x: Math.min(drawStart.x, c.x), y: Math.min(drawStart.y, c.y), w: Math.abs(c.x - drawStart.x), h: Math.abs(c.y - drawStart.y) };
    setCurRegion(reg);
    drawRegions([...regions, reg]);
  };
  const onUp = () => {
    if (isDrawing && curRegion && curRegion.w > 5 && curRegion.h > 5) {
      setRegions(prev => [...prev, curRegion]);
    }
    setCurRegion(null); setIsDrawing(false); setPreviewUrl(null);
  };

  const removeRegion = (i: number) => { const u = regions.filter((_, j) => j !== i); setRegions(u); drawRegions(u); setPreviewUrl(null); };
  const clearRegions = () => { setRegions([]); setCurRegion(null); drawRegions([]); setPreviewUrl(null); };

  const drawRegions = (regs: Region[]) => {
    const c = canvasRef.current; if (!c || !frameUrl) return;
    const ctx = c.getContext("2d")!;
    const img = new Image(); img.src = frameUrl;
    img.onload = () => {
      c.width = img.width; c.height = img.height;
      ctx.drawImage(img, 0, 0);
      regs.forEach((r, i) => {
        if (r.w > 0 && r.h > 0) {
          const col = REGION_COLORS[i % REGION_COLORS.length];
          ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([6, 3]);
          ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]);
          ctx.fillStyle = col + "30"; ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.fillStyle = col; ctx.font = "bold 16px sans-serif";
          ctx.fillText(`#${i + 1}`, r.x + 6, r.y + 20);
        }
      });
    };
  };

  useEffect(() => {
    if (frameUrl && canvasRef.current) {
      const img = new Image(); img.src = frameUrl;
      img.onload = () => {
        const c = canvasRef.current!; c.width = img.width; c.height = img.height;
        c.getContext("2d")!.drawImage(img, 0, 0);
        if (regions.length > 0) drawRegions(regions);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameUrl]);

  // ── Build removal filter for FFmpeg ──
  const buildRemovalFilter = (regs: Region[], method: RemovalMethod): string[] => {
    if (regs.length === 0) return [];

    if (method === "fill-black" || method === "fill-white" || method === "fill-sample") {
      const color = method === "fill-black" ? "black" : method === "fill-white" ? "white" : "black@0";
      const boxes = regs.map(r => `drawbox=x=${r.x}:y=${r.y}:w=${r.w}:h=${r.h}:color=${color}:t=fill`).join(",");
      if (method === "fill-sample") {
        const blurs = regs.map((r, i) => {
          const src = i === 0 ? "[0:v]" : `[v${i}]`;
          const out = `[v${i + 1}]`;
          return `${src}split[m${i}][b${i}];[b${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},gblur=sigma=50,scale=${r.w}:${r.h}[bl${i}];[m${i}][bl${i}]overlay=${r.x}:${r.y}${out}`;
        }).join(";");
        return ["-filter_complex", blurs, "-map", `[v${regs.length}]`];
      }
      return ["-vf", boxes];
    }

    if (method === "pixelate") {
      const filters = regs.map((r, i) => {
        const src = i === 0 ? "[0:v]" : `[v${i}]`;
        const out = `[v${i + 1}]`;
        const pw = Math.max(4, Math.floor(r.w / 8));
        const ph = Math.max(4, Math.floor(r.h / 8));
        return `${src}split[m${i}][p${i}];[p${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},scale=${pw}:${ph},scale=${r.w}:${r.h}:flags=neighbor[px${i}];[m${i}][px${i}]overlay=${r.x}:${r.y}${out}`;
      }).join(";");
      return ["-filter_complex", filters, "-map", `[v${regs.length}]`];
    }

    // heavy-blur
    const filters = regs.map((r, i) => {
      const src = i === 0 ? "[0:v]" : `[v${i}]`;
      const out = `[v${i + 1}]`;
      return `${src}split[m${i}][b${i}];[b${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},gblur=sigma=50[bl${i}];[m${i}][bl${i}]overlay=${r.x}:${r.y}${out}`;
    }).join(";");
    return ["-filter_complex", filters, "-map", `[v${regs.length}]`];
  };

  // ── Preview removal on single frame ──
  const previewRemoval = useCallback(async () => {
    if (!ffRef.current || !frameUrl || regions.length === 0) return;
    const ff = ffRef.current;
    setProgress("Generating preview...");

    try {
      const res = await fetch(frameUrl);
      const blob = await res.blob();
      const data = new Uint8Array(await blob.arrayBuffer());
      await ff.writeFile("preview_in.jpg", data);

      const filterArgs = buildRemovalFilter(regions, removalMethod);
      await ff.exec(["-i", "preview_in.jpg", ...filterArgs, "-frames:v", "1", "preview_out.jpg"]);

      const out = await ff.readFile("preview_out.jpg");
      const bytes = new Uint8Array(out as Uint8Array);
      const b = new Blob([bytes.buffer as ArrayBuffer], { type: "image/jpeg" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(b));
      await ff.deleteFile("preview_in.jpg").catch(() => {});
      await ff.deleteFile("preview_out.jpg").catch(() => {});
    } catch (e) {
      console.error("Preview error:", e);
    } finally { setProgress(""); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameUrl, regions, removalMethod, previewUrl]);

  // ── Process full video ──
  const processVideo = async () => {
    if (!videoFile || !ffRef.current) return;
    const ff = ffRef.current;
    setProcessing(true); setProgress("Reading video..."); setError(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(null);

    try {
      await ff.writeFile("input.mp4", await fetchFile(videoFile));

      if (regions.length > 0) {
        setProgress(`Removing ${regions.length} watermark area${regions.length > 1 ? "s" : ""}...`);
        const filterArgs = buildRemovalFilter(regions, removalMethod);
        await ff.exec(["-i", "input.mp4", ...filterArgs, "-map", "0:a?", "-c:a", "copy", "-preset", "ultrafast", "cleaned.mp4"]);
        await ff.deleteFile("input.mp4");
        await ff.rename("cleaned.mp4", "input.mp4");
      }

      const hasNew = (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
      if (hasNew) {
        setProgress("Adding your watermark...");
        if (wmType === "text") {
          await ff.writeFile("wm.png", createTextPNG(wmText, wmSize, wmColor, wmOpacity));
        } else if (wmImage) {
          await ff.writeFile("wm.png", await fetchFile(wmImage));
        }
        const oFilt = wmType === "text" ? "" : `,colorchannelmixer=aa=${wmOpacity}`;
        await ff.exec([
          "-i", "input.mp4", "-i", "wm.png",
          "-filter_complex", `[1:v]format=rgba${oFilt}[wm];[0:v][wm]overlay=${OVERLAY_POS[wmPos]}[out]`,
          "-map", "[out]", "-map", "0:a?", "-c:a", "copy", "-preset", "ultrafast", "-movflags", "+faststart", "output.mp4",
        ]);
        const d = await ff.readFile("output.mp4");
        const b = new Uint8Array(d as Uint8Array);
        setResultUrl(URL.createObjectURL(new Blob([b.buffer as ArrayBuffer], { type: "video/mp4" })));
      } else {
        const d = await ff.readFile("input.mp4");
        const b = new Uint8Array(d as Uint8Array);
        setResultUrl(URL.createObjectURL(new Blob([b.buffer as ArrayBuffer], { type: "video/mp4" })));
      }
      setProgress("Done!");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Processing failed.");
    } finally {
      setProcessing(false);
      for (const f of ["input.mp4", "cleaned.mp4", "output.mp4", "wm.png"]) await ff.deleteFile(f).catch(() => {});
    }
  };

  const canProcess = () => {
    if (!videoFile || !loaded) return false;
    return regions.length > 0 || (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
  };

  const getLabel = () => {
    if (processing) return progress;
    if (!loaded && loading) return "Loading engine...";
    if (!loaded) return "Engine not loaded";
    if (!videoFile) return "Upload a video first";
    const hasR = regions.length > 0;
    const hasN = (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
    if (!hasR && !hasN) return "Select watermark areas or add your watermark";
    if (hasR && hasN) return `Remove ${regions.length} Area${regions.length > 1 ? "s" : ""} & Add Watermark`;
    if (hasR) return `Remove ${regions.length} Watermark Area${regions.length > 1 ? "s" : ""}`;
    return "Add Watermark";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-4">
            Video Watermark Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Remove & replace watermarks</h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Scrub through your video, highlight every watermark, preview the removal, then add your own. All in-browser.
          </p>
        </div>
      </section>

      {/* Status */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-4">
        {loading && <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm"><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading video engine...</div>}
        {loaded && !processing && <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>Ready to process</div>}
        {!loaded && !loading && error && <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm"><span>{error}</span><button onClick={() => { setError(null); loadFF(); }} className="ml-4 px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-medium">Retry</button></div>}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">

        {/* Upload & Video Player */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-4">1. Upload & Navigate Your Video</h2>
          {!videoUrl ? (
            <button onClick={() => vidInputRef.current?.click()} className="w-full aspect-video max-h-72 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              <span className="text-sm text-gray-500 font-medium">Click to upload a video</span>
              <span className="text-xs text-gray-400">MP4, MOV, AVI, WebM</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video ref={vidRef} src={videoUrl} className="w-full max-h-72 object-contain" controls muted onLoadedData={onVideoLoaded} onSeeked={onVideoSeeked} />
                <button onClick={() => { setVideoFile(null); if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setFrameUrl(null); setRegions([]); setPreviewUrl(null); if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={captureFrame}>
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
                  Capture This Frame
                </Button>
                <span className="text-xs text-gray-400">Scrub to where you see the watermark, then capture</span>
              </div>
            </div>
          )}
          <input ref={vidInputRef} type="file" accept="video/*" className="hidden" onChange={onVideoSelect} />
        </div>

        {/* Frame + Region Drawing */}
        {frameUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold">2</span>
              <h2 className="font-bold text-lg">Highlight Watermarks to Remove</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What does the watermark say? <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={oldText} onChange={e => setOldText(e.target.value)} placeholder="e.g. NotebookLM, Shutterstock..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Draw boxes around <strong>every</strong> watermark on the frame:</p>
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 cursor-crosshair">
                  <canvas ref={canvasRef} className="w-full h-auto" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Click and drag to draw a box. You can draw multiple boxes for watermarks in different areas.</p>
              </div>

              {regions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{regions.length} area{regions.length > 1 ? "s" : ""} selected</span>
                    <button onClick={clearRegions} className="text-xs text-red-500 hover:text-red-700 underline">Clear all</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {regions.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }} />
                        <span className="font-medium">#{i + 1}</span>
                        <span className="text-gray-500 text-xs font-mono">{r.w}x{r.h}</span>
                        <button onClick={() => removeRegion(i)} className="ml-auto text-gray-400 hover:text-red-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {regions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How to remove</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {([
                      { v: "heavy-blur" as const, l: "Heavy Blur", d: "Strong Gaussian blur — hides text completely" },
                      { v: "fill-sample" as const, l: "Smart Fill", d: "Fills with blurred background color" },
                      { v: "pixelate" as const, l: "Pixelate", d: "Mosaic/pixelation over the area" },
                      { v: "fill-black" as const, l: "Fill Black", d: "Cover with solid black" },
                      { v: "fill-white" as const, l: "Fill White", d: "Cover with solid white" },
                    ]).map(m => (
                      <label key={m.v} className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${removalMethod === m.v ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" name="rm" value={m.v} checked={removalMethod === m.v} onChange={() => { setRemovalMethod(m.v); setPreviewUrl(null); }} className="mt-0.5 accent-black" />
                        <div>
                          <span className="text-sm font-medium">{m.l}</span>
                          <p className="text-xs text-gray-500">{m.d}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {regions.length > 0 && loaded && (
                <div>
                  <Button size="sm" variant="outline" onClick={previewRemoval} disabled={!!progress}>
                    {progress ? <><svg className="h-3.5 w-3.5 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{progress}</> : "Preview Removal on This Frame"}
                  </Button>
                  {previewUrl && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview (watermarks removed):</p>
                      <img src={previewUrl} alt="Preview" className="w-full rounded-xl border border-gray-200" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Watermark */}
        {videoFile && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">3</span>
              <h2 className="font-bold text-lg">Add Your Watermark</h2>
            </div>
            <div className="space-y-4">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button onClick={() => setWmType("text")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${wmType === "text" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Text</button>
                <button onClick={() => setWmType("image")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${wmType === "image" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Image</button>
              </div>
              {wmType === "text" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                    <input type="text" value={wmText} onChange={e => setWmText(e.target.value)} placeholder="GovconCommandCenter.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label><input type="number" value={wmSize} onChange={e => setWmSize(parseInt(e.target.value) || 36)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><select value={wmColor} onChange={e => setWmColor(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10">{["white","black","red","blue","green","yellow","gray"].map(c => <option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}</select></div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Image</label>
                  {!wmImagePreview ? (
                    <button onClick={() => imgInputRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-1 hover:border-gray-400 cursor-pointer"><span className="text-sm text-gray-500">Upload logo image</span><span className="text-xs text-gray-400">PNG with transparency recommended</span></button>
                  ) : (
                    <div className="relative inline-block"><img src={wmImagePreview} alt="WM" className="max-h-20 rounded-lg border" /><button onClick={() => { setWmImage(null); if (wmImagePreview) URL.revokeObjectURL(wmImagePreview); setWmImagePreview(null); }} className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button></div>
                  )}
                  <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={onWmImageSelect} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <div className="grid grid-cols-3 gap-1.5">{positions.map(p => <button key={p.value} onClick={() => setWmPos(p.value)} className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${wmPos === p.value ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p.label}</button>)}</div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {Math.round(wmOpacity * 100)}%</label><input type="range" min="0" max="1" step="0.05" value={wmOpacity} onChange={e => setWmOpacity(parseFloat(e.target.value))} className="w-full accent-black" /></div>
            </div>
          </div>
        )}

        {/* Process */}
        {videoFile && (
          <Button size="lg" className="w-full" disabled={!canProcess() || processing} onClick={processVideo}>
            {(processing || loading) && <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {getLabel()}
          </Button>
        )}

        {error && loaded && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

        {resultUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-4">Result</h2>
            <video src={resultUrl} className="w-full rounded-xl" controls />
            <a href={resultUrl} download="watermarked-video.mp4" className="mt-4 w-full inline-flex"><Button className="w-full"><svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Download Result</Button></a>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p><strong>Privacy:</strong> Everything runs in your browser. Your video never leaves your device.</p>
          <p><strong>Tip:</strong> Use &quot;Preview Removal&quot; to check how it looks before processing the full video. Heavy Blur or Smart Fill work best for most watermarks.</p>
        </div>
      </div>
    </div>
  );
}
