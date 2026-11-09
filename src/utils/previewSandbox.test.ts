import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePreviewHtml } from './previewSandbox.ts';

test('generatePreviewHtml wraps React app with Babel and Tailwind', () => {
  const files = {
    'src/App.tsx': `export default function App() { return <h1>Hello Maya</h1>; }`,
    'src/style.css': `h1 { color: #fff; }`,
  };

  const html = generatePreviewHtml({ files });
  assert.ok(html.includes('react.development.js'));
  assert.ok(html.includes('babel.min.js'));
  assert.ok(html.includes('MAYA_PREVIEW_CONSOLE'));
  assert.ok(html.includes('Hello Maya'));
  assert.ok(html.includes('h1 { color: #fff; }'));
});

test('generatePreviewHtml preserves custom index.html and injects console interceptor', () => {
  const files = {
    'index.html': `<!DOCTYPE html><html><head><title>Custom</title></head><body><div id="content">Original</div></body></html>`,
    'styles.css': `body { background: black; }`,
  };

  const html = generatePreviewHtml({ files });
  assert.ok(html.includes('<title>Custom</title>'));
  assert.ok(html.includes('Original'));
  assert.ok(html.includes('MAYA_PREVIEW_CONSOLE'));
  assert.ok(html.includes('background: black;'));
});
