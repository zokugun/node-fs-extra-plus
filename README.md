[@zokugun/fs-extra-plus](https://github.com/zokugun/node-fs-extra-plus)
=======================================================================

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/fs-extra-plus.svg?colorB=green)](https://www.npmjs.com/package/@zokugun/fs-extra-plus)
[![Donation](https://img.shields.io/badge/donate-ko--fi-green)](https://ko-fi.com/daiyam)
[![Donation](https://img.shields.io/badge/donate-liberapay-green)](https://liberapay.com/daiyam/donate)
[![Donation](https://img.shields.io/badge/donate-paypal-green)](https://paypal.me/daiyam99)

> Wraps `node:fs` to fully typed functions that resolve to a `Result`. Includes additional helpers.

Overview
--------

`@zokugun/fs-extra-plus` is a TypeScript-first port and fork of [`fs-extra`](https://github.com/jprichardson/node-fs-extra). The goal is to keep the battle-tested surface area of `fs-extra` while:

- rewriting everything in strict TypeScript so typings always match the implementation,
- every functions resolves to a [`Result`](https://github.com/zokugun/node-xtry) object instead of throwing. So you handle errors explicitly without exceptions.
- publishing dual ESM/CJS builds with identical named exports,
- tracking the latest Node.js `fs` additions (including `glob`, `mkdtempDisposable`, etc.),
- shipping first-party async and sync entry points to help bundlers tree-shake unused helpers,

Installation
------------

```bash
npm add @zokugun/fs-extra-plus
```

Usage
-----

**ESM / TypeScript**

```ts
import { ensureDir, pathExists, readJson, type FsVoidResult } from '@zokugun/fs-extra-plus/async';

async function main(): Promise<FsVoidResult> {
    const dir = await ensureDir('dist/cache');
    if (dir.fails) {
        return dir;
    }

    const exists = await pathExists('package.json'); // always Success<boolean>
    if (exists.value) {
        const pkg = await readJson('package.json');
        if (pkg.fails) {
            return pkg;
        }

        console.log(pkg.value.name);
    }
}
```

**CommonJS**

```js
const { ensureDir, copy, type FsVoidResult } = require('@zokugun/fs-extra-plus/sync');

function main(): FsVoidResult {
    const dir = ensureDir('dist/assets');
    if (dir.fails) {
        return dir;
    }

    const copy = copy('static/logo.svg', 'dist/assets/logo.svg');
    if (copy.fails) {
        return copy;
    }
}
```

Entry points
------------

- `@zokugun/fs-extra-plus` — mixed bundle exporting both async and sync helpers. **Functions have _Async_ or _Sync_ suffixes**
- `@zokugun/fs-extra-plus/async` — promise-based helpers only. no suffixes.
- `@zokugun/fs-extra-plus/sync` — synchronous counterparts. no suffixes.

Donations
---------

Support this project by becoming a financial contributor.

<table>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
        <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
        <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
    </tr>
    <tr>
        <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
        <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
    </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
