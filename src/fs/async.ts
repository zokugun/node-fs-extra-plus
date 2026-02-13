import fs from 'node:fs';
import fsa from 'node:fs/promises';
import { type AsyncFunction, xtryify, xtryifyIterable } from '@zokugun/xtry/async';
import { toPromise } from '../utils/to-promise.js';

const xtryifyFs = <Fn extends (...args: any[]) => any>(fn: AsyncFunction<Fn>) => xtryify<NodeJS.ErrnoException, Fn>(fn);
const xtryifyIterableFs = <Fn extends (...args: any[]) => AsyncIterable<unknown>>(fn: Fn) => xtryifyIterable<NodeJS.ErrnoException, Fn>(fn);

const access = xtryifyFs(fsa.access);
const appendFile = xtryifyFs(fsa.appendFile);
const chmod = xtryifyFs(fsa.chmod);
const chown = xtryifyFs(fsa.chown);
const close = xtryifyFs(toPromise(fs.close));
const copyFile = xtryifyFs(fsa.copyFile);
const cp = xtryifyFs(fsa.cp);
// eslint-disable-next-line n/no-deprecated-api
const exists = xtryifyFs(toPromise(fs.exists));
const fchmod = xtryifyFs(toPromise(fs.fchmod));
const fchown = xtryifyFs(toPromise(fs.fchown));
const fdatasync = xtryifyFs(toPromise(fs.fdatasync));
const fstat = xtryifyFs(toPromise(fs.fstat));
const fsync = xtryifyFs(toPromise(fs.fsync));
const ftruncate = xtryifyFs(toPromise(fs.ftruncate));
const futimes = xtryifyFs(toPromise(fs.futimes));
const glob = fsa.glob ? xtryifyIterableFs(fsa.glob) : undefined;
const lchmod = xtryifyFs(fsa.lchmod);
const lchown = xtryifyFs(fsa.lchown);
const link = xtryifyFs(fsa.link);
const lstat = xtryifyFs(fsa.lstat);
const lutimes = xtryifyFs(fsa.lutimes);
const mkdir = xtryifyFs(fsa.mkdir);
const mkdtemp = xtryifyFs(fsa.mkdtemp);
const mkdtempDisposable = xtryifyFs(fsa.mkdtempDisposable);
const openAsBlob = xtryifyFs(fs.openAsBlob ?? import('../open-as-blob/async.js'));
const read = xtryifyFs(toPromise(fs.read));
const readv = xtryifyFs(toPromise(fs.readv));
const readFile = xtryifyFs(fsa.readFile);
const readdir = xtryifyFs(fsa.readdir);
const readlink = xtryifyFs(fsa.readlink);
const realpath = xtryifyFs(fsa.realpath);
const rename = xtryifyFs(fsa.rename);
const rm = xtryifyFs(fsa.rm);
const rmdir = xtryifyFs(fsa.rmdir);
const stat = xtryifyFs(fsa.stat);
const statfs = xtryifyFs(fsa.statfs);
const symlink = xtryifyFs(fsa.symlink);
const truncate = xtryifyFs(fsa.truncate);
const unlink = xtryifyFs(fsa.unlink);
const utimes = xtryifyFs(fsa.utimes);
const write = xtryifyFs(toPromise(fs.write));
const writev = xtryifyFs(toPromise(fs.writev));
const writeFile = xtryifyFs(fsa.writeFile);

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
	openAsBlob,
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
