# funpm

<!--
    [![build status][build-png]][build]
    [![Coverage Status][cover-png]][cover]
    [![Davis Dependency status][dep-png]][dep]
-->

<!-- [![NPM][npm-png]][npm] -->

A fun package manager client

## Concept

A very minimal implementation of an `npm` client that has
very few features. Designed for performance and correctness.

Is compatible with the public NPM servers

## Commands

### install

`funpm install` will install from the current `funpm-shrinkwrap.json`
file in the current working directory.

The suggested workflows are:

 - `git clone a-project` and run `funpm install` to download
    its dependencies
 - `git checkout a-branch` and run `funpm install` to download
    the dependencies for the branch

If you want to install new modules; use `funpm update` instead.

### update

`funpm update` will update `node_modules`, `package.json` and
`funpm-shrinkwrap.json` with a new module.

It will do a pre-flight `npm ls` to ensure that the tree is
in a good shape before doing any mutations.

You run `funpm update module@version` to update a single module.
This will install the module at the version you asked and update
the `package.json` and `funpm-shrinkwrap.json` file.

### ls

`funpm ls` will show the current logical tree for your
node_modules on disk and tell you if it agrees or disagrees with
the `funpm-shrinkwrap.json` file.

### shrinkwrap

There is no `funpm shrinkwrap` command; It is build into `update`;
Each time you update a module, we update the shrinkwrap file.

## Installation

`npm install funpm -g`

## Tests

`npm test`

## Contributors

 - Raynos

## MIT Licensed

  [build-png]: https://secure.travis-ci.org/Raynos/funpm.png
  [build]: https://travis-ci.org/Raynos/funpm
  [cover-png]: https://coveralls.io/repos/Raynos/funpm/badge.png
  [cover]: https://coveralls.io/r/Raynos/funpm
  [dep-png]: https://david-dm.org/Raynos/funpm.png
  [dep]: https://david-dm.org/Raynos/funpm
  [npm-png]: https://nodei.co/npm/funpm.png?stars&downloads
  [npm]: https://nodei.co/npm/funpm
