"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/design-system";
import { colors } from "@/lib/design-system/tokens";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  showDot?: boolean;
  className?: string;
}

export default function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeColor = colors.primary.DEFAULT,
  strokeWidth = 2,
  fillColor,
  showDot = true,
  className,
}: SparklineProps) {
  const { path, fillPath, lastPoint } = useMemo(() => {
    if (!data.length) return { path: "", fillPath: "", lastPoint: null };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * (width - padding * 2),
      y: padding + (1 - (value - min) / range) * (height - padding * 2),
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return {
      path: pathD,
      fillPath: fillPathD,
      lastPoint: points[points.length - 1],
    };
  }, [data, width, height]);

  if (!data.length) return null;

  return (
    <motion.svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {fillColor && (
        <motion.path
          d={fillPath}
          fill={fillColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
        />
      )}
      <motion.path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {showDot && lastPoint && (
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3}
          fill={strokeColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        />
      )}
    </motion.svg>
  );
}
