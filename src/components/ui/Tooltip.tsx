"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/design-system";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

const positions = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrows = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-navy border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-navy border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-navy border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-navy border-y-transparent border-l-transparent",
};

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-navy rounded-lg shadow-lg whitespace-nowrap",
              positions[position],
              className
            )}
          >
            {content}
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                arrows[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
