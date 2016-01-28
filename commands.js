'use strict';

var assert = require('assert');
var path = require('path');
var process = global.process;

var RegistryClient = require('./registry-client.js');
var TarballRepository = require('./tarball-repository.js');
var NodeModulesInstaller = require('./node-modules-installer.js');

module.exports = Commands;

function Commands(argv) {
    this.argv = argv;

    this.prefix = argv.prefix || process.cwd();
    this.registryClient = new RegistryClient();
    this.tarballRepository = new TarballRepository();
    this.installer = new NodeModulesInstaller();
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

        self.tarballRepository.fetchTarball(tarball, onTarball);
    }

    function onTarball(err, response) {
        if (err) {
            return cb(err);
        }

        var location = path.join(self.prefix, 'node_modules', moduleName);
        self.installer.installTarballStream(
            response, location, onInstalled
        );
    }

    function onInstalled(err) {
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
