import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxGEgF32GJr36zd-bvRfLD1A8jwqUP55U",
  authDomain: "gen-lang-client-0652406277.firebaseapp.com",
  projectId: "gen-lang-client-0652406277",
  storageBucket: "gen-lang-client-0652406277.firebasestorage.app",
  messagingSenderId: "702501096723",
  appId: "1:702501096723:web:0afc94200abde68ddc1ee6",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
}, "ai-studio-bodakimberlyyjho-e8d1b9fb-ccab-4520-a1d8-009da67bdd0c");

async function main() {
  console.log("Testing Firestore connection to ai-studio-bodakimberlyyjho-e8d1b9fb-ccab-4520-a1d8-009da67bdd0c...");
  try {
    const colRef = collection(db, "guests");
    const snapshot = await getDocs(colRef);
    console.log("SUCCESS! Found documents count:", snapshot.size);
    snapshot.forEach(doc => {
      console.log("- Document ID:", doc.id, "Data:", JSON.stringify(doc.data()).substring(0, 100));
    });
  } catch (err) {
    console.error("FAILED with error:", err);
  }
}

main();
