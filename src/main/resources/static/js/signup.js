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
        alert("Please fill all the fields.");
        return;
    }

    // Terms check
    if (!terms) {
        alert("Please agree to the Terms & Conditions.");
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
                alert(result.data.message);
                return;
            }
            alert("Account created successfully! Please login.");
            window.location.href = "login.html";
        })
        .catch(function () {
            alert("Server se connect nahi ho paya.");
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