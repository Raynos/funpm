'use strict';

var assert = require('assert');
var process = global.process;

var NodeModulesInstaller = require('./node-modules-installer.js');

module.exports = Commands;

function Commands(argv) {
    this.argv = argv;

    this.prefix = argv.prefix || process.cwd();
    this.installer = new NodeModulesInstaller(this.prefix);
}

Commands.prototype.install = function install(cb) {
    var self = this;

    self.installer.installProject(self.prefix, cb);
};

Commands.prototype.update = function update(cb) {
    var self = this;

    var module = self.argv._[1];
    var parts = module.split('@');

    assert(parts.length === 2,
        'Must update with `module@version`');

    var moduleName = parts[0];
    var versionish = parts[1];

    self.installer.installModule(
        self.prefix, moduleName, versionish, [], cb
    );
};

Commands.prototype.ls = function ls(cb) {
    cb(new Error('funpm ls is not implemented'));
};
