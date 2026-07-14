/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gift, Copy, Check, Mail, Landmark, ShoppingBag } from "lucide-react";
import { GIFT_REGISTRY_CHANNELS } from "../data";

interface WishItem {
  id: string;
  name: string;
  price: string;
  reserved: boolean;
  reservedBy?: string;
  store: string;
}

export default function GiftRegistry() {
  const [copiedBank, setCopiedBank] = useState(false);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [reservationName, setReservationName] = useState("");
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);

  useEffect(() => {
    // Load wishlist state from localStorage to show interactive reservations
    const saved = localStorage.getItem("wedding_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        setWishlist(GIFT_REGISTRY_CHANNELS.wishlist as WishItem[]);
      }
    } else {
      setWishlist(GIFT_REGISTRY_CHANNELS.wishlist as WishItem[]);
    }
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(GIFT_REGISTRY_CHANNELS.bank.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleReserveClick = (itemId: string) => {
    setActiveReservationId(itemId);
    setReservationName("");
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationName.trim() || !activeReservationId) return;

    const updated = wishlist.map((item) => {
      if (item.id === activeReservationId) {
        return {
          ...item,
          reserved: true,
          reservedBy: reservationName.trim(),
        };
      }
      return item;
    });

    setWishlist(updated);
    localStorage.setItem("wedding_wishlist", JSON.stringify(updated));
    setActiveReservationId(null);
    setReservationName("");
  };

  const handleCancelReservation = (itemId: string) => {
    if (window.confirm("¿Deseas cancelar la reserva de este regalo?")) {
      const updated = wishlist.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            reserved: false,
            reservedBy: undefined,
          };
        }
        return item;
      });

      setWishlist(updated);
      localStorage.setItem("wedding_wishlist", JSON.stringify(updated));
    }
  };

  return (
    <section id="mesa-de-regalos" className="py-24 bg-gold-50">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            MESA DE REGALOS Y AGRADECIMIENTOS
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Mesa de Regalos
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Gift className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto">
            El regalo más grande es contar con tu compañía. Si deseas tener un detalle con nosotros, te ofrecemos estas cómodas alternativas.
          </p>
        </div>

        {/* PRIMARY CHANNELS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Lluvia de Sobres Card */}
          <div className="bg-white p-8 border border-gold-200 rounded-sm shadow-md relative flex flex-col justify-between">
            <div className="absolute inset-1.5 border border-gold-400/10 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-500 mb-6">
                <Mail className="w-8 h-8 stroke-[1.25]" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-zinc-800 font-light mb-4">
                Lluvia de Sobres
              </h3>
              <p className="font-sans text-sm text-zinc-600 leading-relaxed">
                {GIFT_REGISTRY_CHANNELS.bank.giftEnvelopeNote}
              </p>
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
              <span className="font-serif italic text-sm text-gold-700 block">
                &ldquo;Cofre disponible en el salón principal&rdquo;
              </span>
            </div>
          </div>

          {/* Bank Transfer details card */}
          <div className="bg-white p-8 border border-gold-200 rounded-sm shadow-md relative flex flex-col justify-between">
            <div className="absolute inset-1.5 border border-gold-400/10 pointer-events-none" />
            
            <div className="text-center">
              <span className="inline-block p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-500 mb-6">
                <Landmark className="w-8 h-8 stroke-[1.25]" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-zinc-800 font-light mb-4">
                Transferencia Bancaria
              </h3>
              
              <div className="bg-gold-50 p-4 border border-gold-200 rounded-sm inline-block text-left max-w-sm w-full mx-auto space-y-2.5 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold font-sans block">Banco</span>
                  <span className="font-semibold text-zinc-800">{GIFT_REGISTRY_CHANNELS.bank.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold font-sans block">Tipo y Número de Cuenta</span>
                  <span className="font-semibold text-zinc-800">{GIFT_REGISTRY_CHANNELS.bank.accountType}: {GIFT_REGISTRY_CHANNELS.bank.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold font-sans block">Titular</span>
                  <span className="font-semibold text-zinc-800">{GIFT_REGISTRY_CHANNELS.bank.titular}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold font-sans block">Identificación</span>
                  <span className="font-semibold text-zinc-800">{GIFT_REGISTRY_CHANNELS.bank.document}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCopyAccount}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-sm"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Datos de Cuenta</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* WISHLIST REGISTRY DISPLAY */}
        <div className="bg-white p-8 md:p-12 border border-gold-300 rounded-sm shadow-xl relative">
          <div className="absolute inset-2 border border-gold-400/20 pointer-events-none" />

          <h3 className="font-serif text-2xl text-zinc-900 font-light text-center mb-8 flex items-center justify-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-gold-500" />
            <span>Sugerencias de Regalo</span>
          </h3>

          <div className="divide-y divide-zinc-100">
            {wishlist.map((item) => (
              <div key={item.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-medium text-zinc-800">{item.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-1 font-sans">
                    <span className="tracking-widest uppercase">Establecimiento sugerido:</span>
                    <span className="text-gold-600 font-semibold">{item.store}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <span className="font-sans text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-sm">
                    {item.price}
                  </span>

                  {item.reserved ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-sans tracking-wide text-zinc-400 font-semibold italic bg-zinc-100 px-3 py-2 border rounded-sm">
                        Reservado {item.reservedBy ? `por ${item.reservedBy}` : ""}
                      </span>
                      <button
                        onClick={() => handleCancelReservation(item.id)}
                        className="text-[10px] font-sans font-bold text-rose-500 hover:text-rose-700 cursor-pointer uppercase tracking-wider"
                      >
                        [ Cancelar ]
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserveClick(item.id)}
                      className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-sm"
                    >
                      Reservar regalo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reservation Dialog Popup */}
      {activeReservationId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-sm border border-gold-500 p-6 relative">
            <div className="absolute inset-1 border border-gold-400/10 pointer-events-none" />
            <h4 className="font-serif text-xl text-zinc-900 font-medium mb-3">
              ¿Deseas reservar este regalo?
            </h4>
            <p className="font-sans text-xs text-zinc-500 leading-relaxed mb-4">
              Ingresa tu nombre para indicarle a los novios que tú te encargarás de este detalle. No requiere pagos inmediatos, solo se marcará como reservado en esta invitación.
            </p>

            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">
                  Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Ej. Andrés Barreto"
                  className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none p-3 font-sans text-sm rounded-sm"
                  required
                />
              </div>

              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReservationId(null)}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 border border-gold-300 text-gold-700 text-xs uppercase tracking-wider cursor-pointer rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-wider cursor-pointer rounded-sm"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
