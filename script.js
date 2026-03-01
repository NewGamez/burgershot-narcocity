/* ============================================================
   1. KERN-SYSTEM (STORAGE, AUTH & NAVIGATION)
   ============================================================ */

function getAccounts() {
    let accs = JSON.parse(localStorage.getItem("bs_accounts"));
    if (!accs || Object.keys(accs).length === 0) {
        // Falls leer: Erstelle den Master-Admin
        accs = { "Admin": { password: "1234", role: "cheffe" } };
        localStorage.setItem("bs_accounts", JSON.stringify(accs));
    }
    return accs;
}

function saveAccounts(accs) {
    localStorage.setItem("bs_accounts", JSON.stringify(accs));
}

function login() {
    const userIn = document.getElementById("username").value.trim();
    const passIn = document.getElementById("password").value.trim();

    if (!userIn || !passIn) return alert("Bitte alles ausfüllen!");

    const accs = getAccounts();
    const userData = accs[userIn];

    if (userData && passIn === userData.password) {
        sessionStorage.setItem("loggedInUser", userIn);
        // Rolle für stabilen Vergleich immer kleingeschrieben speichern
        sessionStorage.setItem("userRole", userData.role.toLowerCase().trim());
        window.location.href = "index.html";
    } else {
        alert("Nutzername oder Passwort falsch!");
    }
}

function isAdmin() {
    const role = (sessionStorage.getItem("userRole") || "").toLowerCase().trim();
    return role === "cheffe" || role === "management";
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

function updateUIVisibility() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = isAdmin() ? 'flex' : 'none';
    }
}

function showTab(tabId, btn) {
    document.querySelectorAll(".mgmt-tab").forEach(t => t.style.display = "none");
    const activeTab = document.getElementById(tabId);
    if(activeTab) activeTab.style.display = "block";

    if(btn) {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }

    // Daten je nach Tab laden
    if(tabId === 'tab-accounts' && typeof renderUsers === "function") renderUsers();
    if(tabId === 'tab-abmeldungen' && typeof renderAbmeldungen === "function") renderAbmeldungen();
    if(tabId === 'tab-bewerber' && typeof renderBewerberManagement === "function") renderBewerberManagement();
}

// Initialisierung beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    updateUIVisibility();
    if(document.getElementById("accCount")) updateDashboardStats();
    if(document.getElementById("meineAbmeldungenList")) renderMeineAbmeldungen();
    if(document.getElementById("newsFullGrid")) renderNewsFull();
});

/* ============================================================
   2. ABMELDUNGEN LOGIK
   ============================================================ */
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function updateDashboardStats() {
    const accCount = Object.keys(getAccounts()).length;
    const offeneCount = getAbmeldungen().filter(a => a.status === "offen").length;

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneCount;
}

function submitAbmeldungUI() {
    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if(!von || !bis || !grund) return alert("Bitte alle Felder ausfüllen!");

    const list = getAbmeldungen();
    list.push({ user, von, bis, grund, status: "offen", id: Date.now() });
    saveAbmeldungen(list);

    if(typeof closeAbmModal === "function") closeAbmModal();
    updateDashboardStats();
    renderMeineAbmeldungen();
}

function renderMeineAbmeldungen() {
    const container = document.getElementById("meineAbmeldungenList");
    if(!container) return;
    container.innerHTML = "";
    const user = sessionStorage.getItem("loggedInUser");
    const meine = getAbmeldungen().filter(a => a.user === user);

    meine.reverse().forEach(a => {
        let color = a.status === "genehmigt" ? "#2ecc71" : (a.status === "abgelehnt" ? "#e74c3c" : "#faac15");
        const div = document.createElement("div");
        div.style.cssText = `background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${color}`;
        div.innerHTML = `<div><b>${a.von} - ${a.bis}</b><br><small>${a.grund}</small></div><span style="color:${color}; font-weight:bold;">${a.status.toUpperCase()}</span>`;
        container.appendChild(div);
    });
}

/* ============================================================
   3. NEWS & INFOS LOGIK
   ============================================================ */
