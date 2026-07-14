/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Camera, Upload, RefreshCw, Sparkles, Check, AlertCircle } from "lucide-react";
import defaultCover from "../assets/images/wedding_cover_beach_1784060805678.jpg";

export default function CoverPhotoEditor() {
  const [previewImage, setPreviewImage] = useState<string>(defaultCover);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });
  const [isCompiling, setIsCompiling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom cover on mount
  useEffect(() => {
    const savedCover = localStorage.getItem("wedding_custom_cover_image");
    if (savedCover) {
      setPreviewImage(savedCover);
    }
  }, []);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatusMsg({ type: "error", text: "El archivo seleccionado debe ser una imagen válida (JPG o PNG)." });
      return;
    }

    setIsCompiling(true);
    setStatusMsg({ type: "", text: "" });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          
          // Compress to a highly detailed but lightweight widescreen resolution (1600px width)
          const MAX_WIDTH = 1600;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("No se pudo obtener el contexto del canvas.");
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Quality: 0.78 is the sweet spot of gorgeous high fidelity and lightweight size (~200kb)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.78);
          
          localStorage.setItem("wedding_custom_cover_image", compressedBase64);
          
          // Dispatch custom event to notify Hero component of real-time update
          window.dispatchEvent(new Event("wedding_cover_updated"));
          
          setPreviewImage(compressedBase64);
          setStatusMsg({ type: "success", text: "¡Tu foto de portada ha sido actualizada con éxito y optimizada para la web!" });
        } catch (e) {
          console.error("Compression error:", e);
          setStatusMsg({ type: "error", text: "Error al procesar la imagen. Intenta con otra foto." });
        } finally {
          setIsCompiling(false);
        }
      };
      
      img.onerror = () => {
        setStatusMsg({ type: "error", text: "Error al cargar el archivo de imagen." });
        setIsCompiling(false);
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      setStatusMsg({ type: "error", text: "Error al leer el archivo de tu dispositivo." });
      setIsCompiling(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas restablecer la foto de portada predeterminada?")) {
      localStorage.removeItem("wedding_custom_cover_image");
      window.dispatchEvent(new Event("wedding_cover_updated"));
      setPreviewImage(defaultCover);
      setStatusMsg({ type: "success", text: "Se ha restablecido la foto de portada predeterminada de la playa." });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-8 text-zinc-100">
      
      {/* Tab Header Description */}
      <div>
        <div className="flex items-center space-x-2 text-gold-400 mb-2">
          <Camera className="w-5 h-5" />
          <h3 className="font-serif text-lg tracking-wide">Personalizar Foto de Portada</h3>
        </div>
        <p className="font-sans text-xs text-zinc-400 leading-relaxed max-w-2xl">
          Sube tu propia foto de novios para que sea la imagen de fondo principal en la sección de bienvenida de tu invitación de boda.
          Nuestro cargador comprimirá y optimizará automáticamente tu imagen en tiempo real para que tu web se cargue rápido tanto en móviles como en computadoras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Drag and Drop & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? "border-gold-400 bg-gold-400/5"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {isCompiling ? (
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="w-10 h-10 text-gold-400 animate-spin" />
                <p className="font-sans text-sm text-gold-300 font-semibold animate-pulse">
                  Optimizando y procesando tu foto...
                </p>
                <p className="font-sans text-[11px] text-zinc-500">
                  Adaptando resolución y compresión para la web
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-gold-400 group-hover:border-gold-500/20 transition-all duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-sans text-sm text-zinc-300 font-medium">
                    Arrastra tu foto de novios aquí o <span className="text-gold-400 font-semibold group-hover:underline">haz clic para buscarla</span>
                  </p>
                  <p className="font-sans text-[11px] text-zinc-500 mt-1">
                    Formatos admitidos: JPEG, PNG. Resolución sugerida: Horizontal (16:9)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={triggerFileSelect}
              disabled={isCompiling}
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 text-xs font-bold tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivo</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isCompiling || previewImage === defaultCover}
              className="px-4 py-2.5 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 disabled:hover:border-zinc-800 text-zinc-400 hover:text-white text-xs tracking-wider uppercase transition-colors rounded-sm cursor-pointer flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer Playa</span>
            </button>
          </div>

          {/* User Feedback Alerts */}
          {statusMsg.text && (
            <div
              className={`p-4 rounded-sm border flex items-start space-x-3 text-xs leading-relaxed ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/5 border-rose-500/20 text-rose-400"
              }`}
            >
              {statusMsg.type === "success" ? (
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="font-sans">{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Right column: Live preview thumbnail */}
        <div className="lg:col-span-5 space-y-4">
          <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
            Vista Previa de la Portada
          </span>
          
          <div className="relative border border-zinc-800 bg-zinc-950 rounded-sm overflow-hidden aspect-video group">
            {/* Dark glass cover mask for style */}
            <div className="absolute inset-0 bg-zinc-950/30 z-10 pointer-events-none" />
            
            {/* Live preview image element */}
            <img
              src={previewImage}
              alt="Preview Cover"
              className="w-full h-full object-cover transition-all duration-500 filter brightness-95"
              referrerPolicy="no-referrer"
            />
            
            {/* Badge overlay indicating active status */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-950/80 backdrop-blur-md border border-gold-500/30 rounded-xs z-20 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span className="text-[9px] text-zinc-200 tracking-wider font-sans uppercase font-semibold">
                {previewImage === defaultCover ? "Preboda Playa" : "Tu Foto Activa"}
              </span>
            </div>
          </div>

          <p className="font-sans text-[11px] text-zinc-500 leading-relaxed italic text-center">
            {previewImage === defaultCover 
              ? "Actualmente se muestra la hermosa foto predeterminada al atardecer." 
              : "¡Tu foto personalizada está activa! Los invitados la verán al ingresar a la invitación."}
          </p>
        </div>

      </div>

    </div>
  );
}
