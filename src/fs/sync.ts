import fs from 'node:fs';
import { type SyncFunction, xtryify, xtryifyIterable } from '@zokugun/xtry/sync';

const xtryifyFs = <Fn extends (...args: any[]) => any>(fn: SyncFunction<Fn>) => xtryify<NodeJS.ErrnoException, Fn>(fn);
const xtryifyIterableFs = <Fn extends (...args: any[]) => Iterable<unknown>>(fn: Fn) => xtryifyIterable<NodeJS.ErrnoException, Fn>(fn);

const access = xtryifyFs(fs.accessSync);
const appendFile = xtryifyFs(fs.appendFileSync);
const chmod = xtryifyFs(fs.chmodSync);
const chown = xtryifyFs(fs.chownSync);
const close = xtryifyFs(fs.closeSync);
const copyFile = xtryifyFs(fs.copyFileSync);
const cp = xtryifyFs(fs.cpSync);
const exists = xtryifyFs(fs.existsSync);
const fchmod = xtryifyFs(fs.fchmodSync);
const fchown = xtryifyFs(fs.fchownSync);
const fdatasync = xtryifyFs(fs.fdatasyncSync);
const fstat = xtryifyFs(fs.fstatSync);
const fsync = xtryifyFs(fs.fsyncSync);
const ftruncate = xtryifyFs(fs.ftruncateSync);
const futimes = xtryifyFs(fs.futimesSync);
const glob = fs.globSync ? xtryifyIterableFs(fs.globSync) : undefined;
// eslint-disable-next-line n/no-deprecated-api
const lchmod = xtryifyFs(fs.lchmodSync);
const lchown = xtryifyFs(fs.lchownSync);
const link = xtryifyFs(fs.linkSync);
const lstat = xtryifyFs(fs.lstatSync);
const lutimes = xtryifyFs(fs.lutimesSync);
const mkdir = xtryifyFs(fs.mkdirSync);
const mkdtemp = xtryifyFs(fs.mkdtempSync);
const mkdtempDisposable = xtryifyFs(fs.mkdtempDisposableSync);
const open = xtryifyFs(fs.openSync);
const read = xtryifyFs(fs.readSync);
const readv = xtryifyFs(fs.readvSync);
const readFile = xtryifyFs(fs.readFileSync);
const readdir = xtryifyFs(fs.readdirSync);
const readlink = xtryifyFs(fs.readlinkSync);
const realpath = xtryifyFs(fs.realpathSync);
const rename = xtryifyFs(fs.renameSync);
const rm = xtryifyFs(fs.rmSync);
const rmdir = xtryifyFs(fs.rmdirSync);
const stat = xtryifyFs(fs.statSync);
const statfs = xtryifyFs(fs.statfsSync);
const symlink = xtryifyFs(fs.symlinkSync);
const truncate = xtryifyFs(fs.truncateSync);
const unlink = xtryifyFs(fs.unlinkSync);
const utimes = xtryifyFs(fs.utimesSync);
const write = xtryifyFs(fs.writeSync);
const writev = xtryifyFs(fs.writevSync);
const writeFile = xtryifyFs(fs.writeFileSync);

export {
	access,
	appendFile,
	chmod,
	chown,
	close,
	copyFile,
	cp,
	exists,
	fchmod,
	fchown,
	fdatasync,
	fstat,
	fsync,
	ftruncate,
	futimes,
	glob,
	lchmod,
	lchown,
	link,
	lstat,
	lutimes,
	mkdir,
	mkdtemp,
	mkdtempDisposable,
	open,
	read,
	readv,
	readFile,
	readdir,
	readlink,
	realpath,
	rename,
	rm,
	rmdir,
	stat,
	statfs,
	symlink,
	truncate,
	unlink,
	utimes,
	write,
	writev,
	writeFile,
};
