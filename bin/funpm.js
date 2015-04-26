'use strict';

var process = require('process');
var console = require('console');
var minimist = require('minimist');

var Commands = require('../commands.js');

main.exec = exec;

module.exports = main;

if (require.main === module) {
    main(minimist(process.argv.slice(2)), onError);
}

function onError(err) {
    console.error(err.message);
    process.exit(1);
}

function main(argv, cb) {
    /*eslint no-console: 0, no-process-exit: 0*/
    var command = argv._[0];
    var commands = new Commands(argv);

    if (command === 'install') {
        commands.install(cb);
    } else if (command === 'update') {
        commands.update(cb);
    } else if (command === 'ls') {
        commands.ls(cb);
    } else {
        cb(new Error('unknown command ' + command));
    }

    return commands;
}

function exec(parts, cb) {
    if (typeof parts === 'string') {
        parts = parts.split(' ');
    }

    return main(minimist(parts), cb);
}
