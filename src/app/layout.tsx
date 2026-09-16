import type { Metadata } from "next";
import { VT323, Press_Start_2P, Orbitron } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pretext Generator - Слайды, Карточки, Шпаргалки",
  description: "Генератор визуальных карточек, шпаргалок и презентаций на базе Pretext",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${vt323.variable} ${pressStart.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090B] antialiased">{children}</body>
    </html>
  );
}
