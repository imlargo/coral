/**
 * Checks every component's Props table against the props it actually takes.
 *
 * The tables are written by hand, because what a reader needs from a row - a default spelled out
 * in words, a type shown by its shape - is not what the source says. Nothing else reads them, so a
 * prop added, renamed or made bindable used to reach the page only if someone remembered. Repo
 * tooling, like `coral-manifest.test.ts`: it reads the filesystem and is never published.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import manifest from './components/coral/coral.json' with { type: 'json' };
import { isComponent } from '../../registry.config.js';

const CORAL = path.join(import.meta.dirname, 'components/coral');
const DOCS = path.resolve(import.meta.dirname, '../routes/(docs)/docs');

const components = Object.keys(manifest.components).filter(isComponent);

async function parse(file: string, text?: string): Promise<ts.SourceFile> {
	const source = text ?? (await readFile(file, 'utf8'));
	return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

const nameOf = (name: ts.PropertyName | ts.BindingName, source: ts.SourceFile) =>
	ts.isStringLiteral(name) || ts.isIdentifier(name) ? name.text : name.getText(source);

/**
 * The props a component declares itself: the members of its exported `*Props` types, following
 * aliases in the same file and imports from inside Coral. A reference to anything outside -
 * `ComponentProps<typeof Popover>`, `HTMLAttributes` - is what it forwards, and stops the walk.
 */
async function declared(file: string): Promise<Set<string>> {
	const names = new Set<string>();
	const seen = new Set<string>();

	async function follow(name: string, source: ts.SourceFile): Promise<void> {
		const key = `${source.fileName}#${name}`;
		if (seen.has(key)) return;
		seen.add(key);

		for (const statement of source.statements) {
			if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
				return visit(statement.type, source);
			}
			const bindings = ts.isImportDeclaration(statement)
				? statement.importClause?.namedBindings
				: undefined;
			if (!bindings || !ts.isNamedImports(bindings)) continue;

			const specifier = (statement as ts.ImportDeclaration).moduleSpecifier;
			if (!ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) continue;
			for (const element of bindings.elements) {
				if (element.name.text !== name) continue;
				const target = path.resolve(
					path.dirname(source.fileName),
					specifier.text.replace(/\.js$/, '.ts')
				);
				return follow((element.propertyName ?? element.name).text, await parse(target));
			}
		}
	}

	async function visit(node: ts.TypeNode, source: ts.SourceFile): Promise<void> {
		if (ts.isTypeLiteralNode(node)) {
			for (const member of node.members) if (member.name) names.add(nameOf(member.name, source));
		} else if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
			for (const type of node.types) await visit(type, source);
		} else if (ts.isParenthesizedTypeNode(node)) {
			await visit(node.type, source);
		} else if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
			await follow(node.typeName.text, source);
		}
	}

	const source = await parse(file);
	for (const statement of source.statements) {
		if (
			ts.isTypeAliasDeclaration(statement) &&
			statement.name.text.endsWith('Props') &&
			statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
		) {
			await follow(statement.name.text, source);
		}
	}
	return names;
}

/** What the component's own `$props()` takes out by name - `...rest` is forwarded, not read. */
async function read(folder: string): Promise<{ names: Set<string>; bindable: Set<string> }> {
	const names = new Set<string>();
	const bindable = new Set<string>();

	for (const file of (await readdir(folder)).filter((file) => file.endsWith('.svelte'))) {
		const markup = await readFile(path.join(folder, file), 'utf8');
		for (const [, script] of markup.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
			const source = await parse(file, script);
			const walk = (node: ts.Node): void => {
				if (
					ts.isVariableDeclaration(node) &&
					ts.isObjectBindingPattern(node.name) &&
					node.initializer &&
					ts.isCallExpression(node.initializer) &&
					node.initializer.expression.getText(source) === '$props'
				) {
					for (const element of node.name.elements) {
						if (element.dotDotDotToken) continue;
						const name = nameOf(element.propertyName ?? element.name, source);
						names.add(name);
						const initial = element.initializer;
						if (
							initial &&
							ts.isCallExpression(initial) &&
							initial.expression.getText(source) === '$bindable'
						) {
							bindable.add(name);
						}
					}
				}
				ts.forEachChild(node, walk);
			};
			walk(source);
		}
	}
	return { names, bindable };
}

/**
 * The rows of the page's `## Props` tables - the `Prop` table and the `Snippet` one - as name to
 * description. One row may name several props, as `` `class`, `listClass` `` does.
 */
async function documented(page: string): Promise<Map<string, string>> {
	const text = await readFile(page, 'utf8');
	const section = text.split(/^## Props\s*$/m)[1]?.split(/^## /m)[0] ?? '';
	const rows = new Map<string, string>();

	for (const block of section.split(/\n\s*\n/)) {
		const lines = block.trim().split('\n');
		if (!/^\|\s*(Prop|Snippet)\s*\|/.test(lines[0])) continue;

		for (const line of lines.slice(2)) {
			const cells = line
				.split(/(?<!\\)\|/)
				.slice(1, -1)
				.map((cell) => cell.trim());
			for (const [, name] of cells[0].matchAll(/`([^`]+)`/g)) rows.set(name, cells.at(-1)!);
		}
	}
	return rows;
}

const isAria = (name: string) => name.startsWith('aria-');

describe.each(components)('%s', (name) => {
	const folder = path.join(CORAL, name);
	const facts = Promise.all([
		declared(path.join(folder, 'types.ts')),
		read(folder),
		documented(path.join(DOCS, name, 'index.md'))
	]);

	it('declares its props in an exported `*Props` type in `types.ts`', async () => {
		const [own] = await facts;
		expect(own.size).toBeGreaterThan(0);
	});

	// `ref` is left out on purpose: the Conventions page says once that every component keeps it.
	it('documents every prop it declares', async () => {
		const [own, , rows] = await facts;
		const missing = [...own].filter(
			(prop) => prop !== 'ref' && !rows.has(prop) && !(isAria(prop) && rows.has('aria-*'))
		);
		expect(missing, `in docs/${name}/index.md`).toEqual([]);
	});

	it('documents nothing it does not take', async () => {
		const [own, { names }, rows] = await facts;
		const taken = new Set([...own, ...names]);
		const unknown = [...rows.keys()].filter((row) =>
			row === 'aria-*' ? ![...taken].some(isAria) : !taken.has(row)
		);
		expect(unknown, `in docs/${name}/index.md`).toEqual([]);
	});

	it('says Bindable exactly where a prop is bindable', async () => {
		const [, { bindable }, rows] = await facts;
		const wrong = [...rows].flatMap(([prop, description]) =>
			bindable.has(prop) === /\bBindable\b/.test(description) ? [] : [prop]
		);
		expect(wrong, `in docs/${name}/index.md`).toEqual([]);
	});
});
