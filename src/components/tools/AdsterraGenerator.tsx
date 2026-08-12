import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const PRESETS = [
  { id: "feed", label: "FB Feed / Link Ad", w: 1200, h: 628 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "story", label: "Story / Reel", w: 1080, h: 1920 },
] as const;

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

/** Pixel-perfect FB/YouTube-style play button */
function drawPlayButton(ctx: CanvasRenderingContext2D, tw: number, th: number) {
  const cx = tw / 2;
  const cy = th / 2;
  const radius = Math.round(Math.min(tw, th) * 0.11);

  // Soft outer glow/shadow disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + radius * 0.04, radius * 1.05, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();
  ctx.restore();

  // Main circle
  const grad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.3, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Thin white ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = Math.max(2, radius * 0.06);
  ctx.stroke();

  // Play triangle (optically centered)
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

export function AdsterraGenerator() {
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>("feed");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preset = PRESETS.find((p) => p.id === presetId)!;

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
    drawPlayButton(ctx, preset.w, preset.h);
    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.92));
  }

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId]);

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
    a.download = `basictrick-adsterra-${preset.w}x${preset.h}.jpg`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Adsterra Image Generator</h1>
        <p className="mt-1 text-sm text-slate-500">
          Smart Facebook ads resize + pixel-perfect play button — creatives that look like real videos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-10 text-center transition hover:border-sky-400">
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

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Facebook size preset</p>
            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    presetId === p.id
                      ? "border-sky-500 bg-sky-50 text-sky-900 font-semibold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                  <span className="ml-2 text-xs text-slate-400">
                    {p.w}×{p.h}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={download}
            disabled={!previewUrl}
            className="w-full bg-sky-600 hover:bg-sky-700 gap-2"
          >
            <Download className="h-4 w-4" />
            Download Creative
          </Button>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-700">Preview</p>
          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-[480px] w-full object-contain" />
            ) : (
              <p className="text-sm text-slate-400">Upload an image to preview</p>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
