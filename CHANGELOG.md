# Changelog

## v0.3.3 | 2026-02-15
- add default output to the `createFile` function. Used only when the file doesn't exist.

## v0.3.2 | 2026-02-13
- correctly import async functions in the async module

## v0.3.1 | 2026-02-13
- use latest `tsc-leda` to correctly generate types

## v0.3.0 | 2026-02-13
- rename existing async `open` as `openAsHandle`
- add new async `open` that returns a file descriptor

## v0.2.1 | 2026-02-13
- use latest `tsc-leda` to correctly generate `.cjs` and `.mjs` files

## v0.2.0 | 2026-02-13
- add `createReadStream` and `createWriteStream` functions

## v0.1.1 | 2026-02-12
- update dev dependencies to have no known vulnerabilities

## v0.1.0 | 2026-02-12
- initial release
