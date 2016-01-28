'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var fixtures = require('fixtures-fs');
var parallel = require('collect-parallel/object');

var funpm = require('../bin/funpm.js');

test('updating error@7', fixtures(__dirname, {
    'error-test': {
        'package.json': {
            'dependencies': {}
        }
    }
}, function t(assert) {
    var prefix = path.join(__dirname, 'error-test');
    var errorDir = path.join(prefix, 'node_modules', 'error');
    var client = funpm.exec([
        'update', '--prefix', prefix, 'error@7'
    ], onUpdate);

    function onUpdate(err) {
        assert.ifError(err);

        parallel({
            package: path.join(errorDir, 'package.json'),
            code: path.join(errorDir, 'typed.js')
        }, function read(fileName, key, cb) {
            fs.readFile(fileName, cb);
        }, onFiles);
    }

    function onFiles(err, results) {
        assert.ifError(err);
        assert.ifError(results.package.err);
        assert.ifError(results.code.err);

        var pkg = JSON.parse(String(results.package.value));
        assert.equal(pkg.name, 'error');

        var code = String(results.code.value);
        assert.ok(code.indexOf('function TypedError') !== -1);

        client.destroy();
        assert.end();
    }
}));
