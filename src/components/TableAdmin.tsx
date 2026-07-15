/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Printer, 
  Users, 
  Armchair, 
  Search, 
  UserPlus, 
  ArrowRightLeft, 
  UserMinus,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  X,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Table, AdminGuest } from "../types";
import { TABLES_DATA } from "../data";
import { getGuests, addGuest, updateGuest, getTables, saveTables } from "../lib/firestoreService";

export default function TableAdmin() {
  // Tables and Guests states
  const [tables, setTables] = useState<Table[]>([]);
  const [guestPool, setGuestPool] = useState<string[]>([]); // Master list of guest names
  const [unassignedGuests, setUnassignedGuests] = useState<string[]>([]);
  const [searchGuestQuery, setSearchGuestQuery] = useState("");
  const [guestFilter, setGuestFilter] = useState<"sin-mesa" | "todos">("sin-mesa");

  // Drag and Drop active states
  const [draggedGuest, setDraggedGuest] = useState<{ name: string; sourceTableId: string | "bank" } | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

  // Modal / Form States
  const [isTableFormOpen, setIsTableFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState<number>(10);
  const [tableDescription, setTableDescription] = useState("");
  const [tableError, setTableError] = useState("");

  // Quick Action State (for mobile or click-based assignment)
  const [selectedGuestForMove, setSelectedGuestForMove] = useState<{ name: string; sourceTableId: string | "bank" } | null>(null);

  // Print Preview Modal state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // =========================================================================
  // INITIALIZATION & LIFECYCLE
  // =========================================================================
  useEffect(() => {
    // Load Tables and Guests from Firestore
    const loadTablesAndGuests = async () => {
      try {
        const loadedTables = await getTables();
        setTables(loadedTables);

        const list = await getGuests();
        const masterGuestsList = list.map(g => `${g.firstName} ${g.lastName}`);
        
        // Also extract guest names from the tables data to make sure no one is missed
        const tableGuests = loadedTables.flatMap(t => t.guests);
        
        // Combine and deduplicate
        const combinedGuests = Array.from(new Set([...masterGuestsList, ...tableGuests])).filter(Boolean);
        setGuestPool(combinedGuests);

        // Calculate unassigned guests
        const assigned = new Set(loadedTables.flatMap(t => t.guests));
        const unassigned = combinedGuests.filter(g => !assigned.has(g));
        setUnassignedGuests(unassigned);
      } catch (e) {
        console.error("Error loading tables and guests in TableAdmin:", e);
      }
    };

    loadTablesAndGuests();

    // Sync when guests are updated in other views
    const handleGuestsUpdated = () => {
      loadTablesAndGuests();
    };

    window.addEventListener("wedding_admin_guests_updated", handleGuestsUpdated);
    return () => {
      window.removeEventListener("wedding_admin_guests_updated", handleGuestsUpdated);
    };
  }, []);

  // Synchronize helper to save tables and update unassigned lists
  const saveTablesToStorage = async (updatedTables: Table[]) => {
    setTables(updatedTables);
    try {
      await saveTables(updatedTables);
      window.dispatchEvent(new Event("wedding_tables_updated"));

      // Re-calculate unassigned guests
      const assigned = new Set(updatedTables.flatMap(t => t.guests));
      const unassigned = guestPool.filter(g => !assigned.has(g));
      setUnassignedGuests(unassigned);

      // Synchronize back to guests in Firestore to update table names if they exist
      const parsedGuests = await getGuests();
      parsedGuests.forEach(guest => {
        const fullName = `${guest.firstName} ${guest.lastName}`;
        // Find which table this guest is in now
        const matchingTable = updatedTables.find(t => t.guests.includes(fullName));
        const newTableName = matchingTable ? `Mesa ${matchingTable.number} - ${matchingTable.name}` : "Sin mesa";
        
        if (guest.tableName !== newTableName) {
          const updatedG = { ...guest, tableName: newTableName };
          updateGuest(updatedG).catch(err => console.error("Error updating guest table in Firestore:", err));
        }
      });
    } catch (e) {
      console.error("Error saving tables to Firestore:", e);
    }
  };

  // Add guest to master pool helper
  const handleAddNewGuestToPool = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (guestPool.includes(trimmed)) {
      alert("Este invitado ya existe en el sistema.");
      return;
    }

    const updatedPool = [...guestPool, trimmed];
    setGuestPool(updatedPool);
    setUnassignedGuests([...unassignedGuests, trimmed]);

    // Also create a record in Firestore
    try {
      const parts = trimmed.split(" ");
      const firstName = parts[0] || trimmed;
      const lastName = parts.slice(1).join(" ") || "Invitado";
      
      const newGuestData = {
        firstName,
        lastName,
        phone: "",
        email: "",
        quota: 1,
        tableName: "Sin mesa",
        status: "Pendiente" as const,
        wantsReminder: false
      };

      await addGuest(newGuestData);
      window.dispatchEvent(new Event("wedding_admin_guests_updated"));
    } catch (err) {
      console.error("Error creating guest from TableAdmin:", err);
    }
  };

  // =========================================================================
  // SEATING / MOVEMENT LOGIC (DRAG & DROP)
  // =========================================================================
  const handleDragStart = (e: React.DragEvent, guestName: string, sourceTableId: string | "bank") => {
    setDraggedGuest({ name: guestName, sourceTableId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", guestName);
  };

  const handleDragEnd = () => {
    setDraggedGuest(null);
    setHoveredTableId(null);
  };

  const handleDragOver = (e: React.DragEvent, tableId: string) => {
    e.preventDefault();
    if (hoveredTableId !== tableId) {
      setHoveredTableId(tableId);
    }
  };

  const handleDropOnTable = (e: React.DragEvent, targetTableId: string) => {
    e.preventDefault();
    setHoveredTableId(null);

    if (!draggedGuest) return;
    moveGuest(draggedGuest.name, draggedGuest.sourceTableId, targetTableId);
  };

  const handleDropOnBank = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedGuest || draggedGuest.sourceTableId === "bank") return;

    // Remove from source table and return to bank
    const sourceTable = tables.find(t => t.id === draggedGuest.sourceTableId);
    if (!sourceTable) return;

    const updatedTables = tables.map(t => {
      if (t.id === draggedGuest.sourceTableId) {
        return {
          ...t,
          guests: t.guests.filter(g => g !== draggedGuest.name)
        };
      }
      return t;
    });

    saveTablesToStorage(updatedTables);
  };

  // Central movement function (handles both Drag & Drop AND Mobile Click menus)
  const moveGuest = (guestName: string, sourceId: string | "bank", targetId: string | "bank") => {
    if (sourceId === targetId) return;

    // Source is Table, Target is Bank (Remove guest from table)
    if (targetId === "bank") {
      const updatedTables = tables.map(t => {
        if (t.id === sourceId) {
          return { ...t, guests: t.guests.filter(g => g !== guestName) };
        }
        return t;
      });
      saveTablesToStorage(updatedTables);
      return;
    }

    // Target is a table
    const targetTable = tables.find(t => t.id === targetId);
    if (!targetTable) return;

    // Highlight over-capacity alert if needed, but allow dropping
    const currentGuestsCount = targetTable.guests.length;
    const capacity = targetTable.capacity || 10;
    if (currentGuestsCount >= capacity) {
      const confirmMove = window.confirm(
        `¡Atención! La "${targetTable.name}" ya ha alcanzado su capacidad máxima (${capacity} personas).\n¿Deseas acomodar a este invitado de todas formas (quedará con sobrecupo)?`
      );
      if (!confirmMove) return;
    }

    let updatedTables = [...tables];

    // 1. Remove from source if source was another table
    if (sourceId !== "bank") {
      updatedTables = updatedTables.map(t => {
        if (t.id === sourceId) {
          return { ...t, guests: t.guests.filter(g => g !== guestName) };
        }
        return t;
      });
    }

    // 2. Add to target table
    updatedTables = updatedTables.map(t => {
      if (t.id === targetId) {
        // Prevent duplicate entries
        if (t.guests.includes(guestName)) return t;
        return { ...t, guests: [...t.guests, guestName] };
      }
      return t;
    });

    saveTablesToStorage(updatedTables);
  };

  // Remove guest from table directly via action button
  const handleRemoveGuestDirectly = (guestName: string, tableId: string) => {
    moveGuest(guestName, tableId, "bank");
  };

  // =========================================================================
  // TABLE CRUD OPERATIONS
  // =========================================================================
  const handleOpenAddTable = () => {
    setEditingTable(null);
    // Auto-calculate next table number
    const maxNum = tables.reduce((max, t) => t.number > max ? t.number : max, 0);
    setTableNumber(maxNum + 1);
    setTableName("");
    setTableCapacity(10);
    setTableDescription("");
    setTableError("");
    setIsTableFormOpen(true);
  };

  const handleOpenEditTable = (table: Table) => {
    setEditingTable(table);
    setTableNumber(table.number);
    setTableName(table.name);
    setTableCapacity(table.capacity || 10);
    setTableDescription(table.description);
    setTableError("");
    setIsTableFormOpen(true);
  };

  const handleTableFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTableError("");

    if (!tableName.trim()) {
      setTableError("El nombre de la mesa es requerido.");
      return;
    }

    if (tableCapacity < 1) {
      setTableError("La capacidad mínima debe ser de al menos 1 puesto.");
      return;
    }

    if (editingTable) {
      // Update
      const updated = tables.map(t => {
        if (t.id === editingTable.id) {
          return {
            ...t,
            number: tableNumber,
            name: tableName.trim(),
            capacity: tableCapacity,
            description: tableDescription.trim()
          };
        }
        return t;
      });
      // Sort tables by number
      updated.sort((a, b) => a.number - b.number);
      saveTablesToStorage(updated);
    } else {
      // Create
      const newTable: Table = {
        id: "t-" + Date.now(),
        number: tableNumber,
        name: tableName.trim(),
        capacity: tableCapacity,
        description: tableDescription.trim(),
        guests: []
      };
      const updated = [...tables, newTable].sort((a, b) => a.number - b.number);
      saveTablesToStorage(updated);
    }

    setIsTableFormOpen(false);
  };

  const handleDeleteTable = (tableId: string, name: string, assignedGuests: string[]) => {
    const message = assignedGuests.length > 0 
      ? `La mesa "${name}" tiene ${assignedGuests.length} invitados asignados. Al eliminarla, estos invitados volverán a la lista de "Invitados sin mesa".\n\n¿Estás seguro de que deseas eliminar esta mesa?`
      : `¿Estás seguro de que deseas eliminar la "${name}"?`;

    if (window.confirm(message)) {
      const filtered = tables.filter(t => t.id !== tableId);
      saveTablesToStorage(filtered);
    }
  };

  // =========================================================================
  // PRINT PREVIEW TRIGGER
  // =========================================================================
  const triggerPrint = () => {
    setIsPrintPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Filtered guest bank list based on search and selected tab
  const filteredBankGuests = guestPool.filter(guest => {
    const matchesSearch = guest.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
      searchGuestQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    if (!matchesSearch) return false;

    if (guestFilter === "sin-mesa") {
      return unassignedGuests.includes(guest);
    }
    return true;
  }).sort();

  return (
    <div className="space-y-8">
      
      {/* CONTROL ACTIONS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-5 rounded-sm border border-zinc-800">
        <div>
          <h3 className="font-serif text-lg text-zinc-100 font-light flex items-center gap-2">
            <Armchair className="w-5 h-5 text-gold-500" />
            <span>Organizador y Distribución de Mesas</span>
          </h3>
          <p className="font-sans text-[11px] text-zinc-400 mt-0.5">
            Arrastra los invitados a las mesas, define su aforo y prepara planos de impresión oficiales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleOpenAddTable}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 text-xs font-bold tracking-widest uppercase rounded-sm cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Mesa</span>
          </button>
          
          <button
            onClick={() => setIsPrintPreviewOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-gold-500/30 text-gold-400 hover:text-gold-300 text-xs font-bold tracking-widest uppercase rounded-sm cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Plano Imprimible</span>
          </button>
        </div>
      </div>

      {/* THREE COLUMN GRID LAYOUT (LEFT: GUEST BANK, RIGHT: TABLES GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            GUEST BANK SIDEBAR (4 COLS)
            ========================================================================= */}
        <div className="xl:col-span-4 bg-zinc-900 border border-zinc-800 rounded-sm p-5 space-y-4 shadow-xl sticky top-24">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="font-serif text-sm text-gold-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Banco de Invitados</span>
            </span>
            <span className="text-[10px] bg-zinc-950 px-2 py-0.5 border border-zinc-800 text-zinc-400 font-mono rounded-sm">
              {unassignedGuests.length} Sin Mesa
            </span>
          </div>

          {/* Quick guest adding form */}
          <div className="flex gap-1.5">
            <input
              type="text"
              id="new-guest-name-input"
              placeholder="Agregar nuevo invitado..."
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none px-3 py-2 text-xs rounded-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.currentTarget;
                  handleAddNewGuestToPool(input.value);
                  input.value = "";
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById("new-guest-name-input") as HTMLInputElement;
                if (input) {
                  handleAddNewGuestToPool(input.value);
                  input.value = "";
                }
              }}
              className="bg-zinc-950 hover:bg-zinc-850 text-gold-400 border border-zinc-800 hover:border-gold-500/30 px-3 py-2 text-xs font-bold rounded-sm cursor-pointer"
              title="Añadir invitado al sistema"
            >
              +
            </button>
          </div>

          {/* Search guest bar */}
          <div className="relative">
            <input
              type="text"
              value={searchGuestQuery}
              onChange={(e) => setSearchGuestQuery(e.target.value)}
              placeholder="Filtrar por nombre..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none pl-9 pr-3 py-2 text-xs rounded-sm transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            {searchGuestQuery && (
              <button onClick={() => setSearchGuestQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Filter options tabs */}
          <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-sm gap-1">
            <button
              onClick={() => setGuestFilter("sin-mesa")}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-sans font-bold rounded-xs transition-all cursor-pointer ${
                guestFilter === "sin-mesa"
                  ? "bg-gold-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sin Mesa ({unassignedGuests.length})
            </button>
            <button
              onClick={() => setGuestFilter("todos")}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-sans font-bold rounded-xs transition-all cursor-pointer ${
                guestFilter === "todos"
                  ? "bg-gold-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todos ({guestPool.length})
            </button>
          </div>

          {/* DRAGGABLE LIST CONTAINER */}
          <div 
            className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin bg-zinc-950/40 p-2.5 border border-zinc-800/60 rounded-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnBank}
          >
            {filteredBankGuests.length > 0 ? (
              filteredBankGuests.map((guest, idx) => {
                const isAssigned = !unassignedGuests.includes(guest);
                const currentTable = isAssigned ? tables.find(t => t.guests.includes(guest)) : null;

                return (
                  <div
                    key={idx}
                    draggable={!isAssigned} // Only let them drag if not assigned, or they can drag from table back
                    onDragStart={(e) => handleDragStart(e, guest, "bank")}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-2.5 border rounded-sm text-xs transition-all ${
                      isAssigned
                        ? "bg-zinc-900/40 border-zinc-850 text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-900 border-zinc-800 hover:border-gold-500/40 text-zinc-200 cursor-grab active:cursor-grabbing hover:bg-zinc-850/60 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${isAssigned ? "bg-zinc-600" : "bg-gold-500"}`} />
                      <span className="font-medium truncate" title={guest}>{guest}</span>
                    </div>

                    {isAssigned ? (
                      <span className="text-[9px] font-serif italic text-gold-400/70 bg-zinc-950 px-1.5 py-0.5 border border-zinc-850 shrink-0">
                        Mesa {currentTable?.number || "?"}
                      </span>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        {/* Desktop Drag Handle sign */}
                        <span className="hidden md:inline-block text-[9px] text-zinc-600 border border-zinc-800 px-1 py-0.5 font-mono select-none uppercase tracking-widest rounded-xs bg-zinc-950">
                          Arrastrar
                        </span>
                        
                        {/* Mobile Click Assign Button */}
                        <button
                          onClick={() => setSelectedGuestForMove({ name: guest, sourceTableId: "bank" })}
                          className="md:hidden p-1 bg-zinc-950 text-gold-400 border border-zinc-800 hover:border-gold-500 rounded-xs"
                          title="Asignar a mesa"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 italic text-center py-8 text-xs">
                No hay invitados disponibles con este filtro.
              </p>
            )}
          </div>

          {/* DROP ZONE BACK TO BANK ZONE */}
          <div 
            className={`p-4 border border-dashed text-center rounded-sm transition-all text-xs ${
              draggedGuest && draggedGuest.sourceTableId !== "bank"
                ? "border-rose-500/50 bg-rose-950/20 text-rose-400 animate-pulse"
                : "border-zinc-800 text-zinc-500"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnBank}
          >
            <UserMinus className="w-5 h-5 mx-auto mb-1.5 text-zinc-500" />
            <p className="font-sans text-[10px] uppercase tracking-widest">
              Suelta un invitado aquí para desasignarlo de su mesa
            </p>
          </div>
        </div>

        {/* =========================================================================
            TABLES ORGANISED GRID LAYOUT (8 COLS)
            ========================================================================= */}
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {tables.map((table) => {
              const currentCount = table.guests.length;
              const capacity = table.capacity || 10;
              const available = capacity - currentCount;
              const isOverCapacity = currentCount > capacity;
              const percent = Math.min((currentCount / capacity) * 100, 100);

              return (
                <div
                  key={table.id}
                  onDragOver={(e) => handleDragOver(e, table.id)}
                  onDrop={(e) => handleDropOnTable(e, table.id)}
                  className={`bg-zinc-900 border transition-all rounded-sm shadow-lg overflow-hidden flex flex-col h-[400px] ${
                    hoveredTableId === table.id
                      ? "border-gold-500 ring-2 ring-gold-500/20 scale-[1.01] bg-zinc-850"
                      : isOverCapacity
                      ? "border-rose-500/40 hover:border-rose-500/60"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Table Header bar */}
                  <div className="bg-zinc-950 p-4 border-b border-zinc-850 flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-xs text-gold-400 font-bold uppercase tracking-wider shrink-0">
                          Mesa {table.number}
                        </span>
                        {isOverCapacity && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-400 uppercase bg-rose-950/40 border border-rose-900 px-1 rounded-xs animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Sobrecupo
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-md text-zinc-100 font-light truncate" title={table.name}>
                        {table.name}
                      </h4>
                      {table.description && (
                        <p className="font-sans text-[10px] text-zinc-500 truncate mt-0.5 italic">
                          {table.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTable(table)}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-gold-500/30 text-gold-400 transition-all rounded-xs cursor-pointer"
                        title="Editar Mesa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id, `Mesa ${table.number} - ${table.name}`, table.guests)}
                        className="p-1.5 bg-zinc-900 hover:bg-rose-950/40 border border-zinc-850 hover:border-rose-900 text-zinc-500 hover:text-rose-400 transition-all rounded-xs cursor-pointer"
                        title="Eliminar Mesa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Seat Occupancy Meter */}
                  <div className="px-4 py-2.5 bg-zinc-950/30 border-b border-zinc-850/60 flex flex-col gap-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Cupos ocupados:</span>
                      <span className={`font-mono font-bold ${isOverCapacity ? "text-rose-400" : currentCount === capacity ? "text-emerald-400" : "text-zinc-200"}`}>
                        {currentCount} / {capacity} asientos
                      </span>
                    </div>

                    {/* Progress Bar with dot segments */}
                    <div className="w-full bg-zinc-950 h-2 border border-zinc-800 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          isOverCapacity 
                            ? "bg-rose-500" 
                            : currentCount === capacity 
                            ? "bg-emerald-500" 
                            : "bg-gold-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Disponibles: <strong className={available > 0 ? "text-gold-400 font-mono" : "text-zinc-600"}>{available < 0 ? 0 : available} puestos</strong></span>
                      {available < 0 && <span className="text-rose-500 font-bold">Sobrecupo: {Math.abs(available)}</span>}
                    </div>
                  </div>

                  {/* Guests assigned in this table (scrollable list) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1.5 bg-zinc-950/10">
                    {table.guests.length > 0 ? (
                      table.guests.map((guestName, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStart(e, guestName, table.id)}
                          onDragEnd={handleDragEnd}
                          className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 hover:border-gold-500/20 text-xs text-zinc-300 rounded-sm cursor-grab active:cursor-grabbing hover:bg-zinc-900 transition-colors"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-mono text-[10px] text-zinc-600 shrink-0">{(idx + 1).toString().padStart(2, "0")}</span>
                            <span className="truncate font-serif italic text-zinc-100">{guestName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Move Dropdown menu or triggers */}
                            <button
                              onClick={() => setSelectedGuestForMove({ name: guestName, sourceTableId: table.id })}
                              className="p-1 bg-zinc-900 text-zinc-500 hover:text-gold-400 border border-zinc-850 hover:border-gold-500 rounded-xs cursor-pointer transition-all"
                              title="Reubicar invitado"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </button>
                            
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveGuestDirectly(guestName, table.id)}
                              className="p-1 bg-zinc-900 text-zinc-500 hover:text-rose-400 border border-zinc-850 hover:border-rose-900/40 rounded-xs cursor-pointer transition-all"
                              title="Remover de esta mesa"
                            >
                              <UserMinus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full border border-dashed border-zinc-800 rounded-sm flex flex-col justify-center items-center text-center p-6 text-zinc-500">
                        <Armchair className="w-8 h-8 text-zinc-700 stroke-[1.25] mb-2" />
                        <p className="font-sans text-[11px] leading-normal max-w-[150px]">
                          Sin invitados asignados. Arrastra nombres aquí.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* =========================================================================
          HIGH-FIDELITY ADD / EDIT TABLE MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isTableFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-gold-500/30 p-6 sm:p-8 rounded-sm shadow-2xl relative max-w-md w-full text-left text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsTableFormOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl text-zinc-100 font-light mb-1 border-b border-zinc-800 pb-3 flex items-center space-x-2">
                <Armchair className="w-5 h-5 text-gold-500" />
                <span>{editingTable ? "Editar Detalles de Mesa" : "Crear Nueva Mesa"}</span>
              </h3>

              <form onSubmit={handleTableFormSubmit} className="space-y-4 pt-3 text-xs sm:text-sm">
                
                {/* Table Number & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Número de Mesa *
                    </label>
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                      Capacidad (Asientos) *
                    </label>
                    <input
                      type="number"
                      value={tableCapacity}
                      onChange={(e) => setTableCapacity(parseInt(e.target.value) || 10)}
                      min={1}
                      max={40}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Table Name */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                    Nombre o Distintivo de la Mesa *
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Ej. Familia Figueroa, Mesa Olivo, Mesa de Honor"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm font-serif italic"
                    required
                  />
                </div>

                {/* Table Description */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block">
                    Descripción / Subtítulo
                  </label>
                  <textarea
                    value={tableDescription}
                    onChange={(e) => setTableDescription(e.target.value)}
                    placeholder="Ej. Amigos de infancia de la Novia, Familia directa del novio"
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold-500 text-zinc-100 outline-none p-2.5 rounded-sm resize-none"
                  />
                </div>

                {tableError && (
                  <p className="text-xs text-rose-500 font-sans">
                    {tableError}
                  </p>
                )}

                {/* Footer buttons */}
                <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTableFormOpen(false)}
                    className="px-5 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gold-500 hover:bg-gold-600 text-zinc-950 uppercase tracking-widest text-xs font-bold cursor-pointer rounded-sm"
                  >
                    Guardar Mesa
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          REALLOCATION MENU OVERLAY (FOR ACCESSIBILITY/MOBILE INTERACTION)
          ========================================================================= */}
      <AnimatePresence>
        {selectedGuestForMove && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-gold-500/30 p-6 rounded-sm shadow-2xl relative max-w-md w-full text-left text-white"
            >
              <button
                onClick={() => setSelectedGuestForMove(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="font-sans text-[10px] uppercase tracking-widest text-gold-400 font-bold block mb-1">
                REUBICACIÓN RÁPIDA DE INVITADO
              </span>
              <h3 className="font-serif text-lg font-light text-zinc-100 mb-4 pb-2 border-b border-zinc-800">
                ¿Dónde deseas sentar a <strong className="text-white italic">&ldquo;{selectedGuestForMove.name}&rdquo;</strong>?
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {/* Option to return to guest bank if assigned */}
                {selectedGuestForMove.sourceTableId !== "bank" && (
                  <button
                    onClick={() => {
                      moveGuest(selectedGuestForMove.name, selectedGuestForMove.sourceTableId, "bank");
                      setSelectedGuestForMove(null);
                    }}
                    className="w-full text-left p-3 bg-zinc-950 hover:bg-rose-950/20 border border-zinc-850 hover:border-rose-900 text-rose-400 text-xs font-medium rounded-sm transition-all"
                  >
                    Desasignar y regresar al Banco de Invitados
                  </button>
                )}

                {/* Option for each table */}
                {tables.map((t) => {
                  const isCurrentTable = t.id === selectedGuestForMove.sourceTableId;
                  const count = t.guests.length;
                  const cap = t.capacity || 10;
                  const isFull = count >= cap;

                  return (
                    <button
                      key={t.id}
                      disabled={isCurrentTable}
                      onClick={() => {
                        moveGuest(selectedGuestForMove.name, selectedGuestForMove.sourceTableId, t.id);
                        setSelectedGuestForMove(null);
                      }}
                      className={`w-full text-left p-3 border rounded-sm transition-all flex justify-between items-center text-xs ${
                        isCurrentTable
                          ? "bg-zinc-900/40 border-zinc-850 text-zinc-500 cursor-not-allowed"
                          : "bg-zinc-950 hover:bg-zinc-850 border-zinc-800 hover:border-gold-500/40 text-zinc-200"
                      }`}
                    >
                      <div>
                        <strong className="text-gold-400">Mesa {t.number}:</strong> {t.name}
                      </div>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm ${isFull ? "bg-rose-950 text-rose-400 border border-rose-900/30" : "bg-zinc-900 text-zinc-400"}`}>
                        {count}/{cap} puestos
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setSelectedGuestForMove(null)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded-sm cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          PRINT PREVIEW OVERLAY & OPTIMIZED DOCUMENT VIEW
          ========================================================================= */}
      <AnimatePresence>
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white text-zinc-950 p-6 md:p-8 rounded-sm shadow-2xl relative max-w-4xl w-full max-h-[90vh] overflow-y-auto text-left flex flex-col"
            >
              {/* Header control buttons */}
              <div className="flex flex-wrap justify-between items-center border-b border-zinc-200 pb-4 mb-4 gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Vista Previa de Impresión
                  </h3>
                  <p className="font-sans text-xs text-zinc-500">
                    Así se verá el plano de mesas físico impreso en papel.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={triggerPrint}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer rounded-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Plano</span>
                  </button>
                  <button
                    onClick={() => setIsPrintPreviewOpen(false)}
                    className="px-4 py-2 border border-zinc-300 hover:border-zinc-400 text-zinc-600 text-xs font-bold uppercase tracking-widest cursor-pointer rounded-xs"
                  >
                    Cerrar Vista Previa
                  </button>
                </div>
              </div>

              {/* PRINTABLE PREVIEW CONTENT CONTAINER */}
              <div className="flex-1 bg-white p-6 border border-zinc-200 rounded-sm overflow-y-auto max-h-[55vh]">
                <div className="text-center mb-8 border-b-2 border-zinc-900 pb-6">
                  <span className="font-serif text-xs tracking-[0.4em] text-zinc-500 uppercase block mb-1">
                    BODA DE KIMBERLY & JHON
                  </span>
                  <h1 className="font-serif text-2xl font-normal text-zinc-900 uppercase tracking-widest">
                    Plano de Distribución de Mesas
                  </h1>
                  <p className="font-sans text-[10px] text-zinc-400 tracking-wider uppercase mt-1">
                    Gala Oficial • 1 de Agosto de 2026 • Casona del Prado
                  </p>
                </div>

                {/* Print layout 2-column or 3-column list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {tables.map((t) => (
                    <div key={t.id} className="border-t border-zinc-900 pt-3 flex flex-col gap-1 text-zinc-900">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif text-sm font-bold uppercase tracking-wide">
                            Mesa {t.number}: {t.name}
                          </h4>
                          {t.description && (
                            <p className="font-sans text-[9px] text-zinc-500 italic">
                              {t.description}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-[10px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 font-bold rounded-xs shrink-0 text-zinc-800">
                          Puestos: {t.guests.length} / {t.capacity}
                        </span>
                      </div>

                      <ol className="list-decimal pl-5 font-serif italic text-xs space-y-1 mt-2 text-zinc-800">
                        {t.guests.length > 0 ? (
                          t.guests.map((g, idx) => (
                            <li key={idx} className="pl-1">
                              <span className="font-sans not-italic text-xs text-zinc-900 font-medium pl-1">
                                {g}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="list-none text-zinc-400 text-xs italic pl-0">
                            Mesa vacía / Sin invitados asignados.
                          </li>
                        )}
                      </ol>
                    </div>
                  ))}
                </div>

                {/* Print Footer Summary */}
                <div className="border-t-2 border-zinc-900 mt-10 pt-4 flex justify-between text-[10px] text-zinc-500 font-sans font-bold uppercase tracking-wider">
                  <span>Total Mesas: {tables.length}</span>
                  <span>Total Invitados Sentados: {tables.reduce((sum, t) => sum + t.guests.length, 0)}</span>
                  <span>Aforo Permitido: {tables.reduce((sum, t) => sum + (t.capacity || 10), 0)} Sillas</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          HIDDEN ELEMENT IN THE MAIN DOM FULLY OPTIMIZED FOR THE BROWSER PRINT ENGINE
          This element is invisible on screen but becomes visible and replaces everything 
          when Ctrl+P or window.print() is triggered.
          ========================================================================= */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-[9999] overflow-visible">
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <span className="font-serif text-xs tracking-[0.4em] text-zinc-600 uppercase block mb-1">
            BODA DE KIMBERLY & JHON
          </span>
          <h1 className="font-serif text-2xl font-normal text-black uppercase tracking-widest">
            Plano de Distribución de Mesas
          </h1>
          <p className="font-sans text-[10px] text-zinc-500 tracking-wider uppercase mt-1">
            Gala Oficial • 1 de Agosto de 2026 • Casona del Prado
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {tables.map((t) => (
            <div key={t.id} className="border-t border-black pt-3 flex flex-col gap-1 break-inside-avoid">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wide">
                    Mesa {t.number}: {t.name}
                  </h4>
                  {t.description && (
                    <p className="font-sans text-[9px] text-zinc-600 italic">
                      {t.description}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[10px] bg-zinc-100 border border-zinc-400 px-2 py-0.5 font-bold rounded-xs shrink-0">
                  Puestos: {t.guests.length} / {t.capacity}
                </span>
              </div>

              <ol className="list-decimal pl-5 font-serif italic text-xs space-y-1 mt-2">
                {t.guests.length > 0 ? (
                  t.guests.map((g, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="font-sans not-italic text-xs text-black font-medium pl-1 text-left">
                        {g}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-none text-zinc-400 text-xs italic pl-0">
                    Mesa vacía / Sin invitados asignados.
                  </li>
                )}
              </ol>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black mt-12 pt-4 flex justify-between text-[10px] text-zinc-600 font-sans font-bold uppercase tracking-wider break-inside-avoid">
          <span>Total Mesas: {tables.length}</span>
          <span>Total Invitados Sentados: {tables.reduce((sum, t) => sum + t.guests.length, 0)}</span>
          <span>Aforo Total: {tables.reduce((sum, t) => sum + (t.capacity || 10), 0)} Sillas</span>
        </div>
      </div>

    </div>
  );
}
