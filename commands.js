'use strict';

var assert = require('assert');
var process = require('process');

var RegistryClient = require('./registry-client.js');

module.exports = Commands;

function Commands(argv) {
    if (!(this instanceof Commands)) {
        return new Commands(argv);
    }

    var self = this;

    self.argv = argv;

    self.prefix = argv.prefix || process.cwd();
    self.registryClient = RegistryClient();
}

Commands.prototype.install = function install(cb) {
    cb(new Error('funpm install is not implemented'));
};

Commands.prototype.update = function update(cb) {
    var self = this;

    var module = self.argv._[1];
    var parts = module.split('@');

    assert(parts.length === 2,
        'Must update with `module@version`');

    var moduleName = parts[0];
    var versionish = parts[1];

    self.registryClient.resolveVersionish(
        moduleName, versionish, onVersion
    );

    function onVersion(err, tarball) {
        if (err) {
            return cb(err);
        }

        cb(null);
    }
};

Commands.prototype.ls = function ls(cb) {
    cb(new Error('funpm ls is not implemented'));
};

Commands.prototype.destroy = function destroy() {
    var self = this;

    self.registryClient.destroy();
};
