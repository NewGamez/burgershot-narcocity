/* ===================================================== */
/* ===================== IMPORTS ======================= */
/* ===================================================== */

import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ===================================================== */
/* ===================== AUTH ========================== */
/* ===================================================== */

export function requireLogin() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

/* ===================================================== */
/* ===================== USER DATA ===================== */
/* ===================================================== */

export async function getCurrentUserData() {
  const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
  return snap.data();
}

export async function isAdmin() {
  const data = await getCurrentUserData();
  return data.role === "Management" || data.role === "Cheffe";
}

/* ===================================================== */
/* ===================== ACCOUNTS ====================== */
/* ===================================================== */

window.getAccounts = async function () {
  const snap = await getDocs(collection(db, "users"));
  const accounts = [];

  snap.forEach(d => {
    accounts.push({
      id: d.id,
      ...d.data()
    });
  });

  return accounts;
};

window.addUser = async function () {
  const name = document.getElementById("newName").value.trim();
  const role = document.getElementById("newRole").value;

  if (!name) return;

  await addDoc(collection(db, "users"), {
    name,
    role
  });

  location.reload();
};

window.removeUser = async function (id) {
  await deleteDoc(doc(db, "users", id));
  location.reload();
};

window.updateUserRole = async function (id, newRole) {
  await updateDoc(doc(db, "users", id), {
    role: newRole
  });
  location.reload();
};

/* ===================================================== */
/* ===================== ABMELDUNGEN =================== */
/* ===================================================== */

window.getAbmeldungen = async function () {
  const snap = await getDocs(collection(db, "abmeldungen"));
  const list = [];

  snap.forEach(d => {
    list.push({
      id: d.id,
      ...d.data()
    });
  });

  return list;
};

window.submitAbmeldung = async function (von, bis, grund) {

  if (!von || !bis || !grund) return;

  await addDoc(collection(db, "abmeldungen"), {
    userId: auth.currentUser.uid,
    von,
    bis,
    grund,
    status: "offen",
    createdAt: new Date()
  });
};

window.approveAbm = async function (id) {
  await updateDoc(doc(db, "abmeldungen", id), {
    status: "genehmigt"
  });
  location.reload();
};

window.rejectAbm = async function (id) {
  await updateDoc(doc(db, "abmeldungen", id), {
    status: "abgelehnt"
  });
  location.reload();
};

window.getOffeneAbmeldungenCount = async function () {
  const list = await window.getAbmeldungen();
  return list.filter(a => a.status === "offen").length;
};

/* ===================================================== */
/* ===================== MITARBEITER =================== */
/* ===================================================== */

window.getMitarbeiter = async function () {
  const snap = await getDocs(collection(db, "mitarbeiter"));
  const list = [];

  snap.forEach(d => {
    list.push({
      id: d.id,
      ...d.data()
    });
  });

  return list;
};

window.addMitarbeiter = async function (vor, nach, tel, geh) {

  if (!vor || !nach) return;

  await addDoc(collection(db, "mitarbeiter"), {
    vorname: vor,
    nachname: nach,
    telefon: tel,
    gehalt: geh
  });

  location.reload();
};

window.deleteMitarbeiter = async function (id) {
  await deleteDoc(doc(db, "mitarbeiter", id));
  location.reload();
};

/* ===================================================== */
/* ===================== MODAL UI ====================== */
/* ===================================================== */

window.openAbmModal = function () {
  document.getElementById("abmModal")?.classList.add("active");
};

window.closeAbmModal = function () {
  document.getElementById("abmModal")?.classList.remove("active");
};

/* ===================================================== */
/* ===================== INIT ========================== */
/* ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  if (!auth) return;

  onAuthStateChanged(auth, async user => {

    if (!user) return;

    // Welcome Text
    const userData = await getCurrentUserData();
    const welcome = document.getElementById("welcomeUser");

    if (welcome) {
      welcome.innerText = "Eingeloggt als: " + userData.name;
    }

    // Admin Panel anzeigen
    const adminPanel = document.getElementById("adminPanel");

    if (adminPanel) {
      if (userData.role === "Management" || userData.role === "Cheffe") {
        adminPanel.style.display = "flex";
      }
    }

    // Abmeldungen Counter
    const counter = document.getElementById("abmCounter");
    if (counter) {
      const count = await window.getOffeneAbmeldungenCount();
      counter.innerText = count + " offen";
    }

  });

});
