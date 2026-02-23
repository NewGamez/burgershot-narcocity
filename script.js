/* ================================================= */
/* ================= ACCOUNT SYSTEM ================= */
/* ================================================= */

const getAccounts = () => {
    const data = localStorage.getItem("bs_accounts");
    if (data) return JSON.parse(data);

    const defaultAccounts = {
        "Admin": {
            password: "1234",
            role: "Cheffe",
            isFirstLogin: false
        }
    };

    localStorage.setItem("bs_accounts", JSON.stringify(defaultAccounts));
    return defaultAccounts;
};

const saveAccounts = accs =>
    localStorage.setItem("bs_accounts", JSON.stringify(accs));


/* ================================================= */
/* ================= AUTH SYSTEM =================== */
/* ================================================= */

const requireLogin = () => {
    if (!sessionStorage.getItem("loggedInUser")) {
        window.location.href = "login.html";
    }
};

const logout = () => {
    sessionStorage.clear();
    window.location.href = "login.html";
};

const isAdmin = () => {
    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    return accs[user] &&
        (accs[user].role === "Management" ||
         accs[user].role === "Cheffe");
};


/* ================================================= */
/* ================= ABMELDUNGEN =================== */
/* ================================================= */

const getAbmeldungen = () =>
    JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];

const saveAbmeldungen = data =>
    localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

/* ---------- Abmeldung einreichen ---------- */

function submitAbmeldungUI() {

    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if (!von || !bis || !grund) {
        alert("Bitte alles ausfüllen.");
        return;
    }

    const list = getAbmeldungen();

    list.push({
        user,
        von,
        bis,
        grund,
        status: "offen"
    });

    saveAbmeldungen(list);

    closeAbmModal();
    renderMeineAbmeldungen();
    updateAbmCounter();
}

/* ---------- Counter (nur OFFEN) ---------- */

function getOffeneAbmeldungenCount() {
    return getAbmeldungen()
        .filter(a => a.status === "offen").length;
}

function updateAbmCounter() {
    const badge = document.getElementById("abmCounter");
    if (badge) {
        badge.innerText =
            getOffeneAbmeldungenCount() + " offen";
    }
}

/* ---------- Modal ---------- */

function openAbmModal() {
    document.getElementById("abmModal")
        .classList.add("active");
}

function closeAbmModal() {
    document.getElementById("abmModal")
        .classList.remove("active");

    document.getElementById("abmVon").value = "";
    document.getElementById("abmBis").value = "";
    document.getElementById("abmGrund").value = "";
}

/* ---------- Meine Abmeldungen anzeigen ---------- */

function renderMeineAbmeldungen() {

    const container =
        document.getElementById("meineAbmeldungenList");

    if (!container) return;

    container.innerHTML = "";

    const user = sessionStorage.getItem("loggedInUser");

    const meine = getAbmeldungen()
        .filter(a => a.user === user);

    if (meine.length === 0) {
        container.innerHTML =
            "<p style='opacity:0.6;'>Keine Abmeldungen vorhanden.</p>";
        return;
    }

    meine.forEach((a, index) => {

        const div = document.createElement("div");

        let color = "#aaa";
        if (a.status === "offen") color = "#faac15";
        if (a.status === "genehmigt") color = "#4caf50";
        if (a.status === "abgelehnt") color = "#ff4d4d";

        div.style.marginBottom = "10px";

        div.innerHTML = `
            <div style="font-size:0.85rem;">
                ${a.von} - ${a.bis}
                <span style="color:${color};
                             font-weight:bold;
                             margin-left:8px;">
                    (${a.status})
                </span>
            </div>
        `;

        container.appendChild(div);
    });
}

/* ================================================= */
/* ================= MITARBEITER =================== */
/* ================================================= */

const getMitarbeiter = () =>
    JSON.parse(localStorage.getItem("bs_mitarbeiter")) || [];

const saveMitarbeiter = data =>
    localStorage.setItem("bs_mitarbeiter", JSON.stringify(data));

function addMitarbeiter(vor, nach, tel, gehalt) {

    if (!vor || !nach) return;

    const list = getMitarbeiter();

    list.push({
        vorname: vor,
        nachname: nach,
        telefon: tel,
        gehalt: gehalt
    });

    saveMitarbeiter(list);
}

function deleteMitarbeiter(index) {
    const list = getMitarbeiter();
    list.splice(index, 1);
    saveMitarbeiter(list);
}


/* ================================================= */
/* ================= BEWERBER SYSTEM =============== */
/* ================================================= */

const getBewerber = () =>
    JSON.parse(localStorage.getItem("bs_bewerber")) || [];

function getNeueBewerberCount() {
    return getBewerber()
        .filter(b => b.status === "neu").length;
}


/* ================================================= */
/* ================= INIT ========================== */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {
    updateAbmCounter();
});
