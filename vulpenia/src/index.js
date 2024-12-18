console.log(
    "%cthere is no wasp emoji 😢 🐝",
    "color: #fd0; font-size: 32pt; font-weight: 800; font-family: monospace;"
);

let tabs = document.getElementsByClassName("tab");
let page = document.getElementById("page");
let pages = document.getElementsByClassName("page");
let title = document.getElementById("title");

let readTab = document.getElementById("tabRead");
let sourceTab = document.getElementById("tabSource");
let historyTab = document.getElementById("tabHistory");

let readPage = document.getElementById("pageRead");
let sourcePage = document.getElementById("pageSource");
let historyPage = document.getElementById("pageHistory");

let markdownRaw = document.getElementById("markdownRaw");

let config = getConfig();

let currentPage = "wiki/Main_Page.md";

function hidePages() {
    iterrHtml(pages, function (element) {
        element.className = "page";
    });
}
iterrHtml(tabs, function (element) {
    element.addEventListener("click", function () {
        iterrHtml(tabs, function (element) {
            element.className = "tab";
        });
        element.className = "tab active";
    });
});

// #region Theme Loading
let theme = document.getElementById("theme");

function setTheme(url) {
    theme.href = url;
}

// #region Tab Logic

readTab.addEventListener("click", function () {
    hidePages();
    readPage.className = "page active";
});
sourceTab.addEventListener("click", function () {
    hidePages();
    sourcePage.className = "page active";
});
historyTab.addEventListener("click", async function () {
    hidePages();
    historyPage.className = "page active";

    let commits = await getCommits(currentPage);

    historyPage.innerHTML =
        "<p>If you're not seeing commits, there's a high chance you're being rate limited. Try again later. (fix tbd)</p>";

    if (commits.length == 0) {
        historyPage.innerHTML =
            "<p>GitHub returned no commits, probably because this page hasn't been pushed to the repository yet. If it has been pushed, please create an issue to report this! Also make sure that it's been more than 15 since the last time you checked this tab.</p>";
    }

    commits.forEach((commit) => {
        let element = document.createElement("p");
        element.class = "commit";
        element.innerHTML = `${new Date(commit.date).toLocaleString(undefined, {
            timeZoneName: "short",
        })} | <a href="https://github.com/${config.repo}/commit/${
            commit.sha
        }">${commit.message}</a> - ${commit.author}`;

        historyPage.appendChild(element);
    });
});

// #region Page Navigation

async function setPage(file) {
    let markdown = await getMarkdown(
        `https://raw.githubusercontent.com/${config.repo}/refs/heads/${config.branch}${file}`
    );
    readPage.innerHTML = markdown.html;
    markdownRaw.innerText = markdown.raw;

    currentPage = file;

    let metadata = markdown.meta;

    document.title = metadata.title;
    title.innerText = metadata.title;

    switch (metadata.type) {
        case "no-title":
            document.body.className = "no-title";
            break;
        default:
            document.body.removeAttribute("class");
            break;
    }
}

function loadPageFromHash() {
    fallbackHash();
    currentPage = window.location.hash.replace("#", "") + ".md";
    setPage(currentPage);
}

function fallbackHash() {
    switch (window.location.hash) {
        case "":
        case "#":
        case "#/":
            window.location.hash = "/wiki/Main_Page";
    }
}

window.onhashchange = loadPageFromHash;
window.onload = loadPageFromHash;

setTheme(getConfig().theme)