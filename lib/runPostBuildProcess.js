const Promise = require('bluebird');
const { spawn } = Promise.promisifyAll(require('child_process'));
const log = require('./log');
const logVerbose = require('./logVerbose');

module.exports = function runPostBuildProcess(anyBranchesUpdated, config) {
    const { postBuildProcess } = config;
    return new Promise((resolve, reject) => {
        if(!anyBranchesUpdated) {
            logVerbose(`[Post-build]: No branches were updated`);
            return resolve();
        }
        logVerbose(`[Post-build]: Starting post-build process: ${anyBranchesUpdated}`);
        Promise.resolve(postBuildProcess).map(({ proc, args }) => {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const child = spawn(proc, args);
                logVerbose(`[Post-build]: Opening ${proc} ${args.join(' ')}`);
                child.on('close', (code) => {
                    log(`[Post-build]: Closed | code ${code} | took ${(Math.round(Date.now() - start) / 1000)}s | ${proc} ${args.join(' ')}`);
                    if(code !== 0) {
                        return reject();
                    }
                    resolve();
                });
                child.stderr.on('data', (data) => console.error(`stderr: ${data}`));
                child.on('exit', (code) => {
                    if(code !== 0) {
                        return reject();
                    }
                });
            });
        }, { concurrency: 1 });
    });
}
