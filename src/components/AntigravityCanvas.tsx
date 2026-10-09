'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  baseAngle: number;
  radius: number;
  speed: number;
  length: number;
  width: number;
  color: string;
  phase: number;
}

export default function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      '#4338ca', // Indigo
      '#6366f1', // Light indigo
      '#8b5cf6', // Violet
      '#a855f7', // Purple
      '#3b82f6', // Blue
      '#2563eb', // Royal blue
      '#9333ea', // Deep purple
      '#c084fc', // Lilac
    ];

    // Radial orbital particles matching the Google Antigravity visual
    const count = Math.min(320, Math.floor((width * height) / 4500));
    const particles: Particle[] = [];

    const maxRadius = Math.max(width, height) * 0.75;
    const minRadius = 80;

    for (let i = 0; i < count; i++) {
      const radius = minRadius + Math.pow(Math.random(), 0.75) * (maxRadius - minRadius);
      particles.push({
        baseAngle: Math.random() * Math.PI * 2,
        radius,
        speed: (Math.random() * 0.0006 + 0.0002) * (Math.random() > 0.5 ? 1 : -1),
        length: Math.random() * 3 + 2.5,
        width: Math.random() * 1.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovering: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovering = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
        mouse.isHovering = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.008;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.baseAngle += p.speed;

        // Position on spiral orbit
        let currentRadius = p.radius + Math.sin(time + p.phase) * 12;
        let px = centerX + Math.cos(p.baseAngle) * currentRadius;
        let py = centerY + Math.sin(p.baseAngle) * (currentRadius * 0.75); // Elliptical distortion

        // Mouse gravitational attraction & displacement
        const dx = mouse.x - px;
        const dy = mouse.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let angle = p.baseAngle + Math.PI / 2; // Tangent angle

        if (dist < 260) {
          const force = (1 - dist / 260);
          px += (dx / dist) * force * 35;
          py += (dy / dist) * force * 35;
          angle = Math.atan2(dy, dx) + Math.PI / 2; // Swirl towards mouse
        }

        // Draw elongated dash / capsule
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.ellipse(0, 0, p.length, p.width, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;

        // Opacity falloff at very edge or very center
        const edgeFade = Math.min(1, Math.max(0, (currentRadius - minRadius) / 60));
        ctx.globalAlpha = 0.65 * edgeFade;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
    />
  );
}
