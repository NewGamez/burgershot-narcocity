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
