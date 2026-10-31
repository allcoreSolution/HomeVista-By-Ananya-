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
                                hvAlert(result.data.message || "Could not create your account. Please try again.", { title: "Sign up failed", kind: "error" });
                return;
            }
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", result.data.name);
            localStorage.setItem("userEmail", result.data.email);
                      // Agar wishlist ke liye login par bheja gaya tha, to wahin wapas bhejo
            const back = sessionStorage.getItem("afterLogin");
            sessionStorage.removeItem("afterLogin");

            const safe = back && back.startsWith("/") && !back.startsWith("//") && !back.startsWith("/\\");
            window.location.href = safe ? back : "index.html";
        })
        .catch(function () {
                       hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
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