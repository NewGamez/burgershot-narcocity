/* ================= ACCOUNT & AUTH ==================== */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {};
const saveAccounts = accs => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const requireLogin = () => {
    if (!sessionStorage.getItem("loggedInUser")) window.location.href = "login.html";
};

const logout = () => {
    sessionStorage.clear();
    window.location.href = "login.html";
};

const isAdmin = () => {
    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    return accs[user] && (accs[user].role === "Management" || accs[user].role === "Cheffe");
};

/* PRÜFUNG BEIM LOGIN */
function checkFirstLogin() {
    const username = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    const userAcc = accs[username];

    if (userAcc && userAcc.isFirstLogin) {
        // Zeige das Modal, falls es der erste Login ist
        const modal = document.getElementById("firstLoginModal");
        if (modal) modal.style.display = "flex";
    }
}

/* PASSWORT ÄNDERN FUNKTION */
function changeFirstPassword() {
    const newPass = document.getElementById("newInitialPassword").value.trim();
    const confirmPass = document.getElementById("confirmInitialPassword").value.trim();
    const username = sessionStorage.getItem("loggedInUser");

    if (newPass.length < 4) {
        alert("Das Passwort muss mindestens 4 Zeichen lang sein!");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Die Passwörter stimmen nicht überein!");
        return;
    }

    if (newPass === "0000") {
        alert("Bitte wähle ein anderes Passwort als das Standard-Passwort!");
        return;
    }

    // Speichern im System
    const accs = getAccounts();
    accs[username].password = newPass;
    accs[username].isFirstLogin = false; // Flag auf false setzen
    saveAccounts(accs);

    alert("Passwort erfolgreich geändert! Du kannst das System nun nutzen.");
    document.getElementById("firstLoginModal").style.display = "none";
}

/* ANNOUNCEMENTS LOGIK */
const getAnnouncements = () => JSON.parse(localStorage.getItem("bs_announcements")) || [
    { id: 1, text: "/businessannounce BURGERSHOT – Wo Geschmack über den Dächern von Los Santos lebt\nSaftige Burger, kalte Drinks & die beste Aussicht der Stadt auf unserer Dachterrasse!\nOb Date, Feierabend oder einfach Hunger – wir servieren Good Vibes & Great Burgers!\nBurgerShot – Come hungry, leave happy!" }
];
const saveAnnouncements = (data) => localStorage.setItem("bs_announcements", JSON.stringify(data));

function addAnnouncement() {
    const text = document.getElementById("newAnnounceText").value.trim();
    if (!text) return alert("Bitte Text eingeben!");

    const list = getAnnouncements();
    list.push({ id: Date.now(), text: text });
    saveAnnouncements(list);
    
    document.getElementById("newAnnounceText").value = "";
    renderAnnounceDetails(); // Liste aktualisieren
}

function deleteAnnouncement(id) {
    if (!confirm("Diese Vorlage wirklich löschen?")) return;
    const list = getAnnouncements().filter(a => a.id !== id);
    saveAnnouncements(list);
    renderAnnounceDetails();
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Kopiert!");
    });
}

