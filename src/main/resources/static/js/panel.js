(function () {
    let chart = null;
    let allProps = [];
    let enquiries = [];
    let messages = [];
    let users = [];
    let editingId = null;
    let toastTimer = null;

    const gate = document.getElementById("gate");
    const gateForm = document.getElementById("gateForm");
        const gateKey = document.getElementById("gateKey");
    const gateUser = document.getElementById("gateUser");
    const gateMsg = document.getElementById("gateMsg");
    const app = document.getElementById("app");
    const gateBtn = document.getElementById("gateBtn");
    const gateBtnLabel = document.getElementById("gateBtnLabel");

    // Message ka rang: info = neela, ok = hara, error = laal
    function setGateMsg(text, kind) {
        gateMsg.textContent = text || "";
        gateMsg.className = "gate-msg" + (kind ? " is-" + kind : "");
    }

    // Button par spinner dikhao / hatao
    function setGateBusy(busy, label) {
        gateBtn.disabled = busy;
        gateBtn.classList.toggle("is-busy", busy);
        gateBtnLabel.textContent = busy ? label : "Login";
    }
    const propRows = document.getElementById("propRows");
    const propSearch = document.getElementById("propSearch");
    const propFilter = document.getElementById("propFilter");
    const propModal = document.getElementById("propModal");
    const propForm = document.getElementById("propForm");
    const propMsg = document.getElementById("propMsg");

    // ---------- Chhote helpers ----------

    // Attribute ke andar bhi safe rakhne ke liye quotes bhi badalte hain
    function esc(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function money(p) {
        return "₹" + Number(p).toLocaleString("en-IN");
    }

    function when(iso) {
        return iso ? String(iso).replace("T", " ").slice(0, 16) : "";
    }

    function setText(id, value) {
        document.getElementById(id).textContent = value;
    }

        function api(url, options) {
        options = options || {};
        options.credentials = "same-origin";
               options.headers = Object.assign({}, options.headers || {});
        return fetch(url, options);
    }

    function toast(text, ok) {
        const t = document.getElementById("toast");
        t.textContent = text;
        t.className = "toast" + (ok ? "" : " bad");
        t.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.hidden = true; }, 3000);
    }

    // Toot hui image ki jagah halki tasveer
    const NO_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="104" height="80"><rect width="104" height="80" fill="#e2e8f0"/></svg>'
    );

    document.addEventListener("error", function (event) {
        const img = event.target;
        if (img instanceof HTMLImageElement && !img.dataset.fallback) {
            img.dataset.fallback = "1";
            img.src = NO_IMG;
        }
    }, true);

    // ---------- Lock screen ----------
        function showGate(message, invalid) {
        app.hidden = true;
        gate.classList.remove("gate-leaving");
        gate.hidden = false;
        setGateMsg(message, "error");
        setGateBusy(false);
        gateKey.value = "";
        gateKey.classList.toggle("invalid", !!invalid);
        gateUser.classList.toggle("invalid", !!invalid);
        gateUser.focus();
    }

    // Dobara type karna shuru kare to laal nishan hata do
    function clearInvalid() {
        gateKey.classList.remove("invalid");
        gateUser.classList.remove("invalid");
        setGateMsg("");
    }
    gateKey.addEventListener("input", clearInvalid);
        gateUser.addEventListener("input", clearInvalid);

      // Forgot password: sirf batata hai ki password kahan badalna hai
    document.getElementById("gateForgot").addEventListener("click", function () {
        const help = document.getElementById("gateHelp");
        help.hidden = !help.hidden;
    });

    // Login page ki stats bar: asli ginti
    (async function () {
        try {
            const res = await fetch("/api/public/summary");
            if (!res.ok) return;
            const s = await res.json();
            setText("gsProps", Number(s.properties || 0).toLocaleString("en-IN"));
            setText("gsUsers", Number(s.users || 0).toLocaleString("en-IN"));
            setText("gsCities", Number(s.cities || 0).toLocaleString("en-IN"));
        } catch (err) { }
    })();

    // Aankh par click: password dikhao / chhupao
    document.getElementById("gateEye").addEventListener("click", function () {
        const show = gateKey.type === "password";
        gateKey.type = show ? "text" : "password";
              this.querySelector("i").className = show ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"; 
    });

    function fetchStats() {
        return fetch("/api/admin/stats", { credentials: "same-origin" });
    }

    // Session se khole (page refresh par bina dobara login ke)
    async function unlock(animate) {
        let res;

        try {
            res = await fetchStats();
        } catch (err) {
            showGate("Could not reach the server.");
            return false;
        }

        if (res.status === 403) {
            showGate("");
            return false;
        }

        if (!res.ok) {
            showGate("Server error (" + res.status + ").");
            return false;
        }

       if (animate) {
            // Smooth: gate fade-out hota hai, dashboard fade-in
            gate.classList.add("gate-leaving");
            app.hidden = false;
            app.classList.add("hv-enter");
            setTimeout(function () {
                gate.hidden = true;
                gate.classList.remove("gate-leaving");
                app.classList.remove("hv-enter");
                setGateMsg("");
                setGateBusy(false);
            }, 500);
        } else {
            gate.hidden = true;
            app.hidden = false;
        }

                renderStats(await res.json());
        loadProperties();
        loadLists();
        loadMostVisited();
        return true;
    }

           async function loadMostVisited() {

        const box = document.getElementById("mostVisited");
        if (!box) return;

        try {
            const res = await fetch("/api/properties/most-visited");
            const list = res.ok ? await res.json() : [];
            const visited = list.filter(function (p) { return (p.views || 0) > 0; });
            renderVisitedChart(visited);

            if (!visited.length) {
                box.innerHTML = '<li class="visited-empty">No visits yet.</li>';
                return;
            }

            box.innerHTML = visited.map(function (p, i) {
                return `
                <li>
                    <span class="rank">${i + 1}</span>
                    <img src="${esc(p.imageUrl)}" alt="">
                    <div class="info"><b>${esc(p.title)}</b><small>${esc(p.location)}</small></div>
                    <span class="views"><i class="fa-regular fa-eye"></i>${esc(p.views)}</span>
                </li>`;
            }).join("");

        } catch (err) {
            box.innerHTML = '<li class="visited-empty">Could not load.</li>';
        }
    }

    async function refreshStats() {
        try {
            const res = await fetchStats();
            if (res.ok) renderStats(await res.json());
        } catch (err) { }
        loadMostVisited();
    }

    gateForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!gateUser.value.trim() || gateKey.value === "") {
            setGateMsg("Please enter username and password.", "error");
            return;
        }

           setGateMsg("Checking...", "info");
           setGateBusy(true, "Checking...");
        let res;
        try {
            res = await fetch("/api/admin-auth/login", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({
                    username: gateUser.value.trim(),
                    password: gateKey.value,
                    remember: document.getElementById("gateRemember").checked ? "true" : "false"
                })
            });
        } catch (err) {
            showGate("Could not reach the server.");
            return;
        }

        if (res.status === 401) {
            showGate("Wrong username or password.", true);
            return;
        }

        if (res.status === 429) {
            showGate("Too many wrong attempts. Try again in a few minutes.");
            return;
        }

        if (!res.ok) {
            showGate("Server error (" + res.status + ").");
            return;
        }

          gateKey.value = "";
           setGateMsg("Login successful! Opening dashboard...", "ok");
           setGateBusy(true, "Opening...");
           await new Promise(function (r) { setTimeout(r, 350); });
           await unlock(true);
    });

       // Logout: server se admin session hatao, phir lock screen
    async function lockPanel() {
        try {
            await fetch("/api/admin-auth/logout", { method: "POST", credentials: "same-origin" });
               } catch (err) { }
        showGate("");
    }

        document.getElementById("profileBtn").addEventListener("click", async function () {
        const yes = await hvConfirm("You will need to log in again to open the panel.",
            { title: "Lock the admin panel?", ok: "Lock", kind: "warn" });
        if (yes) lockPanel();
    });
    // ---------- Dashboard ----------

         const anaCharts = {};

    function drawBar(key, canvasId, labels, datasets, horizontal) {
        const canvas = document.getElementById(canvasId);
        if (!window.Chart || !canvas) return;
        if (anaCharts[key]) anaCharts[key].destroy();
        const axis = horizontal ? "x" : "y";
        anaCharts[key] = new Chart(canvas, {
            type: "bar",
            data: { labels: labels, datasets: datasets },
            options: {
                indexAxis: horizontal ? "y" : "x",
                maintainAspectRatio: false,
                plugins: { legend: { display: datasets.length > 1 } },
                scales: { [axis]: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    }

    function shortTitle(t) {
        t = String(t || "");
        return t.length > 22 ? t.slice(0, 22) + "…" : t;
    }

    function renderAnalytics(s) {

        const wish = s.topWishlisted || [];
        document.getElementById("anaWishEmpty").hidden = wish.length > 0;
        drawBar("wish", "anaWish",
            wish.map(function (w) { return shortTitle(w.title); }),
            [{ label: "Saves", data: wish.map(function (w) { return w.count; }), backgroundColor: "#0d9488" }],
            true);

        const tr = s.trends || {};
        const keys = ["properties", "users", "enquiries", "messages"];
        function pick(field) {
            return keys.map(function (k) { return (tr[k] && tr[k][field]) || 0; });
        }
        drawBar("trend", "anaTrend",
            ["Properties", "Users", "Enquiries", "Messages"],
            [
                { label: "Last month", data: pick("lastMonth"), backgroundColor: "#cbd5e1" },
                { label: "This month", data: pick("thisMonth"), backgroundColor: "#1261d8" }
            ],
            false);
    }

    function renderVisitedChart(list) {
        document.getElementById("anaVisitEmpty").hidden = list.length > 0;
        drawBar("visit", "anaVisit",
            list.map(function (p) { return shortTitle(p.title); }),
            [{ label: "Views", data: list.map(function (p) { return p.views || 0; }), backgroundColor: "#f59e0b" }],
            true);
    }

        function renderTrend(id, t) {

        const el = document.getElementById(id);
        const badge = document.getElementById(id.replace("trend", "badge"));
        if (!el) return;

        el.className = "trend";
        if (badge) badge.className = "badge-pct flat";

        if (!t) {
            el.textContent = "";
            if (badge) badge.textContent = "";
            return;
        }

        const now = t.thisMonth || 0;
        const prev = t.lastMonth || 0;

        if (now > 0) {
            el.classList.add("up");
            el.textContent = "+" + now + " new this month";
        } else {
            el.textContent = "No new this month";
        }

        if (!badge) return;

        if (prev > 0) {
            const pct = Math.round(((now - prev) / prev) * 100);
            if (pct > 0) {
                badge.className = "badge-pct";
                badge.textContent = "↑ " + pct + "%";
            } else if (pct < 0) {
                badge.className = "badge-pct down";
                badge.textContent = "↓ " + Math.abs(pct) + "%";
            } else {
                badge.textContent = "0%";
            }
        } else if (now > 0) {
            badge.className = "badge-pct";
            badge.textContent = "New";
        } else {
            badge.textContent = "0%";
        }
    }

    function renderStats(s) {

        setText("statProps", s.properties);
        setText("statUsers", s.users);
        setText("statInq", s.enquiries);
        setText("statMsg", s.contactMessages);
               setText("statWish", s.wishlistSaves);

        const tr = s.trends || {};
        renderTrend("trendProps", tr.properties);
               renderTrend("trendUsers", tr.users);
        renderTrend("trendInq", tr.enquiries);
                      renderTrend("trendMsg", tr.messages);
        setText("trendWish", "All time");
        renderAnalytics(s);
        renderDonut(s.byType || {}, s.properties);
    }

    function renderDonut(byType, totalProps) {

        const buy = byType.buy || 0;
        const rent = byType.rent || 0;
        const commercial = byType.commercial || 0;
        const sum = buy + rent + commercial;

        setText("donutTotal", totalProps);

        const rows = [
            { name: "Buy", count: buy, color: "#1261d8" },
            { name: "Rent", count: rent, color: "#16a34a" },
            { name: "Commercial", count: commercial, color: "#f59e0b" }
        ];

        document.getElementById("legend").innerHTML = rows.map(function (r) {
            const pct = sum ? Math.round((r.count / sum) * 100) : 0;
            return `
            <li>
                <span class="dot" style="background:${r.color}"></span>
                <span class="name">${r.name}</span>
                <span class="cnt">${r.count}</span>
                <span class="pct">(${pct}%)</span>
            </li>`;
        }).join("");

        // Chart.js internet se aata hai, na aaye to chart chhod do
        const canvas = document.getElementById("typeChart");
        if (!window.Chart || !canvas) return;

        if (chart) chart.destroy();

        chart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: rows.map(function (r) { return r.name; }),
                datasets: [{
                    data: sum ? rows.map(function (r) { return r.count; }) : [1],
                    backgroundColor: sum ? rows.map(function (r) { return r.color; }) : ["#e2e8f0"],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: "68%",
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // ---------- Properties table ----------

    const TYPE_LABEL = { buy: "Buy", rent: "Rent", commercial: "Commercial" };

    function rowHtml(p) {

        const type = String(p.type || "").toLowerCase();
        const status = p.status || "Active";
        const statusClass = status.toLowerCase() === "active" ? "active" : "pending";

        return `
        <tr>
            <td>${esc(p.id)}</td>
            <td>
                <div class="prop-cell">
                    <img src="${esc(p.imageUrl)}" alt="">
                    <div><b>${esc(p.title)}</b><small>${esc(p.location)}</small></div>
                </div>
            </td>
            <td><span class="badge ${esc(type)}">${esc(TYPE_LABEL[type] || p.type)}</span></td>
            <td>${money(p.price)}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" class="feat-box" data-id="${esc(p.id)}" ${p.featured ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </td>
            <td><span class="chip ${statusClass}">${esc(status)}</span></td>
            <td>
                <button type="button" class="act edit" data-id="${esc(p.id)}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="act del" data-id="${esc(p.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        </tr>`;
    }

        function renderDistSide() {
        const empty = document.getElementById("distEmpty");
        const info = document.getElementById("distInfo");
        if (!empty || !info) return;

        const has = allProps.length > 0;
        empty.hidden = has;
        info.hidden = !has;

        if (has) {
            setText("distFeatured", allProps.filter(function (p) { return p.featured; }).length);
            setText("distPending", allProps.filter(function (p) { return String(p.status || "").toLowerCase() === "pending"; }).length);
        }
    }

    function renderProps() {

        renderDistSide();

        const q = propSearch.value.trim().toLowerCase();
        const t = propFilter.value;

        const list = allProps.filter(function (p) {

            if (t && String(p.type || "").toLowerCase() !== t) return false;

            if (q) {
                const hay = [p.id, p.title, p.location, p.type].join(" ").toLowerCase();
                if (!hay.includes(q)) return false;
            }

            return true;
        });

        if (!list.length) {
            propRows.innerHTML = '<tr><td colspan="7" class="empty">No properties found.</td></tr>';
            return;
        }

        propRows.innerHTML = list.map(rowHtml).join("");
    }

    async function loadProperties() {
        try {
            const res = await fetch("/api/properties");
            allProps = await res.json();
                       allProps.sort(function (a, b) { return a.id - b.id; });
            renderProps();
            renderActivity();
        } catch (err) {
            propRows.innerHTML = '<tr><td colspan="7" class="empty">Could not load properties.</td></tr>';
        }
    }

    function findProp(id) {
        return allProps.find(function (p) { return String(p.id) === String(id); });
    }

    propSearch.addEventListener("input", renderProps);
    propFilter.addEventListener("change", renderProps);

    // Featured toggle
    propRows.addEventListener("change", async function (event) {

        const box = event.target.closest(".feat-box");
        if (!box) return;

        const p = findProp(box.dataset.id);
        if (!p) return;

        const body = Object.assign({}, p, { featured: box.checked });

        try {
            const res = await api("/api/properties/" + p.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                p.featured = box.checked;
                toast(box.checked ? "Added to featured." : "Removed from featured.", true);
            } else {
                box.checked = !box.checked;
                toast("Could not update (status " + res.status + ").", false);
            }
        } catch (err) {
            box.checked = !box.checked;
            toast("Could not reach the server.", false);
        }
    });

    // Edit aur Delete buttons
    propRows.addEventListener("click", async function (event) {

        const edit = event.target.closest(".act.edit");
        if (edit) {
            const p = findProp(edit.dataset.id);
            if (p) openModal(p);
            return;
        }

        const del = event.target.closest(".act.del");
        if (!del) return;

        const p = findProp(del.dataset.id);
        if (!p) return;

                const yes = await hvConfirm('"' + p.title + '" will be removed permanently. This cannot be undone.',
            { title: "Delete property?", ok: "Delete", kind: "danger" });
        if (!yes) return;
        const res = await api("/api/properties/" + p.id, { method: "DELETE" });

        if (res.ok) {
            toast("Property deleted.", true);
            await loadProperties();
            refreshStats();
        } else {
            toast("Could not delete (status " + res.status + ").", false);
        }
    });

    // ---------- Enquiries, Messages, Users ----------

    function enquiryCells(q) {
        return {
            date: esc(when(q.createdAt)),
            name: esc(q.name),
            phone: esc(q.phone),
            property: esc(q.propertyTitle || "—"),
            message: esc(q.message || "")
        };
    }

    function renderLists() {

        // ----- Dashboard ke chhote cards (latest 5) -----

        const recentEnq = document.getElementById("recentEnq");
        recentEnq.innerHTML = enquiries.length
            ? enquiries.slice(0, 5).map(function (q) {
                const c = enquiryCells(q);
                return `<tr><td>${c.date}</td><td>${c.name}</td><td class="trunc">${c.property}</td><td class="trunc">${c.message}</td></tr>`;
            }).join("")
            : '<tr><td colspan="4" class="empty">No enquiries yet.</td></tr>';

        const recentMsg = document.getElementById("recentMsg");
        recentMsg.innerHTML = messages.length
            ? messages.slice(0, 5).map(function (m) {
                return `<tr><td>${esc(when(m.createdAt))}</td><td>${esc(m.fullName)}</td><td class="trunc">${esc(m.email)}</td><td class="trunc">${esc(m.subject)}</td></tr>`;
            }).join("")
            : '<tr><td colspan="4" class="empty">No messages yet.</td></tr>';

        const recentUsers = document.getElementById("recentUsers");
        recentUsers.innerHTML = users.length
            ? users.slice(0, 5).map(function (u) {
                return `<tr><td>${esc(u.id)}</td><td>${esc(u.name)}</td><td class="trunc">${esc(u.email)}</td><td>User</td></tr>`;
            }).join("")
            : '<tr><td colspan="4" class="empty">No users yet.</td></tr>';

        // ----- Poore pages -----
               renderEnquiryPage();
        renderMessagePage();
        renderUserPage();
        renderActivity();
    }
    function timeAgo(iso) {
        const t = new Date(iso).getTime();
        if (isNaN(t)) return "";
        const mins = Math.floor((Date.now() - t) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return mins + " min ago";
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + " hr ago";
        const days = Math.floor(hrs / 24);
        return days + (days === 1 ? " day ago" : " days ago");
    }

           const BELL_KEY = "hvBellSeen";
    let bellItems = [];

    function renderBell(items) {

        bellItems = items.slice(0, 6);

        let seen = "";
        try { seen = localStorage.getItem(BELL_KEY) || ""; } catch (e) { }

        const fresh = items.filter(function (i) { return String(i.at) > seen; }).length;

        const badge = document.getElementById("bellBadge");
        badge.textContent = fresh > 9 ? "9+" : fresh;
        badge.hidden = fresh === 0;

        const list = document.getElementById("bellList");
        list.innerHTML = bellItems.length
            ? bellItems.map(function (i) {
                return `<li class="${String(i.at) > seen ? "fresh" : ""}">
                    <span class="a-ico ${i.color}"><i class="fa-solid ${i.icon}"></i></span>
                    <span class="b-text">${esc(i.text)}</span>
                    <span class="b-time">${esc(timeAgo(i.at))}</span>
                </li>`;
            }).join("")
            : '<li class="bell-empty">No notifications yet.</li>';
    }

    function renderActivity() {

        const box = document.getElementById("activityList");
        if (!box) return;

        const items = [];

        allProps.forEach(function (p) {
            if (p.createdAt) items.push({ at: p.createdAt, icon: "fa-house-chimney", color: "blue", text: "New property added: " + p.title });
        });
        users.forEach(function (u) {
            if (u.createdAt) items.push({ at: u.createdAt, icon: "fa-user-plus", color: "green", text: "New user registered: " + u.name });
        });
        enquiries.forEach(function (q) {
            if (q.createdAt) items.push({ at: q.createdAt, icon: "fa-comments", color: "purple", text: "New enquiry from " + q.name + (q.propertyTitle ? " for " + q.propertyTitle : "") });
        });
        messages.forEach(function (m) {
            if (m.createdAt) items.push({ at: m.createdAt, icon: "fa-envelope", color: "orange", text: "New message from " + m.fullName + (m.subject ? ": " + m.subject : "") });
        });

                items.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
        renderBell(items);
        if (!items.length) {
            box.innerHTML = '<li class="activity-empty">No recent activity yet.</li>';
            return;
        }

        box.innerHTML = items.slice(0, 8).map(function (i) {
            return `
            <li>
                <span class="a-ico ${i.color}"><i class="fa-solid ${i.icon}"></i></span>
                <span class="a-text">${esc(i.text)}</span>
                <span class="a-time">${esc(timeAgo(i.at))}</span>
            </li>`;
        }).join("");
    }

    function renderEnquiryPage() {

        const q = document.getElementById("enqSearch").value.trim().toLowerCase();
        const from = document.getElementById("enqFrom").value;
        const to = document.getElementById("enqTo").value;
        const body = document.getElementById("enqRows");

        const list = enquiries.filter(function (e) {
            if (q && ![e.name, e.phone, e.propertyTitle, e.message].join(" ").toLowerCase().includes(q)) return false;
            if (from || to) {
                const d = String(e.createdAt || "").slice(0, 10);
                if (!d) return false;
                if (from && d < from) return false;
                if (to && d > to) return false;
            }
            return true;
        });

        body.innerHTML = list.length
            ? list.map(function (e) {
                const c = enquiryCells(e);
                return `<tr><td>${c.date}</td><td>${c.name}</td><td>${c.phone}</td><td>${c.property}</td><td class="msg-cell">${c.message}</td><td><button type="button" class="act del" data-id="${esc(e.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button></td></tr>`;
            }).join("")
            : '<tr><td colspan="6" class="empty">No enquiries found.</td></tr>';
    }

    function renderMessagePage() {

        const q = document.getElementById("msgSearch").value.trim().toLowerCase();
        const body = document.getElementById("msgRows");

        const list = messages.filter(function (m) {
            return !q || [m.fullName, m.email, m.phone, m.subject, m.message].join(" ").toLowerCase().includes(q);
        });

        body.innerHTML = list.length
            ? list.map(function (m) {
                return `<tr>
                    <td>${esc(when(m.createdAt))}</td>
                    <td>${esc(m.fullName)}</td>
                    <td>${esc(m.email)}<br><small style="color:#64748b">${esc(m.phone)}</small></td>
                    <td>${esc(m.subject)}</td>
                    <td class="msg-cell">${esc(m.message)}</td>
                </tr>`;
            }).join("")
            : '<tr><td colspan="5" class="empty">No messages found.</td></tr>';
    }

    function renderUserPage() {

        const q = document.getElementById("userSearch").value.trim().toLowerCase();
        const body = document.getElementById("userRows");

        const list = users.filter(function (u) {
            return !q || [u.id, u.name, u.email, u.phone].join(" ").toLowerCase().includes(q);
        });

        body.innerHTML = list.length
            ? list.map(function (u) {
                return `<tr><td>${esc(u.id)}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>User</td>
                    <td>
                        <button type="button" class="act edit" data-id="${esc(u.id)}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="act del" data-id="${esc(u.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
                    </td></tr>`;
            }).join("")
            : '<tr><td colspan="6" class="empty">No users found.</td></tr>';
    }

    async function loadLists() {

        try {
            const results = await Promise.all([
                api("/api/inquiries"),
                api("/api/admin/contact-messages"),
                api("/api/admin/users")
            ]);

            enquiries = results[0].ok ? await results[0].json() : [];
            messages = results[1].ok ? await results[1].json() : [];
            users = results[2].ok ? await results[2].json() : [];

        } catch (err) { }

        renderLists();
    }

    document.getElementById("enqSearch").addEventListener("input", renderEnquiryPage);
    document.getElementById("msgSearch").addEventListener("input", renderMessagePage);
    document.getElementById("userSearch").addEventListener("input", renderUserPage);

    // ---------- Enquiries: date filter + delete ----------

    function isoDate(d) {
        return d.getFullYear() + "-"
            + String(d.getMonth() + 1).padStart(2, "0") + "-"
            + String(d.getDate()).padStart(2, "0");
    }

    ["enqFrom", "enqTo"].forEach(function (id) {
        document.getElementById(id).addEventListener("change", function () {
            document.getElementById("enqQuick").value = "";
            renderEnquiryPage();
        });
    });

    document.getElementById("enqQuick").addEventListener("change", function () {
        const days = Number(this.value);
        if (!days) { document.getElementById("enqFrom").value = ""; }
        else {
            const d = new Date();
            d.setDate(d.getDate() - days + 1);
            document.getElementById("enqFrom").value = isoDate(d);
        }
        document.getElementById("enqTo").value = isoDate(new Date());
        if (!days) document.getElementById("enqTo").value = "";
        renderEnquiryPage();
    });

    document.getElementById("enqDateClear").addEventListener("click", function () {
        document.getElementById("enqFrom").value = "";
        document.getElementById("enqTo").value = "";
        document.getElementById("enqQuick").value = "";
        renderEnquiryPage();
    });

    document.getElementById("enqRows").addEventListener("click", async function (event) {

        const del = event.target.closest(".act.del");
        if (!del) return;

        const e = enquiries.find(function (x) { return String(x.id) === del.dataset.id; });
        if (!e) return;

                const yes = await hvConfirm('The enquiry from "' + e.name + '" will be removed permanently. This cannot be undone.',
            { title: "Delete enquiry?", ok: "Delete", kind: "danger" });
        if (!yes) return;

        const res = await api("/api/admin/inquiries/" + e.id, { method: "DELETE" });

        if (res.ok) {
            toast("Enquiry deleted.", true);
            await loadLists();
            refreshStats();
        } else {
            toast("Could not delete (status " + res.status + ").", false);
        }
    });

    // ---------- Users: edit + delete ----------

    const userModal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");
    const userMsg = document.getElementById("userMsg");
    let editingUser = null;

    function closeUserModal() {
        userModal.hidden = true;
        editingUser = null;
    }

    document.getElementById("userModalClose").addEventListener("click", closeUserModal);
    document.getElementById("userCancel").addEventListener("click", closeUserModal);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !userModal.hidden) closeUserModal();
    });

    document.getElementById("userRows").addEventListener("click", async function (event) {

        const editBtn = event.target.closest(".act.edit");
        const delBtn = event.target.closest(".act.del");
        const btn = editBtn || delBtn;
        if (!btn) return;

        const u = users.find(function (x) { return String(x.id) === btn.dataset.id; });
        if (!u) return;

        if (editBtn) {
            editingUser = u;
            document.getElementById("uName").value = u.name || "";
            document.getElementById("uPhone").value = u.phone || "";
            userMsg.textContent = "";
            userModal.hidden = false;
            return;
        }
                 const yes = await hvConfirm('"' + u.name + '" (' + u.email + ') will be removed permanently, along with their wishlist saves. This cannot be undone.',
                { title: "Delete user?", ok: "Delete", kind: "danger" });
            if (!yes) return;

            const res = await api("/api/admin/users/" + u.id, { method: "DELETE" });

            if (res.ok) {
                toast("User deleted.", true);
                await loadLists();
                refreshStats();
            } else {
                toast("Could not delete (status " + res.status + ").", false);
            }
    });

    userForm.addEventListener("submit", async function (event) {

        event.preventDefault();
        if (!editingUser) return;

        const name = val("uName");
        const phone = val("uPhone");

        if (!name) { userMsg.textContent = "Please enter a name."; return; }
        if (!/^[0-9+\-\s]{7,15}$/.test(phone)) { userMsg.textContent = "Please enter a valid phone number."; return; }

        userMsg.textContent = "Saving...";

        try {
            const res = await api("/api/admin/users/" + editingUser.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, phone: phone })
            });

            const data = await res.json().catch(function () { return {}; });

            if (res.ok) {
                closeUserModal();
                toast("User updated.", true);
                await loadLists();
            } else {
                userMsg.textContent = data.message || "Could not update (status " + res.status + ").";
            }
        } catch (err) {
            userMsg.textContent = "Could not reach the server.";
        }
    });

    // ---------- Add / Edit popup ----------

    function val(id) {
        return document.getElementById(id).value.trim();
    }

    function setVal(id, value) {
        document.getElementById(id).value = value == null ? "" : value;
    }

    function openModal(p) {

        editingId = p ? p.id : null;

        document.getElementById("propModalTitle").textContent = p ? "Edit Property" : "Add Property";

        setVal("fTitle", p && p.title);
        setVal("fLocation", p && p.location);
        setVal("fType", p ? String(p.type || "buy").toLowerCase() : "buy");
        setVal("fPrice", p && p.price);
        setVal("fStatus", p ? (p.status || "Active") : "Active");
        setVal("fImage", p && p.imageUrl);
        setVal("fBhk", p && p.bhk);
        setVal("fBath", p && p.bath);
        setVal("fArea", p && p.area);
        setVal("fFurnished", p && p.furnished);
        setVal("fDesc", p && p.description);
        document.getElementById("fFeatured").checked = !!(p && p.featured);

        propMsg.textContent = "";
        propModal.hidden = false;
    }

    function closeModal() {
        propModal.hidden = true;
    }

    document.getElementById("addPropBtn").addEventListener("click", function () { openModal(null); });
    document.getElementById("propModalClose").addEventListener("click", closeModal);
    document.getElementById("propCancel").addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !propModal.hidden) closeModal();
    });

    propForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = val("fTitle");
        const location = val("fLocation");
        const price = Number(document.getElementById("fPrice").value);

        if (!title || !location || !(price > 0)) {
            propMsg.textContent = "Please fill title, location and a valid price.";
            return;
        }

        // Edit mein purani property ke baaki fields (jaise propertyType) waise hi rehne do
        const base = editingId ? Object.assign({}, findProp(editingId)) : {};

        const body = Object.assign(base, {
            title: title,
            location: location,
            type: val("fType"),
            price: price,
            status: val("fStatus"),
            imageUrl: val("fImage"),
            bhk: val("fBhk"),
            bath: val("fBath"),
            area: val("fArea"),
            furnished: val("fFurnished"),
            description: val("fDesc"),
            featured: document.getElementById("fFeatured").checked
        });

        propMsg.textContent = "Saving...";

        try {
            const res = await api(editingId ? "/api/properties/" + editingId : "/api/properties", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                let message = "Could not save (status " + res.status + ").";
                try {
                    const data = await res.json();
                    if (data.message) message = data.message;
                } catch (err) { }
                propMsg.textContent = message;
                return;
            }

            const wasEdit = !!editingId;
            closeModal();
            toast(wasEdit ? "Property updated." : "Property added.", true);
            await loadProperties();
            refreshStats();

        } catch (err) {
            propMsg.textContent = "Could not reach the server.";
        }
    });

    // ---------- Date aur time ----------

    function tickClock() {
        const now = new Date();

        setText("dateMain", now.toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        }));

        setText("dateSub", now.toLocaleDateString("en-US", { weekday: "long" }) + ", " +
            now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }

    tickClock();
    setInterval(tickClock, 30000);

    // ---------- Sidebar aur Quick Actions ----------

        function toggleNav() {
        if (window.innerWidth <= 900) {
            document.body.classList.toggle("nav-open");
        } else {
            document.body.classList.toggle("nav-hidden");
        }
    }

    document.getElementById("menuBtn").addEventListener("click", toggleNav);
    document.getElementById("sideCollapse").addEventListener("click", toggleNav);
    function showView(name) {

        document.querySelectorAll(".nav-item").forEach(function (b) {
            b.classList.toggle("active", b.dataset.view === name);
        });

        // Properties dashboard par hi hai, wahan tak scroll kar do
        const page = name === "properties" ? "dashboard" : name;

        document.querySelectorAll(".view").forEach(function (v) {
            v.hidden = v.id !== "view-" + page;
        });

        // Analytics aur Settings agle steps mein bante hain
        const target = document.getElementById("view-" + page);
        if (target && !target.innerHTML.trim()) {
            target.innerHTML =
                '<div class="card soon"><i class="fa-regular fa-clock"></i>' +
                "<h3>Coming in the next step</h3></div>";
        }

        if (name === "properties") {
            document.getElementById("propsCard").scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.scrollTo(0, 0);
        }

        document.body.classList.remove("nav-open");
    }

    document.querySelectorAll(".nav-item").forEach(function (b) {
        b.addEventListener("click", function () {
            showView(b.dataset.view);
        });
    });

    // "View All" aur Quick Actions ke buttons
    document.addEventListener("click", function (event) {

        const go = event.target.closest("[data-go]");
        if (go) {
            showView(go.dataset.go);
            return;
        }

        const action = event.target.closest("[data-action]");
        if (action && action.dataset.action === "add") {
            openModal(null);
        }
    });


     // ---------- Bell ----------

    const bellBtn = document.getElementById("bellBtn");
    const bellMenu = document.getElementById("bellMenu");

    bellBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        bellMenu.hidden = !bellMenu.hidden;

        // Khulte hi "dekh liya" mark karo (list mein nayi wali abhi highlight rahengi)
        if (!bellMenu.hidden && bellItems.length) {
            try { localStorage.setItem(BELL_KEY, String(bellItems[0].at)); } catch (e) { }
            document.getElementById("bellBadge").hidden = true;
        }
    });

    document.addEventListener("click", function (event) {
        if (!bellMenu.hidden && !event.target.closest(".bell-wrap")) bellMenu.hidden = true;
    });

       // ---------- Global search (Ctrl+K) ----------

    const gInput = document.getElementById("globalSearch");
    const gMenu = document.getElementById("searchMenu");
    let gResults = [];

    function has(values, q) {
        return values.join(" ").toLowerCase().includes(q);
    }

    function runGlobalSearch() {

        const q = gInput.value.trim().toLowerCase();

        if (!q) {
            gMenu.hidden = true;
            gResults = [];
            return;
        }

        const found = [];

        allProps.filter(function (p) { return has([p.id, p.title, p.location, p.type], q); })
            .slice(0, 4).forEach(function (p) {
                found.push({ group: "Properties", icon: "fa-house-chimney", color: "blue", title: p.title, sub: p.location,
                    go: function () { propSearch.value = p.title; renderProps(); showView("properties"); } });
            });

        users.filter(function (u) { return has([u.id, u.name, u.email, u.phone], q); })
            .slice(0, 4).forEach(function (u) {
                found.push({ group: "Users", icon: "fa-user", color: "green", title: u.name, sub: u.email,
                    go: function () { document.getElementById("userSearch").value = u.name || ""; renderUserPage(); showView("users"); } });
            });

        enquiries.filter(function (e) { return has([e.name, e.phone, e.propertyTitle, e.message], q); })
            .slice(0, 4).forEach(function (e) {
                found.push({ group: "Enquiries", icon: "fa-comments", color: "purple", title: e.name, sub: e.propertyTitle || e.message || "",
                    go: function () { document.getElementById("enqSearch").value = e.name || ""; renderEnquiryPage(); showView("enquiries"); } });
            });

        messages.filter(function (m) { return has([m.fullName, m.email, m.subject, m.message], q); })
            .slice(0, 4).forEach(function (m) {
                found.push({ group: "Messages", icon: "fa-envelope", color: "orange", title: m.fullName, sub: m.subject || m.email || "",
                    go: function () { document.getElementById("msgSearch").value = m.fullName || ""; renderMessagePage(); showView("messages"); } });
            });

        gResults = found;

        if (!found.length) {
            gMenu.innerHTML = '<div class="s-empty">No results found.</div>';
            gMenu.hidden = false;
            return;
        }

        let html = "";
        let lastGroup = "";

        found.forEach(function (r, i) {
            if (r.group !== lastGroup) {
                html += '<div class="s-group">' + r.group + "</div>";
                lastGroup = r.group;
            }
            html += `<button type="button" class="s-item${i === 0 ? " on" : ""}" data-i="${i}">
                <span class="a-ico ${r.color}" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;font-size:13px"><i class="fa-solid ${r.icon}"></i></span>
                <span class="s-text"><b>${esc(r.title)}</b><small>${esc(r.sub)}</small></span>
            </button>`;
        });

        gMenu.innerHTML = html;
        gMenu.hidden = false;
    }

    function pickResult(i) {
        const r = gResults[i];
        if (!r) return;
        gMenu.hidden = true;
        gInput.value = "";
        gInput.blur();
        r.go();
    }

    gInput.addEventListener("input", runGlobalSearch);

    gInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            pickResult(0);
               }
    });

    // Esc kahin se bhi dabao, search list band ho jaye
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !gMenu.hidden) {
            gMenu.hidden = true;
            gInput.value = "";
            gInput.blur();
        }
    });

    gMenu.addEventListener("click", function (event) {
        const item = event.target.closest(".s-item");
        if (item) pickResult(Number(item.dataset.i));
    });

    document.addEventListener("click", function (event) {
        if (!gMenu.hidden && !event.target.closest(".search")) gMenu.hidden = true;
    });

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            if (app.hidden) return;
            gInput.focus();
            gInput.select();
        }
    });

     // ---------- Settings ----------

       document.getElementById("setLockBtn").addEventListener("click", lockPanel);
    document.getElementById("setBellBtn").addEventListener("click", function () {
        try { localStorage.removeItem(BELL_KEY); } catch (e) { }
        renderActivity();
        toast("Notifications reset.", true);
    });

    // ---------- Start ----------
        unlock();
})();