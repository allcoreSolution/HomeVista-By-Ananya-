(function () {

    const KEY = "homevistaWishlist";

    const HEARTS = ".favorite-btn, .property-heart, .details-heart";

    // Jin cards mein heart nahi hai, wahan khud laga do
    document.querySelectorAll(".rent-image, .project-image, .commercial-image")
        .forEach(function (box) {

            if (box.querySelector(HEARTS)) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "favorite-btn";
            button.setAttribute("aria-label", "Add to wishlist");
            button.innerHTML = '<i class="fa-regular fa-heart"></i>';

            box.appendChild(button);
        });

    // Har type ke card ka structure
    const CARDS = [
        { card: ".property-card",     price: ".price" },
        { card: ".buy-property-card", price: ".property-bottom strong" },
        { card: ".rent-card",         price: ".rent-price" },
        { card: ".project-card",      price: ".project-price" },
        { card: ".commercial-card",   price: ".commercial-price" }
    ];

    const wishlistBtn = document.getElementById("wishlistBtn");
    const wishlistCount = document.getElementById("wishlistCount");
    const wishlistPanel = document.getElementById("wishlistPanel");
    const wishlistItems = document.getElementById("wishlistItems");

    function getList() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveList(list) {
        localStorage.setItem(KEY, JSON.stringify(list));
    }

    function textOf(element) {
        return element ? element.innerText.trim().replace(/\s+/g, " ") : "";
    }

    // Kisi bhi heart button se property ka data nikalo
    function getData(button) {

        // Property details page
        if (button.classList.contains("details-heart")) {
            const image = document.getElementById("mainPropertyImage");

            return {
                id: new URLSearchParams(location.search).get("id"),
                title: textOf(document.getElementById("propertyTitle")),
                price: textOf(document.getElementById("propertyPrice")),
                                image: image ? image.src : "",
                isDetails: true,
                db: new URLSearchParams(location.search).get("source") === "db"
            };
        }

        // List ke cards
        for (const type of CARDS) {

            const card = button.closest(type.card);

            if (!card) continue;

            const link = card.matches("a")
                ? card
                : card.querySelector('a[href*="property-details"]');

            const image = card.querySelector("img");

            return {
                id: link ? new URL(link.href).searchParams.get("id") : null,
                title: textOf(card.querySelector("h3")),
                price: textOf(card.querySelector(type.price)),
                                image: image ? image.src : "",
                isDetails: false,
                db: link ? new URL(link.href).searchParams.get("source") === "db" : false
            };
        }

        return null;
    }

    // Kya ye wahi property hai?
    function isSame(item, data) {

        if (String(item.id) !== String(data.id)) return false;

        // Details page par sirf id match karo
        if (data.isDetails) return true;

        return item.title === data.title;
    }

    // Header panel + count
    function renderPanel() {

        if (!wishlistCount || !wishlistItems) return;

        const list = getList();

        wishlistCount.textContent = list.length;
        wishlistCount.hidden = list.length === 0;

        if (list.length === 0) {
            wishlistItems.innerHTML =
                '<p class="wishlist-empty">Your wishlist is empty.</p>';
            return;
        }

        wishlistItems.innerHTML = list.map(function (item, index) {
            return `
                <div class="wishlist-item">
                                       <a href="property-details.html?id=${item.id}${item.db ? '&source=db' : ''}" class="wishlist-link">
                        <img src="${item.image}" alt="">
                        <div>
                            <strong>${item.title}</strong>
                            <span>${item.price}</span>
                        </div>
                    </a>
                    <button type="button" class="wishlist-remove" data-index="${index}" aria-label="Remove">&times;</button>
                </div>
            `;
        }).join("");
    }

    // Saari hearts red / normal
    function syncHearts() {

        const list = getList();

        document.querySelectorAll(HEARTS).forEach(function (button) {

            const data = getData(button);
            const icon = button.querySelector("i");

            if (!data || !icon) return;

            const saved = list.some(function (item) {
                return isSame(item, data);
            });

            button.classList.toggle("active", saved);
            icon.classList.toggle("fa-solid", saved);
            icon.classList.toggle("fa-regular", !saved);
        });
    }

    function refresh() {
        renderPanel();
        syncHearts();
    }

        // Heart par click (poore page par suna jata hai, taaki baad mein bane cards par bhi chale)
    document.addEventListener("click", function (event) {

        const button = event.target.closest(HEARTS);

        if (!button) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const data = getData(button);

        if (!data || !data.id) return;

        let list = getList();

        const exists = list.some(function (item) {
            return isSame(item, data);
        });

        if (exists) {
            list = list.filter(function (item) {
                return !isSame(item, data);
            });
        } else {
            list.push({
                id: data.id,
                title: data.title,
                price: data.price,
                image: data.image,
                db: data.db
            });
        }

        saveList(list);
        refresh();
    });

    // Panel se remove
    if (wishlistItems) {
        wishlistItems.addEventListener("click", function (event) {

            const removeBtn = event.target.closest(".wishlist-remove");

            if (!removeBtn) return;

            const list = getList();

            list.splice(Number(removeBtn.dataset.index), 1);

            saveList(list);
            refresh();
        });
    }

    // Panel kholo / band karo
    if (wishlistBtn && wishlistPanel) {

        wishlistBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            wishlistPanel.hidden = !wishlistPanel.hidden;
        });

        document.addEventListener("click", function (event) {
            if (!wishlistPanel.contains(event.target)) {
                wishlistPanel.hidden = true;
            }
        });
    }

    // Dusre tab mein change ho to yahan bhi update
    window.addEventListener("storage", refresh);

     refresh();

    // Login hone par server ke saath sync wali file load karo
    const syncScript = document.createElement("script");
    syncScript.src = "js/wishlist-api.js";
    document.body.appendChild(syncScript);

})();