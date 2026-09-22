import { useEffect, useMemo, useState } from 'react';
import { PretextEngine, Obstacle, TextLine } from '@/lib/PretextEngine';

interface UsePretextParams {
  content: string;
  obstacles: Obstacle[];
  containerWidth: number;
  fontSize: number;
  fontFamily?: string;
  lineHeight?: number;
}

interface PretextMetrics {
  calcTime: number;
  lineCount: number;
  cacheActive: boolean;
}

interface UsePretextResult {
  lines: TextLine[];
  metrics: PretextMetrics;
}

export function usePretext({
  content,
  obstacles,
  containerWidth,
  fontSize,
  fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight = 24,
}: UsePretextParams): UsePretextResult {
  const [calcTime, setCalcTime] = useState<number>(0.15);

  const lines = useMemo<TextLine[]>(() => {
    if (!content || content.trim().length === 0 || containerWidth <= 0) {
      return [];
    }

    const engine = new PretextEngine({
      containerWidth,
      fontSize,
      fontFamily,
      lineHeight,
    });

    return engine.calculateLines(content, obstacles);
  }, [content, obstacles, containerWidth, fontSize, fontFamily, lineHeight]);

  useEffect(() => {
    if (!content || containerWidth <= 0) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      const t0 = performance.now();
      const engine = new PretextEngine({
        containerWidth,
        fontSize,
        fontFamily,
        lineHeight,
      });
      engine.calculateLines(content, obstacles);
      const t1 = performance.now();
      setCalcTime(Math.max(0.05, t1 - t0));
    });

    return () => cancelAnimationFrame(rafId);
  }, [content, obstacles, containerWidth, fontSize, fontFamily, lineHeight]);

  return {
    lines,
    metrics: {
      calcTime,
      lineCount: lines.length,
      cacheActive: true,
    },
  };
}
