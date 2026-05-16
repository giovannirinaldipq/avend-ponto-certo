import Image from "next/image";

interface AvendLogoProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Ícone da marca AVEND — usa a imagem real com tratamento para fundo claro/escuro.
 * No fundo claro, mostra o ícone com fundo navy arredondado.
 * No fundo escuro, aplica brightness para clarear.
 */
export default function AvendLogo({ size = 48, variant = "light", className = "" }: AvendLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shadow-lg ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      <Image
        src="/images/avend-icon.png"
        alt="AVEND"
        width={size}
        height={size}
        className={`object-cover ${variant === "dark" ? "brightness-[1.5]" : ""}`}
        style={{ width: size, height: size }}
        priority
      />
    </div>
  );
}

/**
 * Logo completa AVEND (logomarca horizontal) — usa a imagem real.
 * variant="dark" aplica brightness para uso em fundos escuros.
 */
export function AvendLogoFull({ height = 32, variant = "light", className = "" }: { height?: number; variant?: "light" | "dark"; className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/avend-logo.png"
        alt="AVEND"
        width={Math.round(height * 3.5)}
        height={height}
        className={`object-contain ${variant === "dark" ? "brightness-[10]" : ""}`}
        style={{ height, width: "auto" }}
        priority
      />
    </div>
  );
}
