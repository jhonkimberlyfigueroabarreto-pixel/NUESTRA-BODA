import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { WeddingSettings } from "../lib/firestoreService";

export default function BackgroundMusic() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [hasEntered, setHasEntered] = useState(() => {
    return sessionStorage.getItem("wedding_entered") === "true";
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to settings in real time
  useEffect(() => {
    const docRef = doc(db, "config", "wedding_settings");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WeddingSettings;
        setSettings(data);
        if (data.musicVolume !== undefined) {
          setVolume(data.musicVolume);
        }
      }
    }, (error) => {
      console.error("Error listening to wedding settings:", error);
    });
    return () => unsubscribe();
  }, []);

  // Update volume when volume state or settings volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle auto-playing when user enters with music
  const handleEnter = (playMusic: boolean) => {
    sessionStorage.setItem("wedding_entered", "true");
    setHasEntered(true);
    
    if (playMusic && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio playback blocked or failed:", err);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio playback blocked:", err);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (value > 0) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.muted = true;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // Loop music if enabled
      if (settings?.musicEnabled) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Loop restart failed", err));
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // If settings are not loaded yet or music is disabled, we return null
  if (!settings) return null;

  const showWelcome = settings.showWelcomeScreen && !hasEntered;
  const isMusicEnabled = settings.musicEnabled !== false;

  return (
    <>
      <style>{`
        @keyframes soundwave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-soundwave-1 { animation: soundwave 1.2s ease-in-out infinite; }
        .animate-soundwave-2 { animation: soundwave 0.9s ease-in-out infinite 0.25s; }
        .animate-soundwave-3 { animation: soundwave 1.4s ease-in-out infinite 0.4s; }
        .animate-soundwave-4 { animation: soundwave 1.0s ease-in-out infinite 0.15s; }
      `}</style>

      {/* Hidden native HTML5 audio player */}
      {isMusicEnabled && settings.musicUrl && (
        <audio
          ref={audioRef}
          src={settings.musicUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          loop
        />
      )}

      {/* Welcome Screen Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/90 text-white p-6 backdrop-blur-md select-none"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-lg w-full text-center space-y-8 z-10 px-4 py-8 rounded-lg border border-gold-500/20 bg-zinc-900/40 backdrop-blur-sm"
            >
              {/* Rings Icon or Monogram */}
              <div className="flex justify-center items-center gap-1.5 text-gold-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-serif text-3xl font-extralight tracking-widest">💍</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              {/* Names */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl md:text-4xl font-light tracking-[0.2em] text-gold-400 uppercase">
                  Kimberly & Jhon
                </h1>
                <p className="font-sans text-[10px] tracking-[0.4em] text-zinc-400 uppercase">
                  Nuestra Boda • 1 de Agosto de 2026
                </p>
              </div>

              {/* Divider */}
              <div className="flex justify-center items-center gap-4">
                <div className="w-12 h-[1px] bg-gold-500/30"></div>
                <Heart className="w-3.5 h-3.5 text-gold-500 fill-gold-500/10" />
                <div className="w-12 h-[1px] bg-gold-500/30"></div>
              </div>

              {/* Message */}
              <p className="font-serif italic text-lg md:text-xl text-zinc-100 max-w-sm mx-auto leading-relaxed">
                "¡Nos emociona compartir este momento tan especial contigo!"
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {isMusicEnabled ? (
                  <>
                    <button
                      onClick={() => handleEnter(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-zinc-950 font-sans text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-gold-400"
                    >
                      <Music className="w-4 h-4 animate-bounce" />
                      <span>🎵 Entrar con música</span>
                    </button>
                    <button
                      onClick={() => handleEnter(false)}
                      className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-white/5 active:scale-95 text-zinc-300 hover:text-white font-sans text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-zinc-700 hover:border-zinc-500"
                    >
                      <Heart className="w-4 h-4" />
                      <span>❤️ Entrar a la invitación</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEnter(false)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-zinc-950 font-sans text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-gold-400"
                  >
                    <Heart className="w-4 h-4" />
                    <span>❤️ Entrar a la invitación</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Player */}
      {isMusicEnabled && hasEntered && (
        <div className="fixed bottom-6 right-6 z-[999] select-none pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-950/95 text-white border border-gold-500/30 rounded-lg p-3 w-[260px] md:w-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col gap-2 animate-fade-in"
          >
            {/* Audio info */}
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Animating Visualizer */}
              <div className="bg-gold-500/10 border border-gold-500/20 rounded-md p-1.5 flex items-center justify-center h-9 w-9 shrink-0">
                {isPlaying ? (
                  <div className="flex items-end gap-[2px] h-4 w-4 shrink-0">
                    <span className="w-[2.5px] bg-gold-400 animate-soundwave-1 rounded-full"></span>
                    <span className="w-[2.5px] bg-gold-400 animate-soundwave-2 rounded-full"></span>
                    <span className="w-[2.5px] bg-gold-400 animate-soundwave-3 rounded-full"></span>
                    <span className="w-[2.5px] bg-gold-400 animate-soundwave-4 rounded-full"></span>
                  </div>
                ) : (
                  <Music className="w-4 h-4 text-zinc-400" />
                )}
              </div>

              {/* Title & Timing info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-gold-400 leading-none">
                  Música de Fondo
                </span>
                <span className="font-serif text-[11px] text-zinc-200 truncate block mt-0.5" title={settings.musicTitle || "Canción de Boda"}>
                  {settings.musicTitle || "Canción de Boda"}
                </span>
                <span className="font-mono text-[9px] text-zinc-400 mt-0.5">
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-2 border-t border-zinc-800 pt-1.5">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-white/10 active:scale-95 text-gold-400 hover:text-gold-300 rounded-full transition-all cursor-pointer flex items-center justify-center"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              {/* Volume Slider Block */}
              <div className="flex items-center gap-1.5 flex-1 max-w-[120px] md:max-w-[140px]">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:bg-white/10 active:scale-95 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center"
                  title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-800 accent-gold-500 hover:accent-gold-400 rounded-lg cursor-pointer transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
