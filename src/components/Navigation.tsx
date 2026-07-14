/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavigationProps {
  activeSection: string;
}

export default function Navigation({ activeSection }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: "Inicio", id: "inicio" },
    { label: "Nuestra historia", id: "nuestra-historia" },
    { label: "Ceremonia", id: "ceremonia" },
    { label: "Recepción", id: "recepcion" },
    { label: "Itinerario", id: "itinerario" },
    { label: "Galería", id: "galeria" },
    { label: "Confirmación", id: "confirmar-asistencia" },
    { label: "Mi Mesa", id: "encuentra-tu-mesa" },
    { label: "Regalos", id: "mesa-de-regalos" },
    { label: "Comparte Fotos", id: "comparte-tus-fotos" },
    { label: "Mensajes", id: "mensajes" },
    { label: "Contacto", id: "contacto" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of floating navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Top Floating Navbar */}
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-zinc-950/90 backdrop-blur-md border-b border-gold-500/20 py-4 shadow-lg"
            : "bg-gradient-to-b from-zinc-950/80 to-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo / Monogram */}
          <button
            onClick={() => handleScrollTo("inicio")}
            id="nav-logo-btn"
            className="flex items-center space-x-2 text-left cursor-pointer group focus:outline-none"
          >
            <span className="font-serif text-2xl tracking-[0.2em] font-light text-gold-400 group-hover:text-gold-200 transition-colors duration-300">
              K<span className="text-sm font-light text-white/50">&</span>J
            </span>
          </button>

          {/* Desktop Navigation Links (Responsive hiding) */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`relative font-sans text-[10px] xl:text-xs tracking-[0.2em] uppercase cursor-pointer py-1 transition-colors duration-300 focus:outline-none ${
                  activeSection === item.id
                    ? "text-gold-400 font-medium"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Hamburguer button */}
          <button
            onClick={() => setIsOpen(true)}
            id="nav-mobile-open"
            className="lg:hidden p-1 text-gold-400 hover:text-gold-200 focus:outline-none cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-lg z-50 flex flex-col justify-between p-8"
          >
            {/* Header of Drawer */}
            <div className="flex justify-between items-center">
              <span className="font-serif text-3xl tracking-[0.25em] font-light text-gold-400">
                K<span className="text-base text-zinc-400">&</span>J
              </span>
              <button
                onClick={() => setIsOpen(false)}
                id="nav-mobile-close"
                className="p-1 text-gold-400 hover:text-gold-200 focus:outline-none cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Cartier Inspired Frame background decoration */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border border-gold-500/10 pointer-events-none -z-10 rounded-sm" />

            {/* Links scrollable list */}
            <div className="flex-1 flex flex-col justify-center space-y-5 my-10 overflow-y-auto max-h-[70vh] py-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleScrollTo(item.id)}
                  className={`font-serif text-lg tracking-[0.2em] uppercase text-left py-2 cursor-pointer focus:outline-none ${
                    activeSection === item.id
                      ? "text-gold-400 pl-4 border-l-2 border-gold-500/60 font-medium"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Footer of Drawer */}
            <div className="text-center">
              <div className="flex justify-center items-center space-x-2 text-gold-400/60 mb-2">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <p className="font-serif text-xs tracking-widest text-zinc-500">
                01.08.2026 • KIMBERLY & JHON JAIRO
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
