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
        div.innerHTML = `
            <span><b>${b.name}</b> (V: ${b.visum})</span>
            <span>${b.tel}</span>
            <span class="status-badge-${b.status}">${b.status}</span>
            <div class="action-cell">
                <button onclick="setBewStatus(${b.id}, 'angenommen')">✔</button>
                <button onclick="deleteBewerbung(${b.id})">🗑</button>
            </div>`;
        list.appendChild(div);
    });
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
        const div = document.createElement("div");
        div.className = "grid-row";
        div.innerHTML = `<span>${name}</span><span>${accs[name].role}</span><span>Aktiv</span>
            <div class="action-cell"><button onclick="deleteUser('${name}')">🗑</button></div>`;
        list.appendChild(div);
    });
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
