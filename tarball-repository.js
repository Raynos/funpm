'use strict';

var http = require('http');
var url = require('url');

module.exports = TarballRepository;

function TarballRepository() {
    if (!(this instanceof TarballRepository)) {
        return new TarballRepository();
    }
}

TarballRepository.prototype.fetchTarball =
function fetchTarball(tarballUrl, callback) {
    var uri = url.parse(tarballUrl);
    var called = false;

    var req = http.request({
        hostname: uri.host,
        port: 80,
        path: uri.path,
        method: 'GET'
    }, onResponse);

    req.on('error', function onError(err) {
        if (!called) {
            called = true;
            callback(err);
        }
    });

    req.end();

    function onResponse(response) {
        if (!called) {
            called = true;
            callback(null, response);
        }
    }
};
