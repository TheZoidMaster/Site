class PageLink extends HTMLElement {
    constructor() {
        super();

        this.addEventListener("click", function() {
            window.location.hash = this.getAttribute("href") || "/wiki/Main_page";
            let tabs = document.getElementsByClassName("tab");
            iterrHtml(tabs, function (element) {
                element.className = "tab";
            });
            document.getElementById("tabRead").className = "tab active";
            let pages = document.getElementsByClassName("page");
            iterrHtml(pages, function (element) {
                element.className = "page";
            });
            document.getElementById("pageRead").className = "page active";
        });
    };
};

customElements.define("page-link", PageLink);