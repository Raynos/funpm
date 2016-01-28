'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var fixtures = require('fixtures-fs');
var parallel = require('collect-parallel/object');

var funpm = require('../bin/funpm.js');

test('updating xtend@latest', fixtures(__dirname, {
    'xtend-test': {
        'package.json': JSON.stringify({
            'dependencies': {}
        })
    }
}, function t(assert) {
    var prefix = path.join(__dirname, 'xtend-test');
    var xtendDir = path.join(prefix, 'node_modules', 'xtend');
    funpm.exec([
        'update', '--prefix', prefix, 'xtend@latest'
    ], onUpdate);

    function onUpdate(err) {
        assert.ifError(err);

        parallel({
            package: path.join(xtendDir, 'package.json'),
            code: path.join(xtendDir, 'immutable.js')
        }, function read(fileName, key, cb) {
            fs.readFile(fileName, cb);
        }, onFiles);
    }

    function onFiles(err, results) {
        assert.ifError(err);
        assert.ifError(results.package.err);
        assert.ifError(results.code.err);

        var pkg = JSON.parse(String(results.package.value));
        assert.equal(pkg.name, 'xtend');

        var code = String(results.code.value);
        assert.ok(code.indexOf('function extend') !== -1);

        assert.end();
    }
}));
