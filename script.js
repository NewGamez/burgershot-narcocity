
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

function updateDashboardStats() {
    const accs = getAccounts();
    const abm = getAbmeldungen();
    
    const accCount = Object.keys(accs).length;
    const offeneAbm = abm.filter(a => a.status === "offen").length;

    if(document.getElementById("accCount")) 
        document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) 
        document.getElementById("heroAbmCount").innerText = offeneAbm;
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

function showTab(tabId) {
    // Alle Tabs verstecken
    document.querySelectorAll('.mgmt-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Gewünschten Tab zeigen
    document.getElementById(tabId).style.display = 'block';

    // Button-Styling anpassen
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Findet den Button, der die Funktion aufgerufen hat und markiert ihn
    event.currentTarget.classList.add('active');
}

function addUser() {
    const name = document.getElementById("newName").value.trim();
    const role = document.getElementById("newRole").value;
    const accs = getAccounts();
    
    if (!name) return alert("Bitte einen Namen eingeben!");
    if (accs[name]) return alert("Dieser Account existiert bereits!");

    // Account erstellen
    accs[name] = { 
        password: "0000", 
        role: role, 
        isFirstLogin: true 
    };
    
    saveAccounts(accs);
    
    // UI Update: Falls wir auf der Management-Seite sind, Liste neu zeichnen
    if (typeof renderUsers === "function") {
        renderUsers();
    }

    // Felder leeren
    document.getElementById("newName").value = "";
    alert("Mitarbeiter " + name + " wurde angelegt. Standard-PW: 0000");
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

/* Account aus dem System entfernen */
function removeUser(name) {
    if (name === sessionStorage.getItem("loggedInUser")) {
        return alert("Du kannst dich nicht selbst löschen!");
    }
    
    if (!confirm(`Möchtest du den Account von ${name} wirklich löschen?`)) return;

    const accs = getAccounts();
    delete accs[name]; // Entfernt den Key aus dem Objekt
    saveAccounts(accs);
    
    renderUsers(); // Liste neu zeichnen
    if (typeof updateDashboardStats === "function") updateDashboardStats();
}

/* Ränge anpassen */
function uprank(name) {
    const accs = getAccounts();
    const roles = ["Mitarbeiter", "Management", "Cheffe"];
    let currentIdx = roles.indexOf(accs[name].role);
    
    if (currentIdx < roles.length - 1) {
        accs[name].role = roles[currentIdx + 1];
        saveAccounts(accs);
        renderUsers();
    }
}

function derank(name) {
    const accs = getAccounts();
    const roles = ["Mitarbeiter", "Management", "Cheffe"];
    let currentIdx = roles.indexOf(accs[name].role);
    
    if (currentIdx > 0) {
        accs[name].role = roles[currentIdx - 1];
        saveAccounts(accs);
        renderUsers();
    }
}

/* ================= BEWERBER LOGIK ==================== */
const getBewerber = () => JSON.parse(localStorage.getItem("bs_bewerber")) || [];
const saveBewerber = data => localStorage.setItem("bs_bewerber", JSON.stringify(data));

function submitBewerbung() {
    const name = document.getElementById("bewName").value.trim();
    const geb = document.getElementById("bewGeb").value;
    const tel = document.getElementById("bewTel").value.trim();
    const zivi = document.getElementById("bewZivi").value; // "Ja" oder Fraktionsname
    const visum = document.getElementById("bewVisum").value;
    const look = document.getElementById("bewLook").value;

    if(!name || !geb || !tel || !visum) return alert("Bitte die wichtigsten Felder ausfüllen!");

    const bewerber = getBewerber();
    bewerber.push({
        id: Date.now(),
        name, geb, tel, zivi, visum, look,
        status: "offen",
        erstelltAm: new Date().toLocaleDateString('de-DE')
    });

    saveBewerber(bewerber);
    alert("Bewerber erfolgreich eingetragen!");
    
    // Felder leeren
    ["bewName", "bewGeb", "bewTel", "bewZivi", "bewVisum", "bewLook"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

function updateBewerberStatus(id, neuerStatus) {
    let bewerber = getBewerber();
    const index = bewerber.findIndex(b => b.id === id);
    if(index !== -1) {
        bewerber[index].status = neuerStatus;
        saveBewerber(bewerber);
        renderBewerberManagement(); // Liste aktualisieren
    }
}

function deleteBewerber(id) {
    if(!confirm("Bewerber endgültig löschen?")) return;
    const bewerber = getBewerber().filter(b => b.id !== id);
    saveBewerber(bewerber);
    renderBewerberManagement();
}

function renderBewerberManagement() {
    const container = document.getElementById("bewerberManagementList");
    if(!container) return;
    
    const bewerber = getBewerber();
    container.innerHTML = "";

    if(bewerber.length === 0) {
        container.innerHTML = "<p style='padding:20px; opacity:0.5; text-align:center;'>Keine Bewerber in der Datenbank.</p>";
        return;
    }

    bewerber.reverse().forEach(b => {
        const div = document.createElement("div");
        div.className = "grid-row"; 
        
        // Wir setzen das Grid auf 4 Spalten für die Management-Ansicht
        div.style.gridTemplateColumns = "1.5fr 2.5fr 1fr 1fr"; 
        
        const statusColor = b.status === 'angenommen' ? '#2ecc71' : (b.status === 'abgelehnt' ? '#e74c3c' : '#faac15');

        div.innerHTML = `
            <div>
                <strong style="color:var(--primary); font-size:1.1rem;">${b.name}</strong><br>
                <small style="opacity:0.6;">Eingetragen: ${b.erstelltAm}</small>
            </div>
            <div style="font-size: 0.85rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                <span>📅 <b>Geb:</b> ${b.geb}</span>
                <span>📞 <b>Tel:</b> ${b.tel}</span>
                <span>🆔 <b>Visum:</b> ${b.visum}</span>
                <span>👕 <b>Look:</b> ${b.look}/10</span>
                <span style="grid-column: span 2;">🏢 <b>Status/Fraktion:</b> ${b.zivi}</span>
            </div>
            <div style="text-align:center;">
                <span class="status-badge" style="border:1px solid ${statusColor}; color:${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem;">
                    ${b.status.toUpperCase()}
                </span>
            </div>
            <div class="action-btns" style="display:flex; gap:5px; justify-content: flex-end;">
                <button onclick="updateBewerberStatus(${b.id}, 'angenommen')" style="background:#2ecc71; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">✔</button>
                <button onclick="updateBewerberStatus(${b.id}, 'abgelehnt')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">✖</button>
                <button onclick="deleteBewerber(${b.id})" style="background:rgba(255,255,255,0.1); color:#ff4d4d; border:1px solid #ff4d4d; padding:5px 10px; border-radius:5px; cursor:pointer;">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function showTab(tabId, btn) {
    // Alle Tabs verstecken
    document.querySelectorAll(".mgmt-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".mgmt-tab").forEach(t => t.style.display = "none");

    // Gewählten Tab zeigen
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add("active");
    activeTab.style.display = "block";

    // Buttons stylen
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Daten laden je nach Tab
    if(tabId === 'tab-accounts') renderUsers();
    if(tabId === 'tab-mitarbeiter') renderMitarbeiter();
    if(tabId === 'tab-abmeldungen') renderAbmeldungen();
    if(tabId === 'tab-bewerber') renderBewerberManagement(); // WICHTIG!
}
