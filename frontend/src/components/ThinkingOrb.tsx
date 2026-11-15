import React, { useEffect, useRef } from "react";
import type { VoiceStatus } from "../types";

interface Props {
  status: VoiceStatus;
  levelRef?: React.RefObject<number>;
  size?: number;
}

const ORB_THEMES: Record<VoiceStatus, { primary: string; secondary: string; glow: string; label: string }> = {
  idle: {
    primary: "#38e1ff",
    secondary: "#1a73e8",
    glow: "rgba(56, 225, 255, 0.4)",
    label: "STANDBY",
  },
  listening: {
    primary: "#10b981",
    secondary: "#059669",
    glow: "rgba(16, 185, 129, 0.5)",
    label: "LISTENING",
  },
  thinking: {
    primary: "#f59e0b",
    secondary: "#d97706",
    glow: "rgba(245, 158, 11, 0.5)",
    label: "NEURAL THINKING",
  },
  speaking: {
    primary: "#60a5fa",
    secondary: "#3b82f6",
    glow: "rgba(96, 165, 250, 0.5)",
    label: "TRANSMITTING",
  },
};

export default function ThinkingOrb({ status, levelRef, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(status);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;

    const particles: Array<{ a: number; dist: number; speed: number; rad: number; phase: number }> = [];
    const numParticles = 36;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        a: (i / numParticles) * Math.PI * 2,
        dist: 0.25 + Math.random() * 0.22,
        speed: (Math.random() * 0.4 + 0.6) * (i % 2 === 0 ? 1 : -1),
        rad: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      const currentStatus = statusRef.current;
      const theme = ORB_THEMES[currentStatus];

      let level = 0.2;
      if (currentStatus === "listening") {
        level = Math.max(levelRef?.current ?? 0, 0.15) * 1.5;
      } else if (currentStatus === "speaking") {
        level = 0.35 + (Math.sin(t * 8) * 0.5 + 0.5) * 0.45;
      } else if (currentStatus === "thinking") {
        level = 0.28 + (Math.sin(t * 5) * 0.5 + 0.5) * 0.25;
      } else {
        level = 0.18 + Math.sin(t * 1.8) * 0.05;
      }
      level = Math.min(Math.max(level, 0.05), 1.0);

      ctx.clearRect(0, 0, size, size);

      // 1. Central Core Glow Gradient
      const coreR = size * (0.16 + level * 0.08);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, theme.primary);
      grad.addColorStop(0.7, theme.glow);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Multi-Layer Orbital Dotted Rings
      particles.forEach((p, idx) => {
        p.a += p.speed * 0.015 * (currentStatus === "thinking" ? 2.5 : 1);
        const dynamicDist = size * (p.dist + Math.sin(t * 2 + p.phase) * 0.04 * (1 + level));
        const px = cx + Math.cos(p.a) * dynamicDist;
        const py = cy + Math.sin(p.a) * dynamicDist;

        ctx.fillStyle = idx % 3 === 0 ? "#ffffff" : theme.primary;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 6 + level * 10;
        ctx.beginPath();
        ctx.arc(px, py, p.rad * (0.8 + level * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Status Ring Wave (Listening / Speaking)
      if (currentStatus === "listening" || currentStatus === "speaking") {
        ctx.strokeStyle = `${theme.primary}88`;
        ctx.lineWidth = 1.5;
        const waveCount = 48;
        ctx.beginPath();
        for (let i = 0; i <= waveCount; i++) {
          const angle = (i / waveCount) * Math.PI * 2;
          const rOffset = Math.sin(angle * 6 + t * 6) * level * (size * 0.08);
          const r = size * 0.42 + rOffset;
          const wx = cx + Math.cos(angle) * r;
          const wy = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 4. Central Solid Nucleus
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 12 + level * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5 + level * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, levelRef]);

  const currentTheme = ORB_THEMES[status];

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className="relative flex items-center justify-center rounded-full p-2 transition-all duration-500"
        style={{
          boxShadow: `0 0 35px ${currentTheme.glow}`,
          background: "radial-gradient(circle, rgba(12,26,48,0.6) 0%, rgba(6,12,24,0.9) 100%)",
          border: `1px solid ${currentTheme.primary}44`,
        }}
      >
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-cyan-300/80">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full animate-ping"
          style={{ backgroundColor: currentTheme.primary }}
        />
        <span style={{ color: currentTheme.primary }}>{currentTheme.label}</span>
      </div>
    </div>
  );
}
