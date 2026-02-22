// =============================
// LOGIN CHECK
// =============================

function requireLogin() {
    const user = sessionStorage.getItem("loggedInUser");
    if (!user) {
        window.location.href = "login.html";
    }
}

function setHeaderUser() {
    const user = sessionStorage.getItem("loggedInUser");
    const el = document.getElementById("welcomeUser");
    if (el && user) {
        el.innerText = "Eingeloggt als: " + user;
    }
}

function logout() {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// =============================
// ACCOUNT STORAGE
// =============================

function getAccounts() {
    return JSON.parse(localStorage.getItem("accounts")) || {};
}

function saveAccounts(accounts) {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

// =============================
// ROLE CHECK
// =============================

function isAdmin() {
    const user = sessionStorage.getItem("loggedInUser");
    const accounts = getAccounts();

    if (!accounts[user]) return false;

    return accounts[user].role === "Admin";
}

// Initialer Setup-Check (Falls noch gar keine Accounts existieren)
(function initializeSystem() {
    const accounts = getAccounts();
    if (Object.keys(accounts).length === 0) {
        console.log("System leer. Erstelle Standard-Admin...");
        accounts["Admin"] = { password: "0000", role: "Admin" };
        saveAccounts(accounts);
    }
})();
