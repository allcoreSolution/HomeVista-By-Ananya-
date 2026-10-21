// ==================================================
// HomeVista - saari listings ka details data
// Har card ka link yahin se apne aap ban jata hai
// ==================================================

(function () {

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function listingKey(title, price) {
        return slugify(title + " " + price);
    }

    function img(photoId, width) {
        return "https://images.unsplash.com/photo-" + photoId +
            "?auto=format&fit=crop&w=" + width + "&q=80";
    }

    // Extra gallery photos
    const HOMES = [
        "1600566753086-00f18fb6b3ea",
        "1600210492486-724fe5c67fb0",
        "1600607688969-a5bfcd646154",
        "1600585154340-be6161a56a0c",
        "1600566753190-17f0baa2a6c3"
    ];

    const OFFICES = [
        "1497366811353-6870744d04b2",
        "1497366754035-f200968a6e72",
        "1497366216548-37526070297c",
        "1497366412874-3415097a27e7"
    ];

    const AMENITIES = {
        home: [
            ["fa-car", "Parking"],
            ["fa-elevator", "Lift"],
            ["fa-shield-halved", "Security"],
            ["fa-dumbbell", "Gym"],
            ["fa-person-swimming", "Swimming Pool"]
        ],
        villa: [
            ["fa-car", "Parking"],
            ["fa-tree", "Garden"],
            ["fa-shield-halved", "Security"],
            ["fa-wifi", "Wi-Fi"],
            ["fa-couch", "Living Room"]
        ],
        commercial: [
            ["fa-wifi", "High Speed Wi-Fi"],
            ["fa-car", "Parking"],
            ["fa-elevator", "Lift"],
            ["fa-shield-halved", "Security"],
            ["fa-mug-hot", "Cafeteria"]
        ]
    };

    function describe(item) {

        if (item.type === "commercial") {
            return item.title + " in " + item.location +
                ". A well-located commercial property with good footfall, " +
                "easy access and all the facilities a growing business needs.";
        }

        if (item.type === "project") {
            return item.title + " is a new residential project in " +
                item.location + ". Thoughtfully planned homes with modern " +
                "amenities and excellent connectivity.";
        }

        return "Beautiful " + item.title + " located in " + item.location +
            ". This property offers modern interiors, spacious rooms " +
            "and excellent connectivity.";
    }

    const RAW = [
        { title: "3 BHK Apartment", location: "Gomti Nagar, Lucknow", price: "₹85 Lakh", tag: "For Sale", type: "apartment", bhk: "3 BHK", bath: "3 Baths", area: "1,450", furnished: "Semi Furnished", photo: "1600607687920-4e2a09cf159d" },
        { title: "4 BHK Independent Villa", location: "Sector 150, Noida", price: "₹45,000 / month", tag: "For Rent", type: "villa", bhk: "4 BHK", bath: "4 Baths", area: "2,300", furnished: "Semi Furnished", photo: "1600585154340-be6161a56a0c" },
        { title: "Office Space", location: "Cyber City, Gurgaon", price: "₹1.2 Lakh / month", tag: "Commercial", type: "commercial", bhk: "Office", bath: "2 Washrooms", area: "1,000", furnished: "Furnished", photo: "1497366811353-6870744d04b2" },
        { title: "2 BHK Apartment", location: "Hinjewadi, Pune", price: "₹65 Lakh", tag: "For Sale", type: "apartment", bhk: "2 BHK", bath: "2 Baths", area: "1,200", furnished: "Semi Furnished", photo: "1600566753190-17f0baa2a6c3" },
        { title: "3 BHK Luxury Apartment", location: "Gomti Nagar, Lucknow", price: "₹85 Lakh", tag: "For Sale", type: "apartment", bhk: "3 BHK", bath: "3 Baths", area: "1,450", furnished: "Semi Furnished", photo: "1600607687939-ce8a6c25118c" },
        { title: "4 BHK Independent Villa", location: "Sector 150, Noida", price: "₹1.85 Crore", tag: "For Sale", type: "villa", bhk: "4 BHK", bath: "4 Baths", area: "2,300", furnished: "Semi Furnished", photo: "1600585154340-be6161a56a0c" },
        { title: "4 BHK Modern House", location: "Whitefield, Bangalore", price: "₹2.10 Crore", tag: "For Sale", type: "house", bhk: "4 BHK", bath: "4 Baths", area: "2,800", furnished: "Semi Furnished", photo: "1600607687920-4e2a09cf159d" },
        { title: "2 BHK Premium Apartment", location: "Hinjewadi, Pune", price: "₹65 Lakh", tag: "For Sale", type: "apartment", bhk: "2 BHK", bath: "2 Baths", area: "1,200", furnished: "Semi Furnished", photo: "1600566753086-00f18fb6b3ea" },
        { title: "3 BHK Luxury Apartment", location: "Gomti Nagar, Lucknow", price: "₹25,000 / month", tag: "For Rent", type: "apartment", bhk: "3 BHK", bath: "2 Baths", area: "1,450", furnished: "Semi Furnished", photo: "1600607687939-ce8a6c25118c" },
        { title: "Modern Family House", location: "Whitefield, Bangalore", price: "₹35,000 / month", tag: "For Rent", type: "house", bhk: "3 BHK", bath: "2 Baths", area: "1,800", furnished: "Semi Furnished", photo: "1494526585095-c41746248156" },
        { title: "2 BHK Premium Apartment", location: "Hinjewadi, Pune", price: "₹18,000 / month", tag: "For Rent", type: "apartment", bhk: "2 BHK", bath: "2 Baths", area: "1,200", furnished: "Semi Furnished", photo: "1600566753086-00f18fb6b3ea" },
        { title: "Skyline Residences", location: "Gomti Nagar, Lucknow", price: "₹75 Lakh onwards", tag: "New Launch", type: "project", bhk: "2–3 BHK", bath: "2-3 Baths", area: "1,200 - 2,400", furnished: "Semi Furnished", photo: "1600607687939-ce8a6c25118c" },
        { title: "Green Valley Villas", location: "Sector 150, Noida", price: "₹1.50 Crore onwards", tag: "Premium", type: "project", bhk: "3–4 BHK", bath: "2-3 Baths", area: "1,200 - 2,400", furnished: "Semi Furnished", photo: "1600585154340-be6161a56a0c" },
        { title: "Urban Heights", location: "Whitefield, Bangalore", price: "₹95 Lakh onwards", tag: "Upcoming", type: "project", bhk: "2–4 BHK", bath: "2-3 Baths", area: "1,200 - 2,400", furnished: "Semi Furnished", photo: "1494526585095-c41746248156" },
        { title: "Premium Office Space", location: "Gomti Nagar, Lucknow", price: "₹75,000 / month", tag: "For Rent", type: "commercial", bhk: "Office", bath: "2 Washrooms", area: "1,500", furnished: "Furnished", photo: "1497366811353-6870744d04b2" },
        { title: "High Street Retail Shop", location: "Hazratganj, Lucknow", price: "₹45,000 / month", tag: "For Rent", type: "commercial", bhk: "Retail", bath: "2 Washrooms", area: "800", furnished: "Bare Shell", photo: "1441986300917-64674bd600d8" },
        { title: "Corporate Office Building", location: "Cyber City, Gurgaon", price: "₹2.5 Crore onwards", tag: "For Sale", type: "commercial", bhk: "Building", bath: "2 Washrooms", area: "2,500", furnished: "Bare Shell", photo: "1486406146926-c627a92ad1ab" }
    ];

    const LISTINGS = {};

    RAW.forEach(function (item, index) {

        const isCommercial = item.type === "commercial";
        const pool = isCommercial ? OFFICES : HOMES;

        const images = [item.photo];

        for (let i = 0; images.length < 4; i++) {
            const candidate = pool[(index + i) % pool.length];
            if (!images.includes(candidate)) {
                images.push(candidate);
            }
        }

        let amenities = AMENITIES.home;
        if (isCommercial) amenities = AMENITIES.commercial;
        else if (item.type === "villa" || item.type === "house") amenities = AMENITIES.villa;

        LISTINGS[listingKey(item.title, item.price)] = {
            title: item.title,
            location: item.location,
            price: item.price,
            tag: item.tag,
            bhk: item.bhk,
            bath: item.bath,
            area: item.area,
            furnished: item.furnished,
            description: describe(item),
            images: images.map(function (id) { return img(id, 1200); }),
            amenities: amenities
        };
    });

    window.LISTINGS = LISTINGS;

    // ==================================================
    // Har card ke "View Details" link ko sahi id do
    // ==================================================

    const CARDS = [
        [".property-card", ".price"],
        [".buy-property-card", ".property-bottom strong"],
        [".rent-card", ".rent-price"],
        [".project-card", ".project-price"],
        [".commercial-card", ".commercial-price"]
    ];

    CARDS.forEach(function (config) {

        document.querySelectorAll(config[0]).forEach(function (card) {

            const title = card.querySelector("h3");
            const price = card.querySelector(config[1]);

            if (!title || !price) return;

            const key = listingKey(title.textContent, price.textContent);

            if (!LISTINGS[key]) return;

            const links = card.matches("a")
                ? [card]
                : card.querySelectorAll('a[href*="property-details"]');

            links.forEach(function (link) {
                link.setAttribute("href", "property-details.html?id=" + key);
            });
        });
    });

})();