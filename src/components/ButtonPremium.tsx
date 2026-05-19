"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonPremiumProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const ButtonPremium = forwardRef<HTMLButtonElement, ButtonPremiumProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      glow = false,
      pulse = false,
      icon,
      iconPosition = "left",
      loading = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "relative inline-flex items-center justify-center font-semibold transition-all duration-300 btn-ripple";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-primary to-secondary text-navy hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
      secondary:
        "bg-secondary/10 text-secondary hover:bg-secondary/20 hover:-translate-y-0.5 active:translate-y-0",
      ghost:
        "bg-transparent text-muted hover:text-navy hover:bg-zinc-100 active:bg-zinc-200",
    };

    const sizeClasses = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2.5 rounded-xl gap-2",
      lg: "text-base px-6 py-3 rounded-xl gap-2.5",
    };

    const glowClass = glow && variant === "primary" ? "btn-glow" : "";
    const pulseClass = pulse ? "nova-indicacao-pulse" : "";
    const disabledClass = disabled || loading ? "opacity-60 cursor-not-allowed" : "";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClass} ${pulseClass} ${disabledClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Carregando...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="icon-float">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="icon-float">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

ButtonPremium.displayName = "ButtonPremium";

export default ButtonPremium;
