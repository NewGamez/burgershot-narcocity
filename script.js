/* ================= CORE FUNCTIONS ==================== */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {};
const saveAccounts = accs => localStorage.setItem("bs_accounts", JSON.stringify(accs));
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

const requireLogin = () => { if (!sessionStorage.getItem("loggedInUser")) window.location.href = "login.html"; };
const logout = () => { sessionStorage.clear(); window.location.href = "login.html"; };
const isAdmin = () => {
    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    return accs[user] && (accs[user].role === "Management" || accs[user].role === "Cheffe");
};

/* ================= TABS & UI ==================== */
function showTab(tabId, btn) {
    document.querySelectorAll(".mgmt-tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if(tabId === 'tab-accounts') renderUsers();
    if(tabId === 'tab-mitarbeiter') renderMitarbeiter();
    if(tabId === 'tab-abmeldungen') renderAbmeldungen();
    if(tabId === 'tab-bewerber') renderBewerbungen();
}

function closeModal(id) { document.getElementById(id).classList.remove("active"); }
function openAbmModal() { document.getElementById("abmModal").classList.add("active"); }
function closeAbmModal() { document.getElementById("abmModal").classList.remove("active"); }

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

/* ================= BEWERBUNGEN ==================== */
function submitBewerbungUI() {
    const name = document.getElementById("bewName").value;
    const bews = JSON.parse(localStorage.getItem("bs_bewerbungen") || "[]");
    const neueBew = {
        id: Date.now(),
        name: name,
        tel: document.getElementById("bewTel").value,
        visum: document.getElementById("bewVisum").value,
        fraktion: document.getElementById("bewFraktion").value,
        status: "offen"
    };
    bews.push(neueBew);
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    closeModal('bewModal');
    updateDashboardStats();
    alert("Abgesendet!");
}

function renderBewerbungen() {
    const list = document.getElementById("bewManagementList");
    if(!list) return;
    list.innerHTML = "";
    const bews = JSON.parse(localStorage.getItem("bs_bewerbungen") || "[]");

    bews.reverse().forEach(b => {
        const div = document.createElement("div");
        div.className = "grid-row";
        // Wir nutzen hier das gleiche Spalten-Verhältnis wie im Header oben
        div.style.gridTemplateColumns = "1.2fr 0.8fr 1fr 1fr 0.8fr 0.8fr";
        div.style.fontSize = "0.85rem"; // Etwas kleiner, damit alles reinpasst

        div.innerHTML = `
            <span><b>${b.name}</b> (V: ${b.visum || '?'})</span>
            <span>${b.geb || '-'}</span>
            <span>${b.tel || '-'}</span>
            <span>${b.zivi === 'Ja' ? '✅ Zivi' : (b.fraktion || 'Keine')}</span>
            <span><span class="status-badge-${b.status}">${b.status}</span></span>
            <div class="action-cell">
                <button onclick="setBewStatus(${b.id}, 'angenommen')" title="Annehmen">✔</button>
                <button onclick="deleteBewerbung(${b.id})" title="Löschen">🗑</button>
            </div>`;
        list.appendChild(div);
    });
}

/* Stelle sicher, dass deine Absende-Funktion auch alle Daten sammelt: */
function submitBewerbungUI() {
    const bews = JSON.parse(localStorage.getItem("bs_bewerbungen") || "[]");
    const neueBew = {
        id: Date.now(),
        name: document.getElementById("bewName").value,
        geb: document.getElementById("bewGeb").value,    // NEU
        tel: document.getElementById("bewTel").value,
        zivi: document.getElementById("bewZivi").value,  // NEU
        fraktion: document.getElementById("bewFraktion").value, // NEU
        visum: document.getElementById("bewVisum").value,
        status: "offen"
    };
    
    if(!neueBew.name) return alert("Name fehlt!");
    
    bews.push(neueBew);
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    closeModal('bewModal');
    updateDashboardStats();
    alert("Bewerbung erfolgreich eingereicht!");
}

function setBewStatus(id, s) {
    let bews = JSON.parse(localStorage.getItem("bs_bewerbungen"));
    const i = bews.findIndex(b => b.id === id);
    if(i !== -1) bews[i].status = s;
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    renderBewerbungen();
}

function deleteBewerbung(id) {
    let bews = JSON.parse(localStorage.getItem("bs_bewerbungen")).filter(b => b.id !== id);
    localStorage.setItem("bs_bewerbungen", JSON.stringify(bews));
    renderBewerbungen();
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
    closeAbmModal();
    updateDashboardStats();
    renderMeineAbmeldungen();
}

function renderAbmeldungen() {
    const list = document.getElementById("abmList");
    if(!list) return;
    list.innerHTML = "";
    getAbmeldungen().reverse().forEach(a => {
        const div = document.createElement("div");
        div.className = "grid-row";
        div.innerHTML = `<span>${a.user}</span><span>${a.von}-${a.bis}</span><span class="status-badge-${a.status}">${a.status}</span>
            <div class="action-cell"><button onclick="approveAbm(${a.id});renderAbmeldungen()">✔</button><button onclick="deleteAbm(${a.id});renderAbmeldungen()">🗑</button></div>`;
        list.appendChild(div);
    });
}

function approveAbm(id) {
    const list = getAbmeldungen();
    const i = list.findIndex(a => a.id === id);
    if(i !== -1) list[i].status = "genehmigt";
    saveAbmeldungen(list);
}

function deleteAbm(id) {
    const list = getAbmeldungen().filter(a => a.id !== id);
    saveAbmeldungen(list);
}

function renderMeineAbmeldungen() {
    const container = document.getElementById("meineAbmeldungenList");
    if(!container) return;
    const user = sessionStorage.getItem("loggedInUser");
    const meine = getAbmeldungen().filter(a => a.user === user);
    container.innerHTML = meine.length ? "" : "Keine Einträge.";
    meine.reverse().forEach(a => {
        const div = document.createElement("div");
        div.className = "panel";
        div.style.marginBottom = "10px";
        div.innerHTML = `<b>${a.von} - ${a.bis}</b> | Status: ${a.status.toUpperCase()}`;
        container.appendChild(div);
    });
}

/* ================= ACCOUNTS ==================== */
function renderUsers() {
    const list = document.getElementById("userList");
    if(!list) return;
    list.innerHTML = "";
    const accs = getAccounts();

    Object.keys(accs).forEach(name => {
        const userData = accs[name];
        const div = document.createElement("div");
        div.className = "grid-row";
        div.style.gridTemplateColumns = "1.5fr 1.2fr 1fr 1.5fr"; // Mehr Platz für Buttons

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
            </div>
        `;
        list.appendChild(div);
    });
}

// Logik für Uprank / Derank
function changeRank(username, direction) {
    const accs = getAccounts();
    const ränge = ["Mitarbeiter", "Management", "Cheffe"];
    let aktuellerIndex = ränge.indexOf(accs[username].role);

    if(direction === 'up' && aktuellerIndex < ränge.length - 1) {
        aktuellerIndex++;
    } else if(direction === 'down' && aktuellerIndex > 0) {
        aktuellerIndex--;
    }

    accs[username].role = ränge[aktuellerIndex];
    saveAccounts(accs);
    renderUsers();
}

/* ================= MITARBEITERLISTE (FINANZEN) ==================== */
function renderMitarbeiter() {
    const list = document.getElementById("mitarbeiterList");
    if(!list) return;
    
    list.innerHTML = `
        <div class="grid-row grid-header" style="grid-template-columns: 1.5fr 1fr 1.2fr 1fr 1fr;">
            <span>Name</span><span>Rang</span><span>Gehalt ($)</span><span>Telefon</span><span style="text-align:right;">Aktion</span>
        </div>`;
    
    const mitarbeiter = getMitarbeiter();
    mitarbeiter.forEach(m => {
        const div = document.createElement("div");
        div.className = "grid-row";
        div.style.gridTemplateColumns = "1.5fr 1fr 1.2fr 1fr 1fr";
        
        const rangClass = m.rang.toLowerCase().includes('cheffe') ? 'cheffe' : 
                         (m.rang.toLowerCase().includes('management') ? 'management' : 'mitarbeiter');

        div.innerHTML = `
            <span><b>${m.name}</b></span>
            <div><span class="role-badge ${rangClass}">${m.rang}</span></div>
            <input type="number" class="table-input" value="${m.gehalt}" onchange="updateMA(${m.id}, 'gehalt', this.value)">
            <span>${m.tel}</span>
            <div class="action-cell">
                <button class="fire-btn" onclick="deleteMA(${m.id})">Kündigen</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// Falls noch nicht vorhanden, hier auch die addUser Funktion passend dazu:
function addUser() {
    const name = document.getElementById("newName").value.trim();
    const role = document.getElementById("newRole").value;
    if(!name) return alert("Bitte Benutzernamen eingeben!");

    const accs = getAccounts();
    accs[name] = { 
        password: "0000", 
        role: role, 
        isFirstLogin: true 
    };
    
    saveAccounts(accs);
    renderUsers();
    
    // Eingabefeld leeren
    document.getElementById("newName").value = "";
}

function addUser() {
    const name = document.getElementById("newName").value.trim();
    if(!name) return;
    const accs = getAccounts();
    accs[name] = { password: "0000", role: document.getElementById("newRole").value, isFirstLogin: true };
    saveAccounts(accs);
    renderUsers();
}

function deleteUser(name) {
    const accs = getAccounts();
    delete accs[name];
    saveAccounts(accs);
    renderUsers();
}

function checkFirstLogin() {
    const user = getAccounts()[sessionStorage.getItem("loggedInUser")];
    if(user && user.isFirstLogin) document.getElementById("firstLoginModal").style.display = "flex";
}

function changeFirstPassword() {
    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    accs[user].password = document.getElementById("newInitialPassword").value;
    accs[user].isFirstLogin = false;
    saveAccounts(accs);
    document.getElementById("firstLoginModal").style.display = "none";
}
