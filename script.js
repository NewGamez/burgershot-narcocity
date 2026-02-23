import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ================= AUTH ================= */

window.logout = async function() {
  await signOut(auth);
  window.location.href = "login.html";
};

export function requireLogin() {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "login.html";
  });
}

/* ================= USER ROLE ================= */

export async function getCurrentUserData() {
  const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
  return snap.data();
}

/* ================= ABMELDUNGEN ================= */

window.submitAbmeldungUI = async function() {

  const von = document.getElementById("abmVon").value;
  const bis = document.getElementById("abmBis").value;
  const grund = document.getElementById("abmGrund").value;

  if (!von || !bis || !grund) return alert("Alles ausfüllen.");

  await addDoc(collection(db, "abmeldungen"), {
    userId: auth.currentUser.uid,
    von,
    bis,
    grund,
    status: "offen",
    createdAt: new Date()
  });

  document.getElementById("abmModal").classList.remove("active");
};

/* Echtzeit Anzeige */
export function listenAbmeldungen(callback) {
  const q = collection(db, "abmeldungen");
  onSnapshot(q, snap => {
    const data = [];
    snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}

/* ================= MITARBEITER ================= */

window.addMitarbeiterUI = async function(vor, nach, tel, gehalt) {

  await addDoc(collection(db, "mitarbeiter"), {
    vorname: vor,
    nachname: nach,
    telefon: tel,
    gehalt: gehalt
  });
};

export function listenMitarbeiter(callback) {
  onSnapshot(collection(db, "mitarbeiter"), snap => {
    const data = [];
    snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}
