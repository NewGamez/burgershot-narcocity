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
