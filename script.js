/* ===================================== */
/* BURGERSHOT INTERN – CORE LOGIC        */
/* ===================================== */

// --- DATEN-VERWALTUNG (LocalStorage) ---
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {
    "Admin": { password: "123", role: "Cheffe", isFirstLogin: false }
};

const saveAccounts = (accs) => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const getAbsences = () => JSON.parse(localStorage.getItem("bs_absences")) || [];
const saveAbsences = (data) => localStorage.setItem("bs_absences", JSON.stringify(data));

const getApplicants = () => JSON.parse(localStorage.getItem("bs_applicants")) || [];

// --- AUTHENTIFIZIERUNG ---
const requireLogin = () => {
    if (!sessionStorage.getItem("loggedInUser")) {
        window.location.href = "login.html";
    }
};

const isAdmin = () => {
    const username = sessionStorage.getItem("loggedInUser");
    const user = getAccounts()[username];
    return user && ["Cheffe", "Management"].includes(user.role);
};

const setHeaderUser = () => {
    const welcome = document.getElementById("welcomeUser");
    if (welcome) welcome.innerText = `Moin, ${sessionStorage.getItem("loggedInUser")}`;
};

const logout = () => {
    sessionStorage.clear();
    window.location.href = "login.html";
};

// --- PASSWORT LOGIK ---
function saveNewPassword() {
    const pin = document.getElementById("newPinInput").value;
    const user = sessionStorage.getItem("loggedInUser");
    const accounts = getAccounts();
    
    if (pin.length === 4 && !isNaN(pin) && pin !== "0000") {
        accounts[user].password = pin;
        accounts[user].isFirstLogin = false;
        saveAccounts(accounts);
        document.getElementById("firstLoginModal").style.display = "none";
        alert("PIN erfolgreich gespeichert!");
    } else {
        alert("Bitte gib eine gültige 4-stellige PIN ein (nicht 0000).");
    }
}
