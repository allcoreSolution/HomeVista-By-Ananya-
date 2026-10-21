(function () {

    

    const grid = document.querySelector(".agents-grid");
    if (!grid) return;

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function cardHtml(a) {
        return `
        <article class="agent-card">
            <div class="agent-cover"></div>
            <div class="agent-profile">
                <div class="agent-photo">
                    <img src="${esc(a.photoUrl)}" alt="${esc(a.name)}">
                </div>
                <h3>${esc(a.name)}</h3>
                <p class="agent-role">${esc(a.role)}</p>
                <p class="agent-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${esc(a.location)}
                </p>
                <div class="agent-stats">
                    <div>
                        <strong>${esc(a.experience)}</strong>
                        <span>Years Experience</span>
                    </div>
                    <div>
                        <strong>${esc(a.propertiesCount)}</strong>
                        <span>Properties</span>
                    </div>
                </div>
                <div class="agent-contact">
                    <a href="contact.html">
                        <i class="fa-regular fa-envelope"></i> Contact
                    </a>
                    <a href="buy.html" class="primary">
                        View Properties
                    </a>
                </div>
            </div>
        </article>`;
    }

    fetch("/api/agents")
        .then(function (res) { return res.json(); })
        .then(function (list) {
            if (!list.length) return;
            grid.innerHTML = list.map(cardHtml).join("");
        })
        .catch(function (err) {
            console.error("Agents API se nahi aaye:", err);
        });

})();