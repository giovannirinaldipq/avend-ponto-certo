"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const BRAND_COLORS = [
  "#00e5c8", // primary
  "#4040bf", // secondary
  "#8b2fc9", // accent
  "#1a1145", // navy
  "#00c4ab", // primary-dark
  "#FFD700", // gold
];

export default function ConfettiCelebration({
  trigger,
  duration = 3000,
  particleCount = 50,
  colors = BRAND_COLORS,
  onComplete,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const createParticles = useCallback(() => {
    const newParticles: ConfettiParticle[] = [];
    const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 3,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    return newParticles;
  }, [particleCount, colors]);

  useEffect(() => {
    if (!trigger) return;

    setIsActive(true);
    setParticles(createParticles());

    const timeout = setTimeout(() => {
      setIsActive(false);
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, duration, createParticles, onComplete]);

  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocityX * 0.1,
          y: p.y + p.velocityY * 0.3,
          rotation: p.rotation + p.rotationSpeed,
          velocityY: p.velocityY + 0.05, // gravity
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, particles.length]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.y > 100 ? 0 : 1,
          }}
        >
          {particle.shape === "square" && (
            <div
              className="w-3 h-3"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === "circle" && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === "triangle" && (
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: `10px solid ${particle.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Hook para facilitar o uso
export function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);

  const celebrate = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const reset = useCallback(() => {
    setShowConfetti(false);
  }, []);

  return {
    showConfetti,
    celebrate,
    reset,
    ConfettiComponent: (props: Omit<ConfettiCelebrationProps, "trigger">) => (
      <ConfettiCelebration
        {...props}
        trigger={showConfetti}
        onComplete={() => {
          reset();
          props.onComplete?.();
        }}
      />
    ),
  };
}
