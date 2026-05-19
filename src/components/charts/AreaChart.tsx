"use client";

import { useMemo } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { cn, formatCompact } from "@/lib/design-system";
import { colors, gradients } from "@/lib/design-system/tokens";

export interface AreaChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  strokeColor?: string;
  strokeWidth?: number;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  className?: string;
  animate?: boolean;
}

function CustomTooltip(props: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}) {
  const { active, payload, label, formatValue, formatLabel } = props;
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value as number;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-border px-4 py-3"
    >
      <p className="text-xs text-muted mb-1">
        {formatLabel ? formatLabel(label as string) : label}
      </p>
      <p className="text-lg font-bold text-navy">
        {formatValue ? formatValue(value) : formatCompact(value)}
      </p>
    </motion.div>
  );
}

export default function AreaChartComponent({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height = 200,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  showTooltip = true,
  gradientFrom = colors.primary.DEFAULT,
  gradientTo = "transparent",
  strokeColor = colors.primary.DEFAULT,
  strokeWidth = 2,
  formatValue,
  formatLabel,
  className,
  animate = true,
}: AreaChartProps) {
  const gradientId = useMemo(
    () => `area-gradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full", className)}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.3} />
              <stop offset="100%" stopColor={gradientTo} stopOpacity={0} />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              vertical={false}
            />
          )}

          {showXAxis && (
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: colors.muted }}
              dy={10}
            />
          )}

          {showYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: colors.muted }}
              tickFormatter={(value) => formatCompact(value)}
              dx={-10}
            />
          )}

          {showTooltip && (
            <Tooltip
              content={
                <CustomTooltip
                  formatValue={formatValue}
                  formatLabel={formatLabel}
                />
              }
              cursor={{
                stroke: colors.primary.DEFAULT,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            animationDuration={animate ? 1500 : 0}
            animationEasing="ease-out"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
