"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
  glowEnabled?: boolean;
}

export default function ScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  showLabel = true,
  animated = true,
  glowEnabled = true,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(animated ? 0 : score);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const offset = circumference - progress;

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 70) return { stroke: "#00e5c8", glow: "rgba(0, 229, 200, 0.5)" };
    if (s >= 50) return { stroke: "#4040bf", glow: "rgba(64, 64, 191, 0.4)" };
    if (s >= 30) return { stroke: "#8b2fc9", glow: "rgba(139, 47, 201, 0.4)" };
    return { stroke: "#6b7294", glow: "rgba(107, 114, 148, 0.3)" };
  };

  const colors = getColor(score);

  useEffect(() => {
    if (!animated) return;

    const duration = 1200;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = score;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * eased);

      setAnimatedScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div
      className="score-ring relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={glowEnabled && score >= 70 ? "score-ring-glow" : ""}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(26, 17, 69, 0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animated ? "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            filter: glowEnabled ? `drop-shadow(0 0 4px ${colors.glow})` : "none",
          }}
        />
      </svg>

      {showLabel && (
        <span
          className={`absolute text-sm font-bold ${score >= 70 ? "text-primary-dark" : score >= 50 ? "text-secondary" : "text-muted"}`}
          style={{
            animation: animated ? "count-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards" : "none",
            opacity: animated ? 0 : 1,
          }}
        >
          {animatedScore}
        </span>
      )}
    </div>
  );
}
