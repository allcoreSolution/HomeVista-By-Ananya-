(function () {

   
    const grid = document.querySelector(".blog-grid");
    if (!grid) return;

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function cardHtml(p) {
        return `
        <article class="blog-card">
            <div class="blog-image">
                <img src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <span class="blog-label">${esc(p.category)}</span>
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${esc(p.publishedDate)}</span>
                    <span><i class="fa-regular fa-clock"></i> ${esc(p.readTime)}</span>
                </div>
                <h3>${esc(p.title)}</h3>
                <p>${esc(p.summary)}</p>
                               <a href="blog-detail.html?id=${p.id}" class="read-more">
                    Read Article <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </article>`;
    }

    fetch("/api/blogs")
        .then(function (res) { return res.json(); })
        .then(function (list) {
            if (!list.length) return;
            grid.innerHTML = list.map(cardHtml).join("");
        })
        .catch(function (err) {
            console.error("Blog API se nahi aaye:", err);
        });

})();