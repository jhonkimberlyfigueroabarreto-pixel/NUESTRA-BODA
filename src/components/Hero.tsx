/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronDown, Sparkles } from "lucide-react";
import { WEDDING_DATE } from "../data";
import coverImage from "../assets/images/wedding_cover_custom_couple_1784063752964.jpg";

// ==========================================
// EDITABLE CONTENT SECTION
// Feel free to modify any of these values
// ==========================================
export const HERO_CONFIG = {
  brideName: "Kimberly",
  groomName: "Jhon",
  weddingActionText: "Nos Casamos",
  weddingDateFormatted: "1 de Agosto de 2026",
  romanticText: "El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección. Hoy iniciamos la aventura más hermosa de nuestras vidas, uniendo nuestros caminos para siempre bajo una misma promesa.",
  buttonText: "Conoce nuestra historia",
  countdownTitle: "La Cuenta Regresiva",
  todayIsTheDayText: "¡Hoy es nuestro gran día!",
};

interface HeroProps {
  onDiscoverClick: () => void;
}

export default function Hero({ onDiscoverClick }: HeroProps) {
  const [cover, setCover] = useState<string>(coverImage);
  const [countdownTitle, setCountdownTitle] = useState<string>(HERO_CONFIG.countdownTitle);
  const [formattedDate, setFormattedDate] = useState<string>(HERO_CONFIG.weddingDateFormatted);
  const [weddingDate, setWeddingDate] = useState<Date>(WEDDING_DATE);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  // Load custom cover and countdown on mount
  useEffect(() => {
    const savedCover = localStorage.getItem("wedding_custom_cover_image");
    if (savedCover) {
      setCover(savedCover);
    }

    const savedTitle = localStorage.getItem("wedding_countdown_title");
    if (savedTitle) {
      setCountdownTitle(savedTitle);
    }

    const savedFormatted = localStorage.getItem("wedding_countdown_date_formatted");
    if (savedFormatted) {
      setFormattedDate(savedFormatted);
    }

    const savedDate = localStorage.getItem("wedding_countdown_date");
    if (savedDate) {
      try {
        setWeddingDate(new Date(savedDate));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Listen for updates in real-time
  useEffect(() => {
    const handleCoverUpdate = () => {
      const savedCover = localStorage.getItem("wedding_custom_cover_image");
      if (savedCover) {
        setCover(savedCover);
      } else {
        setCover(coverImage);
      }
    };

    const handleCountdownUpdate = () => {
      const savedTitle = localStorage.getItem("wedding_countdown_title");
      if (savedTitle) setCountdownTitle(savedTitle);

      const savedFormatted = localStorage.getItem("wedding_countdown_date_formatted");
      if (savedFormatted) setFormattedDate(savedFormatted);

      const savedDate = localStorage.getItem("wedding_countdown_date");
      if (savedDate) {
        try {
          setWeddingDate(new Date(savedDate));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWeddingDate(WEDDING_DATE);
      }
    };

    window.addEventListener("wedding_cover_updated", handleCoverUpdate);
    window.addEventListener("wedding_countdown_date_updated", handleCountdownUpdate);
    return () => {
      window.removeEventListener("wedding_cover_updated", handleCoverUpdate);
      window.removeEventListener("wedding_countdown_date_updated", handleCountdownUpdate);
    };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = weddingDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <section
      id="inicio"
      className="relative min-h-screen w-full flex flex-col justify-between items-center text-center overflow-hidden bg-zinc-950 text-white selection:bg-gold-500/30"
    >
      {/* 1. Full Screen Background with Zoom effect on load */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.03, opacity: 0.55 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          src={cover}
          alt={`${HERO_CONFIG.brideName} & ${HERO_CONFIG.groomName} Wedding`}
          className="w-full h-full object-cover filter brightness-50 contrast-[102%]"
          referrerPolicy="no-referrer"
        />
        {/* Elegant dark gradient layers for reading contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/40 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_10%,rgba(9,9,11,0.9)_90%)]" />
      </div>

      {/* Decorative Luxury Lines & Corners */}
      <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-gold-500/15 pointer-events-none z-10 hidden sm:block">
        <div className="absolute top-1 left-1 bottom-1 right-1 border border-gold-500/5" />
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold-400" />
      </div>

      {/* Spacing to clear floating navbar */}
      <div className="h-24 sm:h-28 z-10 w-full" />

      {/* 2. Main Hero Content Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-4xl z-10 w-full">
        {/* Sparkle Icon with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-4 sm:mb-6 text-gold-400/80 flex justify-center items-center"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </motion.div>

        {/* Elegant Names Typography Pairing */}
        <div className="mb-6 sm:mb-8 select-none">
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-wide leading-none text-white drop-shadow-sm"
          >
            {HERO_CONFIG.brideName}
          </motion.h1>

          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="block font-serif text-3xl sm:text-4xl md:text-5xl my-3 text-gold-400 italic font-light"
          >
            &
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: -35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-wide leading-none text-white drop-shadow-sm"
          >
            {HERO_CONFIG.groomName}
          </motion.h1>
        </div>

        {/* Action subtitle & Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
          className="flex flex-col items-center w-full max-w-2xl"
        >
          <div className="h-[1px] w-28 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent mb-5" />
          
          <h2 className="font-serif text-2xl sm:text-3xl tracking-widest text-gold-200 mb-3 uppercase font-light">
            {HERO_CONFIG.weddingActionText}
          </h2>

          <div className="flex items-center space-x-2 text-zinc-300 font-sans tracking-[0.2em] text-xs sm:text-sm mb-6 uppercase">
            <Calendar className="w-4 h-4 text-gold-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Romantic Text Block */}
          <p className="font-serif italic text-sm sm:text-base text-zinc-300/90 leading-relaxed max-w-xl mb-10 px-2 sm:px-6">
            &ldquo;{HERO_CONFIG.romanticText}&rdquo;
          </p>

          {/* Elegant Cartier Inspired Action Button */}
          <button
            onClick={onDiscoverClick}
            className="group relative px-8 py-4 bg-transparent text-gold-300 font-sans text-[10px] sm:text-xs tracking-[0.3em] uppercase border border-gold-400/40 overflow-hidden cursor-pointer transition-all duration-500 rounded-xs hover:text-zinc-950 hover:border-gold-300 shadow-lg hover:shadow-gold-500/10"
          >
            {/* Elegant slide up overlay */}
            <span className="absolute inset-0 bg-gold-400 -translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-zinc-950 font-semibold">
              {HERO_CONFIG.buttonText}
            </span>
          </button>
        </motion.div>
      </div>

      {/* 3. Elegant Countdown Cards Section */}
      <div className="w-full max-w-4xl px-6 pb-12 sm:pb-16 z-10 flex flex-col items-center">
        {!timeLeft.isOver ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <p className="font-serif italic text-xs sm:text-sm tracking-[0.25em] text-gold-400 mb-6 flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gold-400/40" />
              <span>{countdownTitle}</span>
              <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold-400/40" />
            </p>

            {/* Countdown Grid - High-end Cards */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
              {[
                { label: "Días", value: timeLeft.days },
                { label: "Horas", value: timeLeft.hours },
                { label: "Minutos", value: timeLeft.minutes },
                { label: "Segundos", value: timeLeft.seconds, highlight: true },
              ].map((card, idx) => (
                <div
                  key={card.label}
                  className={`relative overflow-hidden p-3 sm:p-4 rounded-sm border transition-all duration-300 bg-zinc-950/80 backdrop-blur-md ${
                    card.highlight
                      ? "border-gold-400/40 shadow-[0_0_15px_rgba(197,160,89,0.1)]"
                      : "border-gold-500/15"
                  }`}
                >
                  {/* Subtle inner gold accent line */}
                  <div className="absolute inset-[1px] border border-gold-500/5 pointer-events-none rounded-xs" />
                  
                  <span
                    className={`block font-serif text-2xl sm:text-4xl md:text-5xl font-extralight tracking-tight ${
                      card.highlight ? "text-gold-400" : "text-white"
                    }`}
                  >
                    {String(card.value).padStart(2, "0")}
                  </span>
                  <span className="block text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-sans mt-1.5 font-medium">
                    {card.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4 px-8 border border-gold-400/30 bg-gold-500/5 backdrop-blur-md rounded-sm"
          >
            <p className="font-serif text-lg sm:text-2xl tracking-widest text-gold-300 uppercase font-light animate-pulse">
              {HERO_CONFIG.todayIsTheDayText}
            </p>
          </motion.div>
        )}

        {/* Pulse Scrolling Indicator Arrow */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-10 cursor-pointer text-gold-400/70 hover:text-gold-300 transition-colors"
          onClick={onDiscoverClick}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
}
