import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFileTree,
  getMonacoLanguage,
  isValidFilePath,
  renamePathInFiles,
  deletePathInFiles,
} from './fileSystem.ts';

test('buildFileTree creates nested tree structure with directories first', () => {
  const files = {
    'index.html': '<html></html>',
    'src/main.tsx': 'import React from "react";',
    'src/components/Header.tsx': 'export const Header = () => null;',
    'styles/main.css': 'body { margin: 0; }',
  };

  const tree = buildFileTree(files);
  assert.equal(tree.length, 3); // src/, styles/, index.html

  // First items should be directories
  assert.equal(tree[0].name, 'src');
  assert.equal(tree[0].isDirectory, true);
  assert.equal(tree[1].name, 'styles');
  assert.equal(tree[1].isDirectory, true);
  assert.equal(tree[2].name, 'index.html');
  assert.equal(tree[2].isDirectory, false);

  // Check nested src children
  const src = tree[0];
  assert.ok(src.children);
  assert.equal(src.children[0].name, 'components');
  assert.equal(src.children[0].isDirectory, true);
  assert.equal(src.children[1].name, 'main.tsx');
  assert.equal(src.children[1].isDirectory, false);
});

test('getMonacoLanguage maps standard file extensions', () => {
  assert.equal(getMonacoLanguage('src/App.tsx'), 'typescript');
  assert.equal(getMonacoLanguage('index.html'), 'html');
  assert.equal(getMonacoLanguage('style.css'), 'css');
  assert.equal(getMonacoLanguage('schema.sql'), 'sql');
  assert.equal(getMonacoLanguage('script.py'), 'python');
  assert.equal(getMonacoLanguage('config.json'), 'json');
  assert.equal(getMonacoLanguage('readme.md'), 'markdown');
  assert.equal(getMonacoLanguage('unknown.xyz'), 'plaintext');
});

test('isValidFilePath rejects malicious and invalid relative paths', () => {
  assert.equal(isValidFilePath('src/App.tsx'), true);
  assert.equal(isValidFilePath('components/Card.tsx'), true);
  assert.equal(isValidFilePath(''), false);
  assert.equal(isValidFilePath('../evil.js'), false);
  assert.equal(isValidFilePath('/root/file.js'), false);
  assert.equal(isValidFilePath('foo/bar/../baz.js'), false);
});

test('renamePathInFiles correctly cascades rename to children files', () => {
  const files = {
    'src/components/Button.tsx': 'export const Button = () => null;',
    'src/components/Card.tsx': 'export const Card = () => null;',
    'src/index.ts': 'export * from "./components/Button";',
  };

  const renamed = renamePathInFiles(files, 'src/components', 'src/ui');
  assert.equal(renamed['src/ui/Button.tsx'], 'export const Button = () => null;');
  assert.equal(renamed['src/ui/Card.tsx'], 'export const Card = () => null;');
  assert.equal(renamed['src/components/Button.tsx'], undefined);
  assert.equal(renamed['src/index.ts'], 'export * from "./components/Button";');
});

test('deletePathInFiles removes target directory and all descendants', () => {
  const files = {
    'src/legacy/Old.ts': 'export const old = 1;',
    'src/legacy/sub/Deep.ts': 'export const deep = 2;',
    'src/App.tsx': 'export default () => null;',
  };

  const remaining = deletePathInFiles(files, 'src/legacy');
  assert.equal(remaining['src/legacy/Old.ts'], undefined);
  assert.equal(remaining['src/legacy/sub/Deep.ts'], undefined);
  assert.equal(remaining['src/App.tsx'], 'export default () => null;');
});
