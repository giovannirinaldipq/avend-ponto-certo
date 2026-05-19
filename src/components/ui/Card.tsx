"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/design-system";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: "default" | "elevated" | "glass" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  className?: string;
}

const variants = {
  default: "bg-white border border-border",
  elevated: "bg-white shadow-md",
  glass: "bg-white/80 backdrop-blur-xl border border-white/20",
  gradient: "bg-gradient-to-br from-white to-gray-50/50 border border-border",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: "0 8px 24px rgba(26,17,69,0.08)" } : undefined}
      className={cn(
        "rounded-2xl transition-shadow",
        variants[variant],
        paddings[padding],
        hover && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Sub-components
Card.Header = function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-navy", className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted", className)}>{children}</p>
  );
};

Card.Content = function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
};

Card.Footer = function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-border", className)}>
      {children}
    </div>
  );
};
