"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatCompact, formatPercent } from "@/lib/design-system";
import { colors } from "@/lib/design-system/tokens";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Sparkline from "../charts/Sparkline";

interface KPICardProps {
  title: string;
  value: number;
  format?: "number" | "currency" | "percent" | "compact";
  prefix?: string;
  suffix?: string;
  trend?: { value: number; label?: string };
  sparklineData?: number[];
  icon?: ReactNode;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap = {
  primary: colors.primary.DEFAULT,
  secondary: colors.secondary.DEFAULT,
  accent: colors.accent.DEFAULT,
  success: colors.success.DEFAULT,
  warning: colors.warning.DEFAULT,
  danger: colors.danger.DEFAULT,
};

const bgColorMap = {
  primary: colors.primary[100],
  secondary: colors.secondary[100],
  accent: colors.accent[100],
  success: colors.success.bg,
  warning: colors.warning.bg,
  danger: colors.danger.bg,
};

export default function KPICard({
  title,
  value,
  format = "number",
  prefix,
  suffix,
  trend,
  sparklineData,
  icon,
  color = "primary",
  size = "md",
  className,
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `R$ ${formatCurrency(val)}`;
      case "percent":
        return formatPercent(val, 1);
      case "compact":
        return formatCompact(val);
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? colors.success.DEFAULT
      : trend.value < 0
      ? colors.danger.DEFAULT
      : colors.muted
    : colors.muted;

  const sizeClasses = {
    sm: { card: "p-4", title: "text-xs", value: "text-xl" },
    md: { card: "p-6", title: "text-sm", value: "text-3xl" },
    lg: { card: "p-8", title: "text-base", value: "text-4xl" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-2xl border border-border relative overflow-hidden",
        sizeClasses[size].card,
        className
      )}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ background: colorMap[color] }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className={cn("text-muted font-medium", sizeClasses[size].title)}>
            {title}
          </span>
          {icon && (
            <div
              className="p-2 rounded-xl"
              style={{ background: bgColorMap[color] }}
            >
              <div style={{ color: colorMap[color] }}>{icon}</div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-muted text-lg">{prefix}</span>}
          <motion.span
            className={cn("font-bold text-navy", sizeClasses[size].value)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {formatValue(value)}
          </motion.span>
          {suffix && <span className="text-muted text-lg">{suffix}</span>}
        </div>

        {/* Trend & Sparkline */}
        <div className="flex items-center justify-between mt-3">
          {trend && TrendIcon && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1"
            >
              <TrendIcon size={14} style={{ color: trendColor }} />
              <span className="text-sm font-medium" style={{ color: trendColor }}>
                {trend.value > 0 ? "+" : ""}
                {formatPercent(trend.value, 1)}
              </span>
              {trend.label && (
                <span className="text-xs text-muted ml-1">{trend.label}</span>
              )}
            </motion.div>
          )}

          {sparklineData && sparklineData.length > 1 && (
            <Sparkline
              data={sparklineData}
              strokeColor={colorMap[color]}
              fillColor={colorMap[color]}
              width={80}
              height={28}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
