async function getJson(url) {
    let result = {};
    await fetch(url)
        .then((response) => response.json())
        .then((data) => {
            result = data;
        });
    return result;
}

function getConfig() {
    let config = {};

    try {
        const request = new XMLHttpRequest();
        request.open("GET", "wiki.config.json", false);
        request.send();

        if (request.status === 200) {
            config = JSON.parse(request.responseText);
        } else {
            console.warn(
                "Config file not found or could not be loaded. Using fallback values..."
            );
            config = {
                repo: "JaegerwaldDev/W4SP",
                branch: "main",
                theme: "src/themes/wasp-yellow.css",
                logo: "img/wasp.png",
                logo_text: "img/wasp_text.png",
            };
        }
    } catch (error) {
        console.error("Error fetching config:", error);
        console.warn("Using fallback values...");
        config = {
            repo: "JaegerwaldDev/W4SP",
            branch: "main",
            theme: "src/themes/wasp-yellow.css",
            logo: "img/wasp.png",
            logo_text: "img/wasp_text.png",
        };
    }

    return config;
}

async function getMarkdown(url) {
    let result = {};
    await fetch(url)
        .then((response) => response.text())
        .then((data) => {
            result.raw = data;

            if (data.startsWith("---")) {
                data = data.split("---");
                result.meta = toObject(data[1].trim());

                if (!("title" in result.meta)) {
                    result.meta.title = "Unkown Page (No Title)";
                }
                if (!("type" in result.meta)) {
                    result.meta.type = "default";
                }

                data = data.splice(2, data.length);

                result.html = marked.parse(data.join("---"));
            } else {
                result.meta = {
                    title: "Unkown Page (No Title)",
                    type: "default",
                };
                result.html = marked.parse(data);
            }
        });
    return result;
}

function iterrHtml(htmlCollection, iterrateFunc) {
    for (let i = 0; i < htmlCollection.length; i++) {
        iterrateFunc(htmlCollection[i]);
    }
}

function toObject(string) {
    result = {};
    string = string.replace(/\r/g, "");
    string.split("\n").forEach((line) => {
        line = line.split(": ");

        result[line[0]] = line[1];
    });
    return result;
}

function setGetCommits(page) {
    localStorage.setItem("lg|" + page, Date.now());
}
function canRefetchCommits(page) {
    let lastRefetched = localStorage.getItem("lg|" + page);
    if (lastRefetched == null) {
        localStorage.setItem("lg|" + page, 0);
        lastRefetched = localStorage.getItem("lg|" + page);
    }

    const currentTime = Date.now();
    return currentTime - lastRefetched >= 900000;
}
