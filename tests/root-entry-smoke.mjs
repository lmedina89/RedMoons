import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');

assert.ok(html.includes('url=./dist/'), 'Repo-root index must meta-refresh into ./dist/');
assert.ok(html.includes("new URL('./dist/', location.href)"), 'Repo-root index must JS-redirect into ./dist/');
assert.ok(html.includes('href="./dist/"'), 'Repo-root fallback link must target ./dist/');
for (const bad of ['href="css/game.css"', 'src="vendor/phaser.min.js"', 'src="js/main.js"']) {
  assert.ok(!html.includes(bad), `Repo-root launcher must not load runtime resource directly: ${bad}`);
}
await access(path.join(root, 'dist', 'index.html'));
await access(path.join(root, 'dist', 'css', 'game.css'));
await access(path.join(root, 'dist', 'js', 'main.js'));
await access(path.join(root, 'dist', 'vendor', 'phaser.min.js'));
console.log('Root entry smoke passed');
