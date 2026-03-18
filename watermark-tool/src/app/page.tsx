"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

type RemovalMethod = "heavy-blur" | "fill-black" | "fill-white" | "pixelate";
type WatermarkType = "text" | "image";
type Position = "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right";

interface Region { x: number; y: number; w: number; h: number; }
interface Scene { id: number; time: number; frameUrl: string; regions: Region[]; }

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" }, { value: "top-center", label: "Top Center" }, { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" },
];
const OVERLAY_POS: Record<Position, string> = {
  "top-left":"10:10","top-center":"(W-w)/2:10","top-right":"W-w-10:10",center:"(W-w)/2:(H-h)/2",
  "bottom-left":"10:H-h-10","bottom-center":"(W-w)/2:H-h-10","bottom-right":"W-w-10:H-h-10",
};
const COLORS = ["#ef4444","#f97316","#a855f7","#3b82f6","#22c55e","#eab308","#ec4899"];

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function createTextPNG(text: string, fontSize: number, color: string, opacity: number): Uint8Array {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const met = ctx.measureText(text);
  const pad = 20;
  canvas.width = Math.ceil(met.width) + pad * 2;
  canvas.height = fontSize + pad * 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cm: Record<string, string> = { white:"255,255,255",black:"0,0,0",red:"255,0,0",green:"0,255,0",blue:"0,0,255",yellow:"255,255,0",gray:"128,128,128" };
  const rgb = cm[color.toLowerCase()] || "255,255,255";
  const sh = Math.max(1, Math.floor(fontSize / 20));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;
  ctx.fillText(text, pad + sh, pad + fontSize * 0.8 + sh);
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
  const [videoDuration, setVideoDuration] = useState(0);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null);
  const [removalMethod, setRemovalMethod] = useState<RemovalMethod>("heavy-blur");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [curRegion, setCurRegion] = useState<Region | null>(null);
  const [nextId, setNextId] = useState(1);

  const [wmType, setWmType] = useState<WatermarkType>("text");
  const [wmText, setWmText] = useState("");
  const [wmImage, setWmImage] = useState<File | null>(null);
  const [wmImagePrev, setWmImagePrev] = useState<string | null>(null);
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

  // ── FFmpeg ──
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
    } catch (e) { console.error(e); setError("Failed to load video engine. Click Retry."); }
    finally { setLoading(false); setProgress(""); }
  }, [loaded]);
  useEffect(() => { loadFF(); }, [loadFF]);

  // ── Video ──
  const onVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideoFile(f);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(f));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null); setError(null); setScenes([]); setActiveSceneId(null);
  }, [videoUrl, resultUrl]);

  const onWmImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setWmImage(f);
    if (wmImagePrev) URL.revokeObjectURL(wmImagePrev);
    setWmImagePrev(URL.createObjectURL(f));
  }, [wmImagePrev]);

  const onVideoLoaded = useCallback(() => {
    const v = vidRef.current; if (!v) return;
    setVideoDims({ w: v.videoWidth, h: v.videoHeight });
    setVideoDuration(v.duration);
  }, []);

  // ── Scene Management ──
  const captureScene = useCallback(() => {
    const v = vidRef.current; if (!v || v.videoWidth === 0) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const frameUrl = c.toDataURL("image/jpeg", 0.9);
    const scene: Scene = { id: nextId, time: v.currentTime, frameUrl, regions: [] };
    setScenes(prev => [...prev, scene].sort((a, b) => a.time - b.time));
    setActiveSceneId(nextId);
    setNextId(n => n + 1);
  }, [nextId]);

  const deleteScene = (id: number) => {
    setScenes(prev => prev.filter(s => s.id !== id));
    if (activeSceneId === id) setActiveSceneId(null);
  };

  const activeScene = scenes.find(s => s.id === activeSceneId) || null;

  // ── Drawing on active scene ──
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: Math.round((e.clientX - r.left) * (videoDims.w / r.width)), y: Math.round((e.clientY - r.top) * (videoDims.h / r.height)) };
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => { setDrawStart(getCoords(e)); setCurRegion(null); setIsDrawing(true); };
  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeScene) return;
    const c = getCoords(e);
    const reg = { x: Math.min(drawStart.x, c.x), y: Math.min(drawStart.y, c.y), w: Math.abs(c.x - drawStart.x), h: Math.abs(c.y - drawStart.y) };
    setCurRegion(reg);
    drawOnCanvas(activeScene.frameUrl, [...activeScene.regions, reg]);
  };
  const onUp = () => {
    if (isDrawing && curRegion && curRegion.w > 5 && curRegion.h > 5 && activeScene) {
      setScenes(prev => prev.map(s => s.id === activeScene.id ? { ...s, regions: [...s.regions, curRegion] } : s));
    }
    setCurRegion(null); setIsDrawing(false);
  };

  const removeRegionFromScene = (sceneId: number, regionIdx: number) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, regions: s.regions.filter((_, i) => i !== regionIdx) } : s));
  };

  const drawOnCanvas = (frameUrl: string, regions: Region[]) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image(); img.src = frameUrl;
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      regions.forEach((r, i) => {
        if (r.w > 0 && r.h > 0) {
          const col = COLORS[i % COLORS.length];
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
    if (activeScene) drawOnCanvas(activeScene.frameUrl, activeScene.regions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSceneId, scenes]);

  // ── Build FFmpeg filter with time-based enable ──
  const buildFilter = (sortedScenes: Scene[], method: RemovalMethod, duration: number): string[] => {
    const allTimed: { region: Region; tStart: number; tEnd: number }[] = [];
    for (let i = 0; i < sortedScenes.length; i++) {
      const s = sortedScenes[i];
      const tStart = s.time;
      const tEnd = i + 1 < sortedScenes.length ? sortedScenes[i + 1].time : duration + 1;
      for (const r of s.regions) {
        allTimed.push({ region: r, tStart, tEnd });
      }
    }
    if (allTimed.length === 0) return [];

    if (method === "fill-black" || method === "fill-white") {
      const color = method === "fill-black" ? "black" : "white";
      const boxes = allTimed.map(({ region: r, tStart: ts, tEnd: te }) =>
        `drawbox=x=${r.x}:y=${r.y}:w=${r.w}:h=${r.h}:color=${color}:t=fill:enable='between(t,${ts.toFixed(2)},${te.toFixed(2)})'`
      ).join(",");
      return ["-vf", boxes];
    }

    // For blur and pixelate, use split + overlay with enable
    const n = allTimed.length;
    const parts: string[] = [];
    parts.push(`[0:v]split=${n + 1}[orig]${allTimed.map((_, i) => `[s${i}]`).join("")}`);

    allTimed.forEach(({ region: r, tStart: ts, tEnd: te }, i) => {
      const src = i === 0 ? "[orig]" : `[v${i}]`;
      const out = i === n - 1 ? "[vout]" : `[v${i + 1}]`;

      if (method === "pixelate") {
        const pw = Math.max(4, Math.floor(r.w / 8));
        const ph = Math.max(4, Math.floor(r.h / 8));
        parts.push(`[s${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},scale=${pw}:${ph},scale=${r.w}:${r.h}:flags=neighbor[px${i}]`);
        parts.push(`${src}[px${i}]overlay=${r.x}:${r.y}:enable='between(t,${ts.toFixed(2)},${te.toFixed(2)})'${out}`);
      } else {
        parts.push(`[s${i}]crop=${r.w}:${r.h}:${r.x}:${r.y},gblur=sigma=50[bl${i}]`);
        parts.push(`${src}[bl${i}]overlay=${r.x}:${r.y}:enable='between(t,${ts.toFixed(2)},${te.toFixed(2)})'${out}`);
      }
    });

    return ["-filter_complex", parts.join(";"), "-map", "[vout]"];
  };

  // ── Process ──
  const processVideo = async () => {
    if (!videoFile || !ffRef.current) return;
    const ff = ffRef.current;
    setProcessing(true); setProgress("Reading video..."); setError(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(null);

    try {
      await ff.writeFile("input.mp4", await fetchFile(videoFile));
      const sorted = [...scenes].filter(s => s.regions.length > 0).sort((a, b) => a.time - b.time);

      if (sorted.length > 0) {
        setProgress("Removing watermarks...");
        const filterArgs = buildFilter(sorted, removalMethod, videoDuration);
        await ff.exec(["-i", "input.mp4", ...filterArgs, "-map", "0:a?", "-c:a", "copy", "-preset", "ultrafast", "cleaned.mp4"]);
        await ff.deleteFile("input.mp4");
        await ff.rename("cleaned.mp4", "input.mp4");
      }

      const hasNew = (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
      if (hasNew) {
        setProgress("Adding your watermark...");
        if (wmType === "text") await ff.writeFile("wm.png", createTextPNG(wmText, wmSize, wmColor, wmOpacity));
        else if (wmImage) await ff.writeFile("wm.png", await fetchFile(wmImage));
        const oF = wmType === "text" ? "" : `,colorchannelmixer=aa=${wmOpacity}`;
        await ff.exec(["-i", "input.mp4", "-i", "wm.png", "-filter_complex", `[1:v]format=rgba${oF}[wm];[0:v][wm]overlay=${OVERLAY_POS[wmPos]}[out]`, "-map", "[out]", "-map", "0:a?", "-c:a", "copy", "-preset", "ultrafast", "-movflags", "+faststart", "output.mp4"]);
        const d = await ff.readFile("output.mp4");
        setResultUrl(URL.createObjectURL(new Blob([(new Uint8Array(d as Uint8Array)).buffer as ArrayBuffer], { type: "video/mp4" })));
      } else {
        const d = await ff.readFile("input.mp4");
        setResultUrl(URL.createObjectURL(new Blob([(new Uint8Array(d as Uint8Array)).buffer as ArrayBuffer], { type: "video/mp4" })));
      }
      setProgress("Done!");
    } catch (e) { console.error(e); setError(e instanceof Error ? e.message : "Processing failed."); }
    finally {
      setProcessing(false);
      for (const f of ["input.mp4","cleaned.mp4","output.mp4","wm.png"]) await ff.deleteFile(f).catch(() => {});
    }
  };

  const totalRegions = scenes.reduce((sum, s) => sum + s.regions.length, 0);
  const canProcess = () => {
    if (!videoFile || !loaded) return false;
    return totalRegions > 0 || (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
  };
  const getLabel = () => {
    if (processing) return progress;
    if (!loaded && loading) return "Loading engine...";
    if (!loaded) return "Engine not loaded";
    if (!videoFile) return "Upload a video first";
    const hasR = totalRegions > 0;
    const hasN = (wmType === "text" && wmText.trim()) || (wmType === "image" && wmImage);
    if (!hasR && !hasN) return "Mark watermarks or add your own";
    if (hasR && hasN) return `Remove ${totalRegions} area${totalRegions > 1 ? "s" : ""} across ${scenes.filter(s => s.regions.length > 0).length} scene${scenes.filter(s => s.regions.length > 0).length > 1 ? "s" : ""} & add watermark`;
    if (hasR) return `Remove ${totalRegions} watermark area${totalRegions > 1 ? "s" : ""}`;
    return "Add watermark";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-4">Video Watermark Tool</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Remove & replace watermarks</h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">Scrub through your video, mark watermarks at each scene, and remove them all — even when they move around.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-4">
        {loading && <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-5 py-3 text-sm"><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading video engine...</div>}
        {loaded && !processing && <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>Ready</div>}
        {!loaded && !loading && error && <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm"><span>{error}</span><button onClick={() => { setError(null); loadFF(); }} className="ml-4 px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-medium">Retry</button></div>}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        {/* Step 1: Upload */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-4">1. Upload Your Video</h2>
          {!videoUrl ? (
            <button onClick={() => vidInputRef.current?.click()} className="w-full aspect-video max-h-60 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              <span className="text-sm text-gray-500 font-medium">Click to upload a video</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video ref={vidRef} src={videoUrl} className="w-full max-h-60 object-contain" controls muted onLoadedMetadata={onVideoLoaded} />
                <button onClick={() => { setVideoFile(null); if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setScenes([]); setActiveSceneId(null); if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={captureScene}>
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Mark Watermark at {vidRef.current ? fmtTime(vidRef.current.currentTime) : "0:00"}
                </Button>
                <span className="text-xs text-gray-400">Scrub to where the watermark appears, click to capture that scene</span>
              </div>
            </div>
          )}
          <input ref={vidInputRef} type="file" accept="video/*" className="hidden" onChange={onVideoSelect} />
        </div>

        {/* Step 2: Scenes */}
        {scenes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-1">2. Mark Watermarks at Each Scene</h2>
            <p className="text-sm text-gray-500 mb-4">Each scene applies from its timestamp until the next scene. Draw boxes around the watermark in each one.</p>

            {/* Scene tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {scenes.map((s, i) => {
                const tEnd = i + 1 < scenes.length ? scenes[i + 1].time : videoDuration;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSceneId(s.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${activeSceneId === s.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    <span className="font-mono text-xs">{fmtTime(s.time)} – {fmtTime(tEnd)}</span>
                    {s.regions.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{s.regions.length}</span>}
                    <button onClick={(e) => { e.stopPropagation(); deleteScene(s.id); }} className="text-gray-400 hover:text-red-500 ml-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  </button>
                );
              })}
              <button onClick={() => { if (vidRef.current) { vidRef.current.pause(); captureScene(); } }} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 border border-dashed border-gray-300 hover:border-gray-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add scene
              </button>
            </div>

            {/* Active scene drawing */}
            {activeScene && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Draw boxes around the watermark in this scene ({fmtTime(activeScene.time)}):</p>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-300 cursor-crosshair">
                    <canvas ref={canvasRef} className="w-full h-auto" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Click and drag to draw boxes. You can draw multiple for this scene.</p>
                </div>

                {activeScene.regions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activeScene.regions.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-mono">{r.w}x{r.h}</span>
                        <button onClick={() => removeRegionFromScene(activeScene.id, i)} className="text-gray-400 hover:text-red-500">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Removal method */}
            {totalRegions > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Removal method (applies to all scenes)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { v: "heavy-blur" as const, l: "Heavy Blur", d: "Blurs out the area" },
                    { v: "pixelate" as const, l: "Pixelate", d: "Mosaic effect" },
                    { v: "fill-black" as const, l: "Fill Black", d: "Black rectangle" },
                    { v: "fill-white" as const, l: "Fill White", d: "White rectangle" },
                  ]).map(m => (
                    <label key={m.v} className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors text-center ${removalMethod === m.v ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="rm" value={m.v} checked={removalMethod === m.v} onChange={() => setRemovalMethod(m.v)} className="sr-only" />
                      <span className="text-sm font-medium">{m.l}</span>
                      <span className="text-[11px] text-gray-500">{m.d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: New watermark */}
        {videoFile && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">{scenes.length > 0 ? "3" : "2"}</span>
              <h2 className="font-bold text-lg">Add Your Watermark</h2>
            </div>
            <div className="space-y-4">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button onClick={() => setWmType("text")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${wmType === "text" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Text</button>
                <button onClick={() => setWmType("image")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${wmType === "image" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}>Image</button>
              </div>
              {wmType === "text" ? (<>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label><input type="text" value={wmText} onChange={e => setWmText(e.target.value)} placeholder="GovconCommandCenter.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label><input type="number" value={wmSize} onChange={e => setWmSize(parseInt(e.target.value)||36)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><select value={wmColor} onChange={e => setWmColor(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10">{["white","black","red","blue","green","yellow","gray"].map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}</select></div>
                </div>
              </>) : (<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Image</label>
                {!wmImagePrev ? (<button onClick={() => imgInputRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-1 hover:border-gray-400 cursor-pointer"><span className="text-sm text-gray-500">Upload logo image</span></button>) : (
                  <div className="relative inline-block"><img src={wmImagePrev} alt="WM" className="max-h-20 rounded-lg border" /><button onClick={() => { setWmImage(null); if (wmImagePrev) URL.revokeObjectURL(wmImagePrev); setWmImagePrev(null); }} className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button></div>
                )}
                <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={onWmImageSelect} />
              </div>)}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Position</label><div className="grid grid-cols-3 gap-1.5">{POSITIONS.map(p=><button key={p.value} onClick={()=>setWmPos(p.value)} className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${wmPos===p.value?"bg-black text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p.label}</button>)}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {Math.round(wmOpacity*100)}%</label><input type="range" min="0" max="1" step="0.05" value={wmOpacity} onChange={e=>setWmOpacity(parseFloat(e.target.value))} className="w-full accent-black" /></div>
            </div>
          </div>
        )}

        {/* Process */}
        {videoFile && (
          <Button size="lg" className="w-full" disabled={!canProcess()||processing} onClick={processVideo}>
            {(processing||loading) && <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {getLabel()}
          </Button>
        )}

        {error && loaded && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

        {resultUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-4">Result</h2>
            <video src={resultUrl} className="w-full rounded-xl" controls />
            <a href={resultUrl} download="watermarked-video.mp4" className="mt-4 w-full inline-flex"><Button className="w-full"><svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Download</Button></a>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p><strong>How it works:</strong> Each scene you capture defines a time range. The watermark removal you draw only applies during that range. If the watermark moves at 2:00, scrub to 2:00, add a new scene, and draw the boxes in the new position.</p>
          <p><strong>Privacy:</strong> Everything runs in your browser. Your video never leaves your device.</p>
        </div>
      </div>
    </div>
  );
}
