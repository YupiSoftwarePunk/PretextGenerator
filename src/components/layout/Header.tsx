'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Code, Menu, X, LayoutGrid, Layers } from 'lucide-react';

interface HeaderProps {
  showAnchorLinks?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showAnchorLinks = false }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';
  const isEditor = pathname.startsWith('/editor');
  const isGallery = pathname.startsWith('/gallery');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/85 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold gradient-text leading-none tracking-tight">
                Pretext Core
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block tracking-wider">
              120 FPS TYPOGRAPHY
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-zinc-400">
          {isHome || showAnchorLinks ? (
            <>
              <a href="#sandbox" className="hover:text-cyan-300 transition-colors">
                Песочница
              </a>
              <a href="#magazine" className="hover:text-violet-300 transition-colors">
                Журнал
              </a>
              <a href="#benchmark" className="hover:text-emerald-300 transition-colors">
                Бенчмарк
              </a>
              <a href="#formats" className="hover:text-pink-300 transition-colors">
                Форматы
              </a>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Главная витрина</span>
              </Link>
              <Link
                href="/editor"
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                  isEditor ? 'text-violet-400 font-bold' : ''
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Студия</span>
              </Link>
              <Link
                href="/gallery"
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                  isGallery ? 'text-violet-400 font-bold' : ''
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Галерея</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/gallery"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
              isGallery
                ? 'bg-violet-600/30 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Галерея</span>
          </Link>

          <Link
            href="/editor"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg hover:scale-105 ${
              isEditor
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-600/30'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Pretext Studio</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-6 py-4 space-y-3 font-mono text-sm">
          {isHome ? (
            <>
              <a
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-300 hover:text-cyan-300"
              >
                • Песочница
              </a>
              <a
                href="#magazine"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-300 hover:text-violet-300"
              >
                • Журнал
              </a>
              <a
                href="#benchmark"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-300 hover:text-emerald-300"
              >
                • Бенчмарк
              </a>
              <a
                href="#formats"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-300 hover:text-pink-300"
              >
                • Форматы документов
              </a>
            </>
          ) : (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-zinc-300 hover:text-white"
            >
              • Главная
            </Link>
          )}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300"
            >
              Галерея
            </Link>
            <Link
              href="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center rounded-lg bg-violet-600 text-xs text-white font-bold"
            >
              Студия
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
