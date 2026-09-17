import { Check, Clock, Download, Play, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const PRESETS = [
  { id: "feed", label: "FB Feed / Link Ad", w: 1200, h: 628 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "story", label: "Story / Reel", w: 1080, h: 1920 },
] as const;

type OverlayMethod = "reels-10s" | "single";
type SizeScale = "normal" | "medium" | "large";

const SIZE_OPTIONS: { id: SizeScale; label: string; scale: number; hint: string }[] = [
  { id: "normal", label: "Standard", scale: 1.0, hint: "স্বাভাবিক" },
  { id: "medium", label: "Medium (+20%)", scale: 1.22, hint: "একটু বড় (রিকমেন্ডেড)" },
  { id: "large", label: "Large (+40%)", scale: 1.42, hint: "বড় সাইজ" },
];

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  tw: number,
  th: number,
) {
  const scale = Math.max(tw / img.width, th / img.height);
  const sw = tw / scale;
  const sh = th / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
}

/** Base circular background with drop shadow and subtle border */
function drawButtonBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  isCentral = false,
) {
  // Soft outer drop shadow disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.05, radius * 1.06, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fill();
  ctx.restore();

  // Dark circular translucent disc
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isCentral ? "rgba(0, 0, 0, 0.65)" : "rgba(0, 0, 0, 0.58)";
  ctx.fill();

  // Thin subtle border ring
  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
  ctx.lineWidth = Math.max(1.6, radius * 0.04);
  ctx.stroke();
}

/** White play triangle (optically centered) */
function drawPlayTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const triH = radius * 0.95;
  const triW = triH * 0.82;
  const ox = cx - triW * 0.28;
  ctx.beginPath();
  ctx.moveTo(ox, cy - triH / 2);
  ctx.lineTo(ox, cy + triH / 2);
  ctx.lineTo(ox + triW, cy);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

/** Classic single play button */
function drawClassicPlayButton(
  ctx: CanvasRenderingContext2D,
  tw: number,
  th: number,
  scale: number,
) {
  const cx = tw / 2;
  const cy = th / 2;
  const radius = Math.round(Math.min(tw, th) * 0.11 * scale);

  drawButtonBase(ctx, cx, cy, radius, true);

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.lineWidth = Math.max(2, radius * 0.055);
  ctx.stroke();

  drawPlayTriangle(ctx, cx, cy, radius);
}

/** 10s Rewind (backward) or Forward (forward) button with circular arrow & "10" */
function drawSkip10Button(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  direction: "backward" | "forward",
) {
  drawButtonBase(ctx, x, y, radius, false);

  const iconR = radius * 0.52;
  const strokeW = Math.max(2.5, radius * 0.075);
  const isBack = direction === "backward";

  ctx.save();
  ctx.translate(x, y);

  // Circular arc with open gap at the top
  ctx.beginPath();
  if (isBack) {
    // Counter-clockwise from bottom-right (0.35 PI) to near top (-0.55 PI)
    ctx.arc(0, 0, iconR, 0.35 * Math.PI, -0.55 * Math.PI, true);
  } else {
    // Clockwise from bottom-left (0.65 PI) to near top (-0.45 PI)
    ctx.arc(0, 0, iconR, 0.65 * Math.PI, -0.45 * Math.PI, false);
  }
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = strokeW;
  ctx.lineCap = "round";
  ctx.stroke();

  // Arrow Head at the end of the arc
  const arrowSize = radius * 0.22;
  ctx.beginPath();
  if (isBack) {
    const tipAngle = -0.55 * Math.PI;
    const tipX = iconR * Math.cos(tipAngle);
    const tipY = iconR * Math.sin(tipAngle);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + arrowSize * 0.75, tipY - arrowSize * 0.35);
    ctx.lineTo(tipX + arrowSize * 0.35, tipY + arrowSize * 0.72);
  } else {
    const tipAngle = -0.45 * Math.PI;
    const tipX = iconR * Math.cos(tipAngle);
    const tipY = iconR * Math.sin(tipAngle);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - arrowSize * 0.75, tipY - arrowSize * 0.35);
    ctx.lineTo(tipX - arrowSize * 0.35, tipY + arrowSize * 0.72);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Bold "10" in the center
  const fontSize = Math.round(radius * 0.44);
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("10", 0, iconR * 0.08);

  ctx.restore();
}

