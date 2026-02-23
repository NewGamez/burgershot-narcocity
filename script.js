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

function getAktiveAbmeldungenCount() {
    return getAbmeldungen()
        .filter(a => a.status === "genehmigt").length;
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
