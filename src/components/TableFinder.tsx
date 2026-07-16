/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, UserCheck, Armchair, HelpCircle, Users } from "lucide-react";
import { TABLES_DATA } from "../data";
import { Table, AdminGuest } from "../types";
import { getTables, getGuests } from "../lib/firestoreService";

export default function TableFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tablesData, setTablesData] = useState<Table[]>([]);
  const [guestsData, setGuestsData] = useState<AdminGuest[]>([]);
  const [foundResults, setFoundResults] = useState<{ guest: string; table: Table }[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync with live tables and guests data in Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesList, guestsList] = await Promise.all([getTables(), getGuests()]);
        setTablesData(tablesList);
        setGuestsData(guestsList);
        
        // Re-sync selected table if it changed
        if (selectedTable) {
          const updatedSelected = tablesList.find(t => t.id === selectedTable.id);
          if (updatedSelected) {
            setSelectedTable(updatedSelected);
          }
        }
      } catch (err) {
        console.error("Error loading data inside finder:", err);
      }
    };

    fetchData();

    window.addEventListener("wedding_tables_updated", fetchData);
    window.addEventListener("wedding_admin_guests_updated", fetchData);
    return () => {
      window.removeEventListener("wedding_tables_updated", fetchData);
      window.removeEventListener("wedding_admin_guests_updated", fetchData);
    };
  }, [selectedTable]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    if (!searchQuery.trim()) {
      setFoundResults([]);
      setSelectedTable(null);
      return;
    }

    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const results: { guest: string; table: Table }[] = [];

    tablesData.forEach((table) => {
      table.guests.forEach((guest) => {
        const guestNormal = guest.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (guestNormal.includes(query)) {
          results.push({ guest, table });
        }

        // Search in companions of this guest
        const guestObj = guestsData.find(g => `${g.firstName} ${g.lastName}` === guest);
        if (guestObj?.companions) {
          guestObj.companions.forEach((comp) => {
            const compNormal = comp.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (compNormal.includes(query)) {
              results.push({ guest: `${comp} (Acompañante de ${guest})`, table });
            }
          });
        }
      });
    });

    setFoundResults(results);
    
    // Auto-select the first matching table to display the gorgeous visual chart
    if (results.length > 0) {
      setSelectedTable(results[0].table);
    } else {
      setSelectedTable(null);
    }
  };

  // Select table directly from dropdown or browse all
  const handleSelectTableDirectly = (tableId: string) => {
    const table = tablesData.find((t) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setFoundResults([]);
      setHasSearched(false);
      setSearchQuery("");
    }
  };

  return (
    <section id="encuentra-tu-mesa" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="font-serif text-xs tracking-[0.3em] uppercase text-gold-600 mb-3">
            ORGANIZACIÓN E INVITADOS
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-zinc-900 mb-4">
            Encuentra tu Mesa
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="h-[1px] w-12 bg-gold-400" />
            <Armchair className="w-4 h-4 text-gold-500" />
            <div className="h-[1px] w-12 bg-gold-400" />
          </div>
          <p className="font-sans text-sm text-zinc-500 mt-4 max-w-md mx-auto">
            Ingresa tu nombre para ver en qué mesa estás ubicado(a) y quiénes te acompañarán en la celebración.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* SEARCH COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gold-50/70 p-6 md:p-8 border border-gold-200 rounded-sm shadow-md relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-500" />
              
              <h3 className="font-serif text-xl text-zinc-900 font-medium mb-4 flex items-center space-x-2">
                <Search className="w-5 h-5 text-gold-600" />
                <span>Buscador de Asientos</span>
              </h3>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escribe tu nombre o apellido..."
                    className="w-full bg-white border border-gold-300 focus:border-gold-500 outline-none pl-4 pr-12 py-3.5 font-sans text-sm rounded-sm transition-all focus:shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold-600 hover:text-gold-800 transition-colors cursor-pointer"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 font-sans tracking-wide">
                  💡 Prueba buscando nombres de ejemplo como: <span className="font-semibold text-gold-600">“Alejandra”</span>, <span className="font-semibold text-gold-600">“Carlos”</span>, o <span className="font-semibold text-gold-600">“Martha”</span>.
                </p>
              </form>

              {/* Seating search results */}
              {hasSearched && (
                <div className="mt-6 space-y-4 pt-6 border-t border-gold-200">
                  {foundResults.length > 0 ? (
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-2">
                        Coincidencias encontradas:
                      </span>
                      <div className="space-y-2">
                        {foundResults.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTable(res.table)}
                            className={`w-full flex items-center justify-between p-3 border rounded-sm text-left transition-all text-xs sm:text-sm cursor-pointer ${
                              selectedTable?.id === res.table.id
                                ? "bg-zinc-950 text-white border-zinc-900 shadow-md"
                                : "bg-white text-zinc-800 border-gold-200 hover:border-gold-300"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <UserCheck className={`w-4 h-4 ${selectedTable?.id === res.table.id ? "text-gold-400" : "text-emerald-600"}`} />
                              <span className="font-medium">{res.guest}</span>
                            </div>
                            <span className={`font-serif italic text-xs ${selectedTable?.id === res.table.id ? "text-gold-300" : "text-gold-600"}`}>
                              Mesa {res.table.number}: {res.table.name.split(" - ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm text-center">
                      <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="font-sans text-xs text-zinc-500">
                        No encontramos resultados exactos con ese nombre. Por favor intenta con otro o consulta la lista de mesas abajo.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DIRECT DROPDOWN SELECTION */}
            <div className="bg-zinc-50 p-6 border border-zinc-200 rounded-sm">
              <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-2">
                O explora todas las mesas directamente:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {tablesData.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTableDirectly(t.id)}
                    className={`p-2.5 border rounded-sm text-xs text-center tracking-wider uppercase transition-all font-sans cursor-pointer ${
                      selectedTable?.id === t.id
                        ? "bg-gold-500 text-white border-gold-500 font-bold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-gold-300"
                    }`}
                  >
                    Mesa {t.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VISUAL TABLE GRAPHIC COLUMN */}
          <div className="lg:col-span-7">
            {selectedTable ? (
              <div className="bg-gold-50/20 border border-gold-300 rounded-sm p-6 md:p-10 shadow-lg text-center relative flex flex-col items-center">
                <div className="absolute inset-1.5 border border-gold-400/15 pointer-events-none" />
                
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-600 font-bold mb-1">
                  DETALLE DE ASIGNACIÓN
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-zinc-900 mb-2">
                  Mesa {selectedTable.number}: {selectedTable.name}
                </h3>
                <p className="font-sans text-xs text-zinc-500 italic mb-8 max-w-sm">
                  {selectedTable.description}
                </p>

                {/* Elegant Circular Table Layout Visual */}
                {(() => {
                  const seatedList: { name: string; isCompanion: boolean; principalName: string }[] = [];
                  selectedTable.guests.forEach((gName) => {
                    seatedList.push({
                      name: gName,
                      isCompanion: false,
                      principalName: gName
                    });
                    const guestObj = guestsData.find(g => `${g.firstName} ${g.lastName}` === gName);
                    if (guestObj?.companions) {
                      guestObj.companions.forEach((comp) => {
                        seatedList.push({
                          name: comp,
                          isCompanion: true,
                          principalName: gName
                        });
                      });
                    }
                  });

                  return (
                    <>
                      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gold-50/50 rounded-full border border-gold-300/40 flex items-center justify-center shadow-inner mb-8">
                        
                        {/* Central Core Table Plate */}
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border border-gold-400 shadow-md flex flex-col justify-center items-center z-10 p-2 relative">
                          <div className="absolute inset-1 border border-gold-400/20 rounded-full pointer-events-none" />
                          <span className="font-serif text-xs tracking-widest text-gold-600 uppercase font-bold">MESA</span>
                          <span className="font-serif text-3xl md:text-4xl text-zinc-800 font-light leading-none mt-1">
                            {selectedTable.number}
                          </span>
                          <span className="font-sans text-[8px] text-zinc-400 tracking-wider uppercase mt-1">
                            {seatedList.length} Puestos
                          </span>
                        </div>

                        {/* Outer chairs mapped circularly */}
                        {seatedList.map((person, idx) => {
                          const totalChairs = seatedList.length;
                          const angle = (idx * 360) / totalChairs;
                          // Circle positioning math
                          const radius = window.innerWidth < 768 ? 100 : 130; // responsive diameter
                          const x = Math.round(radius * Math.cos((angle * Math.PI) / 180));
                          const y = Math.round(radius * Math.sin((angle * Math.PI) / 180));

                          // Highlight matched search guest or companion
                          const isMatched = searchQuery.trim() !== "" && 
                            person.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
                              searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            );

                          return (
                            <div
                              key={idx}
                              className="absolute flex flex-col items-center justify-center transition-all duration-500"
                              style={{
                                transform: `translate(${x}px, ${y}px)`,
                              }}
                            >
                              {/* Chair Node dot */}
                              <div
                                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center text-[7px] font-bold shadow-sm transition-all duration-500 ${
                                  isMatched
                                    ? "bg-gold-500 text-white border-gold-500 ring-4 ring-gold-200 scale-125 z-20 animate-pulse"
                                    : person.isCompanion
                                    ? "bg-zinc-100 text-zinc-500 border-zinc-300"
                                    : "bg-white text-zinc-600 border-gold-300"
                                }`}
                                title={person.name + (person.isCompanion ? " (Acompañante)" : "")}
                              >
                                {idx + 1}
                              </div>
                              {/* Compact guest name floating close to the dot */}
                              <span
                                className={`absolute text-[8px] md:text-[10px] tracking-wide font-sans mt-8 bg-white px-1.5 py-0.5 rounded-sm border shadow-sm whitespace-nowrap max-w-[90px] truncate ${
                                  isMatched
                                    ? "text-gold-700 border-gold-400 font-bold z-20 scale-105"
                                    : "text-zinc-600 border-zinc-100"
                                }`}
                              >
                                {person.name.split(" ")[0]} {person.name.split(" ")[1] ? person.name.split(" ")[1].charAt(0) + "." : ""}
                                {person.isCompanion && " *"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Table mates names list panel */}
                      <div className="w-full text-left pt-6 border-t border-gold-200">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center space-x-2 mb-3">
                          <Users className="w-3.5 h-3.5 text-gold-600" />
                          <span>Lista completa de esta mesa:</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                          {selectedTable.guests.map((gName, idx) => {
                            const guestObj = guestsData.find(g => `${g.firstName} ${g.lastName}` === gName);
                            const isPrincipalMatched = searchQuery.trim() !== "" && 
                              gName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
                                searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                              );

                            return (
                              <div key={idx} className="space-y-1">
                                {/* Principal Guest */}
                                <div
                                  className={`flex items-center space-x-2 text-sm p-1.5 px-3 rounded-sm ${
                                    isPrincipalMatched ? "bg-gold-100/50 border border-gold-300/30 font-bold text-gold-800" : "text-zinc-800"
                                  }`}
                                >
                                  <span className="text-zinc-400 text-xs font-mono">{idx + 1}.</span>
                                  <span className="font-medium text-zinc-900">{gName}</span>
                                </div>

                                {/* Companions */}
                                {guestObj?.companions && guestObj.companions.length > 0 && (
                                  <div className="pl-8 space-y-1">
                                    {guestObj.companions.map((comp, cIdx) => {
                                      const isCompMatched = searchQuery.trim() !== "" && 
                                        comp.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
                                          searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                        );

                                      return (
                                        <div
                                          key={cIdx}
                                          className={`flex items-center space-x-2 text-xs p-1 px-2.5 rounded-sm ${
                                            isCompMatched ? "bg-gold-50 border border-gold-200/50 font-semibold text-gold-700" : "text-zinc-500"
                                          }`}
                                        >
                                          <span className="text-gold-500 text-xs">•</span>
                                          <span>{comp}</span>
                                          <span className="text-[10px] text-zinc-400 font-serif italic">(Acompañante)</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full border border-dashed border-gold-300 bg-gold-50/10 rounded-sm flex flex-col justify-center items-center text-center p-12 min-h-[350px] relative">
                <div className="absolute inset-2 border border-gold-400/5 pointer-events-none" />
                <Armchair className="w-16 h-16 text-gold-300/60 stroke-[1.25] mb-4" />
                <h4 className="font-serif text-lg text-zinc-700 mb-2">Selecciona o busca tu mesa</h4>
                <p className="font-sans text-xs text-zinc-400 max-w-sm">
                  Utiliza el buscador con tu nombre o haz clic en cualquiera de las mesas del panel de la izquierda para desplegar la visualización en 3D del plano de asientos.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
