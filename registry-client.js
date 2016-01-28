'use strict';

var http = require('http');
var LBPool = require('lb_pool').Pool;
var semver = require('semver');

module.exports = RegistryClient;

function RegistryClient() {
    if (!(this instanceof RegistryClient)) {
        return new RegistryClient();
    }

    var self = this;

    self.npmPool = new LBPool(http, [
        'registry.npmjs.org:80',
        'registry.npmjs.org:80',
        'registry.npmjs.org:80'
    ], {
        maxPending: 300,
        maxSockets: 2,
        resolution: 500,
        timeout: 5000,
        keepAlive: false,
        ping: '/'
    });
}

RegistryClient.prototype.destroy = function destroy() {
    var self = this;

    self.npmPool.close();
};

RegistryClient.prototype.resolveVersionish =
function resolveVersionish(moduleName, versionish, cb) {
    var self = this;

    // either a range or `null`
    var isVersion = semver.valid(versionish);
    var rangeExpression = semver.validRange(versionish);
    var isTag = rangeExpression === null;

    self.getPackage(moduleName, onPackage);

    function onPackage(err, pkg) {
        if (err) {
            return cb(err);
        }

        var version = null;
        if (isVersion) {
            version = versionish;
        }

        if (isTag) {
            version = pkg['dist-tags'][versionish];
            if (!version) {
                return cb(new Error('unknown tag: ' +
                    module + '@' + versionish));
            }
        }

        if (rangeExpression) {
            var validVersions = Object.keys(pkg.versions);
            version = semver.maxSatisfying(
                validVersions, rangeExpression
            );
        }

        var meta = pkg.versions[version];
        var tarball = meta.dist.tarball;

        cb(null, tarball);
    }
};

RegistryClient.prototype.getPackage =
function getPackage(moduleName, cb) {
    var self = this;

    self.npmPool.get('/' + moduleName, onResponse);

    function onResponse(err, resp, body) {
        if (err) {
            return cb(err);
        }

        cb(null, JSON.parse(body));
    }
};
