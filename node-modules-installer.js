'use strict';

var zlib = require('zlib');
var tar = require('tar');
var path = require('path');
var fs = require('fs');

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

    function onUnpackaged(err, pkg) {
        if (err) {
            return cb(err);
        }

        var location = path.join(prefix, 'node_modules', moduleName);
        self.installAllModules(location, pkg, cb);
    }
};

NodeModulesInstaller.prototype.installProject =
function installProject(prefix, cb) {
    var self = this;

    var packageFile = path.join(prefix, 'package.json');
    fs.readFile(packageFile, 'utf8', onFile);

    function onFile(err, content) {
        if (err) {
            return cb(err);
        }

        var pkg = JSON.parse(content);
        self.installAllModules(prefix, pkg, cb);
    }
};

NodeModulesInstaller.prototype.installAllModules =
function installAllModules(prefix, pkg, cb) {
    var self = this;

    var deps = pkg.dependencies ? Object.keys(pkg.dependencies) : null;
    if (!deps || deps.length === 0) {
        return cb(null);
    }

    var counter = deps.length;
    for (var i = 0; i < deps.length; i++) {
        var moduleName = deps[i];
        var versionish = pkg.dependencies[moduleName];

        self.installModule(prefix, moduleName, versionish, onInstalled);
    }

    function onInstalled(err) {
        if (err && counter > 0) {
            counter = 0;
            return cb(err);
        }

        if (--counter === 0) {
            return cb(null);
        }
    }
};

NodeModulesInstaller.prototype.unpackModule =
function unpackModule(prefix, moduleName, versionish, cb) {
    var self = this;

    var _meta = null;

    self.registryClient.resolveVersionish(
        moduleName, versionish, onVersion
    );

    function onVersion(err, meta) {
        if (err) {
            return cb(err);
        }

        _meta = meta;

        self.tarballRepository.fetchTarball(_meta.dist.tarball, onTarball);
    }

    function onTarball(err, response) {
        if (err) {
            return cb(err);
        }

        var location = path.join(prefix, 'node_modules', moduleName);
        self.installTarballStream(response, location, onInstalled);
    }

    function onInstalled(err) {
        if (err) {
            return cb(err);
        }

        cb(null, _meta);
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
