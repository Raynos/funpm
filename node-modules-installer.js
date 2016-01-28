'use strict';

var zlib = require('zlib');
var tar = require('tar');

module.exports = NodeModulesInstaller;

function NodeModulesInstaller() {
}

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
