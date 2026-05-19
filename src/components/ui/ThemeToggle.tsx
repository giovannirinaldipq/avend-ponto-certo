"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/design-system";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  const sizes = {
    sm: { button: "w-8 h-8", icon: 14 },
    md: { button: "w-10 h-10", icon: 18 },
    lg: { button: "w-12 h-12", icon: 22 },
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-xl flex items-center justify-center transition-colors",
        "bg-surface border border-border hover:border-primary/30",
        sizes[size].button,
        className
      )}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon size={sizes[size].icon} className="text-primary" />
        ) : (
          <Sun size={sizes[size].icon} className="text-warning" />
        )}
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          boxShadow: isDark
            ? "0 0 12px rgba(0, 229, 200, 0.3)"
            : "0 0 12px rgba(245, 158, 11, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
