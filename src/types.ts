/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RSVP {
  id: string;
  fullName: string;
  attending: boolean;
  guestsCount: number;
  phone: string;
  foodAllergies?: string;
  songRequest?: string;
  message?: string;
  timestamp: string;
  code?: string;
  wantsReminder?: boolean;
}

export interface Table {
  id: string;
  name: string; // e.g., "Mesa Oro", "Mesa Olivo"
  number: number;
  description: string; // e.g., "Mesa de Honor", "Amigos de la Novia"
  guests: string[];
  capacity?: number; // Optional capacity, defaults to 10 if undefined
}

export interface GuestbookMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  heartCount: number;
}

export interface PhotoAsset {
  id: string;
  url: string;
  author: string;
  caption: string;
  timestamp: string;
  likes: number;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon name
}

export interface AdminGuest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  quota: number;
  tableName: string; // e.g., "Mesa 1 - Imperial de Honor"
  status: "Pendiente" | "Confirmado" | "No asiste";
  notes?: string;
  code?: string;
  wantsReminder?: boolean;
  companions?: string[];
}

