
/* --- SPEICHER-FUNKTIONEN --- */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {
    "Admin": { password: "123", role: "Cheffe", isFirstLogin: false }
};
const saveAccounts = (accs) => localStorage.setItem("bs_accounts", JSON.stringify(accs));

/* --- AUTH-LOGIK --- */
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

const setHeaderUser = () => {
    const user = sessionStorage.getItem("loggedInUser");
    const el = document.getElementById("welcomeUser");
    if (el && user) el.innerText = `Willkommen, ${user}`;
};
