(function () {

    const box = document.getElementById("article");
    const id = new URLSearchParams(window.location.search).get("id");

    function esc(text) {
        const div = document.createElement("div");
        div.textContent = text == null ? "" : text;
        return div.innerHTML;
    }

    function message(text) {
        box.innerHTML = '<p class="article-message">' + esc(text) + "</p>";
    }

    if (!id) {
        message("Article not found.");
        return;
    }

    fetch("/api/blogs/" + encodeURIComponent(id))
        .then(function (res) {
            if (!res.ok) throw new Error("not found");
            return res.json();
        })
        .then(function (p) {

            document.title = p.title + " - HomeVista";

            // Content na ho to summary dikhao
            const text = (p.content && p.content.trim()) ? p.content : (p.summary || "");

            const paragraphs = text
                .split(/\n+/)
                .filter(function (line) { return line.trim() !== ""; })
                .map(function (line) { return "<p>" + esc(line) + "</p>"; })
                .join("");

            box.innerHTML = `
                <a href="blog.html" class="article-back">&larr; Back to Blog</a>
                <div><span class="article-label">${esc(p.category)}</span></div>
                <h1>${esc(p.title)}</h1>
                <div class="article-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${esc(p.publishedDate)}</span>
                    <span><i class="fa-regular fa-clock"></i> ${esc(p.readTime)}</span>
                </div>
                <img class="article-image" src="${esc(p.imageUrl)}" alt="${esc(p.title)}">
                <div class="article-body">${paragraphs}</div>
            `;
        })
        .catch(function () {
            message("Article not found.");
        });

})();