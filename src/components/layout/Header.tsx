'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Code,
  Menu,
  X,
  LayoutGrid,
  Layers,
  Home,
  Sliders,
  BookOpen,
  Zap,
  FileBox,
} from 'lucide-react';

interface HeaderProps {
  showAnchorLinks?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showAnchorLinks = false }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';
  const isEditor = pathname.startsWith('/editor');
  const isGallery = pathname.startsWith('/gallery');



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/90 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold gradient-text leading-none tracking-tight">
                Pretext Generator
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav Links (Desktop md+) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-mono font-medium text-zinc-400">
          {isHome || showAnchorLinks ? (
            <>
              <a href="#sandbox" className="hover:text-cyan-300 transition-colors py-2">
                Песочница
              </a>
              <a href="#magazine" className="hover:text-violet-300 transition-colors py-2">
                Журнал
              </a>
              <a href="#benchmark" className="hover:text-emerald-300 transition-colors py-2">
                Бенчмарк
              </a>
              <a href="#formats" className="hover:text-pink-300 transition-colors py-2">
                Форматы
              </a>
            </>
          ) : (
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center gap-1.5 py-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Главная витрина</span>
            </Link>
          )}

          <Link
            href="/editor"
            className={`hover:text-white transition-colors flex items-center gap-1.5 py-2 ${
              isEditor ? 'text-violet-400 font-bold' : ''
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Студия</span>
          </Link>
          <Link
            href="/gallery"
            className={`hover:text-white transition-colors flex items-center gap-1.5 py-2 ${
              isGallery ? 'text-violet-400 font-bold' : ''
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Галерея</span>
          </Link>
        </nav>

        {/* Right Action Buttons (Desktop md+) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/gallery"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium min-h-[40px] transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs min-h-[40px] transition-all shadow-lg hover:scale-105 ${
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
          aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          className="md:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/98 backdrop-blur-2xl shadow-2xl px-4 py-4 space-y-4 font-mono text-sm max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Main Pages Navigation */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl min-h-[44px] transition-colors ${
                isHome ? 'bg-violet-600/20 text-white font-bold border border-violet-500/30' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-violet-400" />
              <span>Главная страница</span>
            </Link>

            <Link
              href="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl min-h-[44px] transition-colors ${
                isEditor ? 'bg-violet-600/20 text-white font-bold border border-violet-500/30' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Pretext Studio (Редактор)</span>
            </Link>

            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl min-h-[44px] transition-colors ${
                isGallery ? 'bg-violet-600/20 text-white font-bold border border-violet-500/30' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-pink-400" />
              <span>Галерея документов</span>
            </Link>
          </div>

          {/* Home Anchor Quick Links */}
          <div className="pt-3 border-t border-white/10 space-y-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider px-3.5 font-semibold block mb-1">
              Разделы витрины
            </span>
            <Link
              href="/#sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl min-h-[40px] text-zinc-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Песочница</span>
            </Link>
            <Link
              href="/#magazine"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl min-h-[40px] text-zinc-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              <span>Журнал</span>
            </Link>
            <Link
              href="/#benchmark"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl min-h-[40px] text-zinc-400 hover:text-emerald-300 hover:bg-white/5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Бенчмарк</span>
            </Link>
            <Link
              href="/#formats"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl min-h-[40px] text-zinc-400 hover:text-pink-300 hover:bg-white/5 transition-colors"
            >
              <FileBox className="w-3.5 h-3.5 text-pink-400" />
              <span>Форматы</span>
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 font-semibold min-h-[44px] hover:bg-white/10 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Галерея</span>
            </Link>
            <Link
              href="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs text-white font-bold min-h-[44px] shadow-lg shadow-violet-600/30 transition-transform active:scale-95"
            >
              <Code className="w-3.5 h-3.5" />
              <span>В Студию</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
