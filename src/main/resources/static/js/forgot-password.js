// ================= FORGOT PASSWORD =================

const forgotForm = document.getElementById("forgotForm");

forgotForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();

    if (email === "" || !email.includes("@")) {
        alert("Please enter your registered email address.");
        return;
    }

    fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(function (res) {
            return res.json();
        })
                        .then(function (data) {
            alert(data.message);
            window.location.href = "reset-password.html";
        })
        .catch(function () {
                        hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
        });
});