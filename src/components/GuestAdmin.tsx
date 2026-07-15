/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown, 
  User, 
  Mail, 
  Phone, 
  Users, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  X, 
  FileSpreadsheet, 
  Sparkles,
  Award,
  ChevronDown,
  Camera,
  Upload,
  RefreshCw,
  Landmark,
  Calendar,
  Clock,
  Music,
  Utensils,
  PartyPopper,
  HeartHandshake,
  Church,
  GlassWater,
  Gift,
  MapPin,
  Heart,
  Star,
  Smile,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminGuest, ItineraryItem } from "../types";
import TableAdmin from "./TableAdmin";
import CoverPhotoEditor from "./CoverPhotoEditor";
import { TIMELINE_MILESTONES } from "./OurStory";
import { INITIAL_GALLERY_PHOTOS } from "./Gallery";
import { GIFT_REGISTRY_CHANNELS, ITINERARY_DATA } from "../data";
import { 
  getGuests, 
  addGuest, 
  updateGuest, 
  deleteGuestFromDb,
  getOurStory,
  saveOurStory,
  getItinerary as getItineraryFromDb,
  saveItinerary as saveItineraryToDb,
  getGalleryPhotos,
  saveGalleryPhoto,
  deleteGalleryPhoto,
  getWeddingSettings,
  saveWeddingSettings
} from "../lib/firestoreService";

function generateUniqueGuestCode(existingGuests: AdminGuest[]): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let attempts = 0;
  while (attempts < 100) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!existingGuests.some(g => g.code === code)) {
      return code;
    }
    attempts++;
  }
  return "G" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// =========================================================================
// DEFAULT SEED DATA FOR THE ADMINISTRATION MODULE
// Pre-populates the database so the user sees a gorgeous, realistic grid.
// =========================================================================
const INITIAL_ADMIN_GUESTS: AdminGuest[] = [
  {
    id: "g-1",
    firstName: "Kimberly",
    lastName: "Figueroa Barreto",
    phone: "+57 300 111 2222",
    email: "kimberly@example.com",
    quota: 2,
    tableName: "Mesa 1 - Imperial de Honor",
    status: "Confirmado",
    notes: "¡La hermosa Novia! Todo listo en el altar."
  },
  {
    id: "g-2",
    firstName: "Jhon Jairo",
    lastName: "Gómez",
    phone: "+57 300 222 3333",
    email: "jhon@example.com",
    quota: 2,
    tableName: "Mesa 1 - Imperial de Honor",
    status: "Confirmado",
    notes: "¡El Novio! Brindis y discurso preparados."
  },
  {
    id: "g-3",
    firstName: "Alejandra",
    lastName: "Figueroa Barreto",
    phone: "+57 300 444 5555",
    email: "alejandra@example.com",
    quota: 2,
    tableName: "Mesa 2 - Familia Figueroa",
    status: "Confirmado",
    notes: "Hermana de la novia. Coordinadora de damas."
  },
  {
    id: "g-4",
    firstName: "Mauricio",
    lastName: "Figueroa",
    phone: "+57 301 987 6543",
    email: "mauricio.f@example.com",
    quota: 2,
    tableName: "Mesa 2 - Familia Figueroa",
    status: "Pendiente",
    notes: "Tío de la novia. Trae regalo físico."
  },
  {
    id: "g-5",
    firstName: "Guillermo",
    lastName: "Jhon",
    phone: "+57 312 345 6789",
    email: "guillermo.j@example.com",
    quota: 2,
    tableName: "Mesa 3 - Familia Jhon",
    status: "Confirmado",
    notes: "Familia directa del novio."
  },
  {
    id: "g-6",
    firstName: "Mariana",
    lastName: "Gómez",
    phone: "+57 315 555 1234",
    email: "mariana.g@example.com",
    quota: 1,
    tableName: "Mesa 4 - Corte de Honor",
    status: "Confirmado",
    notes: "Coordinadora principal del protocolo de ceremonia."
  },
  {
    id: "g-7",
    firstName: "Andrés",
    lastName: "Mendoza",
    phone: "+57 300 555 6666",
    email: "andres.m@example.com",
    quota: 2,
    tableName: "Mesa 5 - Amigos Cercanos",
    status: "Confirmado",
    notes: "Compañero de universidad del novio."
  },
  {
    id: "g-8",
    firstName: "Martha Ligia",
    lastName: "Ramírez",
    phone: "+57 311 888 9999",
    email: "martha.r@example.com",
    quota: 1,
    tableName: "Mesa 6 - Compañeros de Éxito",
    status: "No asiste",
    notes: "Envía felicitaciones y regalo por lluvia de sobres."
  },
  {
    id: "g-9",
    firstName: "Gabriel Jaime",
    lastName: "Restrepo",
    phone: "+57 314 777 8888",
    email: "gabriel.r@example.com",
    quota: 2,
    tableName: "Mesa 6 - Compañeros de Éxito",
    status: "Pendiente",
    notes: "Confirmará asistencia definitiva esta semana."
  },
  {
    id: "g-10",
    firstName: "Carlos Mario",
    lastName: "Holguín",
    phone: "+57 318 222 1111",
    email: "carlos.h@example.com",
    quota: 2,
    tableName: "Mesa 6 - Compañeros de Éxito",
    status: "Confirmado",
    notes: "Compañero de oficina de Jhon."
  }
];

