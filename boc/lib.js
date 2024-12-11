/* just the repetitive base functions */

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
    let result = "";
    await fetch(url)
    .then(response => response.text())
    .then(data => {
        result = marked.parse(data);
    });
    return result;
};

const blockTemplate = `<div class="block" id="%id%">$c</div>`

const types = {};
types.markdown = async function(data) {
    return blockTemplate.replace("$c", await getMarkdown(data.src)).replace("%id%","md");
};
types.image = async function(data) {
    return blockTemplate.replace("$c", `<img src="${data.src}" draggable="false"></img>`).replace("%id%","img");
};
types.multiple = async function(data) {
    let innerHtml = "";
    for (const block of data.src) {
        innerHtml += await parseBlock(block);
    }
    return blockTemplate.replace("$c", innerHtml).replace("%id%","multi");
};

async function parseBlock(data) {
    return await types[data.type](data);
};