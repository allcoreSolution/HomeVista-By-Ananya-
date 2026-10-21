const form = document.getElementById("propertyForm");
const msg = document.getElementById("msg");

function show(text, ok) {
    msg.textContent = text;
    msg.className = ok ? "ok" : "bad";
}

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const adminKey = document.getElementById("adminKey").value;
    const title = document.getElementById("title").value.trim();
    const location = document.getElementById("location").value.trim();
    const type = document.getElementById("type").value;
    const price = Number(document.getElementById("price").value);

    if (adminKey === "" || title === "" || location === "" || !price) {
        show("Please fill admin key, title, location and price.", false);
        return;
    }

    const property = {
        title: title,
        location: location,
        type: type,
        price: price,
        imageUrl: document.getElementById("imageUrl").value.trim(),
        bhk: document.getElementById("bhk").value.trim(),
        bath: document.getElementById("bath").value.trim(),
        area: document.getElementById("area").value.trim(),
               furnished: document.getElementById("furnished").value.trim(),
        propertyType: document.getElementById("propertyType").value,
        featured: document.getElementById("featured").value === "yes",
        description: document.getElementById("description").value.trim()
    };

    fetch("/api/properties", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(property)
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                show(result.data.message || "Could not add property.", false);
                return;
            }
            show("Property added (id " + result.data.id + ").", true);

            // Admin key chhod ke baaki form khali karo
            ["title", "location", "price", "imageUrl", "bhk", "bath", "area", "furnished", "description"]
                .forEach(function (id) {
                    document.getElementById(id).value = "";
                });
        })
        .catch(function () {
            show("Server se connect nahi ho paya.", false);
        });
});