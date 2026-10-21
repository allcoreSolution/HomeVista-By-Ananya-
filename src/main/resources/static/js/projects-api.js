(function () {

    const grid = document.querySelector(".projects-grid");
    if (!grid) return;

    const buttons = document.querySelectorAll(".project-filters button");
    let projects = [];

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function price(p) {
        if (p >= 10000000) return "₹" + Number((p / 10000000).toFixed(2)) + " Crore";
        if (p >= 100000) return "₹" + Number((p / 100000).toFixed(2)) + " Lakh";
        return "₹" + Number(p).toLocaleString("en-IN");
    }

    function cardHtml(p) {
        return `
        <article class="project-card">
            <div class="project-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.name)}">
                <span class="project-status">${esc(p.status)}</span>
            </div>
            <div class="project-info">
                <h3>${esc(p.name)}</h3>
                <p class="project-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(p.location)}
                </p>
                <div class="project-price">
                    ${price(p.startingPrice)} <small>onwards</small>
                </div>
                <div class="project-meta">
                    <span><i class="fa-solid fa-building"></i> ${esc(p.category)}</span>
                    <span><i class="fa-solid fa-bed"></i> ${esc(p.bhkRange)}</span>
                </div>
                <a href="contact.html" class="project-details">
                    Enquire Now
                </a>
            </div>
        </article>`;
    }

    function render(list) {
        if (!list.length) {
            grid.innerHTML =
                '<p style="grid-column:1/-1;text-align:center;color:#64748b;">No projects found.</p>';
            return;
        }
        grid.innerHTML = list.map(cardHtml).join("");
    }

    const filters = {
        "All Projects": function () { return true; },
        "Residential": function (p) { return /apartment|villa|residen/i.test(p.category || ""); },
        "Luxury": function (p) { return /premium|luxury/i.test(p.status || ""); },
        "Ready to Move": function (p) { return /ready/i.test(p.status || ""); }
    };

    buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {

            buttons.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");

            // Database se data na aaya ho to purane cards waise hi rehne do
            if (!projects.length) return;

            const test = filters[btn.textContent.trim()] || filters["All Projects"];
            render(projects.filter(test));
        });
    });

    fetch("/api/projects")
        .then(function (res) { return res.json(); })
        .then(function (list) {
            if (!list.length) return;
            projects = list;
            render(list);
        })
        .catch(function (err) {
            console.error("Projects API se nahi aaye:", err);
        });

})();