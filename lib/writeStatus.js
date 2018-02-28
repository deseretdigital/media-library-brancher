const fs = require('fs');
const log = require('./log');

function getBranchesFromBranchList(branchSets = []) {
    const returnedBranches = {};
    branchSets.forEach(branches => {
        Object.keys(branches).forEach(branch => {
            if(Array.isArray(returnedBranches[branch])) {
                returnedBranches[branch].push(branches[branch][0].repo);
            } else {
                returnedBranches[branch] = [branches[branch][0].repo];
            }
        });
    });
    return returnedBranches;
}

module.exports = function writeStatus(branchList, config) {
    const { buildPath } = config;
    const statusFilePath = `${buildPath}/status.json`;
    return new Promise((resolve, reject) => {
        let branchesToClean = [];
        if(fs.existsSync(statusFilePath)) {
            const existingStatus = fs.readFileSync(statusFilePath);
            const branchSets = JSON.parse(existingStatus);
            branchesToClean = getBranchesFromBranchList(branchSets);
        }
        const jsonString = JSON.stringify(branchList);
        fs.writeFileSync(statusFilePath, jsonString);
        resolve([branchesToClean, getBranchesFromBranchList(branchList)]);
    });
}
