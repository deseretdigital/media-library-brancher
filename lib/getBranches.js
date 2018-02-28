const git = require('simple-git')(__dirname);
const githubApi = require('github-api');
const log = require('./log');
const logVerbose = require('./logVerbose');

const github = new githubApi({
    token: process.env.PERSONAL_GITHUB_TOKEN
});
const Promise = require('bluebird');

function getBranches(config, _, __, buildPath) {
    const { owner, repo } = config;
    return new Promise((resolve, reject) => {
        log(`[${owner}/${repo}]: Fetch branches`);
        const remoteRepo = github.getRepo(owner, repo);
        const repoPath = `${buildPath}/base_${repo}`;
        git.cwd(repoPath).listRemote(['--heads', 'origin'], (err, data) => {
            const branches = data.replace(/(.+)\s+refs\/heads\/(.+)/g, "$1:$2")
                .split("\n")
                .filter(i => i.trim() !== "")
                .map(str => ({
                    sha: str.split(':')[0],
                    name: str.split(':')[1]
                }));
            resolve(Object.assign({}, config, { branches }));
        })
        // remoteRepo.listBranches().then(({ data = [] }) => {
        //     logVerbose(`Branches loaded: ${JSON.stringify(data)}`);
        //     resolve(Object.assign({}, config, { branches: data }));
        // });
    });
}

module.exports = getBranches;