/** Complete Facebook Reels 10s video player controls (Rewind 10s - Play - Forward 10s) */
function drawReels10sControls(
  ctx: CanvasRenderingContext2D,
  tw: number,
  th: number,
  scale: number,
) {
  const cx = tw / 2;
  const cy = th / 2;
  const baseR = Math.round(Math.min(tw, th) * 0.115 * scale);
  const sideR = Math.round(baseR * 0.82);
  const spacing = Math.round(baseR + sideR + Math.min(tw, th) * 0.075);

  // 1. Center Play Button
  drawButtonBase(ctx, cx, cy, baseR, true);
  drawPlayTriangle(ctx, cx, cy, baseR);

  // 2. Left Rewind 10s Button
  drawSkip10Button(ctx, cx - spacing, cy, sideR, "backward");

  // 3. Right Fast Forward 10s Button
  drawSkip10Button(ctx, cx + spacing, cy, sideR, "forward");
}

/** Authentic Facebook Reels/Video bottom player bar (0:00 / 4:39, scrubber, speaker) */
function drawBottomVideoBar(
  ctx: CanvasRenderingContext2D,
  tw: number,
  th: number,
  timeText = "0:00 / 4:39",
) {
  const barH = Math.round(Math.min(tw, th) * 0.16);

  // Bottom dark gradient
  const grad = ctx.createLinearGradient(0, th - barH, 0, th);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.45)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, th - barH, tw, barH);

  // Time text (e.g. 0:00 / 4:39)
  const fontSize = Math.round(Math.min(tw, th) * 0.038);
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const paddingX = Math.round(tw * 0.05);
  const textY = th - barH * 0.42;
  ctx.fillText(timeText, paddingX, textY);

  // Speaker / Volume icon on right
  const speakerX = tw - paddingX - fontSize * 0.6;
  const speakerY = textY;
  const sSize = fontSize * 0.55;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1.8, fontSize * 0.09);
  ctx.lineCap = "round";

  // Speaker body
  ctx.beginPath();
  ctx.moveTo(speakerX - sSize, speakerY - sSize * 0.4);
  ctx.lineTo(speakerX - sSize * 0.4, speakerY - sSize * 0.4);
  ctx.lineTo(speakerX + sSize * 0.2, speakerY - sSize * 0.9);
  ctx.lineTo(speakerX + sSize * 0.2, speakerY + sSize * 0.9);
  ctx.lineTo(speakerX - sSize * 0.4, speakerY + sSize * 0.4);
  ctx.lineTo(speakerX - sSize, speakerY + sSize * 0.4);
  ctx.closePath();
  ctx.fill();

  // Sound wave arcs
  ctx.beginPath();
  ctx.arc(speakerX + sSize * 0.3, speakerY, sSize * 0.6, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(speakerX + sSize * 0.3, speakerY, sSize * 1.05, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();
  ctx.restore();

  // Video progress scrubber bar
  const trackY = th - Math.max(14, barH * 0.16);
  const trackH = Math.max(3, Math.round(th * 0.005));
  const trackW = tw - paddingX * 2;

  // Background track
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(paddingX, trackY, trackW, trackH);

  // Played track segment
  const playedW = trackW * 0.012;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(paddingX, trackY, playedW, trackH);

  // Scrubber circle
  ctx.beginPath();
  ctx.arc(paddingX + playedW, trackY + trackH / 2, Math.max(5, trackH * 1.5), 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

export function AdsterraGenerator() {
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>("feed");
  const [overlayMethod, setOverlayMethod] = useState<OverlayMethod>("reels-10s");
  const [sizeScale, setSizeScale] = useState<SizeScale>("medium");
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const [timeText, setTimeText] = useState<string>("0:00 / 4:39");

  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const currentScale = SIZE_OPTIONS.find((s) => s.id === sizeScale)?.scale || 1.22;

  function render() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, preset.w, preset.h);
    drawCover(ctx, img, preset.w, preset.h);

    if (overlayMethod === "reels-10s") {
      drawReels10sControls(ctx, preset.w, preset.h, currentScale);
    } else {
      drawClassicPlayButton(ctx, preset.w, preset.h, currentScale);
    }

    if (showProgressBar) {
      drawBottomVideoBar(ctx, preset.w, preset.h, timeText);
    }

    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.92));
  }

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      render();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId, overlayMethod, sizeScale, showProgressBar, timeText]);

  function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      render();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = `basictrick-adsterra-${preset.w}x${preset.h}-${overlayMethod}.jpg`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Adsterra Image Generator</h1>
        <p className="mt-1 text-sm text-slate-500">
          Smart Facebook ads resize + pixel-perfect play button & Reels 10s controls — creatives that look like real videos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          {/* Upload Area */}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-8 text-center transition hover:border-sky-400">
            <Upload className="h-8 w-8 text-sky-600" />
            <span className="text-sm font-semibold text-slate-800">Upload image</span>
            <span className="text-xs text-slate-500">{fileName || "JPG, PNG, or WebP"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Overlay Method Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">Button Method / Overlay Style</p>
              <span className="text-xs font-medium text-sky-600">২টি মেথড উপলব্ধ</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setOverlayMethod("reels-10s")}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition ${
                  overlayMethod === "reels-10s"
                    ? "border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <RotateCcw className="h-3 w-3" />
                    <span>10s</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Reels 10s Player</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  ১০ সেকেন্ড ব্যাক, মাঝখানে প্লে ও ১০ সেকেন্ড ফরওয়ার্ড (Reels Video Look)
                </p>
                {overlayMethod === "reels-10s" && (
                  <span className="absolute top-2 right-2 text-sky-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOverlayMethod("single")}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition ${
                  overlayMethod === "single"
                    ? "border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center rounded bg-slate-800 p-1 text-white">
                    <Play className="h-2.5 w-2.5 fill-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Classic Play</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  একক বড় প্লে বাটন (Classic Facebook Feed/YouTube Style)
                </p>
                {overlayMethod === "single" && (
                  <span className="absolute top-2 right-2 text-sky-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Button Size Preset */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Button Size (বাটন সাইজ)</p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSizeScale(opt.id)}
                  className={`rounded-xl border px-3 py-2 text-center transition ${
                    sizeScale === opt.id
                      ? "border-sky-500 bg-sky-50 font-bold text-sky-900 ring-2 ring-sky-500/20 shadow-sm"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs">{opt.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Facebook Size Preset */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Facebook Size Preset</p>
            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetId(p.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    presetId === p.id
                      ? "border-sky-500 bg-sky-50 text-sky-900 font-semibold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-xs font-medium text-slate-400">
                    {p.w}×{p.h}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Video Progress Bar Toggle */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Facebook Video Progress Bar (ভিডিও টাইম বার)
                </span>
              </div>
              <input
                type="checkbox"
                checked={showProgressBar}
                onChange={(e) => setShowProgressBar(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
            </label>
            {showProgressBar && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                <span className="text-[11px] text-slate-500">ভিডিও সময়:</span>
                <input
                  type="text"
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  placeholder="0:00 / 4:39"
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-sky-500 focus:outline-none w-32 font-mono"
                />
              </div>
            )}
          </div>

          <Button
            onClick={download}
            disabled={!previewUrl}
            className="w-full bg-sky-600 hover:bg-sky-700 gap-2 py-6 text-sm font-bold shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Creative ({preset.w}×{preset.h})
          </Button>
        </div>

        {/* Live Preview Panel */}
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Live Preview</p>
            <span className="text-xs text-slate-400">
              {preset.w} × {preset.h} ({overlayMethod === "reels-10s" ? "10s Reels" : "Classic"})
            </span>
          </div>
          <div className="flex flex-1 min-h-72 items-center justify-center overflow-hidden rounded-xl bg-slate-950 border border-slate-800/50 shadow-inner relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-[520px] w-full object-contain" />
            ) : (
              <div className="text-center p-8">
                <Upload className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">Upload an image to preview creative</p>
                <p className="text-xs text-slate-500 mt-1">ছবি আপলোড করলে সাথে সাথে লাইভ প্রিভিউ দেখা যাবে</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

