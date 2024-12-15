// githubs gonna dun sue us chat

const owner = "JaegerwaldDev";
const repo = "W4SP";
let filePath = "src/index.js";
const branchName = "main";

function reformatCommit(commitObject) {
    return {
        sha: commitObject.sha,
        author: commitObject.commit.author.name,
        message: commitObject.commit.message,
        date: commitObject.commit.author.date
    };
};

const getCommitHistory = async () => {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branchName}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        };
        const commits = await response.json();
        return commits;
    } catch (error) {
        console.error("Failed to fetch commit history:", error);
    };
};

async function getCommits(path) {
    let result = [];

    filePath = path;
    
    if (canRefetchCommits(path)) {
        let commits = await getCommitHistory();

        for (let i=0; i<commits.length; i++) {
            result.push(reformatCommit(commits[i]));
        };

        setGetCommits(path);
        localStorage.setItem("cc|" + path, JSON.stringify(result));
        console.log("Got data from GitHub")
    } else {
        result = JSON.parse(localStorage.getItem("cc|" + path));
        console.log("Got data from localStorage")
    };

    return result;
};