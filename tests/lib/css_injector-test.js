const BroccoliTestHelper = require('broccoli-test-helper');
const createTempDir = BroccoliTestHelper.createTempDir;
const co = require('co');
const fs = require('fs');
const path = require('path');
const stripIndent = require('common-tags').stripIndent;

const CSSInjector = require('../../lib/css_injector.js');

const test = QUnit.test;

QUnit.module('CSSInjector', function(hooks) {
  let input, output;

  hooks.beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    output = yield createTempDir();
  }));

  hooks.afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  test('injects css only for files specified as filePathsToInject argument', function(assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': stripIndent`
        <link rel="stylesheet" href="/assets/vendor.css">
        <link rel="stylesheet" href="/assets/app.css">
      `
    };
    input.write(fixture);

    let injector = new CSSInjector({
      rootPath: input.path(),
      filePathsToInject: [ 'assets/vendor.css' ]
    });

    injector.write(path.join(output.path(), 'index.html'))

    assert.equal(output.read()['index.html'], `<style>a { background-color: blue; }</style>\n<link rel=\"stylesheet\" href=\"/assets/app.css\">`);
  });

  test('matches link tags with any attributes', function(assert) {
    let fixture = {
      'assets': {
        'vendor.css': 'a { background-color: blue; }',
        'app.css': 'h1 { background-color: green; }'
      },
      'index.html': stripIndent`
        <link type="text/css" rel="stylesheet" href="/assets/vendor.css">
        <link integrity="" rel="stylesheet" href="/assets/app.css">
      `
    };
    input.write(fixture);

    let injector = new CSSInjector({
      rootPath: input.path(),
      filePathsToInject: [ 'assets/vendor.css', 'assets/app.css' ]
    });

    injector.write(path.join(output.path(), 'index.html'))

    assert.equal(output.read()['index.html'], `<style>a { background-color: blue; }</style>\n<style>h1 { background-color: green; }</style>`);
  });

  test('matches link tags with fingerprints', function(assert) {
    let fixture = {
      'assets': {
        'vendor-83fh92fh9ha309fhf29fh313.css': 'a { background-color: blue; }',
        'app-f32fawwefaw3f2f2g23g23g32g23.css': 'h1 { background-color: green; }'
      },
      'index.html': stripIndent`
        <link type="text/css" rel="stylesheet" href="/assets/vendor-83fh92fh9ha309fhf29fh313.css">
        <link integrity="" rel="stylesheet" href="/assets/app-f32fawwefaw3f2f2g23g23g32g23.css">
      `
    };
    input.write(fixture);

    let injector = new CSSInjector({
      rootPath: input.path(),
      filePathsToInject: [ 'assets/vendor-83fh92fh9ha309fhf29fh313.css', 'assets/app-f32fawwefaw3f2f2g23g23g32g23.css' ]
    });

    injector.write(path.join(output.path(), 'index.html'))

    assert.equal(output.read()['index.html'], `<style>a { background-color: blue; }</style>\n<style>h1 { background-color: green; }</style>`);
  });
});
