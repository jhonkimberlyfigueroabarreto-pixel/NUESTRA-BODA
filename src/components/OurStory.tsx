/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Calendar, Sparkles } from "lucide-react";
import ringsStoryImage from "../assets/images/wedding_rings_story_1784056643278.jpg";
import lakeStoryImage from "../assets/images/wedding_story_lake_couple_1784063740303.jpg";

// ==========================================
// EDITABLE CONTENT SECTION
// Feel free to modify dates, titles, descriptions, and images
// ==========================================
export const TIMELINE_MILESTONES = [
  {
    id: "milestone-1",
    date: "Octubre de 2021",
    title: "El Primer Encuentro",
    description: "Nuestra historia comenzó con una conversación casual que encendió una chispa instantánea. Compartiendo risas, sueños y café por horas, nos dimos cuenta de que estábamos ante el inicio de algo verdaderamente especial.",
    imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "milestone-2",
    date: "Marzo de 2023",
    title: "Aventuras Compartidas",
    description: "Viajes espontáneos, retos superados de la mano y el aprendizaje constante de amarnos. En estos años construimos los cimientos de nuestro amor verdadero, convirtiéndonos en mejores amigos y confidentes eternos.",
    imageUrl: lakeStoryImage,
  },
  {
    id: "milestone-3",
    date: "Enero de 2026",
    title: "La Gran Propuesta",
    description: "Bajo un cielo estrellado de medianoche, Jhon se arrodilló con una promesa de amor infinito. Kimberly dijo un 'Sí' rotundo impregnado de lágrimas, alegría y emoción absoluta por el hogar que construirán.",
    // Let's use the local rings/flowers pre-wedding detail as part of the proposal/rings story to keep original asset compiling
    imageUrl: ringsStoryImage,
  },
  {
    id: "milestone-4",
    date: "1 de Agosto de 2026",
    title: "Nuestro 'Para Siempre'",
    description: "Llegó el momento de unir nuestras vidas de manera definitiva. Delante de Dios, de nuestras familias y de ustedes que han sido testigos de nuestro caminar, comenzaremos la etapa más mágica de nuestro destino.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
  },
];

export const STORY_INTRO = {
  sectionTagline: "NUESTRA HISTORIA DE AMOR",
  sectionTitle: "El Camino Hacia El Altar",
  subtitle: "Caminando juntos, un paso a la vez, escribiendo un para siempre eterno.",
  introParagraph: "Cada momento vivido nos ha traído hasta este día tan esperado. Te compartimos los hitos más felices y significativos que han marcado nuestra historia de complicidad, fe y devoción absoluta.",
};

export default function OurStory() {
  const [milestones, setMilestones] = useState(TIMELINE_MILESTONES);

  useEffect(() => {
    const saved = localStorage.getItem("wedding_our_story_milestones");
    if (saved) {
      try {
        setMilestones(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const handleUpdate = () => {
      const updated = localStorage.getItem("wedding_our_story_milestones");
      if (updated) {
        try {
          setMilestones(JSON.parse(updated));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("wedding_stories_updated", handleUpdate);
    return () => window.removeEventListener("wedding_stories_updated", handleUpdate);
  }, []);

  return (
    <section id="nuestra-historia" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background subtle shapes */}
      <div className="absolute top-20 right-[-10%] w-[350px] h-[350px] bg-gold-100/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[350px] h-[350px] bg-gold-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            {STORY_INTRO.sectionTagline}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            {STORY_INTRO.sectionTitle}
          </h2>
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Heart className="w-4 h-4 text-gold-500 fill-current animate-pulse" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-serif italic text-base text-zinc-500 max-w-lg mx-auto mb-4">
            {STORY_INTRO.subtitle}
          </p>
          <p className="font-sans text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            {STORY_INTRO.introParagraph}
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative mt-16">
          
          {/* Central Line - Elegant Golden Line with subtle shadow */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold-200 via-gold-400 to-gold-200 transform md:-translate-x-1/2 opacity-60" />

          {/* Timeline Milestones Cards */}
          <div className="space-y-12 md:space-y-24">
            {milestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0;
              
              return (
                <div
                  key={milestone.id}
                  className="relative flex flex-col md:flex-row items-center"
                >
                  {/* Timeline Badge (Node on Central Line) */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-gold-400 flex items-center justify-center z-20 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  </motion.div>

                  {/* Left Column (Desktop) */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right">
                    {isEven ? (
                      <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-gold-50/20 p-5 sm:p-6 border border-gold-200 rounded-sm hover:shadow-lg hover:border-gold-300 transition-all duration-300 relative group"
                      >
                        {/* Elegant luxury inner borders */}
                        <div className="absolute inset-1.5 border border-gold-500/5 pointer-events-none rounded-xs" />
                        
                        {/* Milestone Image */}
                        <div className="overflow-hidden rounded-xs mb-4 max-h-[220px] aspect-video w-full">
                          <img
                            src={milestone.imageUrl}
                            alt={milestone.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[97%]"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Title & Description */}
                        <span className="font-serif italic text-xs text-gold-600 block mb-1">{milestone.date}</span>
                        <h4 className="font-serif text-xl font-medium text-zinc-900 mb-2">
                          {milestone.title}
                        </h4>
                        <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          {milestone.description}
                        </p>
                      </motion.div>
                    ) : (
                      /* Empty spacer to align cards correctly on desktop */
                      <div className="hidden md:block" />
                    )}
                  </div>

                  {/* Right Column (Desktop) */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-12 mt-6 md:mt-0">
                    {!isEven ? (
                      <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-gold-50/20 p-5 sm:p-6 border border-gold-200 rounded-sm hover:shadow-lg hover:border-gold-300 transition-all duration-300 relative group"
                      >
                        {/* Elegant luxury inner borders */}
                        <div className="absolute inset-1.5 border border-gold-500/5 pointer-events-none rounded-xs" />

                        {/* Milestone Image */}
                        <div className="overflow-hidden rounded-xs mb-4 max-h-[220px] aspect-video w-full">
                          <img
                            src={milestone.imageUrl}
                            alt={milestone.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[97%]"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Title & Description */}
                        <span className="font-serif italic text-xs text-gold-600 block mb-1">{milestone.date}</span>
                        <h4 className="font-serif text-xl font-medium text-zinc-900 mb-2">
                          {milestone.title}
                        </h4>
                        <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          {milestone.description}
                        </p>
                      </motion.div>
                    ) : (
                      /* Empty spacer to align cards correctly on desktop */
                      <div className="hidden md:block" />
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
