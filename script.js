/* ===================================================== */
/* ================= ACCOUNT SYSTEM ==================== */
/* ===================================================== */

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


/* ===================================================== */
/* ================= AUTH SYSTEM ======================= */
/* ===================================================== */

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


/* ===================================================== */
/* ================= ABMELDUNGEN ======================= */
/* ===================================================== */

const getAbmeldungen = () =>
    JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];

const saveAbmeldungen = data =>
    localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function getOffeneAbmeldungenCount() {
    return getAbmeldungen()
        .filter(a => a.status === "offen").length;
}

function submitAbmeldung(von, bis, grund) {

    const user = sessionStorage.getItem("loggedInUser");

    if (!von || !bis || !grund) return;

    const list = getAbmeldungen();

    list.push({
        user,
        von,
        bis,
        grund,
        status: "offen"
    });

    saveAbmeldungen(list);
}

function approveAbm(i){
    const list = getAbmeldungen();
    list[i].status = "genehmigt";
    saveAbmeldungen(list);
}

function rejectAbm(i){
    const list = getAbmeldungen();
    list[i].status = "abgelehnt";
    saveAbmeldungen(list);
}


/* ===================================================== */
/* ================= MITARBEITER ======================= */
/* ===================================================== */

const getMitarbeiter = () =>
    JSON.parse(localStorage.getItem("bs_mitarbeiter")) || [];

const saveMitarbeiter = data =>
    localStorage.setItem("bs_mitarbeiter", JSON.stringify(data));

function addMitarbeiter(vor, nach, tel, geh) {

    if (!vor || !nach) return;

    const list = getMitarbeiter();

    list.push({
        vorname: vor,
        nachname: nach,
        telefon: tel,
        gehalt: geh
    });

    saveMitarbeiter(list);
}

function deleteMitarbeiter(i){
    const list = getMitarbeiter();
    list.splice(i,1);
    saveMitarbeiter(list);
}


/* ===================================================== */
/* ================= BEWERBER COUNT ==================== */
/* ===================================================== */

function getNeueBewerberCount() {
    return JSON.parse(localStorage.getItem("bs_bewerber"))?.length || 0;
}

/* ===================================================== */
/* ================= ABMELDUNG UI ====================== */
/* ===================================================== */

function openAbmModal(){
    document.getElementById("abmModal").classList.add("active");
}

function closeAbmModal(){
    document.getElementById("abmModal").classList.remove("active");
}

function submitAbmeldungUI(){

    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;

    if(!von || !bis || !grund){
        alert("Bitte alles ausfüllen.");
        return;
    }

    submitAbmeldung(von, bis, grund);

    closeAbmModal();

    // Counter aktualisieren
    const counter = document.getElementById("abmCounter");
    if(counter){
        counter.innerText = getOffeneAbmeldungenCount() + " offen";
    }

    // Felder leeren
    document.getElementById("abmVon").value = "";
    document.getElementById("abmBis").value = "";
    document.getElementById("abmGrund").value = "";
}

/* ===================================================== */
/* ============== MEINE ABMELDUNGEN ==================== */
/* ===================================================== */

function renderMeineAbmeldungen(){

    const container = document.getElementById("meineAbmeldungenList");
    if(!container) return;

    container.innerHTML = "";

    const user = sessionStorage.getItem("loggedInUser");
    const list = getAbmeldungen()
        .filter(a => a.user === user);

    if(list.length === 0){
        container.innerHTML = "<p style='opacity:0.6'>Keine Abmeldungen vorhanden.</p>";
        return;
    }

    list.forEach(a => {

        let color = "#aaa";

        if(a.status === "genehmigt") color = "#4CAF50";
        if(a.status === "abgelehnt") color = "#ff4d4d";
        if(a.status === "offen") color = "#faac15";

        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        row.innerHTML = `
            <div style="display:flex;justify-content:space-between;">
                <span>${a.von} - ${a.bis}</span>
                <span style="color:${color};font-weight:bold;">
                    ${a.status.toUpperCase()}
                </span>
            </div>
        `;

        container.appendChild(row);
    });
}
