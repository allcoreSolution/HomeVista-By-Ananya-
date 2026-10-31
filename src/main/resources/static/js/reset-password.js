// ================= RESET PASSWORD =================

const resetForm = document.getElementById("resetForm");

resetForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const token = document.getElementById("resetCode").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (token === "" || newPassword === "" || confirmPassword === "") {
        hvAlert("Please fill in all the fields.", { title: "Missing details", kind: "warn" });
        return;
    }

    if (newPassword.length < 6) {
        hvAlert("Password must be at least 6 characters.", { title: "Password too short", kind: "warn" });
        return;
    }

    if (newPassword !== confirmPassword) {
        hvAlert("The two passwords do not match.", { title: "Passwords do not match", kind: "warn" });
        return;
    }

    fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                hvAlert(result.data.message || "We could not reset your password. Please try again.", { title: "Reset failed", kind: "error" });
                return;
            }
            hvAlert(result.data.message || "Your password has been updated.", {
                title: "Password changed",
                kind: "success",
                ok: "Go to Login"
            }).then(function () {
                window.location.href = "login.html";
            });
        })
        .catch(function () {
            hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
        });
});