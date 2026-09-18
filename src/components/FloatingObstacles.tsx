'use client';

import React, { useEffect, useState } from 'react';

// Color palette matching the project
const COLORS = [
  'bg-violet-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-purple-500'
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

export const FloatingObstacles: React.FC = () => {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([]);

  useEffect(() => {
    // Generate initial orbs
    const newOrbs = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
    }));
    setOrbs(newOrbs);
  }, []);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setOrbs(prev => prev.map(orb => {
        let newX = orb.x + orb.speedX;
        let newY = orb.y + orb.speedY;

        // Bounce off walls
        let newSpeedX = orb.speedX;
        let newSpeedY = orb.speedY;
        if (newX < 0 || newX > 100) newSpeedX = -orb.speedX;
        if (newY < 0 || newY > 100) newSpeedY = -orb.speedY;

        return { ...orb, x: newX, y: newY, speedX: newSpeedX, speedY: newSpeedY };
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map(orb => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-[100px] opacity-20 ${orb.color} animate-pulse`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            transition: 'left 0.1s linear, top 0.1s linear'
          }}
        />
      ))}
    </div>
  );
};
