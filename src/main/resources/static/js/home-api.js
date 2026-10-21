(function () {

    const container = document.querySelector(".property-container");
    if (!container) return;

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function price(p, type) {
        let text;
        if (p >= 10000000) text = "₹" + Number((p / 10000000).toFixed(2)) + " Crore";
        else if (p >= 100000) text = "₹" + Number((p / 100000).toFixed(2)) + " Lakh";
        else text = "₹" + Number(p).toLocaleString("en-IN");

        return type === "buy" ? text : text + " / month";
    }

    function tagOf(type) {
        if (type === "rent") return { css: "rent", icon: "fa-house", label: "For Rent" };
        if (type === "commercial") return { css: "commercial", icon: "fa-building", label: "Commercial" };
        return { css: "sale", icon: "fa-house", label: "For Sale" };
    }

    function cardHtml(p) {
        const tag = tagOf(p.type);

        return `
        <a href="property-details.html?id=${p.id}&source=db" class="property-card">
            <div class="property-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <span class="property-tag ${tag.css}">
                    <i class="fa-solid ${tag.icon}"></i>
                    ${tag.label}
                </span>
                <button class="favorite-btn">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
            <div class="property-info">
                <h3>${esc(p.title)}</h3>
                <p class="property-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(p.location)}
                </p>
                <strong class="price">${price(p.price, p.type)}</strong>
                <div class="property-details">
                    <span><i class="fa-solid fa-bed"></i> ${esc(p.bhk || "—")}</span>
                    <span><i class="fa-solid fa-bath"></i> ${esc(p.bath || "—")}</span>
                    <span><i class="fa-solid fa-ruler-combined"></i> ${esc(p.area || "—")} Sq.ft</span>
                </div>
            </div>
        </a>`;
    }

    fetch("/api/properties/featured")
        .then(function (res) { return res.json(); })
        .then(function (list) {

            if (!list.length) return;

            container.innerHTML = list.map(cardHtml).join("");

            // Hearts ka rang theek karne ke liye
            window.dispatchEvent(new Event("storage"));
        })
        .catch(function (err) {
            console.error("Featured properties nahi aayi:", err);
        });

})();