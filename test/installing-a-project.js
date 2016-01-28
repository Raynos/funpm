'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var fixtures = require('fixtures-fs');
var parallel = require('collect-parallel/object');

var funpm = require('../bin/funpm.js');

test('installing some dependencies', fixtures(__dirname, {
    'error-test': {
        'package.json': JSON.stringify({
            'dependencies': {
                'error': '7',
                'xtend': 'latest'
            }
        })
    }
}, function t(assert) {
    var prefix = path.join(__dirname, 'error-test');
    var errorDir = path.join(prefix, 'node_modules', 'error');
    var xtendDir = path.join(prefix, 'node_modules', 'xtend');

    funpm.exec([
        'install', '--prefix', prefix
    ], onUpdate);

    function onUpdate(err) {
        assert.ifError(err);

        parallel({
            package: path.join(errorDir, 'package.json'),
            code: path.join(errorDir, 'typed.js'),
            package2: path.join(xtendDir, 'package.json'),
            code3: path.join(xtendDir, 'immutable.js'),

            code2: path.join(
                errorDir, 'node_modules',
                'string-template', 'index.js'
            )
        }, function read(fileName, key, cb) {
            fs.readFile(fileName, 'utf8', cb);
        }, onFiles);
    }

    function onFiles(err, results) {
        assert.ifError(err);
        assert.ifError(results.package.err);
        assert.ifError(results.code.err);
        assert.ifError(results.code2.err);
        assert.ifError(results.package2.err);
        assert.ifError(results.code3.err);

        var pkg = JSON.parse(String(results.package.value));
        assert.equal(pkg.name, 'error');

        var pkg2 = JSON.parse(String(results.package2.value));
        assert.equal(pkg2.name, 'xtend');

        var code = String(results.code.value);
        assert.ok(code.indexOf('function TypedError') !== -1);

        var code2 = results.code2.value;
        assert.ok(code2.indexOf('function template') !== -1);

        var code3 = String(results.code3.value);
        assert.ok(code3.indexOf('function extend') !== -1);

        assert.end();
    }
}));
