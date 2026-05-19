"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { cn, formatCompact } from "@/lib/design-system";
import { colors } from "@/lib/design-system/tokens";

export interface BarChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  barColor?: string;
  barRadius?: number;
  horizontal?: boolean;
  className?: string;
}

export default function BarChartComponent({
  data,
  height = 200,
  showGrid = false,
  showXAxis = true,
  showYAxis = false,
  barColor = colors.primary.DEFAULT,
  barRadius = 6,
  horizontal = false,
  className,
}: BarChartProps) {
  const ChartComponent = horizontal ? RechartsBarChart : RechartsBarChart;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("w-full", className)}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
          )}

          {horizontal ? (
            <>
              <XAxis type="number" hide={!showYAxis} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: colors.muted }}
                width={80}
              />
            </>
          ) : (
            <>
              {showXAxis && (
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: colors.muted }}
                />
              )}
              {showYAxis && (
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: colors.muted }}
                  tickFormatter={formatCompact}
                />
              )}
            </>
          )}

          <Tooltip
            contentStyle={{
              background: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number) => [formatCompact(value), "Valor"]}
          />

          <Bar
            dataKey="value"
            radius={[barRadius, barRadius, barRadius, barRadius]}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color || barColor} />
            ))}
          </Bar>
        </ChartComponent>
      </ResponsiveContainer>
    </motion.div>
  );
}
