import path from 'node:path';
import { expect, it } from 'vitest';
import fse from '../src/index.js';

it('should absolute', () => {
	expect(fse.absolute('.')).to.equal(path.resolve('.'));
	expect(fse.absolute('/opt/webroot')).to.equal('/opt/webroot');
	expect(fse.absolute('opt/webroot')).to.equal(path.resolve('.') + '/opt/webroot');
	expect(fse.absolute('./opt/webroot')).to.equal(path.resolve('.') + '/opt/webroot');
	expect(fse.absolute('../opt/webroot')).to.equal(path.resolve('..') + '/opt/webroot');
});

it('should basename', () => {
	expect(fse.basename('/opt/webroot')).to.equal('webroot');
	expect(fse.basename('/opt/webroot/')).to.equal('webroot');
});

it('should join', () => {
	expect(fse.join('/opt/webroot', 'img')).to.equal('/opt/webroot/img');
	expect(fse.join('/opt/webroot/', 'img')).to.equal('/opt/webroot/img');
	expect(fse.join('/opt/webroot', '/img')).to.equal('/opt/webroot/img');
	expect(fse.join('/opt/webroot/', '/img')).to.equal('/opt/webroot/img');

	expect(fse.join('/opt/webroot/', '..', '/img')).to.equal('/opt/img');
	expect(fse.join('/opt/webroot/', '..', 'webroot', '/img')).to.equal('/opt/webroot/img');
});

it('should parent', () => {
	expect(fse.parent('/opt/webroot')).to.equal('/opt');
	expect(fse.parent('/opt/webroot/')).to.equal('/opt');
});

it('should relative', () => {
	expect(fse.relative('/opt/webroot', '/opt/webroot/img')).to.equal('img');
	expect(fse.relative('/opt/webroot', '/opt/node_modules')).to.equal('../node_modules');
});

it('should resolve', () => {
	expect(fse.resolve('.')).to.equal(path.resolve('.'));
	expect(fse.resolve('/opt/webroot')).to.equal('/opt/webroot');
	expect(fse.resolve('opt/webroot')).to.equal(path.resolve('.') + '/opt/webroot');
	expect(fse.resolve('./opt/webroot')).to.equal(path.resolve('.') + '/opt/webroot');
	expect(fse.resolve('../opt/webroot')).to.equal(path.resolve('..') + '/opt/webroot');
});

it('should have separator', () => {
	expect(fse.separator).to.equal(path.sep);
});
