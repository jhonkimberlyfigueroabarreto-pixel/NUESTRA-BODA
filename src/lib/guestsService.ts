/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { AdminGuest } from "../types";

const GUESTS_COLLECTION = "guests";

// Pre-assigned seeds
const SEED_GUESTS: Omit<AdminGuest, "code">[] = [
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

function generateUniqueGuestCode(existingGuests: { code?: string }[]): string {
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

/**
 * Fetches all guests from Firestore. If Firestore is empty, seeds the collection.
 */
export async function getGuests(): Promise<AdminGuest[]> {
  try {
    const colRef = collection(db, GUESTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log("Firestore guests collection is empty. Seeding with default data...");
      const seeded: AdminGuest[] = [];
      const batch = writeBatch(db);
      
      SEED_GUESTS.forEach((g) => {
        const code = generateUniqueGuestCode(seeded);
        const fullGuest: AdminGuest = {
          ...g,
          code,
          wantsReminder: false
        };
        seeded.push(fullGuest);
        
        const docRef = doc(db, GUESTS_COLLECTION, fullGuest.id);
        batch.set(docRef, fullGuest);
      });
      
      await batch.commit();
      console.log("Seeding complete.");
      return seeded;
    }
    
    const guestsList: AdminGuest[] = [];
    snapshot.forEach((docSnap) => {
      guestsList.push(docSnap.data() as AdminGuest);
    });
    
    return guestsList;
  } catch (err) {
    console.error("Error fetching guests from Firestore:", err);
    throw err;
  }
}

/**
 * Adds a new guest to Firestore with a unique code.
 */
export async function addGuest(newGuestData: Omit<AdminGuest, "id" | "code">): Promise<AdminGuest> {
  try {
    const existing = await getGuests();
    const id = "g-" + Date.now();
    const code = generateUniqueGuestCode(existing);
    
    const newGuest: AdminGuest = {
      ...newGuestData,
      id,
      code,
      wantsReminder: newGuestData.wantsReminder || false
    };
    
    const docRef = doc(db, GUESTS_COLLECTION, id);
    await setDoc(docRef, newGuest);
    return newGuest;
  } catch (err) {
    console.error("Error adding guest to Firestore:", err);
    throw err;
  }
}

/**
 * Updates an existing guest in Firestore.
 */
export async function updateGuest(guest: AdminGuest): Promise<void> {
  try {
    const docRef = doc(db, GUESTS_COLLECTION, guest.id);
    const updatePayload: Partial<AdminGuest> = {
      firstName: guest.firstName,
      lastName: guest.lastName,
      phone: guest.phone || "",
      email: guest.email || "",
      quota: guest.quota,
      tableName: guest.tableName || "",
      status: guest.status,
      code: guest.code,
      wantsReminder: guest.wantsReminder || false
    };
    
    if (guest.notes !== undefined) {
      updatePayload.notes = guest.notes;
    }
    
    await updateDoc(docRef, updatePayload as any);
  } catch (err) {
    console.error("Error updating guest in Firestore:", err);
    throw err;
  }
}

/**
 * Deletes a guest from Firestore.
 */
export async function deleteGuestFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, GUESTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting guest from Firestore:", err);
    throw err;
  }
}
