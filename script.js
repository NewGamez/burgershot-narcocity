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
        const modal = document.getElementById("firstLoginModal");
        if (modal) modal.style.display = "flex";
    }
}

/* PASSWORT ÄNDERN FUNKTION */
function changeFirstPassword() {
    const newPass = document.getElementById("newInitialPassword").value.trim();
    const confirmPass = document.getElementById("confirmInitialPassword").value.trim();
    const username = sessionStorage.getItem("loggedInUser");

    if (newPass.length < 4) return alert("Das Passwort muss mindestens 4 Zeichen lang sein!");
    if (newPass !== confirmPass) return alert("Die Passwörter stimmen nicht überein!");
    if (newPass === "0000") return alert("Bitte wähle ein anderes Passwort!");

    const accs = getAccounts();
    accs[username].password = newPass;
    accs[username].isFirstLogin = false;
    saveAccounts(accs);

    alert("Passwort erfolgreich geändert!");
    document.getElementById("firstLoginModal").style.display = "none";
}

function showTab(tabId) {
    document.querySelectorAll('.mgmt-tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');
}

function addUser() {
    const name = document.getElementById("newName").value.trim();
    const role = document.getElementById("newRole").value;
    const accs = getAccounts();
    
    if (!name) return alert("Bitte einen Namen eingeben!");
    if (accs[name]) return alert("Dieser Account existiert bereits!");

    accs[name] = { password: "0000", role: role, isFirstLogin: true };
    saveAccounts(accs);
    
    if (typeof renderUsers === "function") renderUsers();
    document.getElementById("newName").value = "";
    alert("Mitarbeiter " + name + " wurde angelegt.");
}

/* ANNOUNCEMENTS LOGIK */
const getAnnouncements = () => JSON.parse(localStorage.getItem("bs_announcements")) || [
    { id: 1, text: "/businessannounce BURGERSHOT – Wo Geschmack über den Dächern von Los Santos lebt..." }
];
const saveAnnouncements = (data) => localStorage.setItem("bs_announcements", JSON.stringify(data));

function addAnnouncement() {
    const text = document.getElementById("newAnnounceText").value.trim();
    if (!text) return alert("Bitte Text eingeben!");
    const list = getAnnouncements();
    list.push({ id: Date.now(), text: text });
    saveAnnouncements(list);
    document.getElementById("newAnnounceText").value = "";
    renderAnnounceDetails();
}

