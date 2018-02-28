const config = require('./config.js');

const { projects = [], apacheConfigDir, buildPath } = config;
require('dotenv').config();

const Promise = require('bluebird');

const prepRepo = require('./lib/prepRepo');
const getBranches = require('./lib/getBranches');
const buildBranches = require('./lib/buildBranches');
const setupBranches = require('./lib/setupBranches');
const writeStatus = require('./lib/writeStatus');
const cleanupBranches = require('./lib/cleanupBranches');
const log = require('./lib/log');

log('Brancher started');

Promise.resolve(projects)
    .map((config) => prepRepo(config, buildPath), { concurrency: 1 })
    .map((...args) => getBranches(...args, buildPath), { concurrency: 1 })
    .map((...args) => buildBranches(...args, buildPath), { concurrency: 1 })
    .then((branchList) => setupBranches(branchList, config))
    .then((branchList) => writeStatus(branchList, config))
    .then((branches) => cleanupBranches(branches, config))
    .then((...args) => {
        log('Brancher finished');
    });
