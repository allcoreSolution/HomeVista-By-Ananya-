const contactBtn = document.querySelector(".submit-button");

contactBtn.addEventListener("click", function () {

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    if (fullName === "" || email === "" || message === "") {
        hvAlert("Please fill in your name, email and message.", { title: "Missing details", kind: "warn" });
        return;
    }

    fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, subject, message })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
            if (result.ok) {
                document.getElementById("fullName").value = "";
                document.getElementById("email").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("subject").value = "";
                document.getElementById("message").value = "";
                hvAlert(result.data.message || "Thanks! Our team will get back to you soon.", { title: "Message sent", kind: "success", ok: "Done" });
            } else {
                hvAlert(result.data.message || "Something went wrong. Please try again.", { title: "Could not send", kind: "error" });
            }
        })
        .catch(function () {
            hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
        });
});
