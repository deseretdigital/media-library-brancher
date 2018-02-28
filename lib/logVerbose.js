const args = process.argv;

module.exports = (...args) => process.argv.indexOf('-v') > -1 ? console.log(`[${(new Date()).toJSON()}]`, ...args) : null;
