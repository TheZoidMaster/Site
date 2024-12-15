async function getJson(url) {
    let result = {};
    await fetch(url)
    .then(response => response.json())
    .then(data => {
        result = data;
    });
    return result;
};

async function getMarkdown(url) {
    let result = {};
    await fetch(url)
    .then(response => response.text())
    .then(data => {
        result.raw = data;

        data = data.split("---");
        result.meta = data[1];

        data = data.splice(2,data.length);

        result.html = marked.parse(data.join("---"));
    });
    return result;
};

function iterrHtml(htmlCollection, iterrateFunc) {
    for (let i=0; i<htmlCollection.length; i++) {
        iterrateFunc(htmlCollection[i]);
    };
};

function toObject(string) {
    result = {};
    string.split("\r\n").forEach(line => {
       result[line.split(": ")[0]] = line.split(": ")[1] 
    });
    return result;
};

function setGetCommits(page) {
    localStorage.setItem("lg|" + page, Date.now());
};
function canRefetchCommits(page) {
    let lastRefetched = localStorage.getItem("lg|" + page);
    if (lastRefetched == null) {
        localStorage.setItem("lg|" + page, 0);
        lastRefetched = localStorage.getItem("lg|" + page);
    };

    const currentTime = Date.now();
    return (currentTime - lastRefetched) >= 900000;
}