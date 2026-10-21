// ================= BUY PAGE SEARCH =================

const searchButton = document.querySelector(".buy-search-btn");

searchButton.addEventListener("click", function () {

    // Location
    const locationInput = document
        .querySelector(".buy-search input")
        .value
        .trim()
        .toLowerCase();

    // Select boxes
    const selects = document.querySelectorAll(".buy-search select");

    const propertyType = selects[0].value;
    const budget = selects[1].value;

    // Property cards
    const propertyCards = document.querySelectorAll(".buy-property-card");

    let found = false;

    propertyCards.forEach(function (card) {

        const cardText = card.innerText.toLowerCase();

        let showCard = true;


        // ================= LOCATION FILTER =================

        if (locationInput !== "") {

            if (!cardText.includes(locationInput)) {
                showCard = false;
            }

        }


        // ================= PROPERTY TYPE FILTER =================

        if (
            propertyType !== "Property Type" &&
            propertyType !== "Any"
        ) {

            if (!cardText.includes(propertyType.toLowerCase())) {
                showCard = false;
            }

        }


        // ================= SHOW / HIDE CARD =================

        if (showCard) {

            card.style.display = "block";
            found = true;

        } else {

            card.style.display = "none";

        }

    });


    // ================= NO RESULT MESSAGE =================

    let message = document.querySelector(".buy-no-result");

    if (!found) {

        if (!message) {

            message = document.createElement("p");

            message.className = "buy-no-result";

            message.innerText =
                "No properties found matching your search.";

            message.style.textAlign = "center";
            message.style.marginTop = "30px";
            message.style.fontSize = "18px";

            document
                .querySelector(".buy-property-grid")
                .appendChild(message);

        }

    } else {

        if (message) {
            message.remove();
        }

    }

});
// ================= INDEX SE AAYI CITY =================

const cityFromUrl = new URLSearchParams(window.location.search).get("location");

if (cityFromUrl) {
    document.querySelector(".buy-search input").value = cityFromUrl;
    searchButton.click();
}