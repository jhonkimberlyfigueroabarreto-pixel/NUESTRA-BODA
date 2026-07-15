/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";

// Config from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCxGEgF32GJr36zd-bvRfLD1A8jwqUP55U",
  authDomain: "gen-lang-client-0652406277.firebaseapp.com",
  projectId: "gen-lang-client-0652406277",
  storageBucket: "gen-lang-client-0652406277.firebasestorage.app",
  messagingSenderId: "702501096723",
  appId: "1:702501096723:web:0afc94200abde68ddc1ee6",
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore using the custom firestoreDatabaseId from config
export const db = initializeFirestore(app, {}, "ai-studio-bodakimberlyyjho-e8d1b9fb-ccab-4520-a1d8-009da67bdd0c");

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase Connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    } else {
      console.log("Firebase Connection tested.");
    }
  }
}

testConnection();
