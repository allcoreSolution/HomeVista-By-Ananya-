(function () {

    var css = `
.hvd-overlay { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 18px;
    background: rgba(8, 21, 40, 0.55); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
    opacity: 0; transition: opacity .22s ease; font-family: "Segoe UI", Arial, sans-serif; }
.hvd-overlay.show { opacity: 1; }

.hvd-box { position: relative; width: 100%; max-width: 410px; background: #fff; border-radius: 22px;
    padding: 34px 30px 26px; text-align: center; overflow: hidden;
    box-shadow: 0 28px 80px rgba(10, 30, 80, 0.34);
    transform: translateY(18px) scale(.93); opacity: 0;
    transition: transform .3s cubic-bezier(.2,.9,.3,1.15), opacity .22s ease; }
.hvd-overlay.show .hvd-box { transform: none; opacity: 1; }

.hvd-box::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: #1261d8; }
.hvd-box.k-warn::before { background: #f59e0b; }
.hvd-box.k-danger::before, .hvd-box.k-error::before { background: #dc2626; }
.hvd-box.k-success::before { background: #16a34a; }

.hvd-ico { position: relative; width: 72px; height: 72px; margin: 0 auto 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 30px;
    transform: scale(.5); opacity: 0; animation: hvdPop .42s cubic-bezier(.2,.9,.3,1.5) .1s forwards; }
@keyframes hvdPop { to { transform: none; opacity: 1; } }
.hvd-ico::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid currentColor;
    opacity: .18; }
.hvd-info { background: #e8f0ff; color: #1261d8; }
.hvd-success { background: #dcfce7; color: #16a34a; }
.hvd-warn { background: #fef3c7; color: #d97706; }
.hvd-danger, .hvd-error { background: #fde8e8; color: #dc2626; }

.hvd-title { font-size: 21px; font-weight: 700; color: #0b1d3a; margin: 0 0 8px; }
.hvd-text { font-size: 15px; line-height: 1.6; color: #55627a; margin: 0 0 24px; white-space: pre-line; word-break: break-word; }

.hvd-actions { display: flex; gap: 10px; }
.hvd-btn { flex: 1; padding: 13px 16px; border-radius: 11px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: inherit; border: 1px solid transparent;
    transition: transform .1s ease, filter .15s ease, background .15s ease; }
.hvd-btn:active { transform: scale(.97); }
.hvd-cancel { background: #fff; color: #475569; border-color: #d5dde8; }
.hvd-cancel:hover { background: #f1f5fb; }
.hvd-ok { background: linear-gradient(90deg, #1261d8, #2b7bff); color: #fff; box-shadow: 0 8px 20px rgba(18, 97, 216, 0.3); }
.hvd-ok.danger { background: linear-gradient(90deg, #dc2626, #ef4444); box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3); }
.hvd-ok:hover { filter: brightness(1.07); }
.hvd-btn:focus-visible { outline: 3px solid rgba(18, 97, 216, 0.35); outline-offset: 2px; }

body.dark .hvd-box { background: #0f1a2e; box-shadow: 0 28px 80px rgba(0, 0, 0, 0.6); }
body.dark .hvd-title { color: #e8eefc; }
body.dark .hvd-text { color: #94a3b8; }
body.dark .hvd-cancel { background: #16233c; border-color: #2a3a58; color: #cbd5e1; }
body.dark .hvd-cancel:hover { background: #1b2a45; }
body.dark .hvd-info { background: #16294a; color: #60a5fa; }
body.dark .hvd-success { background: #12331f; color: #4ade80; }
body.dark .hvd-warn { background: #3a2a08; color: #fbbf24; }
body.dark .hvd-danger, body.dark .hvd-error { background: #3a1414; color: #f87171; }

@media (prefers-reduced-motion: reduce) { .hvd-box, .hvd-ico { animation: none; transition: none; opacity: 1; transform: none; } }
`;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var ICONS = {
        info: "fa-circle-info",
        success: "fa-circle-check",
        warn: "fa-triangle-exclamation",
        danger: "fa-trash-can",
        error: "fa-circle-xmark"
    };

    var openCount = 0;

    function lockScroll(on) {
        openCount += on ? 1 : -1;
        if (openCount < 0) openCount = 0;
        document.body.style.overflow = openCount ? "hidden" : "";
    }

    function openDialog(opts) {
        return new Promise(function (resolve) {

            var kind = ICONS[opts.kind] ? opts.kind : "info";
            var overlay = document.createElement("div");
            overlay.className = "hvd-overlay";
            overlay.innerHTML =
                '<div class="hvd-box k-' + kind + '" role="dialog" aria-modal="true" aria-labelledby="hvdT">' +
                '<div class="hvd-ico hvd-' + kind + '"><i class="fa-solid ' + ICONS[kind] + '"></i></div>' +
                '<h3 class="hvd-title" id="hvdT"></h3>' +
                '<p class="hvd-text"></p>' +
                '<div class="hvd-actions"></div></div>';

            // textContent: koi bhi text safe rehta hai
            var titleBox = overlay.querySelector(".hvd-title");
            var textBox = overlay.querySelector(".hvd-text");
            titleBox.textContent = opts.title || "";
            textBox.textContent = opts.text || "";
            if (!opts.title) titleBox.remove();
            if (!opts.text) textBox.remove();

            var actions = overlay.querySelector(".hvd-actions");
            var cancelBtn = null;

            if (opts.cancel) {
                cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "hvd-btn hvd-cancel";
                cancelBtn.textContent = opts.cancel;
                actions.appendChild(cancelBtn);
            }

            var okBtn = document.createElement("button");
            okBtn.type = "button";
            okBtn.className = "hvd-btn hvd-ok" + (kind === "danger" ? " danger" : "");
            okBtn.textContent = opts.ok || "OK";
            actions.appendChild(okBtn);

            var done = false;
            function close(result) {
                if (done) return;
                done = true;
                document.removeEventListener("keydown", onKey, true);
                overlay.classList.remove("show");
                lockScroll(false);
                setTimeout(function () { overlay.remove(); }, 240);
                resolve(result);
            }

            function onKey(e) {
                if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(false); }
            }

            okBtn.addEventListener("click", function () { close(true); });
            if (cancelBtn) cancelBtn.addEventListener("click", function () { close(false); });
            overlay.addEventListener("mousedown", function (e) {
                if (e.target === overlay && opts.cancel) close(false);
            });
            document.addEventListener("keydown", onKey, true);

            document.body.appendChild(overlay);
            lockScroll(true);
            requestAnimationFrame(function () { overlay.classList.add("show"); });
            // Delete jaise khatarnak kaam mein pehle "Cancel" par focus, taaki galti se Enter na dab jaye
            (kind === "danger" && cancelBtn ? cancelBtn : okBtn).focus();
        });
    }

    // await hvConfirm("text", { title, ok, cancel, kind })  ->  true / false
    window.hvConfirm = function (text, o) {
        o = o || {};
        return openDialog({
            text: text, title: o.title, kind: o.kind || "warn",
            ok: o.ok || "Yes", cancel: o.cancel || "Cancel"
        });
    };

    // hvAlert("text", { title, kind, ok })
    window.hvAlert = function (text, o) {
        o = o || {};
        return openDialog({ text: text, title: o.title, kind: o.kind || "info", ok: o.ok || "OK" });
    };

    // Purane alert("...") bhi ab sundar popup dikhayenge
    window.alert = function (msg) {
        var text = String(msg);
        var low = text.toLowerCase();
        var kind = "info", title = "Notice";
        if (/success|created|thank|saved|sent|added|updated/.test(low)) { kind = "success"; title = "Success"; }
        else if (/fail|error|invalid|wrong|could not|not allowed|already|incorrect|please enter|please fill/.test(low)) { kind = "error"; title = "Something went wrong"; }
        return window.hvAlert(text, { title: title, kind: kind });
    };

})();
