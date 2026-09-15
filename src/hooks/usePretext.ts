import { useMemo } from 'react';
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
  const result = useMemo<UsePretextResult>(() => {
    // Handle edge case: empty content
    if (!content || content.trim().length === 0) {
      return {
        lines: [],
        metrics: {
          calcTime: 0,
          lineCount: 0,
          cacheActive: false,
        },
      };
    }

    // Handle edge case: invalid container width
    if (containerWidth <= 0) {
      return {
        lines: [],
        metrics: {
          calcTime: 0,
          lineCount: 0,
          cacheActive: false,
        },
      };
    }

    // Start performance measurement
    const startTime = performance.now();

    // Create engine and calculate lines
    const engine = new PretextEngine({
      containerWidth,
      fontSize,
      fontFamily,
      lineHeight,
    });

    const calculatedLines = engine.calculateLines(content, obstacles);

    // End performance measurement
    const endTime = performance.now();
    const calcTime = endTime - startTime;

    return {
      lines: calculatedLines,
      metrics: {
        calcTime,
        lineCount: calculatedLines.length,
        cacheActive: true, // useMemo provides caching
      },
    };
  }, [content, obstacles, containerWidth, fontSize, fontFamily, lineHeight]);

  return result;
}
