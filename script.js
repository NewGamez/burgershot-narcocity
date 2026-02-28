/* ================= HELPER & AUTH ==================== */
function getAccounts() {
    let raw = localStorage.getItem("bs_accounts");
    return raw ? JSON.parse(raw) : { "Admin": { password: "1234", role: "Cheffe" } };
}

function saveAccounts(accs) {
    localStorage.setItem("bs_accounts", JSON.stringify(accs));
}

function isAdmin() {
    const role = sessionStorage.getItem("userRole");
    return role === "cheffe" || role === "management";
}

/* ================= LOGIN LOGIK ==================== */
function login() {
    const userIn = document.getElementById("username").value.trim();
    const passIn = document.getElementById("password").value.trim();

    if (!userIn || !passIn) return alert("Bitte alles ausfüllen!");

    const accs = getAccounts();
    const userData = accs[userIn];

    if (userData && passIn === userData.password) {
        sessionStorage.setItem("loggedInUser", userIn);
        
        // Wir speichern die Rolle kleingeschrieben für einfachere Abfragen
        const role = userData.role.toLowerCase();
        sessionStorage.setItem("userRole", role);
        
        console.log("Login erfolgreich:", userIn, "Rolle:", role);
        window.location.href = "index.html";
    } else {
        alert("Nutzername oder Passwort falsch!");
    }
}

/* ================= ACCOUNT MANAGEMENT ================= */
function addNewUser() {
    const name = document.getElementById("newName").value.trim();
    if (!name) return alert("Name fehlt!");

    const accs = getAccounts();
    if (accs[name]) return alert("Nutzer existiert bereits!");

    accs[name] = {
        password: "0000",
        role: "Mitarbeiter",
        isFirstLogin: true
    };

    saveAccounts(accs);
    
    // UI Update
    if (typeof renderUsers === "function") renderUsers();
    
    document.getElementById("newName").value = "";
    alert("Mitarbeiter " + name + " wurde angelegt. Standard-PW: 0000");
}

function removeUser(name) {
    if (name === sessionStorage.getItem("loggedInUser")) {
        return alert("Du kannst dich nicht selbst löschen!");
    }
    if (!confirm(`Möchtest du den Account von ${name} wirklich löschen?`)) return;

    const accs = getAccounts();
    delete accs[name];
    saveAccounts(accs);
    
    renderUsers(); 
    if (typeof updateDashboardStats === "function") updateDashboardStats();
}

/* ================= ANNOUNCEMENTS LOGIK ================= */
const getAnnouncements = () => JSON.parse(localStorage.getItem("bs_announcements")) || [
    { id: 1, text: "/businessannounce BURGERSHOT – Wo Geschmack lebt!" }
];
const saveAnnouncements = (data) => localStorage.setItem("bs_announcements", JSON.stringify(data));

function addAnnouncement() {
    const text = document.getElementById("newAnnounceText").value.trim();
    if (!text) return alert("Bitte Text eingeben!");

    const list = getAnnouncements();
    list.push({ id: Date.now(), text: text });
    saveAnnouncements(list);
    
    document.getElementById("newAnnounceText").value = "";
    if (typeof renderAnnounceDetails === "function") renderAnnounceDetails(); 
    renderAnnouncementsPage();
}

/* ================= ABMELDUNGEN LOGIK ================= */
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function submitAbmeldungUI() {
    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if(!von || !bis || !grund) return alert("Bitte alle Felder ausfüllen!");

    const list = getAbmeldungen();
    list.push({ user, von, bis, grund, status: "offen", id: Date.now() });
    saveAbmeldungen(list);

    if (typeof closeAbmModal === "function") closeAbmModal();
    updateDashboardStats();
    renderMeineAbmeldungen();
}

/* ================= UI & DASHBOARD ==================== */
function checkManagementBar() {
    const mgmtBar = document.querySelector('.management-bar');
    if (!mgmtBar) return;

    if (isAdmin()) {
        mgmtBar.style.display = 'flex';
    } else {
        mgmtBar.style.display = 'none';
    }
}

function updateDashboardStats() {
    const accCount = Object.keys(getAccounts()).length;
    const offeneAbm = getAbmeldungen().filter(a => a.status === "offen").length;

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneAbm;
}

// Initialisierung beim Laden
document.addEventListener("DOMContentLoaded", () => {
    checkManagementBar();
    updateDashboardStats();
    
    // Falls wir auf der News-Seite sind
    if (document.getElementById("newsFullGrid")) renderNewsFull();
    // Falls wir auf der Dashboard-Seite sind (eigene Abmeldungen)
    if (document.getElementById("meineAbmeldungenList")) renderMeineAbmeldungen();
});

/* Kopier-Funktion */
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Kopiert!");
    });
}
