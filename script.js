/* ===================================== */
/* BURGERSHOT INTERN – CORE LOGIC        */
/* ===================================== */

const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {
    "Admin": { password: "123", role: "Cheffe", isFirstLogin: false }
};

const saveAccounts = (accs) => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const getAbsences = () => JSON.parse(localStorage.getItem("bs_absences")) || [];
const saveAbsences = (data) => localStorage.setItem("bs_absences", JSON.stringify(data));

const isAdmin = () => {
    const user = getAccounts()[sessionStorage.getItem("loggedInUser")];
    return user && ["Cheffe", "Management"].includes(user.role);
};

const requireLogin = () => {
    if (!sessionStorage.getItem("loggedInUser")) window.location.href = "login.html";
};

const setHeaderUser = () => {
    const welcome = document.getElementById("welcomeUser");
    if (welcome) welcome.innerText = `Moin, ${sessionStorage.getItem("loggedInUser")}`;
};

const logout = () => {
    sessionStorage.clear();
    window.location.href = "login.html";
};

// --- ABMELDUNGEN LOGIK ---
function getAbsences() {
    const data = localStorage.getItem("bs_absences");
    return data ? JSON.parse(data) : [];
}

function saveAbsences(data) {
    localStorage.setItem("bs_absences", JSON.stringify(data));
}

// --- BEWERBER LOGIK ---
function getApplicants() {
    const data = localStorage.getItem("bs_applicants");
    return data ? JSON.parse(data) : [];
}

function saveApplicants(data) {
    localStorage.setItem("bs_applicants", JSON.stringify(data));
}
