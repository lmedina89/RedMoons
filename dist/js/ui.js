import { ITEM_DEFS } from './data/items.js';
import { QUEST_DEFS } from './data/quests.js';
import { DEBUG, RARITY } from './config.js';
import { gameEvents } from './core/EventBus.js';
import { equipmentBonuses, xpForLevel } from './systems/StatsSystem.js';

const $ = selector => document.querySelector(selector);

export class UIManager {
  constructor() {
    this.snapshot = null;
    this.panel = null;
    this.selectedItem = null;
    this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 };
    this.confirmingStats = false;
    this.dialogueOpenAt = 0;
    this.bindEvents();
    this.bindTouchControls();
    if (DEBUG) {
      $('#debug-panel').classList.remove('hidden');
      document.querySelectorAll('[data-debug]').forEach(button => button.addEventListener('click', () => gameEvents.emit('command', { type: 'debug', action: button.dataset.debug })));
    }
  }

  bindEvents() {
    gameEvents.on('loading', ({ value }) => $('#loading-fill').style.width = `${Math.round(value * 100)}%`);
    gameEvents.on('ready', () => { $('#loading-screen').classList.add('hidden'); $('#hud').classList.remove('hidden'); $('#touch-controls').classList.remove('hidden'); });
    gameEvents.on('state', snapshot => { this.snapshot = snapshot; this.renderHud(); });
    gameEvents.on('zone', zone => { $('#zone-name').textContent = zone.name; $('#zone-danger').textContent = zone.danger; });
    gameEvents.on('toast', data => this.toast(data));
    gameEvents.on('dialogue', data => this.showDialogue(data));
    gameEvents.on('death', data => { window.__ashfallUiBlocked = true; $('#death-text').textContent = data.text; $('#death-screen').classList.remove('hidden'); });
    gameEvents.on('death-cleared', () => { $('#death-screen').classList.add('hidden'); window.__ashfallUiBlocked = false; });

    document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => this.openPanel(button.dataset.panel)));
    $('#modal-close').addEventListener('click', () => this.closePanel());
    $('#modal').addEventListener('pointerdown', event => { if (event.target === $('#modal')) this.closePanel(); });
    $('#dialogue-close').addEventListener('pointerdown', () => { $('#dialogue-box').classList.add('hidden'); if (!this.panel) window.__ashfallUiBlocked = false; });
    $('#respawn-button').addEventListener('click', () => gameEvents.emit('command', { type: 'respawn' }));
    $('#save-button').addEventListener('click', () => gameEvents.emit('command', { type: 'save' }));
    window.addEventListener('keydown', event => { if (event.key === 'Escape') { this.closePanel(); $('#dialogue-box').classList.add('hidden'); if ($('#death-screen').classList.contains('hidden')) window.__ashfallUiBlocked = false; } });
    window.addEventListener('ashfall-ui', event => this.openPanel(event.detail.action));
  }

  bindTouchControls() {
    const joystick = $('#joystick');
    const knob = $('#joystick-knob');
    const update = event => {
      const rect = joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      let dx = event.clientX - cx, dy = event.clientY - cy;
      const max = rect.width * 0.34;
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      gameEvents.emit('command', { type: 'move', x: dx / max, y: dy / max, active: true });
    };
    const stop = event => {
      if (event && joystick.hasPointerCapture?.(event.pointerId)) joystick.releasePointerCapture(event.pointerId);
      knob.style.transform = 'translate(0, 0)';
      gameEvents.emit('command', { type: 'move', x: 0, y: 0, active: false });
    };
    joystick.addEventListener('pointerdown', event => { joystick.setPointerCapture(event.pointerId); update(event); });
    joystick.addEventListener('pointermove', event => { if (joystick.hasPointerCapture(event.pointerId)) update(event); });
    joystick.addEventListener('pointerup', stop); joystick.addEventListener('pointercancel', stop);
    $('#attack-button').addEventListener('pointerdown', event => { event.preventDefault(); gameEvents.emit('command', { type: 'attack' }); });
    $('#interact-button').addEventListener('pointerup', event => { event.preventDefault(); gameEvents.emit('command', { type: 'interact' }); });
  }

  renderHud() {
    if (!this.snapshot) return;
    const { state, derived, quests } = this.snapshot;
    const player = state.player;
    $('#hud-level').textContent = `Lv. ${player.level}`;
    $('#hud-coins').textContent = `${player.currency} ash`;
    $('#hp-text').textContent = `${Math.ceil(player.hp)} / ${derived.maxHp}`;
    $('#essence-text').textContent = `${Math.ceil(player.essence)} / ${derived.maxEssence}`;
    $('#hp-fill').style.width = `${Math.max(0, player.hp / derived.maxHp * 100)}%`;
    $('#essence-fill').style.width = `${Math.max(0, player.essence / derived.maxEssence * 100)}%`;
    const needed = player.level >= 10 ? 1 : xpForLevel(player.level);
    $('#xp-text').textContent = player.level >= 10 ? 'LEVEL CAP' : `${player.xp} / ${needed} XP`;
    $('#xp-fill').style.width = `${player.level >= 10 ? 100 : Math.min(100, player.xp / needed * 100)}%`;
    $('#stat-badge').textContent = player.unspentStatPoints;
    $('#stat-badge').classList.toggle('hidden', player.unspentStatPoints <= 0);
    $('#quest-tracker').innerHTML = quests.length ? `<strong>${quests[0].ready ? 'Return to Vesra' : quests[0].name}</strong><small>${quests[0].ready ? 'Objective complete' : `${quests[0].summary} • ${quests[0].progress}`}</small>` : `<strong>Warden Vesra</strong><small>Speak with the quest warden in Cinder Refuge.</small>`;
  }

  openPanel(panel) {
    if (!this.snapshot || !['inventory', 'stats', 'quests'].includes(panel)) return;
    this.panel = panel;
    window.__ashfallUiBlocked = true;
    this.selectedItem = panel === 'inventory' ? this.selectedItem : null;
    this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 };
    this.confirmingStats = false;
    $('#modal').classList.remove('hidden');
    $('#modal-title').textContent = panel === 'inventory' ? 'Inventory & Equipment' : panel === 'stats' ? 'Character Growth' : 'Quest Journal';
    this.renderPanel();
    $('#modal-close').focus();
  }

  closePanel() { this.panel = null; $('#modal').classList.add('hidden'); if ($('#dialogue-box').classList.contains('hidden') && $('#death-screen').classList.contains('hidden')) window.__ashfallUiBlocked = false; }
  renderPanel() { if (this.panel === 'inventory') this.renderInventory(); if (this.panel === 'stats') this.renderStats(); if (this.panel === 'quests') this.renderQuests(); }

  renderInventory() {
    const { state } = this.snapshot;
    const equippedIds = new Set(Object.values(state.equipment).filter(Boolean));
    const items = state.inventory;
    if (this.selectedItem && !items.some(item => item.instanceId === this.selectedItem)) this.selectedItem = null;
    const slots = Array.from({ length: 30 }, (_, index) => {
      const item = items[index];
      if (!item) return '<div class="item-slot" aria-hidden="true"></div>';
      const def = ITEM_DEFS[item.itemId];
      const color = RARITY[item.rarity]?.color || '#ded7c7';
      return `<button type="button" class="item-slot ${this.selectedItem === item.instanceId ? 'selected' : ''} ${equippedIds.has(item.instanceId) ? 'equipped' : ''}" data-item="${item.instanceId}" style="color:${color}">${def?.name || item.itemId}</button>`;
    }).join('');
    const selected = items.find(item => item.instanceId === this.selectedItem);
    $('#modal-content').innerHTML = `<div class="inventory-layout"><div><div class="inventory-grid">${slots}</div><p class="empty-copy">${items.length}/30 slots • ${state.player.currency} ash coin</p></div><div class="item-details">${selected ? this.itemDetails(selected, equippedIds.has(selected.instanceId)) : '<h3>Select an item</h3><p>Tap gear to inspect its requirements, modifiers and equipped comparison.</p>'}</div></div>`;
    document.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => { this.selectedItem = button.dataset.item; this.renderInventory(); }));
    $('[data-equip]')?.addEventListener('click', event => { gameEvents.emit('command', { type: 'equip', instanceId: event.currentTarget.dataset.equip }); setTimeout(() => this.panel === 'inventory' && this.renderInventory(), 0); });
    $('[data-unequip]')?.addEventListener('click', event => { gameEvents.emit('command', { type: 'unequip', slot: event.currentTarget.dataset.unequip }); setTimeout(() => this.panel === 'inventory' && this.renderInventory(), 0); });
  }

  itemDetails(item, equipped) {
    const def = ITEM_DEFS[item.itemId];
    const rarity = RARITY[item.rarity] || RARITY.normal;
    const stats = [...Object.entries(def.baseStats || {}), ...Object.entries(item.modifiers || {})].map(([key, value]) => `<li>+${value} ${this.statLabel(key)}</li>`).join('') || '<li>No combat bonuses</li>';
    const requirements = [`Level ${def.levelReq || 1}`, ...Object.entries(def.requirements || {}).map(([key, value]) => `${key.toUpperCase()} ${value}`)].join(' • ');
    const equippedItemId = this.snapshot.state.equipment[def.slot];
    const equippedItem = this.snapshot.state.inventory.find(candidate => candidate.instanceId === equippedItemId);
    const compare = equippedItem && equippedItem.instanceId !== item.instanceId ? `<p>Compared with <strong>${ITEM_DEFS[equippedItem.itemId]?.name}</strong>: base defense ${this.totalStat(item, 'defense') - this.totalStat(equippedItem, 'defense') >= 0 ? '+' : ''}${this.totalStat(item, 'defense') - this.totalStat(equippedItem, 'defense')}, attack ${this.totalStat(item, 'attack') - this.totalStat(equippedItem, 'attack') >= 0 ? '+' : ''}${this.totalStat(item, 'attack') - this.totalStat(equippedItem, 'attack')}</p>` : '';
    return `<h3 style="color:${rarity.color}">${def.name}</h3><span class="rarity-label" style="color:${rarity.color}">${rarity.label}</span><p>${def.slot ? def.slot.toUpperCase() : 'QUEST ITEM'} • Enhancement +${item.enhancement || 0} • Value ${def.value}</p><ul>${stats}</ul><p class="requirements">Requires ${requirements}</p>${compare}<footer>${def.slot ? equipped ? `<button type="button" data-unequip="${def.slot}">Unequip</button>` : `<button type="button" data-equip="${item.instanceId}">Equip</button>` : ''}</footer>`;
  }

  totalStat(item, key) { const def = ITEM_DEFS[item.itemId]; return (def.baseStats?.[key] || 0) + (item.modifiers?.[key] || 0); }
  statLabel(key) { return ({ maxHp: 'Max HP', maxEssence: 'Max Essence', str: 'STR', dex: 'DEX', vit: 'VIT', spr: 'SPR' })[key] || key[0].toUpperCase() + key.slice(1); }

  renderStats() {
    const { state, derived } = this.snapshot;
    const p = state.player;
    const available = p.unspentStatPoints - Object.values(this.pendingStats).reduce((a, b) => a + b, 0);
    const descriptions = { str: 'Melee damage and heavy gear', dex: 'Speed, precision and light gear', vit: 'Health and defense', spr: 'Essence capacity' };
    const rows = ['str', 'dex', 'vit', 'spr'].map(key => `<div class="stat-row"><div><strong>${key.toUpperCase()}</strong><small>${descriptions[key]}</small></div><span>${p.stats[key]}${this.pendingStats[key] ? ` + ${this.pendingStats[key]}` : ''}</span><div class="stat-controls"><button type="button" data-stat-minus="${key}" ${this.pendingStats[key] <= 0 ? 'disabled' : ''}>−</button><b>${this.pendingStats[key]}</b><button type="button" data-stat-plus="${key}" ${available <= 0 ? 'disabled' : ''}>+</button></div></div>`).join('');
    const preview = {
      maxHp: derived.maxHp + this.pendingStats.vit * 9,
      maxEssence: derived.maxEssence + this.pendingStats.spr * 6,
      attack: Math.floor(derived.attack + this.pendingStats.str * 1.75 + this.pendingStats.dex * .45),
      defense: Math.floor(derived.defense + this.pendingStats.vit * .65 + this.pendingStats.dex * .18)
    };
    const spend = p.unspentStatPoints - available;
    $('#modal-content').innerHTML = `<div class="stats-layout"><section class="stats-panel"><h3>Primary Stats</h3>${rows}<div class="stats-footer"><p>${available} unspent points<br>${p.unspentSkillPoints} skill point${p.unspentSkillPoints === 1 ? '' : 's'} reserved</p><button type="button" id="stats-apply" ${spend <= 0 ? 'disabled' : ''}>${this.confirmingStats ? `Confirm ${spend} points` : 'Apply Preview'}</button></div></section><section class="stats-panel"><h3>Derived Combat Stats</h3><div class="derived-grid">${Object.entries(preview).map(([key, value]) => `<div class="derived-card"><small>${this.statLabel(key)}</small><strong>${value}</strong></div>`).join('')}</div><p class="empty-copy">Values update as you preview points. Nothing is permanent until the second confirmation.</p><h3>Equipment Contribution</h3><div class="derived-grid">${Object.entries(equipmentBonuses(state)).filter(([, v]) => v).map(([key, value]) => `<div class="derived-card"><small>${this.statLabel(key)}</small><strong>+${value}</strong></div>`).join('') || '<p class="empty-copy">Starter equipment provides modest bonuses.</p>'}</div></section></div>`;
    document.querySelectorAll('[data-stat-plus]').forEach(button => button.addEventListener('click', () => { if (available > 0) this.pendingStats[button.dataset.statPlus] += 1; this.confirmingStats = false; this.renderStats(); }));
    document.querySelectorAll('[data-stat-minus]').forEach(button => button.addEventListener('click', () => { const key = button.dataset.statMinus; if (this.pendingStats[key] > 0) this.pendingStats[key] -= 1; this.confirmingStats = false; this.renderStats(); }));
    $('#stats-apply')?.addEventListener('click', () => { if (!this.confirmingStats) { this.confirmingStats = true; this.renderStats(); return; } gameEvents.emit('command', { type: 'allocateStats', points: { ...this.pendingStats } }); this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 }; this.confirmingStats = false; setTimeout(() => this.panel === 'stats' && this.renderStats(), 0); });
  }

  renderQuests() {
    const quests = Object.entries(this.snapshot.state.quests).map(([id, quest]) => {
      const def = QUEST_DEFS[id];
      const progress = def.objectives.map(objective => `${objective.id.replaceAll('_', ' ')}: ${Math.min(objective.required, quest.objectives[objective.id] || 0)}/${objective.required}`).join(' • ');
      const label = quest.state === 'available' ? 'Speak with Warden Vesra' : quest.state === 'ready' ? 'Return to Warden Vesra' : quest.state;
      return `<article class="quest-entry ${quest.state}"><small>${label.toUpperCase()}</small><h3>${def.name}</h3><p>${def.summary}</p><p>${progress}</p></article>`;
    }).join('');
    $('#modal-content').innerHTML = `<div class="quest-list">${quests}</div>`;
  }

  showDialogue(data) {
    if (DEBUG) console.info('[Ashfall diagnostics] dialogue received', data.speaker);
    window.__ashfallUiBlocked = true;
    this.dialogueOpenAt = performance.now();
    $('#dialogue-speaker').textContent = data.speaker;
    $('#dialogue-role').textContent = data.role;
    $('#dialogue-text').textContent = data.text;
    $('#dialogue-box').classList.remove('hidden');
    $('#dialogue-close').focus();
  }

  toast({ text, tone = 'normal', short = false }) {
    const element = document.createElement('div');
    element.className = `toast ${tone}`;
    element.textContent = text;
    $('#toast-stack').append(element);
    setTimeout(() => element.remove(), short ? 1150 : 2600);
  }
}
