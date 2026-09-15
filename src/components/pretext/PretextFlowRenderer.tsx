'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { PretextEngine, Obstacle, TextLine } from '@/lib/PretextEngine';

interface PretextFlowRendererProps {
  content: string;
  obstacles: Obstacle[];
  containerWidth: number;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  renderMode?: 'canvas' | 'dom';
  exportMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PretextFlowRenderer({
  content,
  obstacles,
  containerWidth,
  fontSize = 16,
  fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight = 24,
  renderMode = 'dom',
  exportMode = false,
  className = '',
  style,
}: PretextFlowRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<TextLine[]>([]);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Calculate text lines using PretextEngine
  const calculatedLines = useMemo(() => {
    const engine = new PretextEngine({
      containerWidth,
      fontSize,
      fontFamily,
      lineHeight,
    });

    return engine.calculateLines(content, obstacles);
  }, [content, obstacles, containerWidth, fontSize, fontFamily, lineHeight]);

  // Update lines and calculate container height
  useEffect(() => {
    setLines(calculatedLines);

    // Calculate height based on last line position
    const maxY = calculatedLines.reduce((max, line) => Math.max(max, line.y), 0);
    const obstacleMaxY = obstacles.reduce(
      (max, obs) => Math.max(max, obs.y + obs.height),
      0
    );
    setContainerHeight(Math.max(maxY + lineHeight, obstacleMaxY) + 20);
  }, [calculatedLines, obstacles, lineHeight]);

  // Render to canvas
  useEffect(() => {
    if (renderMode === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Set text style
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = exportMode ? '#f0f0f0' : '#f0f0f0';
      ctx.textBaseline = 'alphabetic';

      // Draw text lines
      lines.forEach((line) => {
        ctx.fillText(line.text, line.x, line.y);
      });
    }
  }, [renderMode, lines, containerWidth, containerHeight, fontSize, fontFamily, exportMode]);

  // Generate neon contour paths
  const contourPaths = useMemo(() => {
    return obstacles.map((obstacle, index) => ({
      id: index,
      path: PretextEngine.generateContourPath(obstacle, 10),
    }));
  }, [obstacles]);

  // Base styles
  const baseStyles: React.CSSProperties = exportMode
    ? {
        position: 'relative',
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
        color: '#f0f0f0',
        ...style,
      }
    : {
        ...style,
      };

  const baseClasses = exportMode ? '' : `relative ${className}`;

  if (renderMode === 'canvas') {
    return (
      <div className={baseClasses} style={baseStyles}>
        <canvas ref={canvasRef} className={exportMode ? '' : 'block'} />
        {/* SVG overlay for neon contours */}
        <svg
          className={exportMode ? '' : 'absolute inset-0 pointer-events-none'}
          style={
            exportMode
              ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }
              : undefined
          }
          width={containerWidth}
          height={containerHeight}
        >
          {contourPaths.map((contour) => (
            <path
              key={contour.id}
              d={contour.path}
              fill="none"
              stroke={exportMode ? '#00d9ff' : undefined}
              strokeWidth={exportMode ? '2' : undefined}
              className={exportMode ? '' : 'stroke-[#00d9ff] stroke-2'}
              style={
                exportMode
                  ? {
                      filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))',
                    }
                  : undefined
              }
            />
          ))}
        </svg>
      </div>
    );
  }

  // DOM rendering mode
  return (
    <div className={baseClasses} style={baseStyles}>
      {/* Render text lines */}
      {lines.map((line, index) => (
        <div
          key={index}
          className={exportMode ? '' : 'absolute'}
          style={
            exportMode
              ? {
                  position: 'absolute',
                  left: `${line.x}px`,
                  top: `${line.y - fontSize}px`,
                  color: '#f0f0f0',
                  whiteSpace: 'nowrap',
                }
              : {
                  left: `${line.x}px`,
                  top: `${line.y - fontSize}px`,
                  whiteSpace: 'nowrap',
                }
          }
        >
          {line.text}
        </div>
      ))}

      {/* SVG for neon contours */}
      <svg
        className={exportMode ? '' : 'absolute inset-0 pointer-events-none'}
        style={
          exportMode
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }
            : undefined
        }
        width={containerWidth}
        height={containerHeight}
      >
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {contourPaths.map((contour) => (
          <path
            key={contour.id}
            d={contour.path}
            fill="none"
            stroke={exportMode ? '#00d9ff' : undefined}
            strokeWidth={exportMode ? '2' : undefined}
            className={exportMode ? '' : 'stroke-[#00d9ff] stroke-2'}
            style={
              exportMode
                ? {
                    filter: 'url(#neon-glow)',
                  }
                : undefined
            }
          />
        ))}
      </svg>
    </div>
  );
}
