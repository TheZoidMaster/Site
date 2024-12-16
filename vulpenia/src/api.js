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
    string = string.replace(/\r/g, "");
    string.split("\n").forEach(line => {
        line = line.split(": ");

        result[line[0]] = line[1]
    });
    console.log(result);
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