const tabs = document.querySelectorAll(".tab");

tabs.forEach(function(tab) {

    tab.addEventListener("click", function() {

        // Remove active from all tabs
        tabs.forEach(function(item) {
            item.classList.remove("active");
        });

        // Add active to clicked tab
        tab.classList.add("active");

    });

});


// ================= SEARCH & FILTER =================

const searchButton = document.querySelector(".search-btn");

searchButton.addEventListener("click", function() {

    const location = document
        .querySelector(".search-item input")
        .value
        .trim()
        .toLowerCase();

    const selects = document.querySelectorAll(".search-item select");

    const propertyType = selects[0].value;
    const budget = selects[1].value;
    const bhk = selects[2].value;

    const propertyCards = document.querySelectorAll(".property-card");

    let found = false;


    // Check every property card
    propertyCards.forEach(function(card) {

        const cardText = card.innerText.toLowerCase();

        let showCard = true;


        // ================= LOCATION =================

        if (location !== "") {

            if (!cardText.includes(location)) {
                showCard = false;
            }

        }


        // ================= PROPERTY TYPE =================

        if (
            propertyType !== "Apartment, Villa, Plot..." &&
            propertyType !== "Any"
        ) {

            const type = propertyType.toLowerCase();

            if (!cardText.includes(type)) {
                showCard = false;
            }

        }


        // ================= BHK =================

        if (bhk !== "Any") {

            const selectedBhk = bhk.toLowerCase();

            if (!cardText.includes(selectedBhk)) {
                showCard = false;
            }

        }


        // ================= SHOW / HIDE =================

        if (showCard) {

            card.style.display = "block";
            found = true;

        } else {

            card.style.display = "none";

        }

    });


    // ================= NO RESULT MESSAGE =================

    let message = document.querySelector(".no-result");

    if (!found) {

        if (!message) {

            message = document.createElement("p");

            message.className = "no-result";

            message.innerText = "No properties found.";

            message.style.textAlign = "center";
            message.style.marginTop = "30px";
            message.style.fontSize = "18px";

            document
                .querySelector(".featured-properties")
                .appendChild(message);

        }

    } else {

        if (message) {
            message.remove();
        }

    }

});