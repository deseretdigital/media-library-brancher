const Promise = require('bluebird');
const fs = require('fs');
const apacheConfigTemplate = require('./../apacheConfigTemplate');
const runPostBuildProcess = require('./runPostBuildProcess');
const log = require('./log');

function writeApacheConfig(branch, name, config) {
    const { apacheConfigDir } = config;
    const { owner } = branch[0];
    const repo = branch.map(b => b.repo).join(',');
    const branchApacheConfigPath = `${apacheConfigDir}/branch_${name}`;
    let atLeastOneUpdated = false;
    return new Promise((resolve, reject) => {
        const apacheConfig = apacheConfigTemplate(branch, name, config);
        let needsUpdating = true;
        if(fs.existsSync(branchApacheConfigPath)) {
            const existingConfig = fs.readFileSync(branchApacheConfigPath);
            needsUpdating = `${existingConfig}` !== apacheConfig;
        }
        if(needsUpdating) {
            atLeastOneUpdated = true;
            fs.writeFileSync(branchApacheConfigPath, apacheConfig);
            log(`[${owner}/${repo}#${name}]: Wrote apache config`);
        }
        resolve(atLeastOneUpdated);
    });
}

module.exports = function setupBranches(branchList, config) {
    return new Promise((resolve, reject) => {
        const allBranches = {};
        branchList.forEach(repoBranchList => {
            Object.keys(repoBranchList).forEach(branch => {
                if(Array.isArray(allBranches[branch])) {
                    allBranches[branch].push(repoBranchList[branch][0]);
                } else {
                    allBranches[branch] = [repoBranchList[branch][0]];
                }
            });
        });
        Promise.resolve(Object.keys(allBranches))
            .map(branch => writeApacheConfig(allBranches[branch], branch, config), { concurrency: 1 })
            .then(updated => runPostBuildProcess(updated.some(s => s === true), config))
            .then(() => resolve(branchList));
    });
}
