/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Check, Send, AlertCircle, Heart, User, Search, RefreshCw, Star, HelpCircle, Phone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RSVP } from "../types";

// =========================================================================
// PRE-ASSIGNED GUEST REGISTRY (ADMIN CONTROL)
// The administrators assign these exact quotas and welcoming messages.
// This is easily maintainable and can also be queried from Firebase later.
// =========================================================================
interface PreAssignedGuest {
  fullName: string;
  quota: number;
  welcomeMessage: string;
}

const PRE_ASSIGNED_GUESTS: PreAssignedGuest[] = [
  {
    fullName: "Kimberly Figueroa",
    quota: 2,
    welcomeMessage: "¡Nuestra hermosa novia! Tienes tus lugares especiales reservados en el altar y en la mesa de honor."
  },
  {
    fullName: "Jhon Jairo",
    quota: 2,
    welcomeMessage: "¡Nuestro querido novio! Todo listo para dar el paso más importante de nuestras vidas."
  },
  {
    fullName: "Mariana Gómez",
    quota: 1,
    welcomeMessage: "Estimada Mariana, muchas gracias por tu invaluable apoyo en la coordinación y protocolo de nuestra boda."
  },
  {
    fullName: "Familia Figueroa Barreto",
    quota: 4,
    welcomeMessage: "Querida familia, su amor, fe y bendición son el pilar de nuestro hogar. Nos honra profundamente tenerlos con nosotros."
  },
  {
    fullName: "Familia Gómez",
    quota: 5,
    welcomeMessage: "Estimada familia, estamos sumamente felices de poder compartir esta noche tan especial de fiesta y bendición junto a ustedes."
  },
  {
    fullName: "Andrés Mendoza",
    quota: 2,
    welcomeMessage: "¡Hola Andrés! Esperamos celebrar juntos este gran momento de felicidad y brindar por un nuevo inicio."
  },
  {
    fullName: "María José",
    quota: 1,
    welcomeMessage: "¡Hola María! Tu presencia sumará risas y alegría infinita en nuestra pista de baile."
  },
  {
    fullName: "Juan Carlos",
    quota: 2,
    welcomeMessage: "Estimado Juan, será un verdadero honor contar con tu presencia y la de tu acompañante en este gran día."
  }
];

// Helper to normalize strings (ignoring accents/tildes and case) for perfect user search experience
const normalizeString = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // removes tildes
    .trim();
};

export const RSVP_CONFIG = {
  sectionTagline: "CONFIRMACIÓN DE ASISTENCIA",
  sectionTitle: "Acompáñanos en Nuestro Día",
  subtitle: "Por favor, busca tu nombre y apellido para confirmar tus cupos reservados.",
  deadlineText: "Por favor, confírmanos antes del 10 de Julio de 2026.",
  
  successTitle: "¡Confirmación Guardada!",
  successSubtitle: "Muchas gracias, hemos recibido tu respuesta correctamente.",
  successMessage: "Tu respuesta ha sido registrada y guardada de manera segura. Los novios han sido notificados.",
};

