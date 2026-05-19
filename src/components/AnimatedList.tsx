"use client";

import { Children, cloneElement, isValidElement, ReactNode, useEffect, useState } from "react";

interface AnimatedListProps {
  children: ReactNode;
  animation?: "fade" | "spring" | "stagger";
  baseDelay?: number;
  delayIncrement?: number;
  className?: string;
}

export function AnimatedList({
  children,
  animation = "spring",
  baseDelay = 50,
  delayIncrement = 50,
  className = "",
}: AnimatedListProps) {
  const animationClass = {
    fade: "animate-fade-in",
    spring: "spring-item",
    stagger: "stagger-item",
  };

  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        const delay = baseDelay + index * delayIncrement;

        return cloneElement(child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
          className: `${(child.props as { className?: string }).className || ""} ${animationClass[animation]}`,
          style: {
            ...(child.props as { style?: React.CSSProperties }).style,
            animationDelay: `${delay}ms`,
            opacity: 0,
          },
        });
      })}
    </div>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  animation?: "fade" | "spring" | "pop";
  delay?: number;
  className?: string;
}

export function AnimatedItem({
  children,
  animation = "spring",
  delay = 0,
  className = "",
}: AnimatedItemProps) {
  const animationClass = {
    fade: "animate-fade-in",
    spring: "spring-item",
    pop: "number-animate",
  };

  return (
    <div
      className={`${animationClass[animation]} ${className}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {children}
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1000,
  className = "",
}: AnimatedNumberProps) {
  return (
    <span className={`number-animate ${className}`}>
      {prefix}
      <CountUp end={value} duration={duration} />
      {suffix}
    </span>
  );
}

// Simple count-up hook
function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (end - startValue) * eased);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count.toLocaleString("pt-BR")}</>;
}

export default AnimatedList;
