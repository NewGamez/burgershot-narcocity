/* ============================= */
/* ACCOUNT SYSTEM */
/* ============================= */

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

/* ============================= */
/* AUTH SYSTEM */
/* ============================= */

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

/* ============================= */
/* ABMELDUNGEN SYSTEM */
/* ============================= */

const getAbmeldungen = () =>
    JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];

const saveAbmeldungen = data =>
    localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function submitAbmeldung() {

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
    updateAbmCounter();
}

function updateAbmCounter() {

    const list = getAbmeldungen();

    const activeCount =
        list.filter(a => a.status === "genehmigt").length;

    const badge = document.getElementById("abmCounter");

    if (badge) {
        badge.innerText = activeCount + " aktiv";
    }
}

/* ============================= */
/* MITARBEITER SYSTEM */
/* ============================= */

const getMitarbeiter = () =>
    JSON.parse(localStorage.getItem("bs_mitarbeiter")) || [];

const saveMitarbeiter = data =>
    localStorage.setItem("bs_mitarbeiter", JSON.stringify(data));

function addMitarbeiter(vorname, nachname, telefon, gehalt) {

    if (!vorname || !nachname) return;

    const list = getMitarbeiter();

    list.push({
        vorname,
        nachname,
        telefon,
        gehalt
    });

    saveMitarbeiter(list);
}

/* ============================= */
/* INIT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {

    const user = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();

    if (!user || !accs[user]) return;

    updateAbmCounter();
});
