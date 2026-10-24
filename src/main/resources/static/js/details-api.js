(function () {

    // Sirf tab chalega jab link mein source=db ho
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") !== "db") return;

    const id = params.get("id");
    if (!id) return;

    function formatPrice(p, type) {
        let text;
        if (p >= 10000000) text = "₹" + Number((p / 10000000).toFixed(2)) + " Crore";
        else if (p >= 100000) text = "₹" + Number((p / 100000).toFixed(2)) + " Lakh";
        else text = "₹" + Number(p).toLocaleString("en-IN");

        return type === "rent" ? text + "/month" : text;
    }

    function tagFor(type) {
        if (type === "rent") return "For Rent";
        if (type === "commercial") return "Commercial";
        return "For Sale";
    }

    try {
        // Page ka baaki code turant isi data par chalta hai,
        // isliye yahan data aane tak rukna zaruri hai (synchronous request)
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/properties/" + encodeURIComponent(id), false);
        xhr.send();

        if (xhr.status !== 200 || !xhr.responseText) return;

        const p = JSON.parse(xhr.responseText);
        if (!p || !p.id) return;

        window.LISTINGS = window.LISTINGS || {};
        window.LISTINGS[id] = {
            title: p.title,
            location: p.location,
            price: formatPrice(p.price, p.type),
            tag: tagFor(p.type),
                      bhk: p.bhk || "—",
            bath: p.bath || "—",
            area: p.area || "—",
            furnished: p.furnished || "—",
            description: p.description || (p.title + " in " + p.location + "."),
                       images: [p.imageUrl],
            amenities: []
        };

        // Views +1 (ek tab/session mein ek property ka count sirf ek baar)
        try {
            const key = "viewed_" + id;
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, "1");
                fetch("/api/properties/" + encodeURIComponent(id) + "/view", {
                    method: "POST",
                    keepalive: true
                }).catch(function () {});
            }
        } catch (e) {}
    } catch (err) {
        console.error("Property API se nahi aayi:", err);
    }

})();