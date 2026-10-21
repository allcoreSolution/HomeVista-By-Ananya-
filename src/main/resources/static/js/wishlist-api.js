(function () {

    const KEY = "homevistaWishlist";
    const email = localStorage.getItem("userEmail");

    // Sirf logged-in user ke liye
    if (localStorage.getItem("isLoggedIn") !== "true" || !email) return;

       const headers = {};
    const realSetItem = Storage.prototype.setItem;
    let syncing = false;

    function readList(raw) {
        try {
            return JSON.parse(raw) || [];
        } catch (error) {
            return [];
        }
    }

    function dbIds(list) {
        return list.filter(function (item) { return item.db; })
                   .map(function (item) { return String(item.id); });
    }

    function formatPrice(p, type) {
        let text;
        if (p >= 10000000) text = "₹" + Number((p / 10000000).toFixed(2)) + " Cr";
        else if (p >= 100000) text = "₹" + Number((p / 100000).toFixed(2)) + " Lakh";
        else text = "₹" + Number(p).toLocaleString("en-IN");
        return type === "rent" ? text + "/month" : text;
    }

    let previous = readList(localStorage.getItem(KEY));

    // wishlist.js jab bhi list save kare, farak server ko bhej do
    Storage.prototype.setItem = function (key, value) {

        realSetItem.call(this, key, value);

        if (this !== window.localStorage || key !== KEY || syncing) return;

        const now = readList(value);
        const before = dbIds(previous);
        const after = dbIds(now);

        after.filter(function (id) { return !before.includes(id); })
            .forEach(function (id) {
                fetch("/api/wishlist/" + id, { method: "POST", headers: headers });
            });

        before.filter(function (id) { return !after.includes(id); })
            .forEach(function (id) {
                fetch("/api/wishlist/" + id, { method: "DELETE", headers: headers });
            });

        previous = now;
    };

    // Page khulte hi server ki wishlist le aao
    fetch("/api/wishlist", { headers: headers })
            .then(function (res) {
            if (res.status === 401) {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("homevistaWishlist");
                window.location.reload();
                return null;
            }
            return res.ok ? res.json() : null;
        })
        .then(function (props) {

            if (!props) return;

            const serverIds = props.map(function (p) { return String(p.id); });
            const local = readList(localStorage.getItem(KEY));

            // Server par jo nahi hai par yahan db-property save hai, use server par bhej do
            local.filter(function (item) {
                return item.db && !serverIds.includes(String(item.id));
            }).forEach(function (item) {
                fetch("/api/wishlist/" + item.id, { method: "POST", headers: headers });
            });

            const keepLocal = local.filter(function (item) {
                return !item.db || !serverIds.includes(String(item.id));
            });

            const fromServer = props.map(function (p) {
                return {
                    id: String(p.id),
                    title: p.title,
                    price: formatPrice(p.price, p.type),
                    image: p.imageUrl,
                    db: true
                };
            });

            const merged = keepLocal.concat(fromServer);

            syncing = true;
            realSetItem.call(window.localStorage, KEY, JSON.stringify(merged));
            syncing = false;
            previous = merged;

            // wishlist.js ko bolo ki hearts aur panel dobara bana le
            window.dispatchEvent(new Event("storage"));
        })
        .catch(function (err) {
            console.error("Wishlist sync nahi hui:", err);
        });

})();