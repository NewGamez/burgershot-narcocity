function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let message = document.getElementById("message");

    if (!username || !password) {
        message.innerText = "Bitte alles ausfüllen.";
        return;
    }

    let storedPassword = localStorage.getItem(username);

    // Wenn noch kein Passwort existiert → erstes Login
    if (!storedPassword) {
        if (password === "0000") {
            let newPassword = prompt("Erstes Login! Bitte neues 4-stelliges Passwort eingeben:");

            if (newPassword && /^\d{4}$/.test(newPassword)) {
                localStorage.setItem(username, newPassword);
                alert("Passwort erfolgreich geändert!");
                window.location.href = "dashboard.html";
            } else {
                alert("Passwort muss genau 4 Ziffern haben!");
            }
        } else {
            message.innerText = "Standard Passwort ist 0000.";
        }
    } 
    // Normales Login
    else {
        if (password === storedPassword) {
            window.location.href = "dashboard.html";
        } else {
            message.innerText = "Falsches Passwort.";
        }
    }
}

function logout() {
    window.location.href = "login.html";
}
