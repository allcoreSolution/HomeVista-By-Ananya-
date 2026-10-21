// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

       if (email === "" || password === "") {

        alert("Please enter email and password.");

        return;
    }

       fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                alert(result.data.message);
                return;
            }
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", result.data.name);
            localStorage.setItem("userEmail", result.data.email);
            window.location.href = "index.html";
        })
        .catch(function () {
            alert("Server se connect nahi ho paya.");
        });
});


// ================= SHOW / HIDE PASSWORD =================

const passwordToggle = document.getElementById("passwordToggle");
const passwordInput = document.getElementById("password");

passwordToggle.addEventListener("click", function() {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        passwordToggle.innerHTML =
            '<i class="fa-regular fa-eye"></i>';

    } else {

        passwordInput.type = "password";

        passwordToggle.innerHTML =
            '<i class="fa-regular fa-eye-slash"></i>';

    }

});