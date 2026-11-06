Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][keepachangelog], and this project adheres to [Semantic Versioning][semver].

[v0.6.6] | 2026-11-06
---------------------

### Changed

- use latest version of the dependencies

[v0.6.5] | 2026-11-04
---------------------

### Changed

- update `@zokugun/xtry` dependency to deduplicate/reduce generated types.

[v0.6.4] | 2026-11-04
---------------------

### Fixed

- fix type of the `readFile` function

[v0.6.3] | 2026-11-03
---------------------

### Fixed

- `mime-types` is optional in the `openAsBlob` function

### Changed

- update `@zokugun/fs-path` dependency

[v0.6.2] | 2026-08-30
---------------------

### Added

- export `Globber` type

[v0.6.1] | 2026-06-28
---------------------

### Fixed

- fix `walk` types with `asPaths` option

### Added

- add `emptyIfDirMissing` option to `walk`

[v0.6.0] | 2026-06-28
---------------------

### Breaking

- rename `walk` option `depthLimit` as `maxDepth`

### Added

- add `walk` new options (`asPaths`, `followSymlinks`, `glob`, `maxResults` and `signal`)

[v0.5.0] | 2026-05-31
---------------------

### Added

- add `makeTempDir`, `makeTempFile` and `outputTempFile` functions
- add `collect` option to `walk` function
- expose `@zokugun/fs-path` through dedicated `path` entry and others entries (minus `posix` and `win32`)

[v0.4.1] | 2026-05-03
---------------------

### Fixed

- add missing `copy` exports

[v0.4.0] | 2026-05-02
---------------------

### Added

- add `untildify` function
- add `stringifyJSON` and `stripBOM` aliases

[v0.3.8] | 2026-04-25
---------------------

### Added

- expose some utility functions (`stringifyJson` and `stripBom`)

[v0.3.7] | 2026-04-09
---------------------

### Changed

- use locked dependencies
- use GitHub Environment to publish

[v0.3.6] | 2026-03-04
---------------------

### Fixed

- close `Dir` in the functions `isEmptyDir` and `isNonEmptyDir`

[v0.3.5] | 2026-03-03
---------------------

### Fixed

- fix compatibility for Node.js 18.x

[v0.3.4] | 2026-03-01
---------------------

### Changed

- update dependencies

[v0.3.3] | 2026-02-15
---------------------

### Changed

- add default output to the `createFile` function. Used only when the file doesn't exist.

[v0.3.2] | 2026-02-13
---------------------

### Fixed

- correctly import async functions in the async module

[v0.3.1] | 2026-02-13
---------------------

### Changed

- use latest `tsc-leda` to correctly generate types

[v0.3.0] | 2026-02-13
---------------------

### Breaking

- rename existing async `open` as `openAsHandle`

### Added

- add new async `open` that returns a file descriptor

[v0.2.1] | 2026-02-13
---------------------

### Changed

- use latest `tsc-leda` to correctly generate `.cjs` and `.mjs` files

[v0.2.0] | 2026-02-13
---------------------

### Added

- add `createReadStream` and `createWriteStream` functions

[v0.1.1] | 2026-02-12
---------------------

### Changed

- update dev dependencies to have no known vulnerabilities

[v0.1.0] | 2026-02-12
---------------------

### Added

- initial release

[keepachangelog]: https://keepachangelog.com/en/2.0.0/
[semver]: https://semver.org/spec/v2.0.0.html
[unreleased]: https://github.com/zokugun/node-fs-extra-plus/compare/v0.6.6...HEAD
[v0.6.6]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.6
[v0.6.5]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.5
[v0.6.4]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.4
[v0.6.3]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.3
[v0.6.2]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.2
[v0.6.1]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.1
[v0.6.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.6.0
[v0.5.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.5.0
[v0.4.1]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.4.1
[v0.4.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.4.0
[v0.3.8]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.8
[v0.3.7]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.7
[v0.3.6]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.6
[v0.3.5]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.5
[v0.3.4]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.4
[v0.3.3]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.3
[v0.3.2]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.2
[v0.3.1]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.1
[v0.3.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.3.0
[v0.2.1]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.2.1
[v0.2.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.2.0
[v0.1.1]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.1.1
[v0.1.0]: https://github.com/zokugun/node-fs-extra-plus/releases/tag/v0.1.0