const getNews = () => JSON.parse(localStorage.getItem("bs_news")) || [];
const saveNews = data => localStorage.setItem("bs_news", JSON.stringify(data));

function addNews() {
    const text = document.getElementById("newNewsText").value.trim();
    const imgUrl = document.getElementById("newNewsImg").value.trim();
    if(!text) return alert("Text eingeben!");

    const news = getNews();
    news.push({
        id: Date.now(),
        ersteller: sessionStorage.getItem("loggedInUser"),
        datum: new Date().toLocaleString('de-DE'),
        text: text, bild: imgUrl || null,
        votesUp: [], votesDown: []
    });
    saveNews(news);
    renderNewsFull();
}

function renderNewsFull() {
    const container = document.getElementById("newsFullGrid");
    if(!container) return;
    container.innerHTML = "";
    const admin = isAdmin();

    getNews().reverse().forEach(n => {
        const div = document.createElement("div");
        div.className = "panel";
        div.style.marginBottom = "20px";
        div.innerHTML = `
            <small style="opacity:0.5;">${n.datum} - Von: ${n.ersteller}</small>
            <p style="white-space:pre-line; margin: 10px 0;">${n.text}</p>
            ${n.bild ? `<img src="${n.bild}" style="max-width:100%; border-radius:10px; margin-bottom:10px;">` : ''}
            <div style="display:flex; justify-content:space-between;">
                <div><button onclick="reactToNews(${n.id}, 'up')">✅ ${n.votesUp.length}</button> <button onclick="reactToNews(${n.id}, 'down')">❌ ${n.votesDown.length}</button></div>
                ${admin ? `<button onclick="deleteNews(${n.id})" style="color:#e74c3c; background:none; border:none;">Löschen</button>` : ''}
            </div>`;
        container.appendChild(div);
    });
}

/* ============================================================
   4. BEWERBER LOGIK
   ============================================================ */
const getBewerber = () => JSON.parse(localStorage.getItem("bs_bewerber")) || [];
const saveBewerber = data => localStorage.setItem("bs_bewerber", JSON.stringify(data));

function submitBewerbung() {
    const name = document.getElementById("bewName").value.trim();
    const bewerber = getBewerber();
    bewerber.push({
        id: Date.now(),
        name,
        geb: document.getElementById("bewGeb").value,
        tel: document.getElementById("bewTel").value,
        zivi: document.getElementById("bewZivi").value,
        visum: document.getElementById("bewVisum").value,
        ersch: document.getElementById("bewersch").value,
        status: "offen",
        erstelltAm: new Date().toLocaleDateString('de-DE')
    });
    saveBewerber(bewerber);
    alert("Bewerbung gespeichert!");
}

/* ============================================================
   5. ANNOUNCEMENTS (VORLAGEN)
   ============================================================ */
const getAnnouncements = () => JSON.parse(localStorage.getItem("bs_announcements")) || [
    { id: 1, text: "/businessannounce BURGERSHOT – Wo Geschmack über den Dächern von Los Santos lebt..." }
];

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => alert("In Zwischenablage kopiert!"));
}

/* ============================================================
   6. ACCOUNT MANAGEMENT (LISTE RENDERN)
   ============================================================ */

function renderUsers() {
    const container = document.getElementById("userTableBody");
    if (!container) return; // Falls wir nicht auf der Management-Seite sind

    container.innerHTML = "";
    const accs = getAccounts();

    Object.keys(accs).forEach(name => {
        const user = accs[name];
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${name}</td>
            <td><span class="badge">${user.role}</span></td>
            <td>
                <button onclick="uprank('${name}')" class="btn-small">↑</button>
                <button onclick="derank('${name}')" class="btn-small">↓</button>
                <button onclick="removeUser('${name}')" class="btn-small btn-danger">🗑</button>
            </td>
        `;
        container.appendChild(tr);
    });
}

// FORCE CHECK: Tippe das in die Browser-Konsole (F12), wenn du eingeloggt bist!
function forceShow() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'flex';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
        console.log("Panel wurde manuell erzwungen!");
    } else {
        console.error("ID 'adminPanel' wurde im HTML nicht gefunden!");
    }
}
