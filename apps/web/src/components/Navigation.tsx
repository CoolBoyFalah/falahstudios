"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
const [, setActiveLink] = useState("");
  const navItems = [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#portfolio" },
    { label: "Insights", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-950 font-black text-lg">◆</span>
              </div>
            </div>
            <span className="hidden sm:inline font-black text-sm tracking-widest uppercase">
              Falah <br className="hidden" /> Studios
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                onMouseEnter={() => setActiveLink(item.href)}
                onMouseLeave={() => setActiveLink("")}
              >
                {item.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="#contact"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/50 transition-all text-sm"
            >
              Let's Talk
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-amber-400 block"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-amber-400 block"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-amber-400 block"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-amber-500/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-white hover:bg-amber-500/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="#contact"
                className="block px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-semibold rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Let's Talk
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
