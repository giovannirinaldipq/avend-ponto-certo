"use client";

import { useEffect, useRef } from "react";

interface HeroGradientMeshProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  intensity?: "subtle" | "medium" | "vibrant";
}

export default function HeroGradientMesh({
  children,
  className = "",
  animated = true,
  intensity = "medium",
}: HeroGradientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const intensityConfig = {
    subtle: { primary: 0.08, secondary: 0.06, accent: 0.04 },
    medium: { primary: 0.15, secondary: 0.12, accent: 0.1 },
    vibrant: { primary: 0.25, secondary: 0.2, accent: 0.15 },
  };

  const config = intensityConfig[intensity];

  useEffect(() => {
    if (!animated || !containerRef.current) return;

    const container = containerRef.current;
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;

      const x1 = 20 + Math.sin(time) * 10;
      const y1 = 30 + Math.cos(time * 0.8) * 10;
      const x2 = 80 + Math.sin(time * 1.2) * 10;
      const y2 = 20 + Math.cos(time) * 10;
      const x3 = 60 + Math.sin(time * 0.6) * 15;
      const y3 = 80 + Math.cos(time * 1.1) * 10;

      container.style.background = `
        radial-gradient(at ${x1}% ${y1}%, rgba(0, 229, 200, ${config.primary}) 0%, transparent 50%),
        radial-gradient(at ${x2}% ${y2}%, rgba(64, 64, 191, ${config.secondary}) 0%, transparent 50%),
        radial-gradient(at ${x3}% ${y3}%, rgba(139, 47, 201, ${config.accent}) 0%, transparent 50%),
        linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)
      `;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [animated, config]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: animated
          ? undefined
          : `
          radial-gradient(at 20% 30%, rgba(0, 229, 200, ${config.primary}) 0%, transparent 50%),
          radial-gradient(at 80% 20%, rgba(64, 64, 191, ${config.secondary}) 0%, transparent 50%),
          radial-gradient(at 60% 80%, rgba(139, 47, 201, ${config.accent}) 0%, transparent 50%),
          linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)
        `,
      }}
    >
      {/* Floating orbs for extra depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(0, 229, 200, 0.4) 0%, transparent 70%)",
            top: "10%",
            left: "5%",
            animation: animated ? "float 8s ease-in-out infinite" : "none",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(64, 64, 191, 0.4) 0%, transparent 70%)",
            top: "20%",
            right: "10%",
            animation: animated ? "float 10s ease-in-out infinite reverse" : "none",
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(139, 47, 201, 0.4) 0%, transparent 70%)",
            bottom: "15%",
            left: "30%",
            animation: animated ? "float 12s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
