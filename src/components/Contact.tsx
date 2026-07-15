/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MessageCircle, Heart, Phone, Award } from "lucide-react";
import { getWeddingSettings } from "../lib/firestoreService";

const DEFAULT_CONTACTS = [
  {
    name: "Kimberly Figueroa",
    role: "La Novia",
    phone: "+57 300 123 4567",
    message: "¡Hola! Tengo una duda sobre los detalles de la boda...",
  },
  {
    name: "Jhon Jairo",
    role: "El Novio",
    phone: "+57 311 987 6543",
    message: "¡Hola Jhon! Te escribo por un tema relacionado con la celebración...",
  },
  {
    name: "Mariana Gómez",
    role: "Wedding Planner & Coordinadora",
    phone: "+57 320 456 7890",
    message: "Estimada Mariana, tengo una pregunta sobre la organización o el protocolo...",
  },
];

export default function Contact() {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const settings = await getWeddingSettings();
        if (settings && settings.contacts) {
          setContacts(settings.contacts);
        }
      } catch (err) {
        console.error("Error loading contacts from Firestore:", err);
      }
    };

    fetchContacts();

    const handleUpdate = () => {
      fetchContacts();
    };
    window.addEventListener("wedding_contact_updated", handleUpdate);
    return () => window.removeEventListener("wedding_contact_updated", handleUpdate);
  }, []);

  return (
    <section id="contacto" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gold-200" />

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            ¿TIENES ALGUNA PREGUNTA?
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Contacto de Asistencia
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Phone className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto">
            Si necesitas aclarar dudas de transporte, vestuario, alojamiento o cualquier otro detalle, por favor no dudes en escribirnos directamente.
          </p>
        </div>

        {/* Contact list cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="bg-gold-50/40 p-6 border border-gold-200 rounded-sm text-center relative hover:shadow-md transition-shadow relative"
            >
              <div className="absolute inset-1 border border-gold-400/5 pointer-events-none" />
              
              <span className="inline-block p-3 rounded-full bg-white border border-gold-100 text-gold-500 mb-4">
                {idx === 2 ? (
                  <Award className="w-5 h-5" />
                ) : (
                  <Heart className="w-5 h-5 fill-current" />
                )}
              </span>

              <h4 className="font-serif text-lg font-semibold text-zinc-800">
                {contact.name}
              </h4>
              <p className="font-sans text-[10px] tracking-widest uppercase text-gold-600 font-bold mb-3">
                {contact.role}
              </p>
              
              <p className="font-sans text-xs text-zinc-400 mb-6">
                {contact.phone}
              </p>

              <a
                href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(contact.message)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] tracking-wider uppercase font-sans cursor-pointer transition-colors rounded-sm font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer Monogram signature */}
        <div className="text-center pt-8 border-t border-gold-100">
          <span className="font-serif text-3xl tracking-[0.2em] text-gold-500 block mb-3">
            K & J
          </span>
          <p className="font-serif italic text-sm text-zinc-500">
            &ldquo;Y sobre todas estas cosas vestíos de amor, que es el vínculo perfecto.&rdquo;
          </p>
          <p className="font-sans text-[10px] tracking-widest text-zinc-400 uppercase mt-2">
            Colosenses 3:14 • 1 de Agosto de 2026
          </p>
          
          {/* Quick link to open the Admin/Organizador modal easily */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                window.dispatchEvent(new Event("open_admin_panel"));
              }}
              className="text-[9px] tracking-widest text-zinc-400 hover:text-gold-600 transition-all uppercase font-sans flex items-center space-x-1.5 opacity-60 hover:opacity-100 border border-transparent hover:border-gold-300/30 px-3 py-1 rounded-sm cursor-pointer"
            >
              <span>🔒 ACCESO ORGANIZADOR</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
