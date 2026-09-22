'use client';

import React, { useEffect, useState } from 'react';

// Color palette matching the project
const COLORS = [
  'bg-violet-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-purple-500',
];

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
}

function createInitialOrbs(): FloatingOrb[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    x: 10 + (i * 15) % 80,
    y: 10 + (i * 20) % 80,
    size: 150 + (i * 30) % 150,
    color: COLORS[i % COLORS.length],
    speedX: (i % 2 === 0 ? 0.08 : -0.08),
    speedY: (i % 3 === 0 ? 0.06 : -0.06),
  }));
}

export const FloatingObstacles: React.FC = () => {
  const [orbs, setOrbs] = useState<FloatingOrb[]>(createInitialOrbs);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setOrbs((prev) =>
        prev.map((orb) => {
          let nextSpeedX = orb.speedX;
          let nextSpeedY = orb.speedY;
          let nextX = orb.x + nextSpeedX;
          let nextY = orb.y + nextSpeedY;

          // Bounce off walls
          if (nextX < 0 || nextX > 100) {
            nextSpeedX = -nextSpeedX;
            nextX = Math.max(0, Math.min(100, nextX));
          }
          if (nextY < 0 || nextY > 100) {
            nextSpeedY = -nextSpeedY;
            nextY = Math.max(0, Math.min(100, nextY));
          }

          return {
            ...orb,
            x: nextX,
            y: nextY,
            speedX: nextSpeedX,
            speedY: nextSpeedY,
          };
        })
      );
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-[100px] opacity-20 ${orb.color} animate-pulse`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            transition: 'left 0.1s linear, top 0.1s linear',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingObstacles;