function renderAnnounceDetails() {
    const container = document.getElementById("announceGrid");
    if (!container) return;
    container.innerHTML = "";
    
    const list = getAnnouncements();
    const admin = isAdmin();

    list.forEach(a => {
        const div = document.createElement("div");
        div.className = "panel"; 
        
        // Wir escapen den Text für den Button-Klick sauber
        const cleanText = a.text.replace(/`/g, "\\`").replace(/\n/g, "\\n");

        div.innerHTML = `
            <p style="font-size: 0.85rem; white-space: pre-line; margin-bottom: 15px; opacity: 0.9; line-height: 1.5;">${a.text}</p>
            <div style="display: flex; gap: 8px; margin-top: auto;">
                <button onclick="copyText(\`${cleanText}\`)" style="flex: 2; font-size: 0.75rem;">Text kopieren</button>
                ${admin ? `<button onclick="deleteAnnouncement(${a.id})" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; flex: 1; font-size: 0.75rem;">Löschen</button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// Funktion zum Öffnen des Panels vom Dashboard aus
function openAnnouncePanel() {
    document.getElementById('announceDetailsModal').style.display = 'flex';
    renderAnnounceDetails();
}

/* ================= ABMELDUNGEN LOGIK ================= */
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function getOffeneAbmeldungenCount() {
    return getAbmeldungen().filter(a => a.status === "offen").length;
}

// Stats auf dem Dashboard aktualisieren
function updateDashboardStats() {
    const accCount = Object.keys(getAccounts()).length;
    const offeneCount = getOffeneAbmeldungenCount();

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneCount;
    if(document.getElementById("abmCounter")) document.getElementById("abmCounter").innerText = offeneCount + " offen";
}

function deleteAbm(id) {
    if (confirm("Möchtest du diese Abmeldung wirklich dauerhaft aus dem System löschen?")) {
        const list = getAbmeldungen();
        // Wir behalten alle außer die ID, die gelöscht werden soll
        const newList = list.filter(a => a.id !== id);
        saveAbmeldungen(newList);
        
        // UI aktualisieren falls wir auf der Management Seite sind
        if (typeof renderAbmeldungen === "function") {
            renderAbmeldungen();
        }
        // Stats auf dem Dashboard (Hero-Banner) aktualisieren
        if (typeof updateDashboardStats === "function") {
            updateDashboardStats();
        }
    }
}

/* ================= UI FUNKTIONEN ===================== */
function openAbmModal() { document.getElementById("abmModal").classList.add("active"); }
function closeAbmModal() { document.getElementById("abmModal").classList.remove("active"); }

function submitAbmeldungUI() {
    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if(!von || !bis || !grund) return alert("Bitte alle Felder ausfüllen!");

    const list = getAbmeldungen();
    list.push({ user, von, bis, grund, status: "offen", id: Date.now() });
    saveAbmeldungen(list);

    closeAbmModal();
    updateDashboardStats();
    renderMeineAbmeldungen();
    
    // Felder leeren
    document.getElementById("abmVon").value = "";
    document.getElementById("abmBis").value = "";
    document.getElementById("abmGrund").value = "";
}

// Zeigt dem User seine eigenen Anträge und deren Status
function renderMeineAbmeldungen() {
    const container = document.getElementById("meineAbmeldungenList");
    if(!container) return;

    container.innerHTML = "";
    const user = sessionStorage.getItem("loggedInUser");
    const meine = getAbmeldungen().filter(a => a.user === user);

    if(meine.length === 0) {
        container.innerHTML = "<p style='opacity:0.5;'>Du hast aktuell keine Abmeldungen eingereicht.</p>";
        return;
    }

    meine.reverse().forEach(a => {
        let color = "#faac15"; // offen
        if(a.status === "genehmigt") color = "#2ecc71";
        if(a.status === "abgelehnt") color = "#e74c3c";

        const div = document.createElement("div");
        div.style.cssText = "background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid " + color;
        div.innerHTML = `
            <div>
                <span style="font-weight:bold;">${a.von} - ${a.bis}</span>
                <br><small style="opacity:0.7;">Grund: ${a.grund}</small>
            </div>
            <span style="color:${color}; font-weight:bold; text-transform:uppercase; font-size:0.8rem;">${a.status}</span>
        `;
        container.appendChild(div);
    });
}

/* ================= ADMIN MANAGEMENT ================= */
// Diese Funktionen werden in der management.html genutzt
function approveAbm(id) {
    const list = getAbmeldungen();
    const index = list.findIndex(a => a.id === id);
    if(index !== -1) list[index].status = "genehmigt";
    saveAbmeldungen(list);
}

function rejectAbm(id) {
    const list = getAbmeldungen();
    const index = list.findIndex(a => a.id === id);
    if(index !== -1) list[index].status = "abgelehnt";
    saveAbmeldungen(list);
}
