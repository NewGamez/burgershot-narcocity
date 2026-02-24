/* ================= CORE FUNCTIONS & DATA ==================== */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {};
const saveAccounts = accs => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

const getMitarbeiter = () => JSON.parse(localStorage.getItem("bs_mitarbeiter")) || [];
const saveMitarbeiter = data => localStorage.setItem("bs_mitarbeiter", JSON.stringify(data));

const requireLogin = () => { if (!sessionStorage.getItem("loggedInUser")) window.location.href = "login.html"; };
const logout = () => { sessionStorage.clear(); window.location.href = "login.html"; };

const isAdmin = () => {
    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    return accs[user] && (accs[user].role === "Management" || accs[user].role === "Cheffe");
};

// Rang-Priorität für die Sortierung (Accountverwaltung)
const getRankPriority = (role) => {
    const ränge = { "Cheffe": 1, "Management": 2, "Mitarbeiter": 3 };
    return ränge[role] || 4;
};

/* ================= TABS & UI NAVIGATION ==================== */
function showTab(tabId, btn) {
    document.querySelectorAll(".mgmt-tab").forEach(t => t.classList.remove("active"));
    const targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.add("active");
    
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    if(btn) btn.classList.add("active");

    if(tabId === 'tab-accounts') renderUsers();
    if(tabId === 'tab-mitarbeiter') renderMitarbeiter();
    if(tabId === 'tab-abmeldungen') renderAbmeldungen();
    if(tabId === 'tab-bewerber') renderBewerbungen();
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove("active"); 
}

/* ================= DASHBOARD STATS ==================== */
function updateDashboardStats() {
    const accs = getAccounts();
    const abms = getAbmeldungen();
    const bews = JSON.parse(localStorage.getItem("bs_bewerbungen") || "[]");

    const offeneAbm = abms.filter(a => a.status === "offen").length;
    const offeneBew = bews.filter(b => b.status === "offen").length;

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = Object.keys(accs).length;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneAbm;
    if(document.getElementById("abmCounter")) document.getElementById("abmCounter").innerText = offeneAbm + " offen";
    if(document.getElementById("bewerberCounter")) document.getElementById("bewerberCounter").innerText = offeneBew + " neu";
}

/* ================= MITARBEITERLISTE (IC - FINANZEN) ==================== */
// WICHTIG: Diese IDs müssen 1:1 in deinem HTML stehen!
function uiAddMitarbeiter() {
    const nameVal = document.getElementById("maName")?.value.trim();
    const telVal = document.getElementById("maTel")?.value.trim() || "Keine Nummer";
    const gehaltVal = document.getElementById("maGehalt")?.value || "10000";

    if(!nameVal) {
        alert("Bitte einen Namen eingeben!");
        return;
    }

    let maList = getMitarbeiter();
    maList.push({
        id: Date.now(),
        name: nameVal,
        tel: telVal,
        gehalt: parseInt(gehaltVal)
    });

    saveMitarbeiter(maList);
    
    // Felder leeren
    document.getElementById("maName").value = "";
    document.getElementById("maTel").value = "";
    document.getElementById("maGehalt").value = "10000";

    renderMitarbeiter();
    console.log("Mitarbeiter hinzugefügt:", nameVal);
}

