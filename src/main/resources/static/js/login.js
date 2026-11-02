// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

// Button par loader dikhao / hatao
function setLoginBusy(btn, busy, label) {
    btn.disabled = busy;
    btn.classList.toggle("is-busy", busy);
    const text = btn.querySelector("span");
    if (text) text.textContent = busy ? label : "Login";
}

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

       if (email === "" || password === "") {

        hvAlert("Please enter your email and password.", { title: "Missing details", kind: "warn" });

        return;
    }

      const btn = loginForm.querySelector(".main-login-btn");
    setLoginBusy(btn, true, "Signing in...");

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
                hvAlert(result.data.message || "We could not log you in. Please check your email and password.", { title: "Login failed", kind: "error" });
                return;
            }
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", result.data.name);
            localStorage.setItem("userEmail", result.data.email);
                      // Agar wishlist ke liye login par bheja gaya tha, to wahin wapas bhejo
            const back = sessionStorage.getItem("afterLogin");
            sessionStorage.removeItem("afterLogin");

            const safe = back && back.startsWith("/") && !back.startsWith("//") && !back.startsWith("/\\");
                       setLoginBusy(btn, true, "Welcome back!");
            try { sessionStorage.setItem("hvFadeIn", "1"); } catch (e) { }
            document.body.classList.add("page-leaving");
            setTimeout(function () {
                window.location.href = safe ? back : "index.html";
            }, 450);
        })
                .catch(function () {
            setLoginBusy(btn, false);
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