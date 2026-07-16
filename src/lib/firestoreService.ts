/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { db } from "./firebase";
import { AdminGuest, Table, RSVP, GuestbookMessage, PhotoAsset, ItineraryItem } from "../types";
import { GalleryPhoto, INITIAL_GALLERY_PHOTOS } from "../components/Gallery";
import { TIMELINE_MILESTONES } from "../components/OurStory";
import { TABLES_DATA, INITIAL_PHOTOS, INITIAL_MESSAGES, ITINERARY_DATA, GIFT_REGISTRY_CHANNELS } from "../data";

// Collection Names
const GUESTS_COLLECTION = "guests";
const TABLES_COLLECTION = "tables";
const RSVPS_COLLECTION = "rsvps";
const CONFIG_COLLECTION = "config";
const GALLERY_COLLECTION = "gallery_photos";
const GUEST_PHOTOS_COLLECTION = "guest_photos";
const GUESTBOOK_COLLECTION = "guestbook";

// Helper to generate unique guest code
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

// Default Admin Guests to seed
const INITIAL_ADMIN_GUESTS: Omit<AdminGuest, "code">[] = [
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

// ==========================================
// 1. GUESTS COLLECTION (Invitados)
// ==========================================
export async function getGuests(): Promise<AdminGuest[]> {
  try {
    const colRef = collection(db, GUESTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const seeded: AdminGuest[] = [];
      const batch = writeBatch(db);
      INITIAL_ADMIN_GUESTS.forEach((g) => {
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
      return seeded;
    }
    const guestsList: AdminGuest[] = [];
    snapshot.forEach((docSnap) => {
      guestsList.push(docSnap.data() as AdminGuest);
    });
    return guestsList;
  } catch (err) {
    console.error("Error fetching guests:", err);
    throw err;
  }
}

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
    console.error("Error adding guest:", err);
    throw err;
  }
}

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
    console.error("Error updating guest:", err);
    throw err;
  }
}

export async function deleteGuestFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, GUESTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting guest:", err);
    throw err;
  }
}

// ==========================================
// 2. TABLES COLLECTION (Mesas)
// ==========================================
export async function getTables(): Promise<Table[]> {
  try {
    const colRef = collection(db, TABLES_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      TABLES_DATA.forEach((t) => {
        const docRef = doc(db, TABLES_COLLECTION, t.id);
        batch.set(docRef, t);
      });
      await batch.commit();
      return TABLES_DATA;
    }
    const tablesList: Table[] = [];
    snapshot.forEach((docSnap) => {
      tablesList.push(docSnap.data() as Table);
    });
    // Sort tables by number
    return tablesList.sort((a, b) => a.number - b.number);
  } catch (err) {
    console.error("Error fetching tables:", err);
    throw err;
  }
}

export async function saveTables(tables: Table[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // First, let's fetch current table documents to delete any that are no longer present
    const colRef = collection(db, TABLES_COLLECTION);
    const snapshot = await getDocs(colRef);
    snapshot.forEach((docSnap) => {
      if (!tables.some(t => t.id === docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    tables.forEach((t) => {
      const docRef = doc(db, TABLES_COLLECTION, t.id);
      batch.set(docRef, t);
    });
    await batch.commit();
  } catch (err) {
    console.error("Error saving tables:", err);
    throw err;
  }
}

export async function syncTablesWithGuestsState(allGuests: AdminGuest[]): Promise<void> {
  try {
    const currentTables = await getTables();
    
    // For each table, rebuild its guests array based on the guests whose tableName matches this table
    const updatedTables = currentTables.map(table => {
      const tableStr = `Mesa ${table.number} - ${table.name}`;
      const matchingGuests = allGuests.filter(g => g.tableName === tableStr);
      const guestNames = matchingGuests.map(g => `${g.firstName} ${g.lastName}`);
      return {
        ...table,
        guests: guestNames
      };
    });

    await saveTables(updatedTables);
  } catch (err) {
    console.error("Error synchronizing tables with guests:", err);
    throw err;
  }
}

// ==========================================
// 3. RSVPS COLLECTION (Confirmaciones)
// ==========================================
export async function getRSVPs(): Promise<RSVP[]> {
  try {
    const colRef = collection(db, RSVPS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const rsvpsList: RSVP[] = [];
    snapshot.forEach((docSnap) => {
      rsvpsList.push(docSnap.data() as RSVP);
    });
    return rsvpsList;
  } catch (err) {
    console.error("Error fetching RSVPs:", err);
    throw err;
  }
}

export async function addRSVP(rsvp: RSVP): Promise<void> {
  try {
    const docRef = doc(db, RSVPS_COLLECTION, rsvp.id);
    await setDoc(docRef, rsvp);
  } catch (err) {
    console.error("Error adding RSVP:", err);
    throw err;
  }
}

export async function deleteRSVP(id: string): Promise<void> {
  try {
    const docRef = doc(db, RSVPS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting RSVP:", err);
    throw err;
  }
}

// ==========================================
// 4. CONFIG COLLECTION (Configuración de la boda)
// ==========================================
export interface WeddingSettings {
  countdownTitle: string;
  countdownDate: string;
  countdownDateFormatted: string;
  customCoverImage: string;
  bankInfo: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    titular: string;
    document: string;
    giftEnvelopeNote: string;
  };
  contacts: {
    name: string;
    role: string;
    phone: string;
    message: string;
  }[];
}

const DEFAULT_SETTINGS: WeddingSettings = {
  countdownTitle: "La Cuenta Regresiva",
  countdownDate: "2026-08-01T19:00:00",
  countdownDateFormatted: "1 de Agosto de 2026",
  customCoverImage: "",
  bankInfo: GIFT_REGISTRY_CHANNELS.bank,
  contacts: [
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
  ]
};

export async function getWeddingSettings(): Promise<WeddingSettings> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "wedding_settings");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return docSnap.data() as WeddingSettings;
  } catch (err) {
    console.error("Error fetching wedding settings:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveWeddingSettings(settings: Partial<WeddingSettings>): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "wedding_settings");
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error("Error saving wedding settings:", err);
    throw err;
  }
}

export async function getOurStory(): Promise<any[]> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "our_story");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const data = { milestones: TIMELINE_MILESTONES };
      await setDoc(docRef, data);
      return TIMELINE_MILESTONES;
    }
    return docSnap.data().milestones || [];
  } catch (err) {
    console.error("Error fetching our story:", err);
    return TIMELINE_MILESTONES;
  }
}

