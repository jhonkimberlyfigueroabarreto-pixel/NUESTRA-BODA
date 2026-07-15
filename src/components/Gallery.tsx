/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ZoomIn, X, ChevronLeft, ChevronRight, Sparkles, Sliders } from "lucide-react";
import { getGalleryPhotos, saveGalleryPhoto } from "../lib/firestoreService";

// ==========================================
// EDITABLE LABELS & CONFIGURATION
// Easily modify titles, categories and photo data below
// ==========================================
export const GALLERY_CONFIG = {
  sectionTagline: "NUESTROS MOMENTOS EN IMÁGENES",
  sectionTitle: "Galería de Recuerdos",
  description: "Una muestra curada de nuestro amor, desde las primeras anécdotas compartidas hasta los retratos previos a nuestro gran día.",
};

export const GALLERY_CATEGORIES = [
  { id: "todos", label: "Ver Todo" },
  { id: "preboda", label: "Sesión Pre-Boda" },
  { id: "detalles", label: "Pequeños Detalles" },
  { id: "momentos", label: "Momentos Felices" },
];

export interface GalleryPhoto {
  id: string;
  url: string;
  author: string;
  caption: string;
  timestamp: string;
  likes: number;
  category: "preboda" | "detalles" | "momentos";
}

// 10 premium temporary images with realistic varying aspect ratios for gorgeous masonry columns
export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
    author: "Kimberly & Jhon",
    caption: "El tierno abrazo que selló nuestra sesión pre-boda bajo la luz del atardecer.",
    timestamp: "Junio 2026",
    likes: 84,
    category: "preboda",
  },
  {
    id: "photo-2",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
    author: "Alejandra F.",
    caption: "La primera promesa tangible. Nuestras manos entrelazadas mostrando las alianzas.",
    timestamp: "Enero 2026",
    likes: 72,
    category: "detalles",
  },
  {
    id: "photo-3",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600",
    author: "Jhon",
    caption: "Risas compartidas y espontaneidad pura. Nada mejor que caminar de tu mano.",
    timestamp: "Febrero 2026",
    likes: 95,
    category: "momentos",
  },
  {
    id: "photo-4",
    url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600",
    author: "Kimberly",
    caption: "Sutileza y elegancia en la selección del ramo de flores blancas.",
    timestamp: "Marzo 2026",
    likes: 61,
    category: "detalles",
  },
  {
    id: "photo-5",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600",
    author: "Camilo V.",
    caption: "Perdiéndonos entre bosques dorados, soñando con el 1 de Agosto.",
    timestamp: "Mayo 2026",
    likes: 110,
    category: "preboda",
  },
  {
    id: "photo-6",
    url: "https://images.unsplash.com/photo-1519741621255-23156631db9c?auto=format&fit=crop&q=80&w=600",
    author: "Kimberly & Jhon",
    caption: "Preparativos y copas listas para brindar junto a ustedes.",
    timestamp: "Julio 2026",
    likes: 49,
    category: "detalles",
  },
  {
    id: "photo-7",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600",
    author: "Jhon Jairo",
    caption: "Bajo las luces titilantes de la gran ciudad, prometiendo cuidarnos por siempre.",
    timestamp: "Diciembre 2025",
    likes: 125,
    category: "momentos",
  },
  {
    id: "photo-8",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600",
    author: "Alejandra F.",
    caption: "Una silueta al atardecer frente al agua. Silencios que dicen más que mil palabras.",
    timestamp: "Noviembre 2025",
    likes: 78,
    category: "preboda",
  },
  {
    id: "photo-9",
    url: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=600",
    author: "Kimberly",
    caption: "Un destello eterno que simboliza el compromiso inquebrantable de nuestras almas.",
    timestamp: "Enero 2026",
    likes: 88,
    category: "detalles",
  },
  {
    id: "photo-10",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600",
    author: "Jhon Jairo",
    caption: "Risas espontáneas en nuestra tarde favorita de café. Tu sonrisa es mi hogar.",
    timestamp: "Octubre 2021",
    likes: 140,
    category: "momentos",
  },
];

