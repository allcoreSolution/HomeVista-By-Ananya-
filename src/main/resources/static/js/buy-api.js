(function () {

    const grid = document.querySelector(".buy-property-grid");
    if (!grid) return;

    let searchBtn = document.querySelector(".buy-search-btn");
    const locationInput = document.querySelector(".buy-search input");
    const selects = document.querySelectorAll(".buy-search select");
    const typeSelect = selects[0];
    const budgetSelect = selects[1];
    const sortSelect = document.querySelector(".sort-select");

    const LAKH = 100000;
    const CRORE = 10000000;

    // Budget select ka option number -> kam se kam / zyada se zyada daam
    const BUDGETS = [
        {},                                 // Any Budget
        { max: 50 * LAKH },                 // Under 50 Lakh
        { min: 50 * LAKH, max: CRORE },     // 50 Lakh - 1 Crore
        { min: CRORE, max: 2 * CRORE },     // 1 Crore - 2 Crore
        { min: 2 * CRORE }                  // Above 2 Crore
    ];

    let apiMode = false;
    let current = [];

    const cityFromUrl = new URLSearchParams(window.location.search).get("location");

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function formatPrice(p) {
        if (p >= CRORE) return "₹" + Number((p / CRORE).toFixed(2)) + " Cr";
        if (p >= LAKH) return "₹" + Number((p / LAKH).toFixed(2)) + " Lakh";
        return "₹" + Number(p).toLocaleString("en-IN");
    }

    function cardHtml(p) {
        return `
        <div class="buy-property-card">
            <div class="property-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <span class="sale-tag">For Sale</span>
                <button class="property-heart">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
            <div class="property-content">
                <h3>${esc(p.title)}</h3>
                <p class="property-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(p.location)}
                </p>
                <div class="property-bottom">
                    <strong>${formatPrice(p.price)}</strong>
                    <a href="property-details.html?id=${p.id}&source=db">
                        View Details
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>`;
    }

    function sortList(list) {
        const sorted = list.slice();
        const mode = sortSelect ? sortSelect.selectedIndex : 0;

        if (mode === 1) sorted.sort(function (a, b) { return b.id - a.id; });          // Newest
        if (mode === 2) sorted.sort(function (a, b) { return a.price - b.price; });    // Low to High
        if (mode === 3) sorted.sort(function (a, b) { return b.price - a.price; });    // High to Low

        return sorted;
    }

    function render(list) {
        current = list.slice();
        const sorted = sortList(current);

        if (!sorted.length) {
            grid.innerHTML =
                '<p class="buy-no-result" style="grid-column:1/-1;text-align:center;margin-top:30px;font-size:18px;">' +
                'No properties found matching your search.</p>';
        } else {
            grid.innerHTML = sorted.map(cardHtml).join("");
        }

        // Hearts ka rang theek karne ke liye
        window.dispatchEvent(new Event("storage"));
    }

    function buildUrl() {
        const q = new URLSearchParams();
        q.set("type", "buy");

        const loc = locationInput.value.trim();
        if (loc) q.set("location", loc);

        if (typeSelect.selectedIndex > 0) {
            q.set("propertyType", typeSelect.value.trim().toLowerCase());
        }

        const budget = BUDGETS[budgetSelect.selectedIndex] || {};
        if (budget.min) q.set("minPrice", budget.min);
        if (budget.max) q.set("maxPrice", budget.max);

        return "/api/properties?" + q.toString();
    }

    function runSearch() {
        fetch(buildUrl())
            .then(function (res) {
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })
            .then(render)
            .catch(function (err) {
                console.error("Search nahi chali:", err);
            });
    }

    // Pehli baar: database mein buy properties hain to unhe dikhao,
    // nahi to purane cards waise hi rehne do
    fetch("/api/properties?type=buy")
        .then(function (res) {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        })
        .then(function (all) {

            if (!all.length) return;

            apiMode = true;

            // buy.js ka purana (card-text wala) search handler hatao
            const fresh = searchBtn.cloneNode(true);
            searchBtn.parentNode.replaceChild(fresh, searchBtn);
            searchBtn = fresh;
            searchBtn.addEventListener("click", runSearch);

            if (sortSelect) {
                sortSelect.addEventListener("change", function () { render(current); });
            }

            if (cityFromUrl) {
                locationInput.value = cityFromUrl;
                runSearch();
            } else {
                render(all);
            }
        })
        .catch(function (err) {
            console.error("Properties API se nahi aayi:", err);
        });

})();