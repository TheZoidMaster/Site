class PageLink extends HTMLElement {
    constructor() {
        super();

        this.addEventListener("click", function() {
            window.location.hash = this.getAttribute("href") || "/wiki/Main_page";
        });
    };
};

customElements.define("page-link", PageLink);