'use strict';

var http = require('http');
var semver = require('semver');
var console = require('console');

module.exports = RegistryClient;

function RegistryClient() {
}

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

        cb(null, meta);
    }
};

RegistryClient.prototype.getPackage =
function getPackage(moduleName, cb) {
    var uri = 'http://registry.npmjs.org/' + moduleName;
    var body = '';

    console.log('funpm http request GET ' + uri);
    var req = http.get(uri, onResponse);
    req.on('error', cb);

    function onResponse(resp) {
        if (resp.statusCode !== 200) {
            return cb(new Error('failed fetch: ' + resp.statusCode));
        }

        resp.on('data', onData);
        resp.on('end', onEnd);
    }

    function onData(buf) {
        body += buf.toString();
    }

    function onEnd() {
        cb(null, JSON.parse(body));
    }
};
