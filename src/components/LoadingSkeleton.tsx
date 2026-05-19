"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "title" | "avatar" | "card" | "button" | "custom";
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  const variantStyles: Record<string, { width: string; height: string }> = {
    text: { width: "80%", height: "14px" },
    title: { width: "60%", height: "28px" },
    avatar: { width: "40px", height: "40px" },
    card: { width: "100%", height: "120px" },
    button: { width: "120px", height: "40px" },
    custom: { width: "100%", height: "20px" },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`skeleton ${roundedClasses[rounded]} ${className}`}
      style={{
        width: width ?? styles.width,
        height: height ?? styles.height,
      }}
    />
  );
}

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({ showAvatar = true, lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <div className={`card p-5 space-y-4 ${className}`}>
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" height="12px" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={i === lines - 1 ? "60%" : "100%"}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonKPIProps {
  className?: string;
}

export function SkeletonKPI({ className = "" }: SkeletonKPIProps) {
  return (
    <div className={`card-metric p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="50%" height="12px" />
          <Skeleton variant="title" width="40%" />
          <Skeleton variant="text" width="30%" height="12px" />
        </div>
        <Skeleton variant="avatar" rounded="lg" width="40px" height="40px" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 5, className = "" }: SkeletonTableProps) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-zinc-50/80 border-b border-border px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="80px" height="12px" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-3 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                variant="text"
                width={colIdx === 0 ? "120px" : "80px"}
                height="14px"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className = "" }: SkeletonDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="title" width="200px" />
          <Skeleton variant="text" width="150px" height="12px" />
        </div>
        <Skeleton variant="button" rounded="lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>

      {/* Chart + Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton variant="card" height="200px" rounded="lg" />
        <Skeleton variant="card" height="200px" rounded="lg" />
        <Skeleton variant="card" height="200px" rounded="lg" />
      </div>

      {/* Table */}
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}

export default Skeleton;
