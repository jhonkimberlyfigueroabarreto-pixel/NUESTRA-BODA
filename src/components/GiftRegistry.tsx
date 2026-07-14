/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Landmark, Copy, Check, Heart } from "lucide-react";
import { GIFT_REGISTRY_CHANNELS } from "../data";

export default function GiftRegistry() {
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(GIFT_REGISTRY_CHANNELS.bank.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  return (
    <section id="lluvia-de-sobres" className="py-24 bg-gold-50/30 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold-300/40 to-transparent" />
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-gold-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-gold-200/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            Detalle de Agradecimiento
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-zinc-900 mb-4">
            Lluvia de Sobres
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Heart className="w-3.5 h-3.5 text-gold-500 fill-gold-500/10" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto leading-relaxed">
            Tu presencia en nuestra boda es el mejor regalo que podríamos recibir. Sin embargo, si deseas tener un detalle con nosotros, te ofrecemos estas alternativas.
          </p>
        </div>

        {/* PRIMARY CHANNELS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Lluvia de Sobres Card */}
          <div className="bg-white p-8 border border-gold-200 rounded-sm shadow-md relative flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="absolute inset-1.5 border border-gold-400/10 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-500 mb-6">
                <Mail className="w-8 h-8 stroke-[1.25]" />
              </span>
              <h3 className="font-serif text-xl text-zinc-800 font-light mb-4">
                Sobre Físico
              </h3>
              <p className="font-sans text-sm text-zinc-600 leading-relaxed px-2">
                Contaremos con una urna especial el día de la recepción en el salón principal para que puedas depositar tu sobre con tu tarjeta de felicitación y regalo.
              </p>
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
              <span className="font-serif italic text-xs text-gold-700 block">
                &ldquo;Cofre disponible en el salón principal&rdquo;
              </span>
            </div>
          </div>

          {/* Bank Transfer details card */}
          <div className="bg-white p-8 border border-gold-200 rounded-sm shadow-md relative flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="absolute inset-1.5 border border-gold-400/10 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-500 mb-6">
                <Landmark className="w-8 h-8 stroke-[1.25]" />
              </span>
              <h3 className="font-serif text-xl text-zinc-800 font-light mb-4">
                Sobre Virtual (Transferencia)
              </h3>
              
              <div className="bg-gold-50/50 p-4 border border-gold-200/60 rounded-sm inline-block text-left w-full mx-auto space-y-2.5 text-xs sm:text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold font-sans">Banco</span>
                  <span className="font-medium text-zinc-800 col-span-2 text-right">{GIFT_REGISTRY_CHANNELS.bank.bankName}</span>
                </div>
                <div className="h-px bg-gold-200/30" />
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold font-sans">Cuenta</span>
                  <span className="font-medium text-zinc-800 col-span-2 text-right text-xs sm:text-sm">
                    {GIFT_REGISTRY_CHANNELS.bank.accountType}
                  </span>
                </div>
                <div className="h-px bg-gold-200/30" />
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold font-sans">Número</span>
                  <span className="font-mono font-bold text-zinc-900 col-span-2 text-right select-all">
                    {GIFT_REGISTRY_CHANNELS.bank.accountNumber}
                  </span>
                </div>
                <div className="h-px bg-gold-200/30" />
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold font-sans">Titular</span>
                  <span className="font-medium text-zinc-700 col-span-2 text-right text-xs leading-tight">
                    {GIFT_REGISTRY_CHANNELS.bank.titular}
                  </span>
                </div>
                <div className="h-px bg-gold-200/30" />
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold font-sans">ID / C.C.</span>
                  <span className="font-medium text-zinc-700 col-span-2 text-right">{GIFT_REGISTRY_CHANNELS.bank.document}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCopyAccount}
                className="flex items-center space-x-1.5 px-6 py-2 bg-zinc-950 hover:bg-zinc-800 active:bg-zinc-900 text-white text-[10px] tracking-widest uppercase transition-colors cursor-pointer rounded-sm font-sans font-medium"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gold-400" />
                    <span>Copiar Cuenta</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
