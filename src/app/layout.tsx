import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AVEND Ponto Certo",
  description: "Capte pontos comerciais para máquinas de vending e seja remunerado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
