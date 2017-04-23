#!/usr/bin/env node

import Vorpal = require('vorpal');
import { spawn } from 'child_process';
import { writeFile } from 'fs';
import { resolve } from 'path';
import * as readPkgUp from 'read-pkg-up';
import { atTypesLength, fetchTypesListFromNpmsIoApi, getNamesFromItem } from './fetch-types-list-from-npmsio-api';
import R = require('ramda');

let exclusions = ['typescript', '@types/typescript'];

let runCmdAsync = async (cmd: string) => {
	let [b, ...r] = cmd.split(' ');
	let c = spawn(b, r, { stdio: 'inherit' });
	await new Promise(r => c.on('exit', r));
	return;
};
let atTypesStr = '@types/';
let addAtTypeIfNotExist = k => k.startsWith(atTypesStr) ? k : atTypesStr + k;
let installCmd = (cmdType) => async (pkgNames: string[]) => {
	let cmd = `${cmdType} ${pkgNames.map(addAtTypeIfNotExist).join(' ')}`;
	V.log('executing', cmd);
	return await runCmdAsync(cmd);
};
let yarnAddAtTypesPkg = installCmd('yarn add');
let npmInstallAtTypesPkg = installCmd('npm install');
let getAllDepsFromPkgJson = R.pipe(
	R.toPairs,
	R.filter(([k]) => k.toLowerCase().indexOf('dependencies') !== -1),
	R.map(R.nth(1)),
	R.reduce(R.merge, {}),
	R.toPairs,
	R.map(R.nth(0)),
	R.filter(i => R.complement(R.contains)(i, exclusions)),
);

let V = Vorpal();
V.command('install [pkgs...]', 'install @types package')
	.alias('i')
	.option('-e, --engine <engine>', '[yarn]|[npm] for installation default yarn')
	.action(async (arg, cb) => {
		let { pkgs, options: { engine = 'yarn' } } = arg;
		let installer = engine === 'yarn' ? yarnAddAtTypesPkg : npmInstallAtTypesPkg;
		if (pkgs) {
			await installer(pkgs);
			cb();
			process.exit(0);
			return;
		}
		try {
			let typingsList = require('../../at-types-list.json');
			let { path, pkg } = await readPkgUp();
			let items = getAllDepsFromPkgJson(pkg);
			let [atTypes, deps] = R.partition((s: string) => s.startsWith(atTypesStr))(items as any);
			atTypes = R.map((s: string) => s.slice(atTypesLength))(atTypes);
			let depsWithNoTypings = R.difference(deps, atTypes);
			let targets = R.filter((s: string) => typingsList.indexOf(s) !== -1)(depsWithNoTypings);
			if (targets.length > 0) {
				await installer(targets);
			} else {
				V.log('all @types deps installed');
			}
		} catch (e) {
			console.error('run `typings-install` update first');
		}
		cb();
	});
V.command('update', 'update the @types names registry from npms.io')
	.alias('u')
	.action(async (arg, cb) => {
		let pkgJsonList = [];
		let { total, results } = await fetchTypesListFromNpmsIoApi(0);
		V.log(total + ' @types package');
		pkgJsonList = pkgJsonList.concat(results);
		let n = parseInt((total / 250).toString());
		let pages = R.range(1, n);
		for (let i of pages) {
			V.log(`${i + 1}/${n}`);
			let resp = await fetchTypesListFromNpmsIoApi(i);
			pkgJsonList = pkgJsonList.concat(resp.results);
		}
		let names = pkgJsonList.map(getNamesFromItem);
		await new Promise(r => writeFile(resolve(__dirname, '../../at-types-list.json'), JSON.stringify(names), r));
		cb();
	});

V.parse(process.argv)
	.delimiter('$').show();
