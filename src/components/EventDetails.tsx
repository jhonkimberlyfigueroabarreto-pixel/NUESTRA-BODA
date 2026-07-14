/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, Clock, Shirt, Copy, Check, Eye, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

export default function EventDetails() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState<string | null>(null);

  const events = [
    {
      id: "ceremonia",
      type: "La Ceremonia",
      title: "Ceremonia Religiosa",
      time: "07:00 PM",
      location: "Parroquia Sagrado Corazón de Jesús",
      address: "Barranquilla, Colombia",
      dressCode: "Formal de Etiqueta (Smoking / Traje Oscuro y Vestido Largo)",
      note: "Por favor acompañarnos 15 minutos antes para el ingreso solemne de la corte.",
      mapUrl: "https://maps.google.com/?q=Parroquia+Sagrado+Corazón+de+Jesús,+Barranquilla",
      latLngMock: "10.9943,-74.7964",
    },
    {
      id: "recepcion",
      type: "La Recepción",
      title: "Banquete & Fiesta de Gala",
      time: "08:00 PM",
      location: "Casona del Prado",
      address: "Calle 70 # 60 - 11, Barranquilla, Colombia",
      dressCode: "Etiqueta Rigurosa (Vestido de Gala y Smoking / Frac)",
      note: "Contaremos con servicio de estacionamiento privado y personal de seguridad.",
      mapUrl: "https://maps.google.com/?q=Casona+del+Prado+Calle+70+%23+60+-+11,+Barranquilla",
      latLngMock: "11.0007,-74.7981",
    },
  ];

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2500);
  };

  return (
    <>
      {/* CEREMONIA SECTION */}
      <section id="ceremonia" className="py-24 bg-white relative overflow-hidden">
        {/* Subtle decorative vector watermark background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-zinc-900 pointer-events-none select-none">
          <span className="font-serif text-[18vw] font-light italic leading-none">K&J</span>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
              DONDE SELLARÁ NUESTRO AMOR
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900">
              La Ceremonia
            </h2>
            <div className="h-[1px] w-20 bg-gold-400 mx-auto mt-4" />
          </div>

          {/* Cartier Inspired Single Column Elegant Card for Ceremony */}
          <div className="relative bg-gold-50 p-8 md:p-12 rounded-sm shadow-xl border border-gold-300 max-w-2xl mx-auto">
            {/* Elegant double border inside card */}
            <div className="absolute inset-2 border border-gold-400/20 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-white border border-gold-200 text-gold-500 mb-6">
                <Clock className="w-8 h-8 stroke-[1.25]" />
              </span>
              
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-800 font-light mb-2">
                {events[0].title}
              </h3>
              <p className="font-sans text-xs tracking-widest text-gold-600 uppercase mb-6 font-semibold">
                Sábado, 1 de Agosto de 2026 • {events[0].time}
              </p>

              <div className="h-[1px] w-12 bg-gold-300 mx-auto mb-6" />

              {/* Location details */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center space-x-2 text-zinc-900 mb-2">
                  <MapPin className="w-5 h-5 text-gold-500" />
                  <span className="font-serif text-lg font-medium">{events[0].location}</span>
                </div>
                <p className="font-sans text-sm text-zinc-500 mb-4">{events[0].address}</p>
                
                {/* Action Buttons for Location */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => handleCopyAddress(events[0].address, "ceremonia")}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-zinc-100 border border-gold-300 text-gold-700 text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer rounded-sm"
                  >
                    {copiedAddress === "ceremonia" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Dirección</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowMapModal("ceremonia")}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer rounded-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Mapa</span>
                  </button>
                </div>
              </div>

              {/* No nested dress code here, moved to a separate section */}
            </div>
          </div>
        </div>
      </section>

      {/* RECEPCION SECTION */}
      <section id="recepcion" className="py-24 bg-gold-50/40 border-t border-gold-200/50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
              CELEBRACIÓN Y BRINDIS DE GALA
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900">
              La Recepción
            </h2>
            <div className="h-[1px] w-20 bg-gold-400 mx-auto mt-4" />
          </div>

          {/* Cartier Inspired Single Column Elegant Card for Reception */}
          <div className="relative bg-white p-8 md:p-12 rounded-sm shadow-xl border border-gold-300 max-w-2xl mx-auto">
            {/* Elegant double border inside card */}
            <div className="absolute inset-2 border border-gold-400/20 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-500 mb-6">
                <Shirt className="w-8 h-8 stroke-[1.25]" />
              </span>
              
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-800 font-light mb-2">
                {events[1].title}
              </h3>
              <p className="font-sans text-xs tracking-widest text-gold-600 uppercase mb-6 font-semibold">
                Sábado, 1 de Agosto de 2026 • {events[1].time}
              </p>

              <div className="h-[1px] w-12 bg-gold-300 mx-auto mb-6" />

              {/* Location details */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center space-x-2 text-zinc-900 mb-2">
                  <MapPin className="w-5 h-5 text-gold-500" />
                  <span className="font-serif text-lg font-medium">{events[1].location}</span>
                </div>
                <p className="font-sans text-sm text-zinc-500 mb-4">{events[1].address}</p>
                
                {/* Action Buttons for Location */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => handleCopyAddress(events[1].address, "recepcion")}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-zinc-100 border border-gold-300 text-gold-700 text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer rounded-sm"
                  >
                    {copiedAddress === "recepcion" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Dirección</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowMapModal("recepcion")}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer rounded-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Mapa</span>
                  </button>
                </div>
              </div>

              {/* No nested dress code here, moved to a separate section */}
            </div>
          </div>
        </div>
      </section>

      {/* CÓDIGO DE VESTIMENTA SECTION */}
      <section id="codigo-vestimenta" className="py-24 bg-white relative overflow-hidden border-t border-gold-200/50">
        {/* Subtle decorative vector watermark background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] text-zinc-900 pointer-events-none select-none">
          <Shirt className="w-[30vw] h-[30vw] stroke-[1]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
              CÓMO VESTIR PARA NUESTRO DÍA
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900">
              Código de Vestimenta
            </h2>
            <div className="h-[1px] w-20 bg-gold-400 mx-auto mt-4" />
          </div>

          <div className="relative bg-gold-50 p-8 md:p-12 rounded-sm shadow-xl border border-gold-300 max-w-2xl mx-auto">
            {/* Elegant double border inside card */}
            <div className="absolute inset-2 border border-gold-400/20 pointer-events-none" />

            <div className="text-center space-y-6">
              <span className="inline-block p-4 rounded-full bg-white border border-gold-200 text-gold-500 mb-2">
                <Shirt className="w-8 h-8 stroke-[1.25]" />
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-800 font-light">
                Dress Code: <span className="font-normal text-gold-600">Formal Elegante</span>
              </h3>

              <p className="font-sans text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Queremos celebrar este día con un ambiente sofisticado. Los invitamos a vestir de manera formal y elegante.
              </p>

              <div className="h-[1px] w-24 bg-gold-300 mx-auto my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-lg mx-auto">
                {/* Caballeros */}
                <div className="bg-white/80 p-5 rounded-sm border border-gold-200/40 shadow-sm relative">
                  <div className="absolute top-3 right-3 text-gold-500/20 font-serif text-3xl select-none">♂</div>
                  <h4 className="font-serif text-base text-zinc-800 font-medium mb-2 border-b border-gold-200/30 pb-1">
                    Caballeros
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Traje, blazer con pantalón de vestir o conjunto formal. <span className="text-zinc-400 italic text-xs block mt-1">(Smoking opcional.)</span>
                  </p>
                </div>

                {/* Damas */}
                <div className="bg-white/80 p-5 rounded-sm border border-gold-200/40 shadow-sm relative">
                  <div className="absolute top-3 right-3 text-gold-500/20 font-serif text-3xl select-none">♀</div>
                  <h4 className="font-serif text-base text-zinc-800 font-medium mb-2 border-b border-gold-200/30 pb-1">
                    Damas
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Vestido elegante, largo o midi, o conjunto formal.
                  </p>
                </div>
              </div>

              {/* Crucial color warning */}
              <div className="mt-8 bg-zinc-900 text-white p-5 rounded-sm border border-gold-500/30 shadow-md max-w-lg mx-auto">
                <p className="font-serif text-xs tracking-widest text-gold-400 uppercase font-semibold mb-2">
                  Nota Especial para los Invitados
                </p>
                <p className="font-sans text-xs sm:text-sm text-zinc-300 italic">
                  &ldquo;Reservar los tonos blanco, beige y sus derivados&rdquo;
                </p>
                <div className="flex justify-center gap-1.5 mt-3">
                  <span className="w-5 h-5 rounded-full bg-white border border-zinc-800" title="Blanco" />
                  <span className="w-5 h-5 rounded-full bg-[#f5f5dc] border border-zinc-800" title="Beige" />
                  <span className="w-5 h-5 rounded-full bg-[#fffdd0] border border-zinc-800" title="Crema" />
                  <span className="w-5 h-5 rounded-full bg-[#fdf5e6] border border-zinc-800" title="Marfil" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Interactive styled Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-sm border border-gold-500 p-6 relative">
            <div className="absolute inset-1 border border-gold-400/10 pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-serif text-xl text-zinc-900 font-medium">
                {showMapModal === "ceremonia" ? "Mapa de la Ceremonia" : "Mapa de la Recepción"}
              </h4>
              <button
                onClick={() => setShowMapModal(null)}
                className="text-zinc-400 hover:text-zinc-600 font-sans text-sm uppercase tracking-wider cursor-pointer font-semibold"
              >
                [ Cerrar ]
              </button>
            </div>
            
            {/* Elegant luxury mock map display inside modal */}
            <div className="w-full h-64 bg-zinc-100 flex flex-col justify-center items-center text-center p-6 border border-gold-200 relative overflow-hidden">
              <div className="absolute inset-0 opacity-15">
                <div className="w-full h-full bg-[radial-gradient(#b58d53_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
              <MapPin className="w-12 h-12 text-gold-500 mb-3 animate-bounce" />
              <p className="font-serif text-base text-zinc-800 font-semibold mb-1">
                {showMapModal === "ceremonia" ? events[0].location : events[1].location}
              </p>
              <p className="font-sans text-xs text-zinc-500 max-w-xs mb-4">
                {showMapModal === "ceremonia" ? events[0].address : events[1].address}
              </p>
              
              <a
                href={showMapModal === "ceremonia" ? events[0].mapUrl : events[1].mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs tracking-wider uppercase transition-colors rounded-sm cursor-pointer font-medium"
              >
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-center font-sans text-[10px] text-zinc-400 uppercase tracking-widest mt-4">
              DIRECCIÓN EXACTA • KIMBERLY & JHON JAIRO 2026
            </p>
          </div>
        </div>
      )}
    </>
  );
}
