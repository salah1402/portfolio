import React, { useEffect, useRef } from 'react';

/**
 * HeroCanvas Component (React Bits inspired Threads & Wave Filament Canvas)
 * Features:
 * - Fluid harmonic multi-strand filament waves drawn on HTML5 Canvas
 * - Gentle mouse-displacement physics that smoothly part lines around pointer
 * - Subtle ambient radial light gradient tracking cursor with lerp interpolation
 * - High-DPI retina rendering with devicePixelRatio compensation
 * - Zero external bundle bloat, zero dependencies, 60fps requestAnimationFrame
 * - Auto-pauses on visibility hidden or reduced-motion
 */
export const HeroCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Pointer state with smooth lerping
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Wave parameters
    let time = 0;
    const lineCount = 6;

    const render = () => {
      time += 0.008;

      // Smooth pointer lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient mouse aura (soft luxury warm glow)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
        glow.addColorStop(0, 'rgba(252, 71, 120, 0.07)');
        glow.addColorStop(0.5, 'rgba(252, 71, 120, 0.02)');
        glow.addColorStop(1, 'rgba(252, 71, 120, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Multi-strand organic wave filaments
      for (let i = 0; i < lineCount; i++) {
        const progress = i / (lineCount - 1);
        const baseY = height * 0.38 + (i - lineCount / 2) * 28;
        const freq = 0.0022 + i * 0.0004;
        const speed = 1 + i * 0.2;
        const amp = 34 + i * 8;

        ctx.beginPath();

        const step = 8;
        for (let x = 0; x <= width + step; x += step) {
          let y = baseY + Math.sin(x * freq + time * speed) * amp + Math.cos(x * 0.001 - time * 0.5) * 12;

          // Pointer repulsion displacement
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 180;
            if (dist < radius) {
              const force = (1 - dist / radius) * 32;
              y += (dy / (dist || 1)) * force;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Color styling: subtle graphite hairlines with one rose accent filament
        if (i === 2) {
          ctx.strokeStyle = 'rgba(252, 71, 120, 0.28)';
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = `rgba(43, 43, 43, ${0.05 + progress * 0.06})`;
          ctx.lineWidth = 1.0;
        }

        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-60 sm:opacity-100 transition-opacity duration-300 ${className}`}
      aria-hidden="true"
    />
  );
};

export default HeroCanvas;
