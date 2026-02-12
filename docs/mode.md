# Mode Reference

The `mode` helpers wrap the complexity of Unix permission bits into a single set of typed utilities. Every helper in `src/mode/` accepts the union type `Mode` and converts or compares the underlying permissions without throwing. All functions return a [`Result`](https://github.com/zokugun/node-xtry) so you always handle failures explicitly.

## Representations at a Glance

| Representation | Type alias | Example | Notes |
| --- | --- | --- | --- |
| Number mode | `number` | `0o755` | Bitmask stored as an integer. Always clamped to `MASK (0o7777)` so it may include `SETUID`, `SETGID`, or `STICKY`. |
| Object mode | `ObjectMode` | `{ user: { read: true, write: true, execute: true }, ... }` | Verbose boolean structure, great for programmatic editing. |
| Octal mode | `OctalMode` | `0o755`, `0755`, `755`, `+644` | String of 1–4 octal digits. Allows optional chmod-style prefixes (`+`, `-`, `=`), shell escapes (`\`), or `0`/`0o` literals. |
| Stat mode | `StatMode` | `rwxr-xr-x`, `lrw-r--r--`, `--- --- --x` | POSIX `ls -l` strings. Accepts optional file-type prefix (`-`, `d`, `l`, …) and whitespace between triplets. |
| Symbolic mode | `SymbolicMode` | `u+rwx,g=rx,o-x`, `+x`, `a-`, `o+t,g-s` | `chmod` clause syntax with comma-separated operations, optional targets, and optional permissions per clause. |

## Number Mode

- Internal representation for almost every helper. Use `toNumber(mode)` to convert any input into a clamped value.
- Bits are masked by `MASK (0o7777)` so out-of-range integers simply drop unsupported bits.
- Call `sanitize(mode)` before writing to disk if you need portable behavior; on Windows it strips execute bits and converts to read-only or read-write depending on the write flag.

## Object Mode

```ts
export type ObjectMode = {
    user?: { read?: boolean; write?: boolean; execute?: boolean };
    group?: { read?: boolean; write?: boolean; execute?: boolean };
    others?: { read?: boolean; write?: boolean; execute?: boolean };
    all?: { read?: boolean; write?: boolean; execute?: boolean };
    special?: { setuid?: boolean; setgid?: boolean; sticky?: boolean };
};
```

- Guarantees all flags are present, making it the safest option for UI forms or JSON configs.
- Convert objects with `toObject(mode)` or build from scratch and call `objectToNumber()` indirectly through `toNumber`/`toOctal`/…

## Octal Mode

- Matches the strings typically passed to `chmod 0o755 file`.
- Accepted forms:
  - Plain digits: `755`
  - With leading zeros: `0755`, `00xx`
  - With `0o`/`0O` prefix: `0o755`
  - With shell escape: `\0755`
  - With single leading operator: `+644`, `-0o11`, `=077`
- Whitespace is trimmed prior to validation.
- Use `isOctal(value)` to quickly check a string without converting it.

## Stat Mode

- Human-readable mode used by `ls -l` and `stat` utilities.
- Accepts the standard `r`, `w`, `x`, `-` characters plus special execute markers (`s`, `S`, `t`, `T`, `X`).
- Optional elements:
  - File-type prefix (`-`, `d`, `l`, `p`, `s`, `c`, `b`, `D`).
  - Whitespace separators between permission triplets (`--- --- ---`).
- Triplets may include uppercase variants for sticky/setuid/setgid slots, matching the `fs` output.
- File-type prefixes indicate what kind of inode was inspected: `-` (regular file), `d` (directory), `l` (symlink), `p` (named pipe), `s` (socket), `c` (character device), `b` (block device), `D` (Solaris-style door). They do not affect permissions but help you visually distinguish entries.
- Execute-column markers carry extra meaning:
  - `s` / `S` in the user triplet show `SETUID` is enabled; lowercase `s` means execute is also enabled, uppercase `S` means execute is disabled.
  - `s` / `S` in the group triplet show `SETGID` (with the same lowercase/uppercase rule).
  - `t` / `T` in the others triplet show the sticky bit; lowercase `t` bundles execute, uppercase `T` indicates execute is off.
  - `X` appears in GNU `stat` output and indicates a conditional execute flag (execute applies only when the path is a directory or already had execute set elsewhere).
- Use `isStat(value)` to quickly check a string without converting it.

## Symbolic Mode

- Mirrors the grammar accepted by `chmod`.
- Clause structure (`[targets][operator][permissions]`):
  - **Targets**: optional string containing any combination of `u`, `g`, `o`, or `a`. Missing targets default to `a` (all).
  - **Operator**: one of `+`, `-`, or `=`.
  - **Permissions**: zero or more of `r`, `w`, `x`, `s`, `t`, `X`. Empty permission lists are valid when combined with `+`, `-`, or `=` to express “do nothing” for that category.
- `X` works exactly like the GNU/`chmod` conditional execute flag: it only sets execute bits when the selected target already had execute or when the referenced path is a directory.
- Clauses are comma-separated; extra whitespace around commas is ignored. Duplicate permission letters within the same clause are rejected.
- Examples: `a+rwx`, `g-wx,u+s`, `+x`, `=`, `o+t,g-s`.

## Operator Prefixes

Both octal strings and symbolic clauses may include the `chmod` operators `+`, `-`, or `=`. They behave the same regardless of representation:

- `+` – grant the listed permissions in addition to the existing bits for the selected targets.
- `-` – remove the listed permissions while leaving unrelated bits untouched.
- `=` – replace the entire targeted block by clearing every bit before applying only the listed permissions.

Octal strings use a single leading operator (`+644`, `-0o22`, `=077`) to describe relative adjustments, while symbolic clauses may repeat the operator per clause (e.g., `g+w`, `o-x`).

## Special Bits

Three high-order bits sit above the normal read/write/execute masks and appear across every representation:

- `SETUID` (`0o4000`) – when set on an executable file, processes run with the file owner's user ID; on directories, it can force new files to inherit ownership.
- `SETGID` (`0o2000`) – mirrors `SETUID` but for the group ID; on directories it keeps new files within the directory's group.
- `STICKY` (`0o1000`) – most visible on world-writable directories (like `/tmp`), ensuring only the file owner or root can remove entries.

In stat strings, these flags surface as the `s/S` markers for user/group and the `t/T` markers for others. Symbolic clauses refer to them via `u+s`, `g-s`, or `o+t`, and octal literals simply include the extra leading digit (e.g., `0o4755`).

## Conversion Helpers

All converters return `Result<T, string>` and share the same error messages:

- `toNumber(mode)` – canonical bitmask, clamps to `MASK`.
- `toOctal(mode)` – stringified octal literal (always prefixed with `0o`).
- `toStat(mode)` – `rwxr-xr-x` style string.
- `toSymbolic(mode)` – minimal set of symbolic clauses (e.g., `u+rwx,g+rx,o+rx`).
- `toObject(mode)` – boolean structure described above.

Each helper accepts any `Mode` input: numbers, strings, or objects. Errors are surfaced through `Result.fails` so you can bubble them up unchanged.

## Utility Helpers

- `equals(a, b)` – converts both values (preferring symbolic if either input is symbolic) and compares the normalized results.
- `includes(a, b)` – bitwise check to see if `a` already grants every permission present in `b`.
- `merge(...modes)` – bitwise OR across every input, returning a numeric mode inside a `Result`.
- `min(...modes)` / `max(...modes)` – track the smallest or largest numeric value.
- `sanitize(mode)` – normalize raw numbers, especially useful before writing permissions on Windows.

## Examples

```ts
import { toOctal, toSymbolic, equals, merge } from '@zokugun/fs-extra-plus/src/mode/index.js';

const mode = merge(0o640, 'u+x', { user: { read: true, write: true, execute: false }, group: { read: true, write: false, execute: false }, others: { read: false, write: false, execute: false }, special: { setuid: false, setgid: false, sticky: false } });
if(mode.fails) {
    throw new Error(mode.error);
}

const octal = toOctal(mode.value);
const symbolic = toSymbolic(mode.value);

console.log(octal.value);     // -> 0o764
console.log(symbolic.value);  // -> u+rwx,g+r,o-rwx
console.log(equals('0o764', symbolic.value)); // true
```

Use this document as a quick reference whenever you need to translate between representations or pick the right helper for your workflow.
