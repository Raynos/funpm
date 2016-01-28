'use strict';

var zlib = require('zlib');
var tar = require('tar');
var path = require('path');

var RegistryClient = require('./registry-client.js');
var TarballRepository = require('./tarball-repository.js');

module.exports = NodeModulesInstaller;

function NodeModulesInstaller() {
    this.registryClient = new RegistryClient();
    this.tarballRepository = new TarballRepository();
}

NodeModulesInstaller.prototype.installModule =
function installModule(prefix, moduleName, versionish, cb) {
    var self = this;

    self.unpackModule(prefix, moduleName, versionish, onUnpackaged);

    function onUnpackaged(err) {
        if (err) {
            return cb(err);
        }

        cb(null);
    }
};

NodeModulesInstaller.prototype.unpackModule =
function unpackModule(prefix, moduleName, versionish, cb) {
    var self = this;

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

        var location = path.join(prefix, 'node_modules', moduleName);
        self.installTarballStream(response, location, cb);
    }
};

NodeModulesInstaller.prototype.installTarballStream =
function installTarballStream(stream, location, cb) {
    stream
        .on('error', onError)
        .pipe(zlib.Unzip())
        .on('error', onError)
        .pipe(tar.Extract({
            type: 'Directory',
            path: location,
            strip: 1
        }))
        .on('error', onError)
        .on('close', onClose);

    function onError(err) {
        cb(err);
    }

    function onClose() {
        cb(null);
    }
};
