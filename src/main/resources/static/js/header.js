(function () {

    const header = document.querySelector("header");

    if (!header || header.querySelector(".nav-right")) return;

    const right = document.createElement("div");
    right.className = "nav-right";

    right.innerHTML = `
        <div class="wishlist-wrap">

            <button class="heart-btn" id="wishlistBtn" type="button">
                <i class="fa-regular fa-heart"></i>
                <span class="wishlist-count" id="wishlistCount" hidden>0</span>
            </button>

            <div class="wishlist-panel" id="wishlistPanel" hidden>
                <h4>My Wishlist</h4>
                <div id="wishlistItems"></div>
            </div>

        </div>

        <a href="login.html" class="login-btn" id="loginBtn">Login</a>
        <a href="signup.html" class="signup-btn" id="signupBtn">Sign Up</a>
        <a href="#" class="signup-btn" id="logoutBtn" hidden>Logout</a>
    `;

    header.appendChild(right);

})();

  