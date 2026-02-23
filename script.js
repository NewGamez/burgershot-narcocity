/* --- SPEICHER-FUNKTIONEN --- */
const getAccounts = () => JSON.parse(localStorage.getItem("bs_accounts")) || {
    "Admin": { password: "123", role: "Cheffe", isFirstLogin: false }
};
const saveAccounts = (accs) => localStorage.setItem("bs_accounts", JSON.stringify(accs));

const getAbsences = () => JSON.parse(localStorage.getItem("bs_absences")) || [];
const saveAbsences = (data) => localStorage.setItem("bs_absences", JSON.stringify(data));

/* --- AUTH & LOGOUT --- */
const requireLogin = () => {
    if (!sessionStorage.getItem("loggedInUser")) {
        window.location.href = "login.html";
    }
};

const logout = () => {
    sessionStorage.clear();
    window.location.href = "login.html";
};

/* --- MANAGEMENT FUNKTIONEN --- */
function isAdmin() {
    const user = getAccounts()[sessionStorage.getItem("loggedInUser")];
    return user && (user.role === "Management" || user.role === "Cheffe");
}
