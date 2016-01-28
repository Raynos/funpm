#!/usr/bin/env node
'use strict';

var process = global.process;
var console = require('console');

var Commands = require('../commands.js');

main.exec = exec;

module.exports = main;

if (require.main === module) {
    main(process.argv.slice(2), onError);
}

function onError(err) {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
}

function parseArgs(argv) {
    var opts = {
        _: [],
        prefix: null
    };

    do {
        var token = argv.shift();
        switch (token) {
            case '--prefix':
                opts.prefix = argv.shift();
                break;

            default:
                opts._.push(token);
                break;
        }
    } while (argv.length > 0);

    return opts;
}

function main(argv, cb) {
    /*eslint no-console: 0, no-process-exit: 0*/
    var opts = parseArgs(argv);
    var command = opts._[0];
    var commands = new Commands(opts);

    if (command === 'install') {
        commands.install(cb);
    } else if (command === 'update') {
        commands.update(cb);
    } else if (command === 'ls') {
        commands.ls(cb);
    } else {
        return cb(new Error('unknown command ' + command));
    }

    return commands;
}

function exec(parts, cb) {
    if (typeof parts === 'string') {
        parts = parts.split(' ');
    }

    return main(parts, cb);
}