export async function saveOurStory(milestones: any[]): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "our_story");
    await setDoc(docRef, { milestones });
  } catch (err) {
    console.error("Error saving our story:", err);
    throw err;
  }
}

export async function getItinerary(): Promise<ItineraryItem[]> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "itinerary");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const data = { items: ITINERARY_DATA };
      await setDoc(docRef, data);
      return ITINERARY_DATA;
    }
    return docSnap.data().items || [];
  } catch (err) {
    console.error("Error fetching itinerary:", err);
    return ITINERARY_DATA;
  }
}

export async function saveItinerary(items: ItineraryItem[]): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, "itinerary");
    await setDoc(docRef, { items });
  } catch (err) {
    console.error("Error saving itinerary:", err);
    throw err;
  }
}

// ==========================================
// 5. GALLERY_PHOTOS COLLECTION (Fotografías de Galería)
// ==========================================
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const colRef = collection(db, GALLERY_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      INITIAL_GALLERY_PHOTOS.forEach((photo) => {
        const docRef = doc(db, GALLERY_COLLECTION, photo.id);
        batch.set(docRef, photo);
      });
      await batch.commit();
      return INITIAL_GALLERY_PHOTOS;
    }
    const photosList: GalleryPhoto[] = [];
    snapshot.forEach((docSnap) => {
      photosList.push(docSnap.data() as GalleryPhoto);
    });
    return photosList;
  } catch (err) {
    console.error("Error fetching gallery photos:", err);
    return INITIAL_GALLERY_PHOTOS;
  }
}

export async function saveGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  try {
    const docRef = doc(db, GALLERY_COLLECTION, photo.id);
    await setDoc(docRef, photo);
  } catch (err) {
    console.error("Error saving gallery photo:", err);
    throw err;
  }
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  try {
    const docRef = doc(db, GALLERY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting gallery photo:", err);
    throw err;
  }
}

// ==========================================
// 6. GUEST_PHOTOS COLLECTION (Fotografías Compartidas por Invitados)
// ==========================================
export async function getGuestPhotos(): Promise<PhotoAsset[]> {
  try {
    const colRef = collection(db, GUEST_PHOTOS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      INITIAL_PHOTOS.forEach((photo) => {
        const docRef = doc(db, GUEST_PHOTOS_COLLECTION, photo.id);
        batch.set(docRef, photo);
      });
      await batch.commit();
      return INITIAL_PHOTOS;
    }
    const photosList: PhotoAsset[] = [];
    snapshot.forEach((docSnap) => {
      photosList.push(docSnap.data() as PhotoAsset);
    });
    return photosList;
  } catch (err) {
    console.error("Error fetching guest photos:", err);
    return INITIAL_PHOTOS;
  }
}

export async function saveGuestPhoto(photo: PhotoAsset): Promise<void> {
  try {
    const docRef = doc(db, GUEST_PHOTOS_COLLECTION, photo.id);
    await setDoc(docRef, photo);
  } catch (err) {
    console.error("Error saving guest photo:", err);
    throw err;
  }
}

export async function deleteGuestPhoto(id: string): Promise<void> {
  try {
    const docRef = doc(db, GUEST_PHOTOS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting guest photo:", err);
    throw err;
  }
}

// ==========================================
// 7. GUESTBOOK COLLECTION (Libro de firmas)
// ==========================================
export async function getGuestbookMessages(): Promise<GuestbookMessage[]> {
  try {
    const colRef = collection(db, GUESTBOOK_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      INITIAL_MESSAGES.forEach((msg) => {
        const docRef = doc(db, GUESTBOOK_COLLECTION, msg.id);
        batch.set(docRef, msg);
      });
      await batch.commit();
      return INITIAL_MESSAGES;
    }
    const msgsList: GuestbookMessage[] = [];
    snapshot.forEach((docSnap) => {
      msgsList.push(docSnap.data() as GuestbookMessage);
    });
    return msgsList;
  } catch (err) {
    console.error("Error fetching guestbook messages:", err);
    return INITIAL_MESSAGES;
  }
}

export async function saveGuestbookMessage(msg: GuestbookMessage): Promise<void> {
  try {
    const docRef = doc(db, GUESTBOOK_COLLECTION, msg.id);
    await setDoc(docRef, msg);
  } catch (err) {
    console.error("Error saving guestbook message:", err);
    throw err;
  }
}

export async function deleteGuestbookMessage(id: string): Promise<void> {
  try {
    const docRef = doc(db, GUESTBOOK_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting guestbook message:", err);
    throw err;
  }
}
