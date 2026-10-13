import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron, Unbounded } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pretext Generator",
  description: "Генератор визуальных карточек, шпаргалок и презентаций на базе Pretext",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090B] font-sans antialiased">{children}</body>
    </html>
  );
}
