(function () {

    const card = document.querySelector(".contact-card");
    if (!card) return;

    const nameInput = card.querySelector('input[type="text"]');
    const phoneInput = card.querySelector('input[type="tel"]');
    const messageInput = card.querySelector("textarea");
    const button = card.querySelector(".contact-btn");

    if (!nameInput || !phoneInput || !messageInput || !button) return;

    const params = new URLSearchParams(window.location.search);
    const fromDb = params.get("source") === "db";

    // Login hai to naam pehle se bhar do
    if (localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("userName")) {
        nameInput.value = localStorage.getItem("userName");
    }

    button.addEventListener("click", function () {

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();

        if (name === "" || phone === "") {
            hvAlert("Please enter your name and phone number.", { title: "Missing details", kind: "warn" });
            return;
        }

        if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
            hvAlert("Please enter a valid phone number.", { title: "Invalid phone number", kind: "warn" });
            return;
        }

        const titleBox = document.getElementById("propertyTitle");

        const payload = {
            name: name,
            phone: phone,
            message: message,
            propertyTitle: titleBox ? titleBox.innerText.trim() : "",
            // Id sirf database wali property ki bhejte hain
            propertyId: fromDb ? params.get("id") : null
        };

        button.disabled = true;

        fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (result) {
                if (result.ok) {
                    nameInput.value = "";
                    phoneInput.value = "";
                    messageInput.value = "";
                    hvAlert(result.data.message || "Thank you! Our team will contact you soon.", { title: "Enquiry sent", kind: "success", ok: "Done" });
                } else {
                    hvAlert(result.data.message || "Something went wrong. Please try again.", { title: "Could not send", kind: "error" });
                }
            })
            .catch(function () {
                           hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
            })
            .finally(function () {
                button.disabled = false;
            });
    });

})();