/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Camera, Image, Upload, User, CheckCircle, Heart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PhotoAsset } from "../types";
import { INITIAL_PHOTOS } from "../data";
import { getGuestPhotos, saveGuestPhoto, deleteGuestPhoto } from "../lib/firestoreService";

export default function PhotoSharing() {
  const [photosList, setPhotosList] = useState<PhotoAsset[]>([]);
  const [author, setAuthor] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [successUpload, setSuccessUpload] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const list = await getGuestPhotos();
        // Sort guest photos to show newest first, but if they have a standard guest-photo timestamp or timestamp isn't comparable, let's keep list or sort by id if it contains timestamp
        const sorted = [...list].sort((a, b) => {
          if (a.id.includes("guest-photo-") && b.id.includes("guest-photo-")) {
            const timeA = parseInt(a.id.replace("guest-photo-", ""), 10);
            const timeB = parseInt(b.id.replace("guest-photo-", ""), 10);
            return timeB - timeA;
          }
          return 0;
        });
        setPhotosList(sorted);
      } catch (err) {
        console.error("Error fetching guest photos from Firestore:", err);
      }
    };
    fetchPhotos();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageBase64 || !author.trim() || !caption.trim()) return;

    const newPhoto: PhotoAsset = {
      id: "guest-photo-" + Date.now(),
      url: selectedImageBase64,
      author: author.trim(),
      caption: caption.trim(),
      timestamp: "Hace un momento",
      likes: 0,
    };

    try {
      await saveGuestPhoto(newPhoto);
      setPhotosList([newPhoto, ...photosList]);

      // Reset Form & show success
      setSelectedImageBase64(null);
      setAuthor("");
      setCaption("");
      setShowUploadForm(false);
      setSuccessUpload(true);
      setTimeout(() => setSuccessUpload(false), 3000);
    } catch (err) {
      console.error("Error uploading photo to Firestore:", err);
    }
  };

  const handleLikePhoto = async (id: string) => {
    const photo = photosList.find((p) => p.id === id);
    if (!photo) return;
    const updatedPhoto = { ...photo, likes: photo.likes + 1 };
    
    try {
      await saveGuestPhoto(updatedPhoto);
      setPhotosList(photosList.map((p) => (p.id === id ? updatedPhoto : p)));
    } catch (err) {
      console.error("Error liking photo in Firestore:", err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm("¿Deseas eliminar esta foto de la galería?")) {
      try {
        await deleteGuestPhoto(id);
        setPhotosList(photosList.filter((photo) => photo.id !== id));
      } catch (err) {
        console.error("Error deleting photo from Firestore:", err);
      }
    }
  };

  return (
    <section id="comparte-tus-fotos" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            GALERÍA DE NUESTROS INVITADOS
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Comparte tus Fotos
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Camera className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto">
            ¡Ayúdanos a capturar cada sonrisa! Sube las fotos que tomes durante la ceremonia o recepción para agregarlas a nuestro álbum interactivo.
          </p>
        </div>

        {/* Floating Upload button activator */}
        <div className="text-center mb-12">
          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              id="btn-trigger-upload"
              className="flex items-center space-x-2 px-8 py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs tracking-[0.2em] uppercase transition-all shadow-md hover:shadow-lg cursor-pointer rounded-sm mx-auto"
            >
              <Upload className="w-4 h-4 text-gold-400" />
              <span>Subir mis Fotos de la Boda</span>
            </button>
          ) : (
            <button
              onClick={() => setShowUploadForm(false)}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gold-300 text-gold-700 font-sans text-xs tracking-wider uppercase transition-all cursor-pointer rounded-sm mx-auto"
            >
              <span>Ocultar panel de subida</span>
            </button>
          )}
        </div>

        {/* UPLOAD COLLAPSIBLE DRAWER */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-xl mx-auto overflow-hidden bg-gold-50/50 border border-gold-300 rounded-sm p-6 md:p-8 shadow-xl relative mb-16"
            >
              <div className="absolute inset-1.5 border border-gold-400/10 pointer-events-none" />

              <form onSubmit={handleSubmitPhoto} className="space-y-5">
                {/* Drag and drop input card */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full h-48 border-2 border-dashed rounded-sm flex flex-col justify-center items-center text-center p-6 transition-all ${
                    dragActive ? "border-gold-500 bg-gold-100/40" : "border-gold-300 bg-white"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="guest-file-input"
                    className="hidden"
                  />
                  
                  {selectedImageBase64 ? (
                    <div className="relative h-full flex flex-col justify-center items-center gap-2">
                      <img
                        src={selectedImageBase64}
                        alt="Previsualización"
                        className="max-h-24 object-contain rounded-sm border border-gold-300 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImageBase64(null)}
                        className="text-[10px] font-sans font-bold text-rose-500 uppercase cursor-pointer"
                      >
                        Cambiar Imagen
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="guest-file-input" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gold-400 mb-2 stroke-[1.25]" />
                      <p className="font-sans text-xs text-zinc-600 font-semibold">
                        Haz clic para seleccionar o arrastra una foto aquí
                      </p>
                      <p className="font-sans text-[10px] text-zinc-400 mt-1 uppercase tracking-wide">
                        Soporta formatos PNG, JPG (Max 5MB)
                      </p>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Author Input */}
                  <div className="flex flex-col">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                      Tu Nombre / Familia *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Ej. Tía Estela y Roberto"
                        className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none pl-10 pr-4 py-3 font-sans text-sm rounded-sm"
                        required
                      />
                      <User className="w-4 h-4 text-gold-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Caption Input */}
                  <div className="flex flex-col">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                      Pie de Foto / Dedicatoria *
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Ej. ¡Un momento mágico compartiendo la felicidad de los novios!"
                      className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none p-3 font-sans text-sm rounded-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-5 py-2.5 bg-white border border-gold-300 text-gold-700 text-xs uppercase tracking-wider cursor-pointer rounded-sm"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-wider cursor-pointer rounded-sm"
                  >
                    Publicar Foto
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success toast overlay trigger */}
        {successUpload && (
          <div className="p-4 bg-emerald-50 border border-emerald-400 rounded-sm text-emerald-800 text-sm flex items-center justify-center space-x-2 max-w-sm mx-auto mb-10">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium font-sans">¡La foto se ha agregado exitosamente!</span>
          </div>
        )}

        {/* MASONRY WALL GRID OF PHOTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photosList.map((photo) => {
            const isGuestPhoto = photo.id.startsWith("guest-photo-");
            return (
              <div
                key={photo.id}
                className="group bg-white border border-gold-200 p-3 rounded-sm shadow-md flex flex-col justify-between"
              >
                <div className="overflow-hidden rounded-sm relative aspect-video sm:aspect-square md:aspect-video lg:aspect-square mb-4">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  {isGuestPhoto && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] tracking-widest text-gold-600 font-bold uppercase font-sans">
                    <span>{photo.timestamp}</span>
                    <span className="text-zinc-400">Por {photo.author}</span>
                  </div>
                  
                  <p className="font-serif text-sm text-zinc-700 leading-snug">
                    {photo.caption}
                  </p>

                  <div className="border-t border-zinc-100 pt-3 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-400 uppercase font-sans tracking-widest font-semibold">
                      {isGuestPhoto ? "★ Invitado" : "★ Álbum Inicial"}
                    </span>

                    <button
                      onClick={() => handleLikePhoto(photo.id)}
                      className="flex items-center space-x-1 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="font-sans text-xs font-semibold">{photo.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
