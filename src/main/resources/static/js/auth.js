const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

if (isLoggedIn && loginBtn && signupBtn && logoutBtn) {
    loginBtn.hidden = true;
    signupBtn.hidden = true;
    logoutBtn.hidden = false;

    // Header mein user ka pehla naam dikhana
    const userName = localStorage.getItem("userName");
    if (userName) {
        const firstName = userName.split(" ")[0];
        logoutBtn.textContent = "Logout (" + firstName + ")";
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();

        function finish() {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("homevistaWishlist");
            window.location.href = "login.html";
        }

        // Pehle server ka session band karo, phir page chhodo
        fetch("/api/auth/logout", { method: "POST" })
            .then(finish)
            .catch(finish);
    });
}