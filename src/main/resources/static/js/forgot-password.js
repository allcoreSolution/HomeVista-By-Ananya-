// ================= FORGOT PASSWORD =================

const forgotForm = document.getElementById("forgotForm");

forgotForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();

    if (email === "" || !email.includes("@")) {
        hvAlert("Please enter your registered email address.", { title: "Email required", kind: "warn" });
        return;
    }

    fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                hvAlert(result.data.message || "We could not send a reset code. Please try again.", { title: "Could not send", kind: "error" });
                return;
            }
            hvAlert(result.data.message || "If that email is registered, a reset link is on its way.", {
                title: "Check your email",
                kind: "success",
                ok: "Enter reset code"
            }).then(function () {
                window.location.href = "reset-password.html";
            });
        })
        .catch(function () {
            hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
        });
});