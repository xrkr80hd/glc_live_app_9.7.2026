"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FRAME_W = 800;
const FRAME_H = 500;
const OUTPUT_W = 1600;
const OUTPUT_H = 1000;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function AnnouncementImageCropper({ file, onCancel, onApply }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const [src, setSrc] = useState("");
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("fill");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    loadImage(url).then(setImage).catch(() => setImage(null));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const metrics = useMemo(() => {
    if (!image) return null;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const frameRatio = FRAME_W / FRAME_H;
    const baseScale = mode === "fill"
      ? (imageRatio > frameRatio ? FRAME_H / image.naturalHeight : FRAME_W / image.naturalWidth)
      : (imageRatio > frameRatio ? FRAME_W / image.naturalWidth : FRAME_H / image.naturalHeight);
    return {
      drawW: image.naturalWidth * baseScale * zoom,
      drawH: image.naturalHeight * baseScale * zoom,
    };
  }, [image, mode, zoom]);

  useEffect(() => {
    if (!image || !metrics || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);

    if (mode === "fit") {
      const bgScale = Math.max(FRAME_W / image.naturalWidth, FRAME_H / image.naturalHeight);
      const bgW = image.naturalWidth * bgScale;
      const bgH = image.naturalHeight * bgScale;
      ctx.save();
      ctx.filter = "blur(28px) brightness(.8)";
      ctx.globalAlpha = 0.95;
      ctx.drawImage(image, (FRAME_W - bgW) / 2, (FRAME_H - bgH) / 2, bgW, bgH);
      ctx.restore();
      ctx.fillStyle = "rgba(20,45,34,.10)";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
    } else {
      ctx.fillStyle = "#eef5f0";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
    }

    const x = FRAME_W / 2 - metrics.drawW / 2 + offset.x;
    const y = FRAME_H / 2 - metrics.drawH / 2 + offset.y;
    ctx.drawImage(image, x, y, metrics.drawW, metrics.drawH);
  }, [image, metrics, mode, offset]);

  function reset() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function pointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  }

  function pointerMove(event) {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + event.clientX - dragRef.current.x,
      y: dragRef.current.oy + event.clientY - dragRef.current.y,
    });
  }

  function pointerUp() {
    dragRef.current = null;
  }

  function touchStart(event) {
    if (event.touches.length !== 2) return;
    const [a, b] = event.touches;
    pinchRef.current = {
      distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      zoom,
    };
  }

  function touchMove(event) {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    const [a, b] = event.touches;
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const next = pinchRef.current.zoom * (distance / pinchRef.current.distance);
    setZoom(Math.min(3.5, Math.max(0.65, next)));
  }

  async function apply() {
    if (!image || !metrics) return;
    const out = document.createElement("canvas");
    out.width = OUTPUT_W;
    out.height = OUTPUT_H;
    const ctx = out.getContext("2d");
    const sx = OUTPUT_W / FRAME_W;
    const sy = OUTPUT_H / FRAME_H;

    if (mode === "fit") {
      const bgScale = Math.max(FRAME_W / image.naturalWidth, FRAME_H / image.naturalHeight);
      const bgW = image.naturalWidth * bgScale * sx;
      const bgH = image.naturalHeight * bgScale * sy;
      ctx.save();
      ctx.filter = "blur(56px) brightness(.8)";
      ctx.globalAlpha = 0.95;
      ctx.drawImage(image, (OUTPUT_W - bgW) / 2, (OUTPUT_H - bgH) / 2, bgW, bgH);
      ctx.restore();
      ctx.fillStyle = "rgba(20,45,34,.10)";
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
    } else {
      ctx.fillStyle = "#eef5f0";
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
    }

    const x = (FRAME_W / 2 - metrics.drawW / 2 + offset.x) * sx;
    const y = (FRAME_H / 2 - metrics.drawH / 2 + offset.y) * sy;
    ctx.drawImage(image, x, y, metrics.drawW * sx, metrics.drawH * sy);

    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return;
    const outputFile = new File([blob], `${String(file.name || "announcement").replace(/\.[^.]+$/, "")}-1600x1000.jpg`, { type: "image/jpeg" });
    onApply(outputFile);
  }

  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dce8e1] px-4 py-3">
          <div>
            <h2 className="font-bold text-[#173329]">Adjust announcement image</h2>
            <p className="text-xs text-[#71847b]">Drag to position. Pinch or use the zoom slider.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full px-3 py-1.5 text-sm font-bold text-[#52675d] hover:bg-[#eef5f0]">Close</button>
        </div>

        <div className="bg-[#e9f1ec] p-3 sm:p-4">
          <div className="mx-auto overflow-hidden rounded-xl border border-[#b9cec1] bg-[#dfeae3] shadow-inner" style={{ aspectRatio: "16 / 10", maxWidth: 800 }}>
            <canvas
              ref={canvasRef}
              width={FRAME_W}
              height={FRAME_H}
              className="block h-full w-full touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
              onTouchStart={touchStart}
              onTouchMove={touchMove}
              onTouchEnd={() => { pinchRef.current = null; }}
            />
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setMode("fill"); reset(); }} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${mode === "fill" ? "border-[#1f6846] bg-[#e8f3ec] text-[#1f6846]" : "border-[#d3e0d8] text-[#53695d]"}`}>Fill Frame</button>
            <button type="button" onClick={() => { setMode("fit"); reset(); }} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${mode === "fit" ? "border-[#1f6846] bg-[#e8f3ec] text-[#1f6846]" : "border-[#d3e0d8] text-[#53695d]"}`}>Show Full Image + Blur</button>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#355b49]">
            Zoom
            <input type="range" min="0.65" max="3.5" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="accent-[#1f6846]" />
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={reset} className="rounded-xl border border-[#cbdcd2] px-4 py-2 text-sm font-semibold text-[#52675d]">Reset</button>
            <button type="button" onClick={onCancel} className="rounded-xl border border-[#cbdcd2] px-4 py-2 text-sm font-semibold text-[#52675d]">Cancel</button>
            <button type="button" onClick={apply} className="rounded-xl bg-[#1f6846] px-5 py-2 text-sm font-bold text-white hover:bg-[#18563a]">Crop & Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
