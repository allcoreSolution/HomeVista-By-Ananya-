(function () {

   

    // Kaunsa page hai? Rent ya Commercial
    let grid = document.querySelector(".rent-grid");
    let type = "rent";

    if (!grid) {
        grid = document.querySelector(".commercial-grid");
        type = "commercial";
    }

    if (!grid) return;

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function money(p) {
        return "₹" + Number(p).toLocaleString("en-IN");
    }

    const HEART =
        '<button type="button" class="favorite-btn" aria-label="Add to wishlist">' +
        '<i class="fa-regular fa-heart"></i></button>';

    function rentCard(p) {
        return `
        <article class="rent-card">
            <div class="rent-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <span class="rent-badge">For Rent</span>
                ${HEART}
            </div>
            <div class="rent-card-info">
                <h3>${esc(p.title)}</h3>
                <p class="rent-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(p.location)}
                </p>
                <div class="rent-price">
                    ${money(p.price)} <span>/ month</span>
                </div>
                <div class="rent-features">
                    <span><i class="fa-solid fa-bed"></i> ${esc(p.bhk || "—")}</span>
                    <span><i class="fa-solid fa-bath"></i> ${esc(p.bath || "—")}</span>
                    <span><i class="fa-solid fa-ruler-combined"></i> ${esc(p.area || "—")} sq.ft</span>
                </div>
                <a href="property-details.html?id=${p.id}&source=db" class="rent-details">
                    View Details
                </a>
            </div>
        </article>`;
    }

    function commercialCard(p) {
        return `
        <article class="commercial-card">
            <div class="commercial-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <span class="commercial-badge">For Rent</span>
                ${HEART}
            </div>
            <div class="commercial-info">
                <h3>${esc(p.title)}</h3>
                <p class="commercial-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(p.location)}
                </p>
                <div class="commercial-price">
                    ${money(p.price)} <small>/ month</small>
                </div>
                <div class="commercial-meta">
                    <span><i class="fa-solid fa-ruler-combined"></i> ${esc(p.area || "—")} sq.ft</span>
                    <span><i class="fa-solid fa-building"></i> ${esc(p.bhk || "—")}</span>
                </div>
                <a href="property-details.html?id=${p.id}&source=db" class="commercial-details">
                    View Details
                </a>
            </div>
        </article>`;
    }

    fetch("/api/properties?type=" + type)
        .then(function (res) { return res.json(); })
        .then(function (list) {

            if (!list.length) return;

            grid.innerHTML = list
                .map(type === "rent" ? rentCard : commercialCard)
                .join("");

            // Hearts ka rang theek karne ke liye
            window.dispatchEvent(new Event("storage"));
        })
        .catch(function (err) {
            console.error("Properties API se nahi aayi:", err);
        });

})();