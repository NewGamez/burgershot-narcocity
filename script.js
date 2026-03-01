/* ================= LOGIN SYSTEM ==================== */
function login() {
    const userIn = document.getElementById("username").value.trim();
    const passIn = document.getElementById("password").value.trim();

    if (!userIn || !passIn) return alert("Bitte alles ausfüllen!");

    const accs = getAccounts();
    const userData = accs[userIn];

    if (userData && passIn === userData.password) {
        // 1. Username speichern
        sessionStorage.setItem("loggedInUser", userIn);
        
        // 2. Rolle speichern und DIREKT in Kleinschreibung umwandeln
        const rawRole = userData.role || "mitarbeiter";
        const cleanRole = rawRole.toLowerCase().trim();
        
        sessionStorage.setItem("userRole", cleanRole);
        
        console.log("Login erfolgreich für:", userIn, "Rolle gespeichert als:", cleanRole);
        window.location.href = "index.html";
    } else {
        alert("Nutzername oder Passwort falsch!");
    }
}

/* ================= ADMIN CHECK (KORRIGIERT) ==================== */
function isAdmin() {
    const role = (sessionStorage.getItem("userRole") || "").toLowerCase().trim();
    console.log("Aktuelle Rolle im Check:", role); // Zeigt dir in der Konsole, was er prüft
    
    // Prüft auf alle gängigen Schreibweisen
    return role === "cheffe" || role === "management" || role === "admin";
}

function requireLogin() {
    if (!sessionStorage.getItem("loggedInUser")) {
        window.location.href = "login.html";
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

/* ================= MANAGEMENT UI ==================== */
function updateUIVisibility() {
    // Sucht nach der ID 'adminPanel' aus deiner index.html
    const mgmtBar = document.getElementById('adminPanel'); 
    
    if (mgmtBar) {
        if (isAdmin()) {
            mgmtBar.style.display = 'flex'; 
            console.log("Admin-Leiste eingeblendet");
        } else {
            mgmtBar.style.display = 'none';
            console.log("Kein Admin - Leiste bleibt versteckt");
        }
    }
}

// Beim Laden der Seite ausführen
document.addEventListener("DOMContentLoaded", () => {
    updateUIVisibility();
    // Falls Stats-Container vorhanden, Stats laden
    if(document.getElementById("accCount")) updateDashboardStats();
    // Falls wir auf der Management-Seite sind, User rendern
    if(document.getElementById("userTableBody")) renderUsers();
});

function showTab(tabId, btn) {
    // Alle Tabs verstecken
    document.querySelectorAll(".mgmt-tab").forEach(t => {
        t.style.display = "none";
        t.classList.remove("active");
    });

    // Gewählten Tab zeigen
    const activeTab = document.getElementById(tabId);
    if(activeTab) {
        activeTab.style.display = "block";
        activeTab.classList.add("active");
    }

    // Buttons stylen
    if (btn) {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }

    // Daten laden je nach Tab
    if(tabId === 'tab-accounts') renderUsers();
    if(tabId === 'tab-bewerber') renderBewerberManagement();
    if(tabId === 'tab-abmeldungen') renderAbmeldungen();
}

/* ================= STORAGE & ACCOUNTS ================= */
function getAccounts() {
    let accs = JSON.parse(localStorage.getItem("bs_accounts"));
    if (!accs) {
        // Notfall-Admin falls leer
        accs = { 
            "Cheffe": { 
                password: "1234", 
                role: "Cheffe" 
            } 
        };
        localStorage.setItem("bs_accounts", JSON.stringify(accs));
    }
    return accs;
}

function saveAccounts(accs) {
    localStorage.setItem("bs_accounts", JSON.stringify(accs));
}

function addUser() {
    const name = document.getElementById("newName").value.trim();
    const role = document.getElementById("newRole").value;
    const accs = getAccounts();
    
    if (!name) return alert("Bitte einen Namen eingeben!");
    if (accs[name]) return alert("Dieser Account existiert bereits!");

    accs[name] = { 
        password: "0000", 
        role: role,
        isFirstLogin: true 
    };
    
    saveAccounts(accs);
    renderUsers();
    document.getElementById("newName").value = "";
    alert(`Account für ${name} erstellt.`);
}

function removeUser(name) {
    if (name === sessionStorage.getItem("loggedInUser")) return alert("Selbst löschen nicht möglich!");
    if (!confirm(`Account von ${name} wirklich löschen?`)) return;

    const accs = getAccounts();
    delete accs[name];
    saveAccounts(accs);
    renderUsers();
    updateDashboardStats();
}

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

/* ================= ABMELDUNGEN ================= */
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function submitAbmeldungUI() {
    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if(!von || !bis || !grund) return alert("Bitte alles ausfüllen!");

    const list = getAbmeldungen();
    list.push({ user, von, bis, grund, status: "offen", id: Date.now() });
    saveAbmeldungen(list);

    if(typeof closeAbmModal === "function") closeAbmModal();
    updateDashboardStats();
    if(document.getElementById("meineAbmeldungenList")) renderMeineAbmeldungen();
}

function approveAbm(id) {
    const list = getAbmeldungen();
    const index = list.findIndex(a => a.id === id);
    if(index !== -1) list[index].status = "genehmigt";
    saveAbmeldungen(list);
    renderAbmeldungen();
}

function rejectAbm(id) {
    const list = getAbmeldungen();
    const index = list.findIndex(a => a.id === id);
    if(index !== -1) list[index].status = "abgelehnt";
    saveAbmeldungen(list);
    renderAbmeldungen();
}

/* ================= BEWERBER ================= */
const getBewerber = () => JSON.parse(localStorage.getItem("bs_bewerber")) || [];
const saveBewerber = data => localStorage.setItem("bs_bewerber", JSON.stringify(data));

function submitBewerbung() {
    const name = document.getElementById("bewName").value.trim();
    const geb = document.getElementById("bewGeb").value;
    const tel = document.getElementById("bewTel").value.trim();
    const zivi = document.getElementById("bewZivi").value;
    const visum = document.getElementById("bewVisum").value;
    const ersch = document.getElementById("bewersch").value;

    if(!name || !geb || !tel || !visum) return alert("Felder ausfüllen!");

    const bewerber = getBewerber();
    bewerber.push({
        id: Date.now(),
        name, geb, tel, zivi, visum, ersch,
        status: "offen",
        erstelltAm: new Date().toLocaleDateString('de-DE')
    });

    saveBewerber(bewerber);
    alert("Bewerbung abgeschickt!");
}

/* ================= NEWS ================= */
const getNews = () => JSON.parse(localStorage.getItem("bs_news")) || [];
const saveNews = data => localStorage.setItem("bs_news", JSON.stringify(data));

function addNews() {
    const text = document.getElementById("newNewsText").value.trim();
    if(!text) return alert("Text fehlt!");

    const news = getNews();
    news.push({
        id: Date.now(),
        ersteller: sessionStorage.getItem("loggedInUser"),
        datum: new Date().toLocaleString('de-DE'),
        text: text,
        votesUp: [],
        votesDown: []
    });

    saveNews(news);
    renderNewsFull();
}

/* ================= DASHBOARD STATS ================= */
function updateDashboardStats() {
    const accs = getAccounts();
    const accCount = Object.keys(accs).length;
    const offeneCount = getAbmeldungen().filter(a => a.status === "offen").length;

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneCount;
}

// Hilfsfunktion zum Kopieren
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => alert("Kopiert!"));
}
