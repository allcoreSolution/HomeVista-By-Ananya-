(function () {

    let adminKey = "";

    const keyInput = document.getElementById("adminKey");
    const loadBtn = document.getElementById("loadBtn");
    const statusBox = document.getElementById("status");
    const propsBody = document.getElementById("propsBody");
    const inqBody = document.getElementById("inqBody");

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function say(text, ok) {
        statusBox.textContent = text;
        statusBox.className = ok ? "ok" : "bad";
    }

    function money(p) {
        return "₹" + Number(p).toLocaleString("en-IN");
    }

    function when(iso) {
        return iso ? String(iso).replace("T", " ").slice(0, 16) : "";
    }

    function api(url, options) {
        options = options || {};
        options.headers = Object.assign({ "X-Admin-Key": adminKey }, options.headers || {});
        return fetch(url, options);
    }

    async function loadInquiries() {

        const res = await api("/api/inquiries");

        if (res.status === 403) {
            say("Wrong admin key.", false);
            inqBody.innerHTML = '<tr><td colspan="5" class="empty">Locked.</td></tr>';
            return false;
        }

        const list = await res.json();

        if (!list.length) {
            inqBody.innerHTML = '<tr><td colspan="5" class="empty">No enquiries yet.</td></tr>';
            return true;
        }

        inqBody.innerHTML = list.map(function (q) {
            return `
            <tr>
                <td>${esc(when(q.createdAt))}</td>
                <td>${esc(q.name)}</td>
                <td>${esc(q.phone)}</td>
                <td>${esc(q.propertyTitle)}${q.propertyId ? " (id " + esc(q.propertyId) + ")" : ""}</td>
                <td>${esc(q.message)}</td>
            </tr>`;
        }).join("");

        return true;
    }

    async function loadProperties() {

        const res = await fetch("/api/properties");
        const list = await res.json();

        if (!list.length) {
            propsBody.innerHTML = '<tr><td colspan="6" class="empty">No properties.</td></tr>';
            return;
        }

        propsBody.innerHTML = list.map(function (p) {
            return `
            <tr>
                <td>${esc(p.id)}</td>
                <td>${esc(p.title)}<br><small style="color:#64748b">${esc(p.location)}</small></td>
                <td>${esc(p.type)}</td>
                <td>${money(p.price)}</td>
                <td><input type="checkbox" class="feat-box" data-id="${esc(p.id)}" ${p.featured ? "checked" : ""}></td>
                <td><button type="button" class="danger del-btn" data-id="${esc(p.id)}">Delete</button></td>
            </tr>`;
        }).join("");
    }

    loadBtn.addEventListener("click", async function () {

        adminKey = keyInput.value;

        if (adminKey === "") {
            say("Please enter the admin key.", false);
            return;
        }

        say("Loading...", true);

        try {
            const ok = await loadInquiries();
            if (!ok) return;
            await loadProperties();
            say("Loaded.", true);
        } catch (err) {
            say("Could not reach the server.", false);
        }
    });

    // Delete button aur Featured checkbox
    propsBody.addEventListener("click", async function (event) {

        const btn = event.target.closest(".del-btn");
        if (!btn) return;

        const id = btn.dataset.id;

        if (!confirm("Delete property " + id + "? This cannot be undone.")) return;

        const res = await api("/api/properties/" + id, { method: "DELETE" });

        if (res.ok) {
            say("Property " + id + " deleted.", true);
            loadProperties();
        } else {
            say("Could not delete (status " + res.status + ").", false);
        }
    });

    propsBody.addEventListener("change", async function (event) {

        const box = event.target.closest(".feat-box");
        if (!box) return;

        const id = box.dataset.id;

        try {
            const current = await (await fetch("/api/properties/" + id)).json();
            current.featured = box.checked;

            const res = await api("/api/properties/" + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(current)
            });

            if (res.ok) {
                say("Property " + id + (box.checked ? " is now featured." : " is no longer featured."), true);
            } else {
                box.checked = !box.checked;
                say("Could not update (status " + res.status + ").", false);
            }
        } catch (err) {
            box.checked = !box.checked;
            say("Could not reach the server.", false);
        }
    });

})();