import test from 'node:test';
import assert from 'node:assert/strict';
import { packProjectToZip, unpackProjectFromZip } from './zipService.ts';

test('packProjectToZip and unpackProjectFromZip round-trip files correctly', async () => {
  const originalFiles = {
    'src/index.ts': 'console.log("Hello from ZIP");',
    'package.json': JSON.stringify({ name: 'my-packaged-app' }, null, 2),
    'public/index.html': '<h1>App</h1>',
  };

  const blob = await packProjectToZip(originalFiles);
  assert.ok(blob.size > 0);

  const arrayBuffer = await blob.arrayBuffer();
  const unpacked = await unpackProjectFromZip(arrayBuffer);

  assert.equal(unpacked.files['src/index.ts'], 'console.log("Hello from ZIP");');
  assert.equal(unpacked.files['public/index.html'], '<h1>App</h1>');
  assert.equal(unpacked.manifest?.name, 'my-packaged-app');
});
