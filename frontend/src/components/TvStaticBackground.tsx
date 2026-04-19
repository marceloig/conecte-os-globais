import { useEffect, useRef } from "react";

/**
 * Old TV fuzzy gray static — black & white pixel noise,
 * like a CRT television with no signal.
 */
export default function TvStaticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const interval = 1000 / 20; // ~20 fps choppy analog

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // 0.4 scale → fine grain but still has that slight pixel texture
      canvas.width = Math.ceil(parent.clientWidth * 0.4);
      canvas.height = Math.ceil(parent.clientHeight * 0.4);
    };

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);
      if (time - lastTime < interval) return;
      lastTime = time;

      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const buf = new Uint32Array(imageData.data.buffer);
      const len = buf.length;

      for (let i = 0; i < len; i++) {
        // Same value for R, G, B → pure gray noise
        const v = (Math.random() * 256) | 0;
        buf[i] = 0xFF000000 | (v << 16) | (v << 8) | v;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    resize();
    animId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
        opacity: 0.7,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
