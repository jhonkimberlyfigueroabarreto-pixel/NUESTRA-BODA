/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, Send, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GuestbookMessage } from "../types";
import { INITIAL_MESSAGES } from "../data";

export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wedding_guestbook");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !messageText.trim()) return;

    const newMessage: GuestbookMessage = {
      id: "msg-" + Date.now(),
      author: authorName.trim(),
      message: messageText.trim(),
      timestamp: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      heartCount: 0,
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem("wedding_guestbook", JSON.stringify(updated));

    setAuthorName("");
    setMessageText("");
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 2500);
  };

  const handleHeartClick = (id: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        return { ...m, heartCount: m.heartCount + 1 };
      }
      return m;
    });
    setMessages(updated);
    localStorage.setItem("wedding_guestbook", JSON.stringify(updated));
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm("¿Deseas eliminar este mensaje del muro de bendiciones?")) {
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      localStorage.setItem("wedding_guestbook", JSON.stringify(updated));
    }
  };

  return (
    <section id="mensajes" className="py-24 bg-gold-50/50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            MURAL DE BENDICIONES Y BUENOS DESEOS
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Mensajes para los Novios
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <MessageSquare className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto">
            Déjanos una dedicatoria, un consejo para esta nueva etapa, o tus mejores deseos para Kimberly y Jhon Jairo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: MESSAGE SUBMISSION FORM */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 border border-gold-200 rounded-sm shadow-md relative">
            <div className="absolute inset-1 border border-gold-400/15 pointer-events-none" />
            
            <h3 className="font-serif text-xl text-zinc-900 font-medium mb-6 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gold-600" />
              <span>Escribir Mensaje</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Tu Nombre o Familia *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej. Familia Restrepo Hoyos"
                  className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none p-3 font-sans text-sm rounded-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Mensaje o Consejos *
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe tus hermosos deseos aquí..."
                  rows={5}
                  className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none p-3 font-sans text-sm rounded-sm resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs tracking-widest uppercase transition-colors cursor-pointer rounded-sm"
              >
                <span>Enviar Dedicatoria</span>
                <Send className="w-3.5 h-3.5 text-gold-400" />
              </button>
            </form>

            <AnimatePresence>
              {successAnimation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-emerald-800 text-xs font-sans text-center font-semibold"
                >
                  🎉 ¡Mensaje publicado en el muro!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE MESSAGES WALL */}
          <div className="lg:col-span-7 space-y-6 max-h-[550px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => {
                const isCustomMsg = msg.id.startsWith("msg-") && !["msg-1", "msg-2", "msg-3"].includes(msg.id);
                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-sm border border-gold-100 shadow-sm relative hover:shadow-md transition-shadow group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-400/45 group-hover:bg-gold-500 transition-colors" />

                    {isCustomMsg && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif text-lg font-semibold text-zinc-800">
                          {msg.author}
                        </h4>
                        <span className="font-sans text-[9px] tracking-widest text-zinc-400 uppercase font-medium">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-sm text-zinc-600 leading-relaxed italic pr-4">
                      &ldquo;{msg.message}&rdquo;
                    </p>

                    {/* Likes heart incrementer */}
                    <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-end">
                      <button
                        onClick={() => handleHeartClick(msg.id)}
                        className="flex items-center space-x-1.5 px-3 py-1 bg-gold-50 hover:bg-gold-100/70 border border-gold-200 text-gold-700 transition-all rounded-full cursor-pointer text-xs"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span className="font-bold font-sans">{msg.heartCount}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {messages.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gold-300 bg-white/20">
                <p className="font-sans text-sm text-zinc-400">Aún no hay dedicatorias. ¡Sé el primero en dejar un mensaje!</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
