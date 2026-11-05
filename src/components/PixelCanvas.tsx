import { useEffect, useRef } from 'react';
import { t } from '../i18n';
import { LIMITS } from '../sandbox/limits';
import type { Pixel } from '../sandbox/types';

const SCALE = 10;

/** Холст для функции pixel(x, y, color). Показывается, только если программа что-то нарисовала. */
export function PixelCanvas({ pixels }: { pixels: Pixel[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = LIMITS.gridSize * SCALE;

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, size, size);
    for (const { x, y, color } of pixels) {
      context.fillStyle = color;
      context.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }
  }, [pixels, size]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-canvas"
      width={size}
      height={size}
      role="img"
      aria-label={t.runner.canvasLabel}
    />
  );
}
