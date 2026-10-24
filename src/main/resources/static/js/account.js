(function () {

    function esc(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function when(iso) {
        return iso ? String(iso).replace("T", " ").slice(0, 16) : "";
    }

    function say(id, text, ok) {
        const el = document.getElementById(id);
        el.textContent = text;
        el.className = "acc-msg " + (ok ? "ok" : "bad");
    }

    function toLogin() {
        window.location.href = "login.html";
    }

    async function load() {

        let res;
        try {
            res = await fetch("/api/account/profile", { credentials: "same-origin" });
        } catch (err) {
            document.getElementById("accHello").textContent = "Could not reach the server.";
            return;
        }

        if (res.status === 401) {
            localStorage.removeItem("isLoggedIn");
            toLogin();
            return;
        }

        const p = await res.json();

        document.getElementById("accHello").textContent = "Hello, " + p.name;
        document.getElementById("accName").value = p.name || "";
        document.getElementById("accEmail").value = p.email || "";
        document.getElementById("accPhone").value = p.phone || "";

        loadEnquiries();
    }

    async function loadEnquiries() {

        const box = document.getElementById("enqList");

        try {
            const res = await fetch("/api/account/enquiries", { credentials: "same-origin" });
            const list = res.ok ? await res.json() : [];

            if (!list.length) {
                box.innerHTML = '<li class="enq-empty">You have not sent any enquiry yet.</li>';
                return;
            }

            box.innerHTML = list.map(function (q) {
                return `<li>
                    <b>${esc(q.propertyTitle || "General enquiry")}</b>
                    <small>${esc(when(q.createdAt))}</small>
                    ${q.message ? "<p>" + esc(q.message) + "</p>" : ""}
                </li>`;
            }).join("");

        } catch (err) {
            box.innerHTML = '<li class="enq-empty">Could not load enquiries.</li>';
        }
    }

    document.getElementById("profileForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("accName").value.trim();
        const phone = document.getElementById("accPhone").value.trim();

        if (!name) {
            say("profileMsg", "Name is required.", false);
            return;
        }

        try {
            const res = await fetch("/api/account/profile", {
                method: "PUT",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, phone: phone })
            });

            if (res.status === 401) { toLogin(); return; }

            if (!res.ok) {
                say("profileMsg", "Could not save (status " + res.status + ").", false);
                return;
            }

            localStorage.setItem("userName", name);
            document.getElementById("accHello").textContent = "Hello, " + name;
            say("profileMsg", "Profile saved.", true);

        } catch (err) {
            say("profileMsg", "Could not reach the server.", false);
        }
    });

    document.getElementById("passForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const oldPass = document.getElementById("oldPass").value;
        const newPass = document.getElementById("newPass").value;
        const newPass2 = document.getElementById("newPass2").value;

        if (!oldPass || !newPass) {
            say("passMsg", "Please fill all the fields.", false);
            return;
        }
        if (newPass.length < 6) {
            say("passMsg", "New password must be at least 6 characters.", false);
            return;
        }
        if (newPass !== newPass2) {
            say("passMsg", "New passwords do not match.", false);
            return;
        }

        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass })
            });

            if (res.status === 401) {
                // Ya to login nahi hai, ya purana password galat hai
                let msg = "Current password is wrong.";
                try { const d = await res.json(); if (d.message) msg = d.message; } catch (e) { }
                if (msg === "Please login first") { toLogin(); return; }
                say("passMsg", msg, false);
                return;
            }

            if (!res.ok) {
                say("passMsg", "Could not change password (status " + res.status + ").", false);
                return;
            }

            document.getElementById("passForm").reset();
            say("passMsg", "Password changed.", true);

        } catch (err) {
            say("passMsg", "Could not reach the server.", false);
        }
    });

    load();

})();