function deleteAnnouncement(id) {
    if (!confirm("Diese Vorlage wirklich löschen?")) return;
    const list = getAnnouncements().filter(a => a.id !== id);
    saveAnnouncements(list);
    renderAnnounceDetails();
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => alert("Kopiert!"));
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
        const cleanText = a.text.replace(/`/g, "\\`").replace(/\n/g, "\\n");
        div.innerHTML = `
            <p style="font-size: 0.85rem; white-space: pre-line; margin-bottom: 15px; opacity: 0.9;">${a.text}</p>
            <div style="display: flex; gap: 8px; margin-top: auto;">
                <button onclick="copyText(\`${cleanText}\`)" style="flex: 2; font-size: 0.75rem;">Text kopieren</button>
                ${admin ? `<button onclick="deleteAnnouncement(${a.id})" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; flex: 1; font-size: 0.75rem;">Löschen</button>` : ''}
            </div>`;
        container.appendChild(div);
    });
}

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

function updateDashboardStats() {
    const accCount = Object.keys(getAccounts()).length;
    const offeneCount = getOffeneAbmeldungenCount();
    const bewerberCount = getBewerber().filter(b => b.status === "offen").length;

    if(document.getElementById("accCount")) document.getElementById("accCount").innerText = accCount;
    if(document.getElementById("heroAbmCount")) document.getElementById("heroAbmCount").innerText = offeneCount;
    if(document.getElementById("abmCounter")) document.getElementById("abmCounter").innerText = offeneCount + " offen";
    if(document.getElementById("bewerberCounter")) document.getElementById("bewerberCounter").innerText = bewerberCount + " neu";
}

function deleteAbm(id) {
    if (!confirm("Abmeldung löschen?")) return;
    const newList = getAbmeldungen().filter(a => a.id !== id);
    saveAbmeldungen(newList);
    if (typeof renderAbmeldungen === "function") renderAbmeldungen();
    updateDashboardStats();
}

function openAbmModal() { document.getElementById("abmModal").classList.add("active"); }
function closeAbmModal() { document.getElementById("abmModal").classList.remove("active"); }

function submitAbmeldungUI() {
    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");
    if(!von || !bis || !grund) return alert("Bitte alles ausfüllen!");
    const list = getAbmeldungen();
    list.push({ user, von, bis, grund, status: "offen", id: Date.now() });
    saveAbmeldungen(list);
    closeAbmModal();
    updateDashboardStats();
    renderMeineAbmeldungen();
}

function renderMeineAbmeldungen() {
    const container = document.getElementById("meineAbmeldungenList");
    if(!container) return;
    container.innerHTML = "";
    const user = sessionStorage.getItem("loggedInUser");
    const meine = getAbmeldungen().filter(a => a.user === user);
    if(meine.length === 0) {
        container.innerHTML = "<p style='opacity:0.5;'>Keine Abmeldungen eingereicht.</p>";
        return;
    }
    meine.reverse().forEach(a => {
        let color = a.status === "genehmigt" ? "#2ecc71" : (a.status === "abgelehnt" ? "#e74c3c" : "#faac15");
        const div = document.createElement("div");
        div.style.cssText = `background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${color}`;
        div.innerHTML = `<div><span style="font-weight:bold;">${a.von} - ${a.bis}</span><br><small style="opacity:0.7;">Grund: ${a.grund}</small></div><span style="color:${color}; font-weight:bold; text-transform:uppercase; font-size:0.8rem;">${a.status}</span>`;
        container.appendChild(div);
    });
}

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

/* ================= BEWERBER LOGIK ==================== */
const getBewerber = () => JSON.parse(localStorage.getItem("bs_bewerber")) || [];
const saveBewerber = data => localStorage.setItem("bs_bewerber", JSON.stringify(data));

function updateBewerberCount() {
    const count = getBewerber().filter(b => b.status === "offen").length;
    if(document.getElementById("bewerberCounter")) {
        document.getElementById("bewerberCounter").innerText = count + " neu";
    }
}

function submitBewerbung() {
    const name = document.getElementById("bewName").value.trim();
    const geb = document.getElementById("bewGeb").value.trim();
    const tel = document.getElementById("bewTel").value.trim();
    const zivi = document.getElementById("bewZivi").value;
    const fraktion = document.getElementById("bewFraktion").value.trim();
    const visum = document.getElementById("bewVisum").value.trim();
    const aussehen = document.getElementById("bewAussehen").value;

    if(!name || !tel || !visum) return alert("Name, Telefon und Visum müssen ausgefüllt sein!");

    const list = getBewerber();
    list.push({
        id: Date.now(),
        name, geb, tel, zivi, fraktion, visum, aussehen,
        status: "offen",
        datum: new Date().toLocaleDateString('de-DE')
    });
    
    saveBewerber(list);
    alert("Bewerbung für " + name + " wurde registriert!");
    location.reload(); 
}

function updateBewerberStatus(id, newStatus) {
    const list = getBewerber();
    const index = list.findIndex(b => b.id === id);
    if(index !== -1) {
        list[index].status = newStatus;
        saveBewerber(list);
        if (typeof renderBewerberManagement === "function") renderBewerberManagement();
        updateDashboardStats();
    }
}

function deleteBewerber(id) {
    if(!confirm("Bewerber endgültig löschen?")) return;
    const list = getBewerber().filter(b => b.id !== id);
    saveBewerber(list);
    if (typeof renderBewerberManagement === "function") renderBewerberManagement();
    updateDashboardStats();
}
