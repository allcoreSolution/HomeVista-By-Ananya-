// ================= RESET PASSWORD =================

const resetForm = document.getElementById("resetForm");

resetForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const token = document.getElementById("resetCode").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (token === "" || newPassword === "" || confirmPassword === "") {
        alert("Please fill all the fields.");
        return;
    }

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
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
            alert(result.data.message);
            if (result.ok) {
                window.location.href = "login.html";
            }
        })
        .catch(function () {
            alert("Server se connect nahi ho paya.");
        });
});