'use client';

import { useEffect, useRef, useState } from 'react';

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsActive(true);

      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }, 1000);

    return () => {
      clearTimeout(startDelay);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01';
    const charArray = chars.split('');

    const fontSize = 20;
    const columns = Math.floor(canvas.width / fontSize);

    const drops: number[] = [];
    const dropSpeeds: number[] = [];
    const dropOpacity: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * (canvas.height / fontSize));

      dropSpeeds[i] = 0.5 + Math.random() * 1.5;

      dropOpacity[i] = 0.3 + Math.random() * 0.7;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        const opacity = dropOpacity[i];
        ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20);
          dropSpeeds[i] = 0.5 + Math.random() * 1.5;
          dropOpacity[i] = 0.3 + Math.random() * 0.7;
        }

        drops[i] += dropSpeeds[i];
      }
    };

    const interval = setInterval(draw, 35);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-2000 ease-in-out ${
        isVisible ? 'opacity-20' : 'opacity-0'
      }`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
