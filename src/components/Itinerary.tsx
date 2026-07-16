/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { ITINERARY_DATA } from "../data";
import { ItineraryItem } from "../types";
import { getItinerary } from "../lib/firestoreService";

// Helper to resolve icon by string name
function resolveIcon(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="w-5 h-5 text-gold-500" />;
  }
  return <LucideIcons.Clock className="w-5 h-5 text-gold-500" />;
}

export default function Itinerary() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(ITINERARY_DATA);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const data = await getItinerary();
        setItinerary(data);
      } catch (err) {
        console.error("Error loading itinerary from Firestore:", err);
      }
    };

    fetchItinerary();

    const handleUpdate = () => {
      fetchItinerary();
    };
    window.addEventListener("wedding_itinerary_updated", handleUpdate);
    return () => window.removeEventListener("wedding_itinerary_updated", handleUpdate);
  }, []);

  return (
    <section id="itinerario" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative vertical lines and leaves background */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gold-200/40 z-0" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-20">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            EL CRONOGRAMA DEL GRAN DÍA
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Itinerario de Boda
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <LucideIcons.Sparkles className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
        </div>

        {/* Timeline Path Layout */}
        <div className="relative">
          
          {/* Main vertical line for desktop (centered) */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-[1px] bg-gold-400/50" />

          {/* Staggered Timeline Items */}
          <div className="space-y-12">
            {itinerary.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-start md:items-center relative ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  
                  {/* Timeline Badge (Icon inside circle) positioned on the timeline line */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white border-2 border-gold-400 shadow-md z-10">
                    {resolveIcon(item.iconName)}
                  </div>

                  {/* Left Column (Time) */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12 text-left md:text-right flex md:block">
                    <span className={`font-serif text-2xl sm:text-3xl text-gold-600 font-light tracking-widest ${
                      isEven ? "md:text-left block" : "md:text-right block"
                    }`}>
                      {item.time}
                    </span>
                  </div>

                  {/* Right Column (Card content) */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12 text-left mt-2 md:mt-0">
                    <div className="p-6 bg-gold-50/70 border border-gold-200/60 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 relative group">
                      {/* Cartier border effect on hover */}
                      <div className="absolute inset-1 border border-transparent group-hover:border-gold-400/25 transition-colors duration-500 pointer-events-none" />
                      
                      <h4 className="font-serif text-lg font-semibold text-zinc-800 mb-2">
                        {item.title}
                      </h4>
                      <p className="font-sans text-sm text-zinc-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Timeline Final Greeting */}
        <div className="text-center mt-20 max-w-xl mx-auto">
          <p className="font-serif italic text-base text-gold-700 leading-relaxed">
            &ldquo;Uno solo puede ser vencido, pero dos pueden resistir. ¡La cuerda de tres hilos no se rompe fácilmente!&rdquo;
          </p>
          <span className="font-sans text-[11px] tracking-[0.2em] text-gold-600 block mt-2.5 uppercase font-bold">
            — ECLESIASTÉS 4:12
          </span>
          <div className="h-[1px] w-12 bg-gold-300 mx-auto mt-5" />
        </div>

      </div>
    </section>
  );
}