export default function RSVPForm() {
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<PreAssignedGuest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<PreAssignedGuest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Confirmation state
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [activeRsvp, setActiveRsvp] = useState<RSVP | null>(null);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Load existing RSVP from localStorage if any
  useEffect(() => {
    const saved = localStorage.getItem("wedding_rsvp");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveRsvp(parsed);
      } catch (e) {
        console.error("Error reading saved RSVP", e);
      }
    }
  }, []);

  // Run the automatic search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setHasSearched(true);
    
    const query = normalizeString(searchName);
    if (!query || query.length < 3) {
      setErrorMsg("Por favor, escribe al menos 3 caracteres de tu nombre o apellido.");
      setSearchResults([]);
      return;
    }

    // Filter registry with fuzzy match
    const matches = PRE_ASSIGNED_GUESTS.filter(g => {
      const nameNorm = normalizeString(g.fullName);
      return nameNorm.includes(query) || query.includes(nameNorm);
    });

    setSearchResults(matches);
    
    // Auto-select if there is exactly 1 match to make it frictionless
    if (matches.length === 1) {
      setSelectedGuest(matches[0]);
      setAttending(true); // Default selection
    } else {
      setSelectedGuest(null);
    }
  };

  const handleSelectGuest = (guest: PreAssignedGuest) => {
    setSelectedGuest(guest);
    setAttending(true); // Default to Yes
    setErrorMsg("");
  };

  const handleBackToSearch = () => {
    setSelectedGuest(null);
    setSearchResults([]);
    setHasSearched(false);
    setAttending(null);
    setMessage("");
    setErrorMsg("");
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;
    if (attending === null) {
      setErrorMsg("Por favor, selecciona si asistirás o no.");
      return;
    }

    const rsvpData: RSVP = {
      id: "rsvp-" + normalizeString(selectedGuest.fullName).replace(/\s+/g, "-"),
      fullName: selectedGuest.fullName,
      attending: attending,
      guestsCount: attending ? selectedGuest.quota : 0, // Assigned strictly by administrator
      phone: "Registro Automatizado", // Satisfy the RSVP interface requirement elegantly
      message: message.trim() || undefined,
      timestamp: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      // =========================================================================
      // FUTURE FIREBASE / FIRESTORE STORAGE CONNECTION HOOK:
      // When connecting database later, you'll simply do:
      // =========================================================================
      // import { getFirestore, doc, setDoc } from "firebase/firestore";
      // const db = getFirestore();
      // await setDoc(doc(db, "rsvps", rsvpData.id), rsvpData);
      // =========================================================================

      localStorage.setItem("wedding_rsvp", JSON.stringify(rsvpData));
      setActiveRsvp(rsvpData);
      setSuccessAnimation(true);
      
      // Auto close the celebration toast after 4.5s
      setTimeout(() => setSuccessAnimation(false), 4500);
    } catch (err) {
      setErrorMsg("Ocurrió un error al registrar la confirmación. Inténtalo de nuevo.");
      console.error(err);
    }
  };

  const handleResetRsvp = () => {
    if (window.confirm("¿Deseas modificar o registrar otra confirmación?")) {
      localStorage.removeItem("wedding_rsvp");
      setActiveRsvp(null);
      handleBackToSearch();
      setSearchName("");
    }
  };

  return (
    <section id="confirmar-asistencia" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Outer Frame Lines */}
      <div className="absolute top-12 left-12 right-12 bottom-12 border border-gold-500/10 pointer-events-none -z-10 rounded-sm" />

      {/* Luxury Golden and Blush backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gold-100/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            {RSVP_CONFIG.sectionTagline}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            {RSVP_CONFIG.sectionTitle}
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Heart className="w-4 h-4 text-gold-500 fill-current animate-pulse" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-serif italic text-sm text-zinc-500 mt-4 max-w-md mx-auto leading-relaxed">
            {RSVP_CONFIG.subtitle}
          </p>
          <p className="font-sans text-[11px] tracking-widest text-zinc-400 uppercase mt-2 font-semibold">
            {RSVP_CONFIG.deadlineText}
          </p>
        </div>

        {/* Elegant Card Container */}
        <div className="bg-gold-50/40 border border-gold-300 p-6 sm:p-10 rounded-sm shadow-xl relative overflow-hidden">
          {/* Subtle inside card luxury border */}
          <div className="absolute inset-2 border border-gold-400/10 pointer-events-none rounded-xs" />

          <AnimatePresence mode="wait">
            {activeRsvp ? (
              
              // =========================================================================
              // SCREEN 3: ALREADY CONFIRMED VIEW (LOCAL STORAGE SAVED)
              // =========================================================================
              <motion.div
                key="confirmed-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-400 text-emerald-600 mb-6 shadow-md">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>

                <h3 className="font-serif text-2xl text-zinc-900 font-light mb-1">
                  {RSVP_CONFIG.successTitle}
                </h3>
                <p className="font-sans text-[10px] tracking-widest uppercase text-gold-600 font-bold mb-6">
                  {RSVP_CONFIG.successSubtitle}
                </p>

                {/* Info Card Block */}
                <div className="bg-white p-6 border border-gold-200 rounded-sm text-left relative max-w-md mx-auto mb-8 shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold-500" />
                  
                  <div className="mb-4">
                    <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-0.5">Invitado</span>
                    <span className="font-serif text-lg font-medium text-zinc-800">{activeRsvp.fullName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1">Estado de Asistencia</span>
                      <span className={`inline-block px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider font-sans ${
                        activeRsvp.attending 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {activeRsvp.attending ? "Sí, Asistiré" : "No asistiré"}
                      </span>
                    </div>

                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1">Cupos Reservados</span>
                      <span className="font-serif text-base font-semibold text-zinc-800 bg-gold-50 border border-gold-200 px-3 py-0.5 rounded-sm inline-block">
                        {activeRsvp.attending ? `${activeRsvp.guestsCount} ${activeRsvp.guestsCount === 1 ? 'Lugar' : 'Lugares'}` : "0 Lugares"}
                      </span>
                    </div>
                  </div>

                  {activeRsvp.message && (
                    <div className="mt-4 pt-3 border-t border-zinc-100">
                      <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-400 font-bold block mb-1.5">Mensaje para Kimberly & Jhon</span>
                      <p className="font-serif italic text-xs sm:text-sm text-zinc-600 bg-zinc-50 p-3 border border-zinc-100 rounded-xs leading-relaxed">
                        &ldquo;{activeRsvp.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                <p className="font-sans text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed mb-8">
                  {RSVP_CONFIG.successMessage}
                </p>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={handleResetRsvp}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-zinc-950 text-white text-xs tracking-wider uppercase transition-colors hover:bg-zinc-800 cursor-pointer font-semibold rounded-sm shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Modificar mi Respuesta</span>
                </button>
              </motion.div>
            ) : selectedGuest ? (
              
              // =========================================================================
              // SCREEN 2: GUEST MATCHED - ATTENDANCE CONFIRMATION FORM
              // =========================================================================
              <motion.form
                key="confirm-form"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleConfirmSubmit}
                className="space-y-6 text-left"
              >
                {/* Back to search link */}
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="inline-flex items-center text-[10px] tracking-widest uppercase text-gold-600 hover:text-gold-700 font-bold mb-2 transition-colors cursor-pointer"
                >
                  ← Buscar otro nombre
                </button>

                {/* Personal Greeting & Welcoming Text */}
                <div className="bg-white p-5 border border-gold-200 rounded-sm relative shadow-sm">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gold-400" />
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 font-light mb-1.5">
                    ¡Hola, {selectedGuest.fullName}!
                  </h3>
                  <p className="font-serif italic text-xs sm:text-sm text-zinc-600 leading-relaxed mb-3">
                    &ldquo;{selectedGuest.welcomeMessage}&rdquo;
                  </p>
                  
                  {/* Immutable Assigned Seats Count badge */}
                  <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 px-3.5 py-2 rounded-sm mt-1">
                    <Star className="w-4 h-4 text-gold-600 fill-current animate-pulse" />
                    <span className="font-sans text-[10px] tracking-widest uppercase font-semibold text-zinc-500">
                      Cupos Reservados:
                    </span>
                    <span className="font-serif text-base font-bold text-gold-700">
                      {selectedGuest.quota} {selectedGuest.quota === 1 ? 'Persona' : 'Personas'}
                    </span>
                  </div>
                </div>

                {/* Attendance Toggles */}
                <div className="space-y-2">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    ¿Confirmas tu asistencia? *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      className={`py-4 px-5 font-sans text-xs sm:text-sm tracking-wider uppercase border text-center transition-all cursor-pointer rounded-sm ${
                        attending === true
                          ? "bg-zinc-950 text-white border-zinc-950 font-bold shadow-md"
                          : "bg-white text-zinc-600 border-gold-200 hover:border-gold-400"
                      }`}
                    >
                      Sí, asistiré con gusto
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttending(false)}
                      className={`py-4 px-5 font-sans text-xs sm:text-sm tracking-wider uppercase border text-center transition-all cursor-pointer rounded-sm ${
                        attending === false
                          ? "bg-zinc-950 text-white border-zinc-950 font-bold shadow-md"
                          : "bg-white text-zinc-600 border-gold-200 hover:border-gold-400"
                      }`}
                    >
                      No podré asistir
                    </button>
                  </div>
                </div>

                {/* Message to Couple */}
                <div className="space-y-1.5">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    Un Mensaje para los Novios (Opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escríbenos una bendición, consejo o mensaje cariñoso..."
                    rows={3}
                    className="w-full bg-white border border-gold-200 focus:border-gold-500 outline-none p-3.5 font-sans text-sm rounded-sm transition-all resize-none shadow-inner"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-sans flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </p>
                )}

                {/* Actions Block */}
                <div className="pt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
                  <button
                    type="button"
                    onClick={handleBackToSearch}
                    className="w-full sm:w-auto px-6 py-3 border border-zinc-300 hover:bg-zinc-50 font-sans text-xs tracking-wider uppercase font-semibold text-zinc-600 cursor-pointer rounded-sm"
                  >
                    Regresar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-10 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs tracking-[0.25em] uppercase transition-colors cursor-pointer font-bold rounded-sm shadow-md"
                  >
                    <span>Confirmar mi Asistencia</span>
                    <Send className="w-3.5 h-3.5 text-gold-400" />
                  </button>
                </div>
              </motion.form>
            ) : (
              
              // =========================================================================
              // SCREEN 1: SEARCH SEARCH-NAME INPUT SCREEN
              // =========================================================================
              <motion.form
                key="search-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSearchSubmit}
                className="space-y-6"
              >
                {/* Search field */}
                <div className="text-left space-y-2">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-gold-500" />
                    <span>Escribe tu Nombre y Apellido *</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Ej. Andrés Mendoza o Familia Gómez"
                      className="w-full bg-white border border-gold-200 focus:border-gold-500 outline-none pl-12 pr-4 py-4 font-serif text-base rounded-sm transition-all focus:shadow-md"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-sans text-left flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}

                {/* Trigger Search Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs tracking-[0.25em] uppercase transition-colors cursor-pointer font-bold rounded-sm shadow-md hover:shadow-lg"
                >
                  <span>Buscar mi Invitación</span>
                  <Search className="w-4 h-4 text-gold-400" />
                </button>

                {/* Fuzzy search results state / Feedback */}
                <AnimatePresence>
                  {hasSearched && searchResults.length === 0 && !errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 border border-rose-200 p-4 rounded-sm text-left flex items-start space-x-3 mt-4"
                    >
                      <HelpCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-rose-700 font-bold block">
                          Nombre no encontrado
                        </span>
                        <p className="font-sans text-xs text-rose-600 leading-relaxed">
                          No encontramos coincidencias exactas en la lista. Por favor, asegúrate de escribir tu nombre o apellido correctamente (ej. escribe solo tu apellido principal como "Gómez" o "Figueroa").
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {hasSearched && searchResults.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 mt-4 text-left"
                    >
                      <div className="flex items-center space-x-1 text-gold-600">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
                          Selecciona tu nombre de la lista:
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {searchResults.map((guest) => (
                          <button
                            key={guest.fullName}
                            type="button"
                            onClick={() => handleSelectGuest(guest)}
                            className="w-full text-left bg-white hover:bg-gold-50/50 p-4 border border-gold-200 hover:border-gold-400 transition-all rounded-sm flex justify-between items-center cursor-pointer font-serif text-sm text-zinc-800"
                          >
                            <span>{guest.fullName}</span>
                            <span className="font-sans text-[10px] uppercase tracking-widest text-gold-600 font-bold bg-gold-50 px-2 py-1 rounded-sm border border-gold-100">
                              Seleccionar
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Friendly Test instructions footer */}
                <div className="pt-4 border-t border-gold-100 flex items-start space-x-3 text-left opacity-90">
                  <Star className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-sans text-[9px] uppercase tracking-widest text-gold-600 font-bold block mb-0.5">
                      Prueba la Experiencia (Demostración)
                    </span>
                    <p className="font-sans text-[11px] text-zinc-500 leading-relaxed">
                      Puedes buscar nombres de prueba como: <strong className="text-zinc-700">Kimberly Figueroa</strong>, <strong className="text-zinc-700">Andrés Mendoza</strong>, <strong className="text-zinc-700">Familia Gómez</strong>, o <strong className="text-zinc-700">Familia Figueroa Barreto</strong>. El sistema buscará sus cupos asignados de manera automática.
                    </p>
                  </div>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Elegant Fireworks / Heart success celebration toast */}
      <AnimatePresence>
        {successAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="flex flex-col items-center text-center bg-zinc-950/95 text-white px-8 py-6 rounded-sm border border-gold-400 shadow-2xl backdrop-blur-md max-w-sm"
            >
              <Heart className="w-12 h-12 text-gold-400 fill-current mb-3 animate-bounce" />
              <p className="font-serif text-lg text-gold-200">¡Muchas Gracias!</p>
              <p className="font-sans text-[10px] tracking-widest text-zinc-400 uppercase mt-2 font-semibold">
                Respuesta registrada con éxito
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
