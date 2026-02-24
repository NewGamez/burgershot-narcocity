/* ================= CORE FUNCTIONS & DATA ==================== */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {};
const saveAccounts = accs => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

const getMitarbeiter = () => {
    const data = localStorage.getItem("bs_mitarbeiter");
    return data ? JSON.parse(data) : [];
};
const saveMitarbeiter = data => localStorage.setItem("bs_mitarbeiter", JSON.stringify(data));

const requireLogin = () => { if (!sessionStorage.getItem("loggedInUser")) window.location.href = "login.html"; };
const logout = () => { sessionStorage.clear(); window.location.href = "login.html"; };

// Rang-Priorität für die Account-Sortierung
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
function uiAddMitarbeiter() {
    const nameInput = document.getElementById("maName");
    const telInput = document.getElementById("maTel");
    const gehaltInput = document.getElementById("maGehalt");

    if(!nameInput || !nameInput.value.trim()) {
        alert("Bitte einen Namen eingeben!");
        return;
    }

    let maList = getMitarbeiter();
    
    // Sicherstellen, dass keine korrupten Daten gepusht werden
    maList.push({
        id: Date.now(),
        name: nameInput.value.trim(),
        tel: telInput ? telInput.value.trim() : "-",
        gehalt: gehaltInput ? parseInt(gehaltInput.value) : 10000
    });

    saveMitarbeiter(maList);
    
    // Felder leeren
    nameInput.value = "";
    if(telInput) telInput.value = "";
    if(gehaltInput) gehaltInput.value = "10000";

    renderMitarbeiter();
}

function renderMitarbeiter() {
    const list = document.getElementById("mitarbeiterList");
    if(!list) return;
    list.innerHTML = "";

    let ma = getMitarbeiter();
    
    // Sicherheits-Sortierung: Falls ein Name fehlt, wird er ignoriert, um den Fehler aus image_622b76 zu vermeiden
    ma = ma.filter(m => m && m.name).sort((a,b) => a.name.localeCompare(b.name));

    ma.forEach(m => {
        const div = document.createElement("div");
        div.className = "grid-row";
        // Header-Struktur laut deinem Bild: Name | Gehalt | Telefon | Aktion
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
        ma[i].gehalt = parseInt(wert) || 0;
        saveMitarbeiter(ma);
    }
}

function deleteMA(id) {
    if(!confirm("Mitarbeiter wirklich kündigen?")) return;
    const gefiltert = getMitarbeiter().filter(m => m.id !== id);
    saveMitarbeiter(gefiltert);
    renderMitarbeiter();
}

/* ================= ACCOUNTS (MANAGEMENT-TAB) ==================== */
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
    if(!confirm(`${name} wirklich löschen?`)) return;
    const accs = getAccounts();
    delete accs[name];
    saveAccounts(accs);
    renderUsers();
}

/* ================= BEWERBUNGEN & ABMELDUNGEN ==================== */
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
        if(s === 'angenommen') {
            let ma = getMitarbeiter();
            ma.push({ id: Date.now(), name: bews[i].name, tel: bews[i].tel, gehalt: 10000 });
            saveMitarbeiter(ma);
        }
        localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
        renderBewerbungen();
        updateDashboardStats();
    }
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

function deleteBewerbung(id) {
    let bews = JSON.parse(localStorage.getItem("bs_bewerbungen")).filter(b => b.id !== id);
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    renderBewerbungen();
    updateDashboardStats();
}

/* ================= INITIALISIERUNG ==================== */
document.addEventListener("DOMContentLoaded", () => {
    updateDashboardStats();
    if(document.getElementById("userList")) renderUsers();
    if(document.getElementById("mitarbeiterList")) renderMitarbeiter();
});