export default function Gallery() {
  const [filter, setFilter] = useState("todos");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [likesState, setLikesState] = useState<{ [id: string]: number }>({});
  const [loadedImages, setLoadedImages] = useState<{ [id: string]: boolean }>({});
  const [photos, setPhotos] = useState<GalleryPhoto[]>(INITIAL_GALLERY_PHOTOS);

  // Touch Swipe state variables for mobile support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Load photos from Firestore
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const list = await getGalleryPhotos();
        setPhotos(list);
      } catch (err) {
        console.error("Error loading gallery photos:", err);
      }
    };

    fetchPhotos();

    const handleUpdate = () => {
      fetchPhotos();
    };
    window.addEventListener("wedding_gallery_updated", handleUpdate);
    return () => window.removeEventListener("wedding_gallery_updated", handleUpdate);
  }, []);

  const filteredPhotos = filter === "todos"
    ? photos
    : photos.filter(photo => photo.category === filter);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent multiple likes from the same session
    if (likesState[id]) {
      return;
    }

    const photoToUpdate = photos.find(p => p.id === id);
    if (!photoToUpdate) return;

    const updatedPhoto = { ...photoToUpdate, likes: photoToUpdate.likes + 1 };
    
    try {
      await saveGalleryPhoto(updatedPhoto);
      
      const newLikesState = {
        ...likesState,
        [id]: 1,
      };
      setLikesState(newLikesState);
      
      setPhotos(prev => prev.map(p => p.id === id ? updatedPhoto : p));
    } catch (err) {
      console.error("Error updating photo likes in Firestore:", err);
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  // Slideshow Navigation Helpers
  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activePhotoIndex === null) return;
    const currentPhoto = photos[activePhotoIndex];
    if (!currentPhoto) return;
    const currentIndexInFiltered = filteredPhotos.findIndex(p => p.id === currentPhoto.id);
    
    const prevFilteredIndex = currentIndexInFiltered === 0 
      ? filteredPhotos.length - 1 
      : currentIndexInFiltered - 1;
      
    const prevPhotoGlobalIndex = photos.findIndex(
      p => p.id === filteredPhotos[prevFilteredIndex].id
    );
    setActivePhotoIndex(prevPhotoGlobalIndex);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activePhotoIndex === null) return;
    const currentPhoto = photos[activePhotoIndex];
    if (!currentPhoto) return;
    const currentIndexInFiltered = filteredPhotos.findIndex(p => p.id === currentPhoto.id);
    
    const nextFilteredIndex = currentIndexInFiltered === filteredPhotos.length - 1 
      ? 0 
      : currentIndexInFiltered + 1;
      
    const nextPhotoGlobalIndex = photos.findIndex(
      p => p.id === filteredPhotos[nextFilteredIndex].id
    );
    setActivePhotoIndex(nextPhotoGlobalIndex);
  };

  // Keyboard navigation for the Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === "Escape") setActivePhotoIndex(null);
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, filter]);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizonal Swipe detection (threshold 45px)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 45) {
        if (diffX > 0) {
          handleNextPhoto();
        } else {
          handlePrevPhoto();
        }
      }
    } else {
      // Swipe down to close detection (threshold 70px)
      if (Math.abs(diffY) > 70 && diffY < 0) {
        setActivePhotoIndex(null);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <section id="galeria" className="py-24 bg-gold-50/20 relative overflow-hidden">
      {/* Subtle border dividing sections */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gold-200" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            {GALLERY_CONFIG.sectionTagline}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            {GALLERY_CONFIG.sectionTitle}
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Sparkles className="w-4 h-4 text-gold-500 fill-none" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-serif italic text-sm text-zinc-500 mt-4 max-w-md mx-auto leading-relaxed">
            {GALLERY_CONFIG.description}
          </p>
        </div>

        {/* Premium Category Filter Pills */}
        <div className="flex justify-center space-x-2 md:space-x-3 mb-14 flex-wrap gap-y-3">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`relative px-5 py-2.5 rounded-full font-sans text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 border cursor-pointer focus:outline-none ${
                filter === cat.id
                  ? "bg-zinc-950 border-zinc-950 text-white font-semibold shadow-md"
                  : "bg-white border-gold-200 text-zinc-600 hover:border-gold-400 hover:text-zinc-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 2. Premium CSS-based Masonry Columns (Perfect for varying aspect ratios) */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => {
              const globalIndex = photos.findIndex(p => p.id === photo.id);
              const isLoaded = loadedImages[photo.id];

              return (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45 }}
                  onClick={() => setActivePhotoIndex(globalIndex)}
                  className="break-inside-avoid relative overflow-hidden bg-white rounded-sm border border-gold-200/60 shadow-md hover:shadow-xl hover:border-gold-300 transition-all duration-500 cursor-pointer group flex flex-col mb-6"
                >
                  {/* Outer subtle frame */}
                  <div className="absolute inset-2.5 border border-transparent group-hover:border-gold-400/20 transition-colors duration-500 pointer-events-none z-20" />

                  {/* Image container & Zoom on hover */}
                  <div className="relative w-full overflow-hidden bg-zinc-100">
                    
                    {/* Shimmer loading placeholder block to prevent layout shifts */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 animate-pulse flex items-center justify-center min-h-[250px]">
                        <span className="font-serif text-xs italic text-zinc-400">Cargando fotografía...</span>
                      </div>
                    )}

                    <img
                      src={photo.url}
                      alt={photo.caption}
                      loading="lazy"
                      onLoad={() => handleImageLoad(photo.id)}
                      className={`w-full h-auto block transition-all duration-1000 ease-out group-hover:scale-105 ${
                        isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-95"
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Premium zoom magnifying lens overlay */}
                    <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="p-3.5 bg-white/10 rounded-full text-white backdrop-blur-md border border-white/20"
                      >
                        <ZoomIn className="w-5 h-5 text-gold-200" />
                      </motion.span>
                    </div>
                  </div>

                  {/* Text Details Area (Minimalist style) */}
                  <div className="p-5 relative bg-white border-t border-zinc-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-sans text-[9px] tracking-widest text-gold-600 uppercase font-bold">
                        {photo.timestamp} • Por {photo.author}
                      </span>
                    </div>
                    
                    <p className="font-serif text-sm text-zinc-700 leading-relaxed font-light mb-4">
                      {photo.caption}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                      <span className="font-sans uppercase tracking-widest text-zinc-400 font-medium">
                        Fotografía Oficial
                      </span>
                      
                      {/* Heart Like Interactive Action */}
                      <button
                        onClick={(e) => handleLike(photo.id, e)}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-colors font-sans"
                        title="Me encanta esta foto"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold text-xs">
                          {likesState[photo.id] !== undefined ? likesState[photo.id] : photo.likes}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* 3. PREMIUM LIGHTBOX FULLSCREEN SLIDESHOW MODAL WITH MOBILE SWIPES */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-zinc-950/98 backdrop-blur-xl z-50 flex flex-col justify-between p-4 select-none touch-none"
            onClick={() => setActivePhotoIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar Details */}
            <div className="flex justify-between items-center py-3 px-6 z-10 w-full max-w-7xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <span className="font-sans text-[10px] tracking-widest text-gold-400 uppercase font-semibold">
                Fotografía {activePhotoIndex + 1} de {photos.length}
              </span>
              
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none flex items-center space-x-2 border border-zinc-800/80 bg-zinc-900/40 rounded-sm"
              >
                <X className="w-4 h-4" />
                <span className="font-sans text-[10px] tracking-widest uppercase">Cerrar</span>
              </button>
            </div>

            {/* Core Carousel Layout */}
            <div className="flex-1 flex items-center justify-between relative max-w-7xl mx-auto w-full px-2 sm:px-6">
              
              {/* Prev Button (Hidden on phones, visible on desktop) */}
              <button
                onClick={handlePrevPhoto}
                className="hidden md:flex p-3.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-gold-300 hover:border-gold-500/40 transition-all cursor-pointer z-20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Image Stage */}
              <div 
                className="flex-1 flex items-center justify-center relative py-6 max-h-[72vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={activePhotoIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={photos[activePhotoIndex]?.url}
                  alt={photos[activePhotoIndex]?.caption}
                  className="max-w-full max-h-[70vh] object-contain rounded-xs select-none border border-zinc-800/30 shadow-2xl"
                  referrerPolicy="no-referrer"
                />

                {/* Mobile touch hint text (fades away quickly) */}
                <span className="absolute bottom-1 right-2 font-sans text-[8px] text-zinc-500 uppercase tracking-widest block md:hidden">
                  Desliza para navegar
                </span>
              </div>

              {/* Next Button (Hidden on phones, visible on desktop) */}
              <button
                onClick={handleNextPhoto}
                className="hidden md:flex p-3.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-gold-300 hover:border-gold-500/40 transition-all cursor-pointer z-20"
                aria-label="Siguiente foto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Captions Block */}
            <div 
              className="text-center py-6 px-6 max-w-2xl mx-auto z-10 w-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-serif text-base sm:text-lg text-zinc-200 font-light tracking-wide mb-2.5">
                &ldquo;{photos[activePhotoIndex]?.caption}&rdquo;
              </p>
              
              <div className="flex justify-center items-center space-x-2 text-[10px] tracking-widest uppercase font-medium">
                <span className="text-gold-400">Por {photos[activePhotoIndex]?.author}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{photos[activePhotoIndex]?.timestamp}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
