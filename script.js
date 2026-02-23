/* ===================================== */
/* BURGERSHOT INTERN – CORE SCRIPT       */
/* ===================================== */

// --- ACCOUNTS & AUTH ---
function getAccounts() {
    const accs = localStorage.getItem("bs_accounts");
    return accs ? JSON.parse(accs) : {
        "Admin": { password: "123", role: "Cheffe", isFirstLogin: false }
    };
}

function saveAccounts(accs) {
    localStorage.setItem("bs_accounts", JSON.stringify(accs));
}

function isAdmin() {
    const username = sessionStorage.getItem("loggedInUser");
    const accounts = getAccounts();
    const user = accounts[username];
    if (!user) return false;
    // Cheffe und Management zählen als Admins für das Panel
    return ["Cheffe", "Management"].includes(user.role);
}

function requireLogin() {
    if (!sessionStorage.getItem("loggedInUser")) {
        window.location.href = "login.html";
    }
}

function setHeaderUser() {
    const user = sessionStorage.getItem("loggedInUser");
    const welcome = document.getElementById("welcomeUser");
    if (welcome) welcome.innerText = "Moin, " + user;
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

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
