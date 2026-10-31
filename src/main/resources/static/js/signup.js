// ================= SIGNUP =================

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (event) {

    // Form ko refresh hone se rokna
    event.preventDefault();

    // Values lena
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const terms = document.getElementById("terms").checked;

    // Empty fields check
    if (name === "" || email === "" || phone === "" || password === "") {
        hvAlert("Please fill in all the fields.", { title: "Missing details", kind: "warn" });
        return;
    }

    // Terms check
    if (!terms) {
     hvAlert("Please agree to the Terms & Conditions to continue.", { title: "Terms required", kind: "error" });
        return;
    }

    // Backend ko data bhejna
    fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                                hvAlert(result.data.message || "Could not create your account. Please try again.", { title: "Sign up failed", kind: "error" });
                return;
            }
                       hvAlert("Your account is ready. Please log in to continue.", {
                title: "Account created!",
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


// ================= PASSWORD SHOW / HIDE =================

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';

    }

});