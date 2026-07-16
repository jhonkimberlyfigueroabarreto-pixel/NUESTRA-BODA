/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Re-export guest functions from the main firestoreService to maintain a single source of truth
export { 
  getGuests, 
  addGuest, 
  updateGuest, 
  deleteGuestFromDb,
  syncTablesWithGuestsState
} from "./firestoreService";
