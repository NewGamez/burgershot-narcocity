/* ================= 1. ACCOUNT & AUTH ==================== */
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

function checkFirstLogin() {
    const username = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    const userAcc = accs[username];
    if (userAcc && userAcc.isFirstLogin) {
        const modal = document.getElementById("firstLoginModal");
        if (modal) modal.style.display = "flex";
    }
}

function changeFirstPassword() {
    const newPass = document.getElementById("newInitialPassword").value.trim();
    const confirmPass = document.getElementById("confirmInitialPassword").value.trim();
    const username = sessionStorage.getItem("loggedInUser");
    if (newPass.length < 4) return alert("Passwort zu kurz!");
    if (newPass !== confirmPass) return alert("Passwörter ungleich!");
    const accs = getAccounts();
    accs[username].password = newPass;
    accs[username].isFirstLogin = false;
    saveAccounts(accs);
    alert("Erfolgreich!");
    document.getElementById("firstLoginModal").style.display = "none";
}

/* ================= 2. MANAGEMENT LOGIK ==================== */
function addUser() {
    const name = document.getElementById("newName").value.trim();
    const role = document.getElementById("newRole").value;
    const accs = getAccounts();
    if (!name || accs[name]) return alert("Name ungültig oder existiert bereits!");
    accs[name] = { password: "0000", role: role, isFirstLogin: true };
    saveAccounts(accs);
    document.getElementById("newName").value = "";
    if (typeof renderUsers === "function") renderUsers();
}

function uprank(username) {
    let accs = getAccounts();
    if (accs[username].role === "Mitarbeiter") accs[username].role = "Management";
    else if (accs[username].role === "Management") accs[username].role = "Cheffe";
    saveAccounts(accs);
}

function derank(username) {
    let accs = getAccounts();
    if (accs[username].role === "Cheffe") accs[username].role = "Management";
    else if (accs[username].role === "Management") accs[username].role = "Mitarbeiter";
    saveAccounts(accs);
}

function removeUser(username) {
    if (username === sessionStorage.getItem("loggedInUser")) return alert("Selbstlöschung nicht möglich!");
    if (!confirm("Account löschen?")) return;
    let accs = getAccounts();
    delete accs[username];
    saveAccounts(accs);
}

/* ================= 3. ANNOUNCEMENTS ==================== */
const getAnnouncements = () => JSON.parse(localStorage.getItem("bs_announcements")) || [];
const saveAnnouncements = data => localStorage.setItem("bs_announcements", JSON.stringify(data));

function addAnnouncement() {
    const text = document.getElementById("newAnnounceText").value.trim();
    if (!text) return;
    const list = getAnnouncements();
    list.push({ id: Date.now(), text: text });
    saveAnnouncements(list);
    renderAnnounceDetails();
}

/* ================= 4. ABMELDUNGEN ==================== */
const getAbmeldungen = () => JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];
const saveAbmeldungen = data => localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function approveAbm(id) {
    let list = getAbmeldungen();
    let idx = list.findIndex(a => a.id === id);
    if(idx !== -1) list[idx].status = "genehmigt";
    saveAbmeldungen(list);
}

function rejectAbm(id) {
    let list = getAbmeldungen();
    let idx = list.findIndex(a => a.id === id);
    if(idx !== -1) list[idx].status = "abgelehnt";
    saveAbmeldungen(list);
}

function deleteAbm(id) {
    saveAbmeldungen(getAbmeldungen().filter(a => a.id !== id));
}

/* ================= 5. BEWERBUNGEN ==================== */
const getBewerber = () => JSON.parse(localStorage.getItem("bs_bewerber")) || [];
const saveBewerber = data => localStorage.setItem("bs_bewerber", JSON.stringify(data));

function updateBewerberStatus(id, newStatus) {
    let list = getBewerber();
    let idx = list.findIndex(b => b.id === id);
    if(idx !== -1) {
        list[idx].status = newStatus;
        saveBewerber(list);
        if (typeof renderBewerberManagement === "function") renderBewerberManagement();
    }
}

function deleteBewerber(id) {
    if(!confirm("Löschen?")) return;
    saveBewerber(getBewerber().filter(b => b.id !== id));
    if (typeof renderBewerberManagement === "function") renderBewerberManagement();
}
