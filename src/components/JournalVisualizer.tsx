'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PretextEngine } from '../../PretextEngine';
import { Obstacle, getAvailableWidth } from '../../ObstacleDetector';

interface JournalVisualizerProps {
  text: string;
  initialObstacles: Obstacle[];
}

export const JournalVisualizer: React.FC<JournalVisualizerProps> = ({ text, initialObstacles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [obstacles, setObstacles] = useState(initialObstacles);
  
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  // Animate obstacles to show dynamic wrapping
  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      setObstacles(prev => prev.map((obs, i) => ({
        ...obs,
        x: i === 0 
          ? 100 + Math.sin(time) * 50 
          : 400 + Math.cos(time) * 50,
        y: i === 0
          ? 50 + Math.cos(time) * 30
          : 150 + Math.sin(time) * 30
      })));
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const layout = useMemo(() => {
    if (containerWidth === 0) return [];

    const engine = new PretextEngine();
    const fontConfig = { fontSize: 16, fontFamily: 'sans-serif' };
    const words = engine.prepare(text, fontConfig);

    const calculatedLayout: { word: string, x: number, y: number, width: number }[] = [];
    let currentX = 0;
    let currentY = 0;
    const lineHeight = 24;
    const gap = 10;

    words.forEach((wordMeas) => {
      let availableWidth = getAvailableWidth(currentY, containerWidth, obstacles, gap);
      
      if (currentX + wordMeas.width > availableWidth) {
        currentX = 0;
        currentY += lineHeight;
        availableWidth = getAvailableWidth(currentY, containerWidth, obstacles, gap);
      }

      calculatedLayout.push({
        word: wordMeas.word,
        x: currentX,
        y: currentY,
        width: wordMeas.width
      });

      currentX += wordMeas.width + 5;
    });

    return calculatedLayout;
  }, [text, obstacles, containerWidth]);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] border border-white/10 rounded-lg p-6 bg-zinc-950">
      {/* Render Obstacles */}
      {obstacles.map((obs, i) => (
        <div
          key={i}
          className="absolute bg-violet-500/30 border border-violet-400 backdrop-blur-sm"
          style={{
            left: obs.x,
            top: obs.y,
            width: obs.width,
            height: obs.height,
            borderRadius: obs.shape === 'circle' ? '50%' : '8px',
            transition: 'all 0.05s linear' // Smooth movement
          }}
        />
      ))}

      {/* Render Text */}
      <div className="relative font-sans text-white text-[16px] leading-[24px]">
        {layout.map((item, i) => (
          <span
            key={i}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: item.x,
              top: item.y,
              width: item.width
            }}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
};