function renderMitarbeiter() {
    const list = document.getElementById("mitarbeiterList");
    if(!list) return;
    list.innerHTML = "";

    const ma = getMitarbeiter().sort((a,b) => a.name.localeCompare(b.name));

    ma.forEach(m => {
        const div = document.createElement("div");
        div.className = "grid-row";
        // Header: Name, Gehalt, Telefon, Aktion -> Spaltenverhältnis anpassen
        div.style.gridTemplateColumns = "1.5fr 1.2fr 1.5fr 1fr";
        
        div.innerHTML = `
            <span><b>${m.name}</b></span>
            <input type="number" class="table-input" value="${m.gehalt}" onchange="updateMAGehalt(${m.id}, this.value)">
            <span>${m.tel}</span>
            <div class="action-cell">
                <button class="fire-btn" onclick="deleteMA(${m.id})">Kündigen</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateMAGehalt(id, wert) {
    let ma = getMitarbeiter();
    const i = ma.findIndex(x => x.id === id);
    if(i !== -1) {
        ma[i].gehalt = parseInt(wert);
        saveMitarbeiter(ma);
    }
}

function deleteMA(id) {
    if(!confirm("Mitarbeiter wirklich kündigen?")) return;
    saveMitarbeiter(getMitarbeiter().filter(m => m.id !== id));
    renderMitarbeiter();
}

/* ================= ACCOUNTS (MANAGEMENT) ==================== */
function renderUsers() {
    const list = document.getElementById("userList");
    if(!list) return;
    list.innerHTML = "";
    const accs = getAccounts();

    const sortedNames = Object.keys(accs).sort((a, b) => {
        const prioA = getRankPriority(accs[a].role);
        const prioB = getRankPriority(accs[b].role);
        return prioA !== prioB ? prioA - prioB : a.localeCompare(b);
    });

    sortedNames.forEach(name => {
        const userData = accs[name];
        const div = document.createElement("div");
        div.className = "grid-row";
        div.style.gridTemplateColumns = "1.5fr 1.2fr 1fr 1.5fr";

        const rangClass = userData.role.toLowerCase().includes('cheffe') ? 'cheffe' : 
                         (userData.role.toLowerCase().includes('management') ? 'management' : 'mitarbeiter');

        div.innerHTML = `
            <span><b>${name}</b></span>
            <div><span class="role-badge ${rangClass}">${userData.role}</span></div>
            <span style="color: #2ecc71;">Aktiv</span>
            <div class="action-cell">
                <button class="rank-btn" onclick="changeRank('${name}', 'up')">↑</button>
                <button class="rank-btn" onclick="changeRank('${name}', 'down')">↓</button>
                <button class="fire-btn" onclick="deleteUser('${name}')">Kündigen</button>
            </div>`;
        list.appendChild(div);
    });
}

function addUser() {
    const name = document.getElementById("newName")?.value.trim();
    if(!name) return alert("Benutzername fehlt!");
    const accs = getAccounts();
    accs[name] = { 
        password: "0000", 
        role: document.getElementById("newRole").value, 
        isFirstLogin: true 
    };
    saveAccounts(accs);
    renderUsers();
    document.getElementById("newName").value = "";
}

function changeRank(username, direction) {
    const accs = getAccounts();
    const ränge = ["Mitarbeiter", "Management", "Cheffe"];
    let idx = ränge.indexOf(accs[username].role);
    if(direction === 'up' && idx < 2) idx++;
    if(direction === 'down' && idx > 0) idx--;
    accs[username].role = ränge[idx];
    saveAccounts(accs);
    renderUsers();
}

function deleteUser(name) {
    if(!confirm(`${name} wirklich aus dem System löschen?`)) return;
    const accs = getAccounts();
    delete accs[name];
    saveAccounts(accs);
    renderUsers();
}

/* ================= ABMELDUNGEN ==================== */
function submitAbmeldungUI() {
    const list = getAbmeldungen();
    list.push({
        user: sessionStorage.getItem("loggedInUser"),
        von: document.getElementById("abmVon").value,
        bis: document.getElementById("abmBis").value,
        grund: document.getElementById("abmGrund").value,
        status: "offen",
        id: Date.now()
    });
    saveAbmeldungen(list);
    closeModal('abmModal');
    updateDashboardStats();
}

function renderAbmeldungen() {
    const list = document.getElementById("abmList");
    if(!list) return;
    list.innerHTML = "";
    getAbmeldungen().reverse().forEach(a => {
        const div = document.createElement("div");
        div.className = "grid-row";
        div.innerHTML = `
            <span>${a.user}</span>
            <span>${a.von} - ${a.bis}</span>
            <span class="status-badge-${a.status}">${a.status}</span>
            <div class="action-cell">
                <button class="btn-check" onclick="approveAbm(${a.id})">✔</button>
                <button class="btn-delete" onclick="deleteAbm(${a.id})">🗑</button>
            </div>`;
        list.appendChild(div);
    });
}

function approveAbm(id) {
    const list = getAbmeldungen();
    const i = list.findIndex(a => a.id === id);
    if(i !== -1) {
        list[i].status = "genehmigt";
        saveAbmeldungen(list);
        renderAbmeldungen();
    }
}

function deleteAbm(id) {
    saveAbmeldungen(getAbmeldungen().filter(a => a.id !== id));
    renderAbmeldungen();
    updateDashboardStats();
}

/* ================= BEWERBUNGEN ==================== */
function renderBewerbungen() {
    const list = document.getElementById("bewManagementList");
    if(!list) return;
    list.innerHTML = "";
    const bews = JSON.parse(localStorage.getItem("bs_bewerbungen") || "[]");

    bews.reverse().forEach(b => {
        const div = document.createElement("div");
        div.className = "grid-row";
        div.style.gridTemplateColumns = "1.2fr 0.8fr 1fr 1fr 0.8fr 0.8fr";
        div.innerHTML = `
            <span><b>${b.name}</b> (V: ${b.visum || '?'})</span>
            <span>${b.geb || '-'}</span>
            <span>${b.tel || '-'}</span>
            <span>${b.zivi === 'Ja' ? '✅ Zivi' : (b.fraktion || 'Keine')}</span>
            <span><span class="status-badge-${b.status}">${b.status}</span></span>
            <div class="action-cell">
                <button class="btn-check" onclick="setBewStatus(${b.id}, 'angenommen')">✔</button>
                <button class="btn-delete" onclick="deleteBewerbung(${b.id})">🗑</button>
            </div>`;
        list.appendChild(div);
    });
}

function setBewStatus(id, s) {
    let bews = JSON.parse(localStorage.getItem("bs_bewerbungen"));
    const i = bews.findIndex(b => b.id === id);
    if(i !== -1) {
        bews[i].status = s;
        localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
        renderBewerbungen();
        updateDashboardStats();
    }
}

function deleteBewerbung(id) {
    let bews = JSON.parse(localStorage.getItem("bs_bewerbungen")).filter(b => b.id !== id);
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    renderBewerbungen();
    updateDashboardStats();
}

/* ================= INITIALISIERUNG ==================== */
document.addEventListener("DOMContentLoaded", () => {
    // Falls Dashboard-Elemente vorhanden sind
    updateDashboardStats();
    
    // Falls man im Management-Tab startet
    if(document.getElementById("userList")) renderUsers();
});
