'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';

interface JournalVisualizerProps {
  text: string;
  initialObstacles: Obstacle[];
}

export const JournalVisualizer: React.FC<JournalVisualizerProps> = ({ text, initialObstacles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);
  const [obstacles, setObstacles] = useState<Obstacle[]>(initialObstacles);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 48); // subtracting padding
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Animate obstacles to show dynamic wrapping
  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      setObstacles((prev) =>
        prev.map((obs, i) => {
          const widthBound = Math.max(containerWidth - 200, 250);
          return {
            ...obs,
            x:
              i === 0
                ? 60 + Math.sin(time) * 40
                : Math.min(widthBound, 320 + Math.cos(time * 0.8) * 50),
            y:
              i === 0
                ? 40 + Math.cos(time) * 25
                : 130 + Math.sin(time * 0.9) * 25,
          };
        })
      );
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [containerWidth]);

  const layout: WordLayoutItem[] = useMemo(() => {
    if (containerWidth <= 0) return [];

    const engine = new PretextEngine({
      containerWidth,
      fontSize: 16,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 26,
    });

    return engine.calculateWordLayout(text, obstacles, 12);
  }, [text, obstacles, containerWidth]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[380px] h-[400px] border border-violet-500/20 rounded-2xl p-6 bg-zinc-950/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-violet-950/20"
    >
      {/* Decorative background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Render Obstacles */}
      {obstacles.map((obs, i) => (
        <div
          key={i}
          className="absolute border border-violet-400/60 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center pointer-events-none select-none"
          style={{
            left: `${obs.x}px`,
            top: `${obs.y}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`,
            borderRadius: obs.shape === 'circle' ? '50%' : '14px',
            transition: 'left 0.05s linear, top 0.05s linear',
          }}
        >
          <span className="text-xs font-mono font-semibold tracking-wider text-violet-200/90 uppercase px-2 text-center">
            {obs.shape === 'circle' ? '● Orb' : '■ Card'}
          </span>
        </div>
      ))}

      {/* Render Words */}
      <div className="relative font-sans text-zinc-200 text-[16px] leading-[26px]">
        {layout.map((item, i) => (
          <span
            key={i}
            className="absolute transition-all duration-75 ease-out select-none text-zinc-100/90 hover:text-cyan-300 hover:scale-105 cursor-default"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.width}px`,
            }}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
};
export default JournalVisualizer;
