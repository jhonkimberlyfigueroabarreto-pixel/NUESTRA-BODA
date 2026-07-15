/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Calendar, Sparkles } from "lucide-react";
import ringsStoryImage from "../assets/images/wedding_rings_story_1784056643278.jpg";
import lakeStoryImage from "../assets/images/wedding_story_lake_couple_1784063740303.jpg";
import { getOurStory } from "../lib/firestoreService";

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
    const fetchMilestones = async () => {
      try {
        const data = await getOurStory();
        setMilestones(data);
      } catch (err) {
        console.error("Error loading story from Firestore:", err);
      }
    };

    fetchMilestones();

    const handleUpdate = () => {
      fetchMilestones();
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

        {/* 2. Pinterest/Masonry Story Cards Layout (Perfect for original photo aspect ratios) */}
        <div className="columns-1 md:columns-2 gap-8 space-y-8 [column-fill:_balance] mt-16 max-w-5xl mx-auto">
          {milestones.map((milestone, idx) => {
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.1 }}
                className="break-inside-avoid relative overflow-hidden bg-gold-50/10 p-6 sm:p-7 border border-gold-200 rounded-sm hover:shadow-xl hover:border-gold-300 transition-all duration-500 cursor-pointer group flex flex-col mb-8"
              >
                {/* Elegant luxury inner borders */}
                <div className="absolute inset-1.5 border border-gold-500/10 pointer-events-none rounded-xs" />

                {/* Milestone Image without hardcoded crop height or forced aspect-ratio */}
                <div className="relative w-full overflow-hidden bg-zinc-50 rounded-xs mb-5 border border-zinc-100">
                  <img
                    src={milestone.imageUrl}
                    alt={milestone.title}
                    className="w-full h-auto block transition-all duration-[1200ms] ease-out group-hover:scale-105 filter brightness-[98%]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gold-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Date & Icon */}
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" />
                  <span className="font-serif italic text-xs tracking-wider text-gold-600">
                    {milestone.date}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-serif text-xl font-light text-zinc-900 mb-3 tracking-wide flex items-center justify-between">
                  <span>{milestone.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 fill-none opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                </h4>

                {/* Description */}
                <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                  {milestone.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
