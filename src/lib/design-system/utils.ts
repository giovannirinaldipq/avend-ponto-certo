// Design System Utilities - Avend Ponto Certo Enterprise
// Utility functions for consistent styling

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in BRL
 */
export function formatCurrency(value: number, options?: { decimals?: number }): string {
  const { decimals = 0 } = options || {};
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return "#00e5c8"; // primary
  if (score >= 50) return "#4040bf"; // secondary
  if (score >= 30) return "#8b2fc9"; // accent
  return "#545b7a"; // muted
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 70) return "Muito Bom";
  if (score >= 50) return "Bom";
  if (score >= 30) return "Regular";
  return "Baixo";
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(current: number, previous: number): {
  direction: "up" | "down" | "neutral";
  percent: number;
  color: string;
} {
  if (previous === 0) {
    return { direction: "neutral", percent: 0, color: "#545b7a" };
  }

  const percent = ((current - previous) / previous) * 100;

  if (percent > 0) {
    return { direction: "up", percent, color: "#10b981" };
  }
  if (percent < 0) {
    return { direction: "down", percent: Math.abs(percent), color: "#ef4444" };
  }
  return { direction: "neutral", percent: 0, color: "#545b7a" };
}

/**
 * Generate stagger delay for animations
 */
export function staggerDelay(index: number, baseDelay = 50): string {
  return `${index * baseDelay}ms`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return then.toLocaleDateString("pt-BR");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
