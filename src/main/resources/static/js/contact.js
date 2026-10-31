const contactBtn = document.querySelector(".submit-button");

contactBtn.addEventListener("click", function () {

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    if (fullName === "" || email === "" || message === "") {
        alert("Please fill name, email and message.");
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
            alert(result.data.message);
            if (result.ok) {
                document.getElementById("fullName").value = "";
                document.getElementById("email").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("subject").value = "";
                document.getElementById("message").value = "";
            }
        })
        .catch(function () {
                       hvAlert("We could not reach the server. Please check your internet and try again.", { title: "Connection problem", kind: "error" });
        });
});