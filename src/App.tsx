/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import OurStory from "./components/OurStory";
import EventDetails from "./components/EventDetails";
import Itinerary from "./components/Itinerary";
import Gallery from "./components/Gallery";
import RSVPForm from "./components/RSVP";
import TableFinder from "./components/TableFinder";
import GiftRegistry from "./components/GiftRegistry";
import PhotoSharing from "./components/PhotoSharing";
import Guestbook from "./components/Guestbook";
import Contact from "./components/Contact";
import GuestAdmin from "./components/GuestAdmin";

export default function App() {
  const [activeSection, setActiveSection] = useState("inicio");

  // Track active section on scroll to highlight in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "inicio",
        "nuestra-historia",
        "ceremonia",
        "recepcion",
        "itinerario",
        "galeria",
        "confirmar-asistencia",
        "encuentra-tu-mesa",
        "mesa-de-regalos",
        "comparte-tus-fotos",
        "mensajes",
        "contacto",
        "administrador-de-invitados",
      ];

      const scrollPosition = window.scrollY + 120; // offset for navbar height

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDiscoverClick = () => {
    const target = document.getElementById("nuestra-historia");
    if (target) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gold-50/20 text-zinc-800 antialiased selection:bg-gold-200 selection:text-gold-900">
      {/* Floating Header Navigation */}
      <Navigation activeSection={activeSection} />

      {/* Hero / Cover Page */}
      <Hero onDiscoverClick={handleDiscoverClick} />

      {/* Main content sections */}
      <main className="relative z-10">
        {/* Our Story */}
        <OurStory />

        {/* Ceremony & Reception Details */}
        <EventDetails />

        {/* Chronological Itinerary */}
        <Itinerary />

        {/* Curated Pre-Wedding Memories Gallery */}
        <Gallery />

        {/* Guest RSVP Confirmation */}
        <RSVPForm />

        {/* Interactive Table / Seating Chart Finder */}
        <TableFinder />

        {/* Registry & Lluvia de Sobres */}
        <GiftRegistry />

        {/* Collaborative Photo Sharing Grid */}
        <PhotoSharing />

        {/* Guest Blessings & Messages Board */}
        <Guestbook />

        {/* Direct Contacts Info & Monogram */}
        <Contact />

        {/* Exclusive Guest & Seat Administration Panel */}
        <GuestAdmin />
      </main>
    </div>
  );
}