export default function GuestAdmin() {
  // Modal visibility state
  const [isOpen, setIsOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"invitados" | "mesas" | "fotos" | "historia" | "galeria" | "informacion" | "itinerario">("invitados");

  // Listen for opening event from footer or navigation
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    };
    window.addEventListener("open_admin_panel", handleOpen);
    return () => {
      window.removeEventListener("open_admin_panel", handleOpen);
    };
  }, []);

  const handleClosePanel = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  // Guests list & CRUD States
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tableFilter, setTableFilter] = useState<string>("todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"firstName" | "lastName" | "quota" | "tableName" | "status">("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Edit / Add Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<AdminGuest | null>(null);
  
  // Form fields
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formQuota, setFormQuota] = useState(2);
  const [formTableName, setFormTableName] = useState("Mesa 1 - Imperial de Honor");
  const [formStatus, setFormStatus] = useState<"Pendiente" | "Confirmado" | "No asiste">("Pendiente");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Load state and login check
  useEffect(() => {
    // Check local session storage if already unlocked in this session
    const unlocked = sessionStorage.getItem("wedding_admin_unlocked") === "true";
    if (unlocked) {
      setIsAuthenticated(true);
    }

    const loadFirestoreGuests = async () => {
      setIsLoadingGuests(true);
      try {
        const dbGuests = await getGuests();
        setGuests(dbGuests);
      } catch (e) {
        console.error("Error loading guests from Firestore:", e);
      } finally {
        setIsLoadingGuests(false);
      }
    };

    loadFirestoreGuests();

    // Listeners for updates
    const handleUpdateEvent = () => {
      loadFirestoreGuests();
    };

    window.addEventListener("wedding_admin_guests_updated", handleUpdateEvent);
    window.addEventListener("wedding_tables_updated", handleUpdateEvent);

    return () => {
      window.removeEventListener("wedding_admin_guests_updated", handleUpdateEvent);
      window.removeEventListener("wedding_tables_updated", handleUpdateEvent);
    };
  }, []);

  // Save changes helper (keeps state in sync)
  const saveGuestsToStorage = async (updatedGuests: AdminGuest[]) => {
    setGuests(updatedGuests);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Trim and compare (using demo credentials as requested by user)
    if (username.trim().toLowerCase() === "admin" && password === "boda2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("wedding_admin_unlocked", "true");
    } else {
      setLoginError("Usuario o contraseña incorrectos. Por favor, intenta de nuevo.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("wedding_admin_unlocked");
    setUsername("");
    setPassword("");
  };

  // Form submit (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formFirstName.trim() || !formLastName.trim()) {
      setFormError("El nombre y el apellido son obligatorios.");
      return;
    }

    if (formQuota < 1) {
      setFormError("La cantidad de cupos debe ser de al menos 1.");
      return;
    }

    setIsLoadingGuests(true);
    try {
      if (editingGuest) {
        // Edit mode
        const updatedGuest: AdminGuest = {
          ...editingGuest,
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          quota: formQuota,
          tableName: formTableName,
          status: formStatus,
          notes: formNotes.trim() || undefined,
          wantsReminder: editingGuest.wantsReminder || false
        };

        const updated = guests.map(g => g.id === editingGuest.id ? updatedGuest : g);
        await saveGuestsToStorage(updated);
        await updateGuest(updatedGuest);
      } else {
        // Add mode
        const newGuestData = {
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          quota: formQuota,
          tableName: formTableName,
          status: formStatus,
          notes: formNotes.trim() || undefined,
          wantsReminder: false
        };

        const persistedGuest = await addGuest(newGuestData);
        await saveGuestsToStorage([persistedGuest, ...guests]);
      }
      // Dispatch update event
      window.dispatchEvent(new Event("wedding_admin_guests_updated"));
      setIsFormOpen(false);
      resetFormFields();
    } catch (err) {
      console.error("Error saving guest:", err);
      setFormError("Ocurrió un error al guardar en la base de datos persistente.");
    } finally {
      setIsLoadingGuests(false);
    }
  };

  const resetFormFields = () => {
    setEditingGuest(null);
    setFormFirstName("");
    setFormLastName("");
    setFormPhone("");
    setFormEmail("");
    setFormQuota(2);
    setFormTableName("Mesa 1 - Imperial de Honor");
    setFormStatus("Pendiente");
    setFormNotes("");
    setFormError("");
  };

  const handleOpenAddForm = () => {
    resetFormFields();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (guest: AdminGuest) => {
    setEditingGuest(guest);
    setFormFirstName(guest.firstName);
    setFormLastName(guest.lastName);
    setFormPhone(guest.phone || "");
    setFormEmail(guest.email || "");
    setFormQuota(guest.quota);
    setFormTableName(guest.tableName || "Mesa 1 - Imperial de Honor");
    setFormStatus(guest.status);
    setFormNotes(guest.notes || "");
    setIsFormOpen(true);
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a "${name}" de la lista de invitados?`)) {
      setIsLoadingGuests(true);
      try {
        const filtered = guests.filter(g => g.id !== id);
        await saveGuestsToStorage(filtered);
        await deleteGuestFromDb(id);
        window.dispatchEvent(new Event("wedding_admin_guests_updated"));
      } catch (err) {
        console.error("Error deleting guest:", err);
        alert("No se pudo eliminar el invitado de la base de datos persistente.");
      } finally {
        setIsLoadingGuests(false);
      }
    }
  };

  const getGuestLink = (guestCode: string) => {
    return `${window.location.origin}${window.location.pathname}?invitado=${guestCode}#confirmar-asistencia`;
  };

  const handleCopyLink = (guest: AdminGuest) => {
    const link = getGuestLink(guest.code || "");
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShareWhatsApp = (guest: AdminGuest) => {
    const link = getGuestLink(guest.code || "");
    const text = `¡Hola ${guest.firstName}! 💕 Te invitamos cordialmente a nuestra boda. Aquí tienes tu enlace personalizado para confirmar tu asistencia (tienes ${guest.quota} ${guest.quota === 1 ? 'cupo asignado' : 'cupos asignados'}): ${link}`;
    const encodedText = encodeURIComponent(text);
    const cleanPhone = guest.phone ? guest.phone.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareNonConfirmationWhatsApp = (guest: AdminGuest) => {
    const text = `¡Hola ${guest.firstName}! 💕 Queríamos agradecerte de todo corazón tu cariño y tus buenos deseos para nuestra boda. Al haber concluido la fecha máxima de confirmación (15 de Julio de 2026) y no registrarse tu respuesta, entendemos perfectamente que por diferentes motivos no podrás acompañarnos en este gran día. ¡Te tendremos muy presente en nuestro corazón y esperamos compartir pronto en otra ocasión! Con mucho cariño, Kimberly & Jhon. ✨`;
    const encodedText = encodeURIComponent(text);
    const cleanPhone = guest.phone ? guest.phone.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  // Sort and Filter logic
  const handleSort = (field: "firstName" | "lastName" | "quota" | "tableName" | "status") => {
    if (sortBy === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Extract unique table names for the filter dropdown
  const uniqueTables = Array.from(new Set(guests.map(g => g.tableName))).filter(Boolean).sort();

  // Filter & Search
  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchesSearch = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query) || 
                          guest.phone.includes(query) || 
                          guest.email.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "todos" || guest.status === statusFilter;
    const matchesTable = tableFilter === "todos" || guest.tableName === tableFilter;

    return matchesSearch && matchesStatus && matchesTable;
  });

  // Sorted list
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Dashboard Analytics
  const totalGuestsLoaded = guests.length;
  const confirmedCount = guests.filter(g => g.status === "Confirmado").reduce((acc, curr) => acc + curr.quota, 0);
  const pendingCount = guests.filter(g => g.status === "Pendiente").reduce((acc, curr) => acc + curr.quota, 0);
  const declinedCount = guests.filter(g => g.status === "No asiste").length;
  const totalAssignedSeats = guests.reduce((sum, g) => sum + (g.status === "No asiste" ? 0 : g.quota), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white overflow-y-auto z-50 select-text pb-24">
      {/* Close button inside the top bar of the modal */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-end">
        <button
          onClick={handleClosePanel}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gold-400 hover:text-gold-300 font-sans text-xs tracking-widest uppercase font-bold border border-gold-500/20 rounded-sm cursor-pointer flex items-center gap-2 transition-all"
        >
          <X className="w-4 h-4" />
          <span>Cerrar Panel</span>
        </button>
      </div>

      {/* Golden Geometric Background Art */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 pointer-events-none -z-10" />
      <div className="absolute top-12 left-12 right-12 bottom-12 border border-gold-500/10 pointer-events-none -z-10 rounded-sm" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-12">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-400 mb-3 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-gold-500" />
            <span>MÓDULO DE CONTROL EXCLUSIVO</span>
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-100 mb-4">
            Administración de Invitados
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Unlock className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            
            // =========================================================================
            // LOGIN SCREEN (BEAUTIFUL PRIVATE PANEL)
            // =========================================================================
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto bg-zinc-900 border border-gold-500/30 p-8 rounded-sm shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-500" />
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-zinc-950 border border-gold-500/40 flex items-center justify-center text-gold-400 mb-3 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl text-zinc-100 font-light">Panel Protegido</h3>
                <p className="font-sans text-[11px] text-zinc-400 uppercase tracking-widest mt-1">
                  Ingrese credenciales para gestionar el aforo
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Escriba su usuario"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-3 font-sans text-xs sm:text-sm rounded-sm transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Escriba su contraseña"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-3 font-sans text-xs sm:text-sm rounded-sm transition-all"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-[11px] text-rose-500 font-sans text-center bg-rose-950/20 p-2.5 rounded-sm border border-rose-900/30">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-zinc-950 font-sans text-xs tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer rounded-sm"
                >
                  Desbloquear Panel
                </button>
              </form>

              {/* Display credentials box to guide the user/tester */}
              <div className="mt-8 pt-6 border-t border-zinc-800 text-left">
                <span className="font-sans text-[10px] uppercase tracking-widest text-gold-400 font-bold block mb-1">
                  🔑 CREDENCIALES DE DEMOSTRACIÓN:
                </span>
                <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                  Para probar la administración libremente, ingresa:<br />
                  • Usuario: <strong className="text-zinc-100">admin</strong><br />
                  • Contraseña: <strong className="text-zinc-100">boda2026</strong>
                </p>
              </div>
            </motion.div>
          ) : (
            
            // =========================================================================
            // AUTHENTICATED ADMINISTRATOR WORKSPACE
            // =========================================================================
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* TOP HEADER CONTROLS */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-4 rounded-sm border border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-sans text-xs text-zinc-300">
                    Conectado como <strong className="text-gold-400">Organizador Principal</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {activeTab === "invitados" && (
                    <button
                      onClick={handleOpenAddForm}
                      className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 text-xs font-bold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Invitado</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs tracking-wider uppercase transition-colors rounded-sm cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              {/* TABS FOR GUEST LIST & TABLES ORGANIZER */}
              <div className="flex border-b border-zinc-800 gap-6 mt-4 pb-0.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab("invitados")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "invitados" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Control de Invitados</span>
                  {activeTab === "invitados" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("mesas")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "mesas" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Módulo de Mesas</span>
                  {activeTab === "mesas" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("historia")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "historia" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Historia</span>
                  {activeTab === "historia" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("galeria")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "galeria" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Galería</span>
                  {activeTab === "galeria" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("itinerario")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "itinerario" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Itinerario</span>
                  {activeTab === "itinerario" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("informacion")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "informacion" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Cuentas y Contacto</span>
                  {activeTab === "informacion" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("fotos")}
                  className={`pb-4 px-2 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all relative cursor-pointer shrink-0 ${
                    activeTab === "fotos" ? "text-gold-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>Foto de Portada</span>
                  {activeTab === "fotos" && (
                    <motion.div layoutId="admin-active-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
              </div>

              {activeTab === "invitados" ? (
                <>

              {/* ANALYTICS DASHBOARD STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-sm relative">
                  <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Grupos Familiares
                  </span>
                  <span className="font-serif text-3xl text-zinc-100 font-light block">
                    {totalGuestsLoaded}
                  </span>
                  <div className="absolute right-4 bottom-4 text-zinc-800">
                    <Users className="w-8 h-8" />
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-sm relative">
                  <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Asistentes Confirmados
                  </span>
                  <span className="font-serif text-3xl text-emerald-400 font-light block">
                    {confirmedCount}
                  </span>
                  <div className="absolute right-4 bottom-4 text-emerald-950">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-sm relative">
                  <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Cupos Pendientes
                  </span>
                  <span className="font-serif text-3xl text-amber-400 font-light block">
                    {pendingCount}
                  </span>
                  <div className="absolute right-4 bottom-4 text-amber-950">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-sm relative animate-pulse-slow">
                  <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Total Cupos Asignados
                  </span>
                  <span className="font-serif text-3xl text-gold-400 font-light block">
                    {totalAssignedSeats} <span className="text-sm text-zinc-500 font-sans">Sillas</span>
                  </span>
                  <div className="absolute right-4 bottom-4 text-gold-950">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* SEARCH, SORT AND FILTERS AREA */}
              <div className="bg-zinc-900 p-6 border border-zinc-800 rounded-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Search input */}
                  <div className="md:col-span-6 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por Nombre, Teléfono o Correo..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none pl-12 pr-4 py-3 font-sans text-sm rounded-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  </div>

                  {/* Filter Status */}
                  <div className="md:col-span-3 flex flex-col">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 font-sans text-sm rounded-sm outline-none focus:border-gold-500"
                    >
                      <option value="todos">Estado: Todos</option>
                      <option value="Confirmado">Confirmados</option>
                      <option value="Pendiente">Pendientes</option>
                      <option value="No asiste">No asiste</option>
                    </select>
                  </div>

                  {/* Filter Table */}
                  <div className="md:col-span-3 flex flex-col">
                    <select
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 font-sans text-sm rounded-sm outline-none focus:border-gold-500"
                    >
                      <option value="todos">Mesas: Todas</option>
                      {uniqueTables.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile sorting helper row */}
                <div className="flex md:hidden items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 font-sans tracking-widest uppercase">
                  <span>Ordenar por:</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleSort("firstName")} className={`px-2 py-1 border rounded-sm ${sortBy === "firstName" ? "bg-gold-500 text-zinc-950 font-bold border-gold-500" : "border-zinc-800"}`}>Nombre</button>
                    <button onClick={() => handleSort("quota")} className={`px-2 py-1 border rounded-sm ${sortBy === "quota" ? "bg-gold-500 text-zinc-950 font-bold border-gold-500" : "border-zinc-800"}`}>Cupos</button>
                    <button onClick={() => handleSort("status")} className={`px-2 py-1 border rounded-sm ${sortBy === "status" ? "bg-gold-500 text-zinc-950 font-bold border-gold-500" : "border-zinc-800"}`}>Estado</button>
                  </div>
                </div>
              </div>

              {/* INVITATIONS DATA TABLE (DESKTOP) & GRID (MOBILE) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-xl relative min-h-[150px]">
                {isLoadingGuests && (
                  <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mb-2"></div>
                    <span className="text-sm font-sans text-zinc-400">Sincronizando con base de datos...</span>
                  </div>
                )}
                
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-gold-400 font-sans text-[11px] uppercase tracking-widest">
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("firstName")}>
                          <div className="flex items-center space-x-1.5">
                            <span>Nombre Completo</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("quota")}>
                          <div className="flex items-center space-x-1.5">
                            <span>Cupos</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("tableName")}>
                          <div className="flex items-center space-x-1.5">
                            <span>Mesa Asignada</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("status")}>
                          <div className="flex items-center space-x-1.5">
                            <span>Estado</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="p-4">Enlace Único (WhatsApp)</th>
                        <th className="p-4">Notas de Control</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans text-xs text-zinc-300">
                      {sortedGuests.length > 0 ? (
                        sortedGuests.map((guest) => (
                          <tr key={guest.id} className="hover:bg-zinc-850/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-gold-400 uppercase">
                                  {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-serif text-sm text-zinc-100 font-medium block">
                                    {guest.firstName} {guest.lastName}
                                  </span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="p-4 space-y-0.5">
                              {guest.phone && (
                                <span className="flex items-center space-x-1 text-zinc-400">
                                  <Phone className="w-3 h-3 text-gold-500/80" />
                                  <span>{guest.phone}</span>
                                </span>
                              )}
                              {guest.email && (
                                <span className="flex items-center space-x-1 text-zinc-400">
                                  <Mail className="w-3 h-3 text-gold-500/80" />
                                  <span>{guest.email}</span>
                                </span>
                              )}
                            </td>

                            <td className="p-4 font-serif text-sm font-semibold text-zinc-100">
                              {guest.status === "No asiste" ? (
                                <span className="text-zinc-500 line-through">{guest.quota}</span>
                              ) : (
                                <span>{guest.quota} {guest.quota === 1 ? "cupo" : "cupos"}</span>
                              )}
                            </td>

                            <td className="p-4">
                              <span className="inline-block px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-sm text-[11px] text-gold-400 font-serif italic">
                                {guest.tableName}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                guest.status === "Confirmado"
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                                  : guest.status === "No asiste"
                                  ? "bg-rose-950/40 text-rose-400 border-rose-900/60"
                                  : "bg-amber-950/40 text-amber-400 border-amber-900/60"
                              }`}>
                                {guest.status === "Confirmado" ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-400 fill-none" />
                                    <span>Confirmado</span>
                                  </>
                                ) : guest.status === "No asiste" ? (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-400 fill-none" />
                                    <span>No Asiste</span>
                                  </>
                                ) : (
                                  <>
                                    <HelpCircle className="w-3 h-3 text-amber-400 fill-none" />
                                    <span>Pendiente</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="p-4 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] bg-zinc-950 px-2 py-1 rounded-sm border border-zinc-800 text-gold-400 font-bold select-all" title="Código de Invitado">
                                  {guest.code}
                                </span>
                                <button
                                  onClick={() => handleCopyLink(guest)}
                                  className={`p-1.5 border rounded-xs transition-all flex items-center justify-center cursor-pointer ${
                                    copiedId === guest.id
                                      ? "bg-emerald-950/50 border-emerald-500 text-emerald-400"
                                      : "bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white"
                                  }`}
                                  title="Copiar Enlace Único"
                                >
                                  {copiedId === guest.id ? (
                                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleShareWhatsApp(guest)}
                                  className="p-1.5 bg-zinc-950 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-800 text-emerald-400 transition-all rounded-xs flex items-center justify-center cursor-pointer"
                                  title="Enviar Enlace por WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleShareNonConfirmationWhatsApp(guest)}
                                  className="p-1.5 bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-800 text-amber-500 transition-all rounded-xs flex items-center justify-center cursor-pointer"
                                  title="Enviar Agradecimiento por No Asistencia (WhatsApp)"
                                >
                                  <Heart className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            <td className="p-4 max-w-[200px] truncate" title={guest.notes}>
                              <span className="text-zinc-400 italic">
                                {guest.notes || "—"}
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditForm(guest)}
                                  className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-gold-500/30 text-gold-400 transition-all rounded-xs cursor-pointer"
                                  title="Editar Invitado"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGuest(guest.id, `${guest.firstName} ${guest.lastName}`)}
                                  className="p-1.5 bg-zinc-950 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900 text-zinc-500 hover:text-rose-400 transition-all rounded-xs cursor-pointer"
                                  title="Eliminar Invitado"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-zinc-500 italic">
                            No se encontraron invitados con los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile responsive Cards Grid */}
                <div className="block md:hidden divide-y divide-zinc-800">
                  {sortedGuests.length > 0 ? (
                    sortedGuests.map((guest) => (
                      <div key={guest.id} className="p-5 space-y-3 hover:bg-zinc-850/20 transition-all text-xs">
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 text-gold-400 flex items-center justify-center font-bold text-[9px] uppercase">
                              {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                            </div>
                            <span className="font-serif text-sm font-medium text-zinc-100">
                              {guest.firstName} {guest.lastName}
                            </span>
                          </div>

                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            guest.status === "Confirmado"
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                              : guest.status === "No asiste"
                              ? "bg-rose-950/40 text-rose-400 border-rose-900/60"
                              : "bg-amber-950/40 text-amber-400 border-amber-900/60"
                          }`}>
                            {guest.status === "Confirmado" ? "Confirmado" : guest.status === "No asiste" ? "No asiste" : "Pendiente"}
                          </span>
                        </div>

                        {/* Contacts & Table Details */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-zinc-950/50 p-2.5 rounded-xs border border-zinc-800/80">
                          <div>
                            <span className="text-zinc-500 block uppercase text-[8px] tracking-wider font-bold">Cupos</span>
                            <span className="text-zinc-200 font-serif font-semibold">{guest.quota} {guest.quota === 1 ? 'Silla' : 'Sillas'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block uppercase text-[8px] tracking-wider font-bold">Ubicación</span>
                            <span className="text-gold-400 italic font-serif truncate block">{guest.tableName.split(" - ")[0]}</span>
                          </div>
                        </div>

                        {/* Contact numbers / email */}
                        <div className="text-[11px] text-zinc-400 space-y-0.5">
                          {guest.phone && <div className="flex items-center space-x-1"><strong>Tel:</strong> <span>{guest.phone}</span></div>}
                          {guest.email && <div className="flex items-center space-x-1"><strong>Email:</strong> <span className="truncate">{guest.email}</span></div>}
                          {guest.notes && <div className="text-zinc-500 italic mt-1">&ldquo;{guest.notes}&rdquo;</div>}
                        </div>

                        {/* Invitation Link on Mobile */}
                        <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-sm border border-zinc-850">
                          <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Enlace Personalizado:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-gold-400 font-bold bg-zinc-900 px-2 py-0.5 rounded-sm border border-zinc-800">
                              {guest.code}
                            </span>
                            <button
                              onClick={() => handleCopyLink(guest)}
                              className={`p-1 border rounded-xs transition-all flex items-center justify-center cursor-pointer ${
                                copiedId === guest.id
                                  ? "bg-emerald-950/50 border-emerald-500 text-emerald-400"
                                  : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                              title="Copiar Enlace"
                            >
                              {copiedId === guest.id ? (
                                <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShareWhatsApp(guest)}
                              className="p-1 bg-zinc-900 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-800 text-emerald-400 transition-all rounded-xs flex items-center justify-center cursor-pointer"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShareNonConfirmationWhatsApp(guest)}
                              className="p-1 bg-zinc-900 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-800 text-amber-500 transition-all rounded-xs flex items-center justify-center cursor-pointer"
                              title="Agradecimiento No Asistencia (WhatsApp)"
                            >
                              <Heart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex gap-2 pt-2 border-t border-zinc-800 text-[10px] uppercase font-bold tracking-widest justify-end">
                          <button
                            onClick={() => handleOpenEditForm(guest)}
                            className="flex items-center space-x-1 text-gold-400 hover:text-gold-300 p-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id, `${guest.firstName} ${guest.lastName}`)}
                            className="flex items-center space-x-1 text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-zinc-500 italic">
                      No se encontraron invitados.
                    </div>
                  )}
                </div>

              </div>
              </>
              ) : activeTab === "mesas" ? (
                <TableAdmin />
              ) : activeTab === "historia" ? (
                <HistoriaAdmin />
              ) : activeTab === "galeria" ? (
                <GaleriaAdmin />
              ) : activeTab === "itinerario" ? (
                <ItinerarioAdmin />
              ) : activeTab === "informacion" ? (
                <InformacionAdmin />
              ) : (
                <CoverPhotoEditor />
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* =========================================================================
          HIGH-FIDELITY ADD / EDIT MODAL OVERLAY
          ========================================================================= */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-gold-500/30 p-6 md:p-8 rounded-sm shadow-2xl relative max-w-xl w-full max-h-[90vh] overflow-y-auto text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl sm:text-2xl text-zinc-100 font-light mb-1 border-b border-zinc-800 pb-3 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <span>{editingGuest ? "Editar Invitado" : "Registrar Nuevo Invitado"}</span>
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4 pt-3 text-xs sm:text-sm">
                
                {/* Name & Lastname */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      placeholder="Ej. Andrés"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Apellido(s) *
                    </label>
                    <input
                      type="text"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      placeholder="Ej. Mendoza"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm"
                      required
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Teléfono Celular
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="Ej. +57 300 555 6666"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Ej. andres@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm"
                    />
                  </div>
                </div>

                {/* Quota & Table Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Cantidad de Cupos (Sillas) *
                    </label>
                    <input
                      type="number"
                      value={formQuota}
                      onChange={(e) => setFormQuota(parseInt(e.target.value) || 0)}
                      min={1}
                      max={10}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Asignación de Mesa
                    </label>
                    <select
                      value={formTableName}
                      onChange={(e) => setFormTableName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-2.5 rounded-sm outline-none focus:border-gold-500"
                    >
                      <option value="Mesa 1 - Imperial de Honor">Mesa 1 - Imperial de Honor</option>
                      <option value="Mesa 2 - Familia Figueroa">Mesa 2 - Familia Figueroa</option>
                      <option value="Mesa 3 - Familia Jhon">Mesa 3 - Familia Jhon</option>
                      <option value="Mesa 4 - Corte de Honor">Mesa 4 - Corte de Honor</option>
                      <option value="Mesa 5 - Amigos Cercanos">Mesa 5 - Amigos Cercanos</option>
                      <option value="Mesa 6 - Compañeros de Éxito">Mesa 6 - Compañeros de Éxito</option>
                    </select>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                    Estado de Asistencia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pendiente", "Confirmado", "No asiste"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormStatus(st as any)}
                        className={`py-2 px-3 border rounded-sm font-sans text-xs tracking-wider uppercase transition-all cursor-pointer text-center ${
                          formStatus === st
                            ? "bg-gold-500 text-zinc-950 border-gold-500 font-bold"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {st === "Confirmado" ? "Sí Asiste" : st === "No asiste" ? "No asiste" : "Pendiente"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                    Notas o Requerimientos de Control
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Escriba aquí notas de protocolo, alergias, o detalles adicionales..."
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-rose-500 font-sans">
                    {formError}
                  </p>
                )}

                {/* Footer buttons */}
                <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase tracking-widest text-xs font-bold cursor-pointer rounded-sm"
                  >
                    Guardar Cambios
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// =========================================================================
// HISTORIAADMIN COMPONENT (EDITING OUR STORY MILESTONES)
// =========================================================================
function HistoriaAdmin() {
  const [stories, setStories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [editDate, setEditDate] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getOurStory();
        setStories(data);
      } catch (err) {
        console.error("Error loading milestones in admin:", err);
      }
    };
    fetchStories();
  }, []);

  const startEdit = (story: any) => {
    setEditingId(story.id);
    setEditDate(story.date);
    setEditTitle(story.title);
    setEditDesc(story.description);
    setEditImg(story.imageUrl);
  };

  const handleSave = async (id: string) => {
    const updated = stories.map(s => {
      if (s.id === id) {
        return {
          ...s,
          date: editDate,
          title: editTitle,
          description: editDesc,
          imageUrl: editImg
        };
      }
      return s;
    });

    try {
      await saveOurStory(updated);
      setStories(updated);
      window.dispatchEvent(new Event("wedding_stories_updated"));
      setEditingId(null);
    } catch (err) {
      console.error("Error saving milestones to Firestore:", err);
    }
  };

  const handleReset = async () => {
    if (window.confirm("¿Estás seguro de que deseas restablecer las historias predeterminadas?")) {
      try {
        await saveOurStory(TIMELINE_MILESTONES);
        setStories(TIMELINE_MILESTONES);
        window.dispatchEvent(new Event("wedding_stories_updated"));
        setEditingId(null);
      } catch (err) {
        console.error("Error resetting milestones in Firestore:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
        <div>
          <h4 className="font-serif text-lg text-gold-400">Modificar 'Conoce Nuestra Historia'</h4>
          <p className="font-sans text-[11px] text-zinc-400 uppercase tracking-wider">
            Personaliza los hitos cronológicos que ven tus invitados
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 text-[10px] tracking-wider uppercase rounded-sm cursor-pointer"
        >
          Restablecer Valores
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm relative flex flex-col justify-between">
            {editingId === story.id ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gold-400 font-bold block">Fecha / Período</label>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gold-400 font-bold block">Título del Hito</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gold-400 font-bold block">Descripción de la Historia</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gold-400 font-bold block">Cargar Imagen / Foto</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-gold-500/50 bg-zinc-950 p-4 rounded-sm cursor-pointer transition-all text-center">
                      <Upload className="w-5 h-5 text-gold-500 mb-1" />
                      <span className="text-[11px] text-zinc-300 font-medium">Seleccionar Foto</span>
                      <span className="text-[8px] text-zinc-500 uppercase">Haz clic para cargar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImg(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-zinc-500 uppercase whitespace-nowrap">O pegar URL:</span>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={editImg && editImg.startsWith("data:") ? "" : editImg}
                        onChange={(e) => setEditImg(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-[10px] rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                {editImg && (
                  <div className="mt-2 aspect-video overflow-hidden rounded-xs border border-zinc-800 bg-zinc-950">
                    <img src={editImg} alt="Vista previa" className="w-full h-full object-cover animate-fade-in" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600"; }} referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white uppercase text-[10px] font-bold rounded-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(story.id)}
                    className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold rounded-sm cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-serif italic text-xs text-gold-400">{story.date}</span>
                    <button
                      onClick={() => startEdit(story)}
                      className="text-gold-400 hover:text-gold-300 text-[10px] uppercase font-bold flex items-center space-x-1 border border-gold-500/10 hover:border-gold-500/30 px-2.5 py-1 rounded-sm cursor-pointer transition-all"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                  <h5 className="font-serif text-base text-zinc-100 font-semibold mb-2">{story.title}</h5>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">{story.description}</p>
                </div>
                
                <div className="aspect-video w-full overflow-hidden rounded-xs border border-zinc-800 mt-2 bg-zinc-950">
                  <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// GALERIAADMIN COMPONENT (EDITING MEMORIES GALLERY IMAGES)
// =========================================================================
function GaleriaAdmin() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states (Add/Edit)
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoAuthor, setPhotoAuthor] = useState("Kimberly & Jhon");
  const [photoTimestamp, setPhotoTimestamp] = useState("Julio de 2026");
  const [photoCategory, setPhotoCategory] = useState("preboda");

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditingForm: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditingForm) {
      setIsUploadingEdit(true);
    } else {
      setIsUploading(true);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to fit safely in localStorage
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPhotoUrl(dataUrl);
        }
        if (isEditingForm) {
          setIsUploadingEdit(false);
        } else {
          setIsUploading(false);
        }
      };
      img.onerror = () => {
        if (isEditingForm) {
          setIsUploadingEdit(false);
        } else {
          setIsUploading(false);
        }
        alert("Error al cargar la imagen. Intenta con otra.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      if (isEditingForm) {
        setIsUploadingEdit(false);
      } else {
        setIsUploading(false);
      }
      alert("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const list = await getGalleryPhotos();
        setPhotos(list);
      } catch (err) {
        console.error("Error loading gallery in admin:", err);
      }
    };
    fetchPhotos();
  }, []);

  const handleAddPhoto = async () => {
    if (!photoUrl || !photoCaption) {
      alert("Por favor rellena la URL de la imagen y la frase.");
      return;
    }

    const newPhoto = {
      id: "photo-" + Date.now(),
      url: photoUrl,
      caption: photoCaption,
      author: photoAuthor,
      timestamp: photoTimestamp,
      category: photoCategory as "preboda" | "detalles" | "momentos",
      likes: 0
    };

    try {
      await saveGalleryPhoto(newPhoto);
      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      window.dispatchEvent(new Event("wedding_gallery_updated"));

      // Reset fields
      setPhotoUrl("");
      setPhotoCaption("");
      setPhotoAuthor("Kimberly & Jhon");
      setPhotoTimestamp("Julio de 2026");
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding gallery photo to Firestore:", err);
    }
  };

  const startEdit = (photo: any) => {
    setEditingId(photo.id);
    setPhotoUrl(photo.url);
    setPhotoCaption(photo.caption);
    setPhotoAuthor(photo.author);
    setPhotoTimestamp(photo.timestamp);
    setPhotoCategory(photo.category);
  };

  const handleSaveEdit = async (id: string) => {
    const originalPhoto = photos.find(p => p.id === id);
    const updatedPhoto = {
      id,
      url: photoUrl,
      caption: photoCaption,
      author: photoAuthor,
      timestamp: photoTimestamp,
      category: photoCategory as "preboda" | "detalles" | "momentos",
      likes: originalPhoto ? originalPhoto.likes : 0
    };

    try {
      await saveGalleryPhoto(updatedPhoto);
      const updated = photos.map(p => p.id === id ? updatedPhoto : p);
      setPhotos(updated);
      window.dispatchEvent(new Event("wedding_gallery_updated"));
      setEditingId(null);
    } catch (err) {
      console.error("Error saving gallery photo edit to Firestore:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta fotografía de la galería del recuerdo?")) {
      try {
        await deleteGalleryPhoto(id);
        const updated = photos.filter(p => p.id !== id);
        setPhotos(updated);
        window.dispatchEvent(new Event("wedding_gallery_updated"));
      } catch (err) {
        console.error("Error deleting gallery photo from Firestore:", err);
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm("¿Estás seguro de que deseas restablecer las fotos predeterminadas de la galería?")) {
      try {
        for (const p of photos) {
          await deleteGalleryPhoto(p.id);
        }
        for (const p of INITIAL_GALLERY_PHOTOS) {
          await saveGalleryPhoto(p);
        }
        setPhotos(INITIAL_GALLERY_PHOTOS);
        window.dispatchEvent(new Event("wedding_gallery_updated"));
      } catch (err) {
        console.error("Error resetting gallery photos in Firestore:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm gap-4">
        <div>
          <h4 className="font-serif text-lg text-gold-400">Galería del Recuerdo</h4>
          <p className="font-sans text-[11px] text-zinc-400 uppercase tracking-wider">
            Sube o gestiona las fotografías que tus invitados disfrutarán en el carrusel
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 text-[10px] tracking-wider uppercase font-bold rounded-sm cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? "Ocultar Formulario" : "Agregar Foto"}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-3 py-2 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 text-[10px] tracking-wider uppercase rounded-sm cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 p-6 border border-gold-500/30 rounded-sm space-y-4 max-w-xl">
          <h5 className="font-serif text-base text-zinc-100 font-semibold border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Camera className="w-4 h-4 text-gold-500" />
            <span>Agregar Nueva Fotografía a la Galería</span>
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2 bg-zinc-950/40 p-4 border border-zinc-800/80 rounded-sm">
              <label className="text-[10px] uppercase text-gold-400 font-bold block mb-2">Fotografía (Subir archivo o pegar URL)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload Button Area */}
                <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-sm p-4 flex flex-col items-center justify-center text-center relative hover:border-gold-500/50 transition-colors group cursor-pointer min-h-[100px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 text-gold-400 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-gold-500 transition-colors" />
                  )}
                  <span className="text-xs text-zinc-300 font-medium mt-2">
                    {isUploading ? "Cargando imagen..." : "Seleccionar Archivo"}
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Soporta JPG, PNG, WEBP</span>
                </div>

                {/* URL Input Area */}
                <div className="flex flex-col justify-center space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">O introduce la URL de la Imagen:</span>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                  <span className="text-[9px] text-zinc-500 italic">El archivo cargado se convertirá automáticamente para almacenamiento rápido.</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Frase o Pie de Foto</label>
              <input
                type="text"
                placeholder="Amándonos en la playa..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Autor (Por quién)</label>
              <input
                type="text"
                value={photoAuthor}
                onChange={(e) => setPhotoAuthor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Fecha o Época</label>
              <input
                type="text"
                value={photoTimestamp}
                onChange={(e) => setPhotoTimestamp(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Categoría</label>
              <select
                value={photoCategory}
                onChange={(e) => setPhotoCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              >
                <option value="preboda">Sesión Preboda</option>
                <option value="detalles">Anillos & Detalles</option>
                <option value="momentos">Nuestros Momentos</option>
              </select>
            </div>
          </div>
          {photoUrl && (
            <div className="mt-2 aspect-video overflow-hidden rounded-xs border border-zinc-800 bg-zinc-950 max-w-sm">
              <img src={photoUrl} alt="Vista previa" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600"; }} referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white uppercase text-[10px] font-bold rounded-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddPhoto}
              className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold rounded-sm cursor-pointer"
            >
              Agregar Fotografía
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-sm flex flex-col justify-between">
            {editingId === photo.id ? (
              <div className="space-y-3 text-left">
                <div className="space-y-1 bg-zinc-950/30 p-2.5 border border-zinc-850 rounded-xs">
                  <label className="text-[9px] uppercase text-gold-400 font-bold block mb-1">Fotografía (Subir archivo o URL)</label>
                  <div className="space-y-2">
                    <div className="relative bg-zinc-950 border border-dashed border-zinc-800 rounded-sm p-2 flex items-center justify-center gap-2 cursor-pointer hover:border-gold-500/40 transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, true)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {isUploadingEdit ? (
                        <RefreshCw className="w-3.5 h-3.5 text-gold-400 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-zinc-500 group-hover:text-gold-500 transition-colors" />
                      )}
                      <span className="text-[10px] text-zinc-300 font-medium">
                        {isUploadingEdit ? "Cargando..." : "Subir Nuevo Archivo"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="O pega una URL"
                      className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-[11px] rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-gold-400 font-bold block">Frase o Pie</label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-gold-400 font-bold block">Por quién</label>
                  <input
                    type="text"
                    value={photoAuthor}
                    onChange={(e) => setPhotoAuthor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-gold-400 font-bold block">Fecha o Época</label>
                  <input
                    type="text"
                    value={photoTimestamp}
                    onChange={(e) => setPhotoTimestamp(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-gold-400 font-bold block">Categoría</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  >
                    <option value="preboda">Sesión Preboda</option>
                    <option value="detalles">Anillos & Detalles</option>
                    <option value="momentos">Nuestros Momentos</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white uppercase text-[9px] font-bold rounded-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveEdit(photo.id)}
                    className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[9px] font-bold rounded-sm cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col h-full justify-between">
                <div>
                  <div className="aspect-video w-full overflow-hidden rounded-xs border border-zinc-800 bg-zinc-950">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <p className="font-serif italic text-xs text-zinc-200 font-light mt-3 leading-relaxed">&ldquo;{photo.caption}&rdquo;</p>
                  <div className="flex justify-between items-center mt-2.5 text-[9px] uppercase tracking-wider text-zinc-500 font-medium">
                    <span>Por {photo.author}</span>
                    <span>{photo.timestamp}</span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 border border-zinc-800 text-zinc-500 text-[8px] uppercase tracking-widest font-bold rounded-full">
                    {photo.category === "preboda" ? "Sesión Preboda" : photo.category === "detalles" ? "Anillos & Detalles" : "Nuestros Momentos"}
                  </span>
                </div>

                <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3 mt-3">
                  <button
                    onClick={() => startEdit(photo)}
                    className="flex items-center space-x-1 text-gold-400 hover:text-gold-300 text-[10px] uppercase font-bold border border-gold-500/10 hover:border-gold-500/30 px-2.5 py-1 rounded-sm cursor-pointer transition-all"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="flex items-center space-x-1 text-rose-500 hover:text-rose-400 text-[10px] uppercase font-bold border border-rose-500/10 hover:border-rose-500/30 px-2.5 py-1 rounded-sm cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// INFORMACIONADMIN COMPONENT (EDITING BANK AND CONTACT DETAILS)
// =========================================================================
function InformacionAdmin() {
  const [bankInfo, setBankInfo] = useState({
    bankName: "Bancolombia",
    accountType: "Cuenta de Ahorros",
    accountNumber: "245-098765-12",
    titular: "Kimberly Figueroa Barreto / Jhon Jairo",
    document: "C.C. 1.020.456.789"
  });

  const [contacts, setContacts] = useState([
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
    }
  ]);

  const [countdownTitle, setCountdownTitle] = useState("La Cuenta Regresiva");
  const [countdownDate, setCountdownDate] = useState("2026-08-01T19:00:00");
  const [countdownFormatted, setCountdownFormatted] = useState("1 de Agosto de 2026");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getWeddingSettings();
        if (settings) {
          if (settings.bankInfo) setBankInfo(settings.bankInfo);
          if (settings.contacts) setContacts(settings.contacts);
          if (settings.countdownTitle) setCountdownTitle(settings.countdownTitle);
          if (settings.countdownDate) setCountdownDate(settings.countdownDate);
          if (settings.countdownDateFormatted) setCountdownFormatted(settings.countdownDateFormatted);
        }
      } catch (err) {
        console.error("Error fetching settings in admin panel:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveWeddingSettings({ bankInfo });
      window.dispatchEvent(new Event("wedding_bank_updated"));
      alert("¡Información de la cuenta bancaria guardada con éxito!");
    } catch (err) {
      console.error("Error saving bank info to Firestore:", err);
      alert("Error al guardar la información de la cuenta bancaria.");
    }
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveWeddingSettings({ contacts });
      window.dispatchEvent(new Event("wedding_contact_updated"));
      alert("¡Contactos de asistencia guardados con éxito!");
    } catch (err) {
      console.error("Error saving contacts to Firestore:", err);
      alert("Error al guardar los contactos.");
    }
  };

  const handleSaveCountdown = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveWeddingSettings({
        countdownTitle,
        countdownDate,
        countdownDateFormatted: countdownFormatted,
      });
      window.dispatchEvent(new Event("wedding_countdown_date_updated"));
      alert("¡Configuración de la cuenta regresiva guardada con éxito!");
    } catch (err) {
      console.error("Error saving countdown configuration to Firestore:", err);
      alert("Error al guardar la configuración de la cuenta regresiva.");
    }
  };

  const updateContactField = (index: number, field: string, value: string) => {
    const updated = contacts.map((c, idx) => {
      if (idx === index) {
        return { ...c, [field]: value };
      }
      return c;
    });
    setContacts(updated);
  };

  return (
    <div className="space-y-8 text-zinc-100 max-w-5xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="bg-zinc-900/50 p-5 border border-zinc-800 rounded-sm">
        <h4 className="font-serif text-lg text-gold-400">Datos y Cuentas de la Boda</h4>
        <p className="font-sans text-[11px] text-zinc-400 uppercase tracking-wider">
          Configura tus datos reales para la Lluvia de Sobres y los Contactos de Asistencia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BANK ACCOUNT FORM */}
        <form onSubmit={handleSaveBank} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-sm space-y-4">
          <h5 className="font-serif text-base text-gold-400 font-semibold border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-gold-500" />
            <span>Cuenta Bancaria (Sobre Virtual)</span>
          </h5>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Nombre del Banco</label>
              <input
                type="text"
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Tipo de Cuenta</label>
              <input
                type="text"
                value={bankInfo.accountType}
                onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Número de Cuenta</label>
              <input
                type="text"
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Titular de la Cuenta</label>
              <input
                type="text"
                value={bankInfo.titular}
                onChange={(e) => setBankInfo({ ...bankInfo, titular: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 font-bold block">Documento de Identidad / C.C.</label>
              <input
                type="text"
                value={bankInfo.document}
                onChange={(e) => setBankInfo({ ...bankInfo, document: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold tracking-widest rounded-sm cursor-pointer transition-all"
            >
              Guardar Cuenta Bancaria
            </button>
          </div>
        </form>

        {/* CONTACTS FORM */}
        <form onSubmit={handleSaveContacts} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-sm space-y-6">
          <h5 className="font-serif text-base text-gold-400 font-semibold border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gold-500" />
            <span>Contactos de Asistencia (WhatsApp)</span>
          </h5>

          <div className="space-y-6">
            {contacts.map((contact, idx) => (
              <div key={idx} className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-sm space-y-3">
                <span className="text-[9px] bg-gold-500/10 text-gold-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Contacto #{idx + 1}: {contact.role}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Nombre Completo</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContactField(idx, "name", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Rol / Descripción</label>
                    <input
                      type="text"
                      value={contact.role}
                      onChange={(e) => updateContactField(idx, "role", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Teléfono (WhatsApp)</label>
                    <input
                      type="text"
                      placeholder="+57 300 123 4567"
                      value={contact.phone}
                      onChange={(e) => updateContactField(idx, "phone", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Mensaje predeterminado WA</label>
                    <input
                      type="text"
                      value={contact.message}
                      onChange={(e) => updateContactField(idx, "message", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold tracking-widest rounded-sm cursor-pointer transition-all"
            >
              Guardar Contactos de Asistencia
            </button>
          </div>
        </form>

      </div>

      {/* COUNTDOWN CONFIGURATION FORM */}
      <form onSubmit={handleSaveCountdown} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-sm space-y-4 max-w-2xl mx-auto mt-8">
        <h5 className="font-serif text-base text-gold-400 font-semibold border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold-500" />
          <span>Configuración de la Cuenta Regresiva</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-bold block">Título de la Sección</label>
            <input
              type="text"
              value={countdownTitle}
              onChange={(e) => setCountdownTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-bold block">Fecha y Hora del Evento</label>
            <input
              type="datetime-local"
              value={countdownDate}
              onChange={(e) => setCountdownDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] uppercase text-zinc-400 font-bold block">Fecha Formateada (Texto visible en portada)</label>
            <input
              type="text"
              placeholder="Ej: 1 de Agosto de 2026"
              value={countdownFormatted}
              onChange={(e) => setCountdownFormatted(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold tracking-widest rounded-sm cursor-pointer transition-all"
          >
            Guardar Fecha y Cuenta Regresiva
          </button>
        </div>
      </form>
    </div>
  );
}

function ItinerarioAdmin() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new item
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("Clock");

  // Form states for editing item
  const [editTime, setEditTime] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("Clock");

  // Load from Firestore
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const data = await getItineraryFromDb();
        setItinerary(data);
      } catch (err) {
        console.error("Error loading itinerary in admin:", err);
      }
    };
    fetchItinerary();
  }, []);

  // Save changes helper
  const saveItinerary = async (updatedList: ItineraryItem[]) => {
    try {
      await saveItineraryToDb(updatedList);
      setItinerary(updatedList);
      window.dispatchEvent(new Event("wedding_itinerary_updated"));
    } catch (err) {
      console.error("Error saving itinerary to Firestore:", err);
      alert("Error al guardar el itinerario en la base de datos.");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ItineraryItem = {
      id: "iti-custom-" + Date.now(),
      time: newTime,
      title: newTitle,
      description: newDescription,
      iconName: newIcon
    };
    const updated = [...itinerary, newItem];
    // Auto sort by time
    updated.sort((a, b) => a.time.localeCompare(b.time));
    await saveItinerary(updated);
    
    // Reset fields
    setNewTime("");
    setNewTitle("");
    setNewDescription("");
    setNewIcon("Clock");
    alert("¡Evento agregado al itinerario!");
  };

  const handleStartEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setEditTime(item.time);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditIcon(item.iconName);
  };

  const handleSaveEdit = async (id: string) => {
    const updated = itinerary.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          time: editTime,
          title: editTitle,
          description: editDescription,
          iconName: editIcon
        };
      }
      return item;
    });
    // Auto sort by time
    updated.sort((a, b) => a.time.localeCompare(b.time));
    await saveItinerary(updated);
    setEditingId(null);
    alert("¡Evento actualizado!");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento del itinerario?")) {
      const updated = itinerary.filter((item) => item.id !== id);
      await saveItinerary(updated);
      alert("¡Evento eliminado!");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...itinerary];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    await saveItinerary(updated);
  };

  const handleMoveDown = async (index: number) => {
    if (index === itinerary.length - 1) return;
    const updated = [...itinerary];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    await saveItinerary(updated);
  };

  const handleResetToDefault = async () => {
    if (confirm("¿Deseas restablecer el itinerario a su versión original? Esto borrará tus cambios personalizados.")) {
      await saveItinerary(ITINERARY_DATA);
      alert("¡Itinerario restablecido con éxito!");
    }
  };

  const handleSortByTime = async () => {
    const sorted = [...itinerary].sort((a, b) => a.time.localeCompare(b.time));
    await saveItinerary(sorted);
    alert("¡Itinerario ordenado cronológicamente por hora!");
  };

  const availableIcons = [
    { name: "Church", label: "Iglesia / Ceremonia" },
    { name: "GlassWater", label: "Cóctel / Copa" },
    { name: "Sparkles", label: "Entrada de Novios" },
    { name: "Utensils", label: "Banquete / Cena" },
    { name: "Music", label: "Baile / Vals" },
    { name: "PartyPopper", label: "Fiesta / DJ" },
    { name: "HeartHandshake", label: "Despedida / Saludos" },
    { name: "Clock", label: "Reloj / Horario" },
    { name: "Camera", label: "Fotos / Sesión" },
    { name: "Gift", label: "Regalos / Sobres" },
    { name: "MapPin", label: "Ubicación" },
    { name: "Heart", label: "Amor" },
    { name: "Star", label: "Estrella" },
    { name: "Smile", label: "Sonrisa / Bienvenida" }
  ];

  // Resolve icon component dynamically for preview
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      Church, GlassWater, Sparkles, Utensils, Music, PartyPopper, HeartHandshake, Clock, Camera, Gift, MapPin, Heart, Star, Smile
    };
    const IconComp = icons[iconName] || Clock;
    return <IconComp className="w-4 h-4 text-gold-500" />;
  };

  return (
    <div className="space-y-8 text-zinc-100 max-w-5xl mx-auto pb-12">
      <div className="bg-zinc-900/50 p-5 border border-zinc-800 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="font-serif text-lg text-gold-400">Editor del Itinerario de Boda</h4>
          <p className="font-sans text-[11px] text-zinc-400 uppercase tracking-wider">
            Personaliza el cronograma, horas, descripciones e íconos para cada evento del gran día
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSortByTime}
            className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white uppercase text-[9px] font-bold tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>Ordenar por Hora</span>
          </button>
          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-red-400 hover:text-red-300 uppercase text-[9px] font-bold tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Original</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD EVENT FORM */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddItem} className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm space-y-4 sticky top-6">
            <h5 className="font-serif text-sm text-gold-400 font-semibold border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-gold-500" />
              <span>Agregar Nuevo Evento</span>
            </h5>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-bold block">Hora (Ej: 19:30)</label>
                <input
                  type="text"
                  placeholder="19:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-bold block">Título del Evento</label>
                <input
                  type="text"
                  placeholder="Ej: Banquete de Gala"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-bold block">Descripción / Detalles</label>
                <textarea
                  placeholder="Una deliciosa cena preparada para compartir..."
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-bold block">Seleccionar Ícono</label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-sm text-zinc-100 focus:border-gold-500 outline-none"
                >
                  {availableIcons.map((ico) => (
                    <option key={ico.name} value={ico.name}>
                      {ico.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2 p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                  <span className="text-[9px] text-zinc-500 uppercase">Vista previa de ícono:</span>
                  {getIconComponent(newIcon)}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[10px] font-bold tracking-widest rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Evento</span>
            </button>
          </form>
        </div>

        {/* ITINERARY LIST EDITOR */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900/40 p-4 border border-zinc-800 rounded-sm">
            <span className="text-xs font-serif text-zinc-400 italic">Lista de Eventos Registrados</span>
          </div>

          <div className="space-y-3">
            {itinerary.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/20 border border-zinc-800 border-dashed rounded-sm text-zinc-500 italic">
                No hay eventos en el itinerario. Agrega uno usando el panel izquierdo.
              </div>
            ) : (
              itinerary.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-sm transition-all hover:border-zinc-700 relative"
                >
                  {editingId === item.id ? (
                    /* EDITING MODE */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-zinc-500 font-bold block">Hora</label>
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs rounded-sm text-zinc-100 outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[9px] uppercase text-zinc-500 font-bold block">Título del Evento</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs rounded-sm text-zinc-100 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-zinc-500 font-bold block">Descripción / Detalles</label>
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs rounded-sm text-zinc-100 outline-none resize-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-zinc-500 font-bold block">Ícono</label>
                          <select
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs rounded-sm text-zinc-100 outline-none"
                          >
                            {availableIcons.map((ico) => (
                              <option key={ico.name} value={ico.name}>
                                {ico.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white uppercase text-[9px] font-bold rounded-sm cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase text-[9px] font-bold rounded-sm cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* READ-ONLY CARD */
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0">
                          {getIconComponent(item.iconName)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-semibold text-gold-400">{item.time}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                            <h6 className="font-serif text-sm font-bold text-zinc-200">{item.title}</h6>
                          </div>
                          <p className="text-xs text-zinc-400 font-light max-w-md leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`p-1 border border-zinc-800/80 rounded-xs hover:border-zinc-700 text-zinc-400 hover:text-gold-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                            title="Subir"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === itinerary.length - 1}
                            className={`p-1 border border-zinc-800/80 rounded-xs hover:border-zinc-700 text-zinc-400 hover:text-gold-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                            title="Bajar"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 border border-zinc-800/80 hover:border-zinc-700 rounded-sm text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 border border-zinc-800/80 hover:border-red-900/60 rounded-sm text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
