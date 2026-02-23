/* ============================= */
/*         ACCOUNT SYSTEM        */
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

const saveAccounts = (accs) => {
    localStorage.setItem("bs_accounts", JSON.stringify(accs));
};

/* ============================= */
/*         AUTH LOGIC            */
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
    const username = sessionStorage.getItem("loggedInUser");
    const accs = getAccounts();
    const user = accs[username];
    return user && (user.role === "Management" || user.role === "Cheffe");
};

/* ============================= */
/*        COUNTER SYSTEM         */
/* ============================= */

const getAbmeldungen = () =>
    JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];

const getBewerber = () =>
    JSON.parse(localStorage.getItem("bs_bewerber")) || [];

const getAktiveAbmeldungenCount = () =>
    getAbmeldungen().filter(a => a.status === "aktiv").length;

const getNeueBewerberCount = () =>
    getBewerber().filter(b => b.status === "neu").length;

/* ============================= */
/*       ABMELDUNGEN SYSTEM      */
/* ============================= */

const getAbmeldungen = () =>
    JSON.parse(localStorage.getItem("bs_abmeldungen")) || [];

const saveAbmeldungen = (data) =>
    localStorage.setItem("bs_abmeldungen", JSON.stringify(data));

function openAbmeldungModal() {
    document.getElementById("abmModal").classList.add("active");
}

function closeAbmModal() {
    document.getElementById("abmModal").classList.remove("active");
}

function updateAbmCounter() {

    const list = getAbmeldungen();

    const activeCount = list.filter(a => a.status === "genehmigt").length;

    const badge = document.getElementById("abmCounter");
    if(badge) badge.innerText = activeCount + " aktiv";
}

function submitAbmeldung() {

    const von = document.getElementById("abmVon").value;
    const bis = document.getElementById("abmBis").value;
    const grund = document.getElementById("abmGrund").value;
    const user = sessionStorage.getItem("loggedInUser");

    if(!von || !bis || !grund) {
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
    updateAbmCounter();
}
