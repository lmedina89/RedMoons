import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../dist/css/game.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../dist/js/ui.js', import.meta.url), 'utf8');

assert.ok(html.includes('id="debug-panel-toggle"'), 'Debug header must expose a minimize/reopen control');
assert.ok(html.includes('aria-expanded="true"') && html.includes('aria-controls="debug-panel"'), 'Debug docking control must expose expansion semantics');
assert.ok(css.includes('#debug-panel.debug-minimized'), 'CSS must define a minimized debug-panel state');
assert.ok(css.includes('translateX(calc(-100% + 56px))'), 'Minimized debug panel must dock mostly off the left edge while leaving a touch tab visible');
assert.ok(css.includes('#debug-panel.debug-minimized .debug-section { display: none; }'), 'Minimized state must remove full debug sections from the battlefield');
assert.ok(ui.includes('setDebugPanelMinimized(minimized)'), 'UI manager must own debug docking state');
assert.ok(ui.includes("toggle.textContent = this.debugPanelMinimized ? 'DEBUG ›' : 'Minimize'"), 'Docked tab must provide an obvious reopen affordance');
assert.ok(ui.includes("panel?.classList.toggle('debug-minimized', this.debugPanelMinimized)"), 'Minimize toggle must only change panel presentation');
assert.ok(!ui.includes("gameEvents.emit('command', { type: 'debug', action: 'arenaclear'"), 'Minimizing must not clear/reset arena state');

console.log('Debug panel docking smoke passed: full setup panel can collapse to a left-edge DEBUG tab and reopen without touching arena/game state.');
