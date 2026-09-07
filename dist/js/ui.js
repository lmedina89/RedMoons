import { ITEM_DEFS } from './data/items.js';
import { QUEST_DEFS } from './data/quests.js';
import { DEBUG, RARITY } from './config.js';
import { gameEvents } from './core/EventBus.js';
import { equipmentBonuses, previewDerivedStats, statBreakdown, xpForLevel } from './systems/StatsSystem.js';

const $ = selector => document.querySelector(selector);
const EQUIPMENT_SLOTS = Object.freeze([
  ['head', 'Head'], ['shoulders', 'Shoulders'], ['chest', 'Chest'], ['hands', 'Hands'], ['legs', 'Legs'], ['feet', 'Feet'],
  ['weapon', 'Weapon'], ['offhand', 'Offhand'], ['necklace', 'Necklace'], ['ring1', 'Ring 1'], ['ring2', 'Ring 2'], ['wings', 'Wings']
]);

export class UIManager {
  constructor() {
    this.snapshot = null;
    this.panel = null;
    this.selectedItem = null;
    this.characterTab = 'overview';
    this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 };
    this.confirmingStats = false;
    this.dialogueOpenAt = 0;
    this.toastTimer = null;
    this.toastCooldowns = new Map();
    this.activeToastPriority = -1;
    this.resetTouchMovement = () => {};
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
    gameEvents.on('death', data => { this.resetTouchMovement(); window.__ashfallUiBlocked = true; $('#death-text').textContent = data.text; $('#death-screen').classList.remove('hidden'); });
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
    let activePointerId = null;

    const stop = (event = null, force = false) => {
      if (!force && activePointerId !== null && event?.pointerId !== activePointerId) return;
      const pointerId = activePointerId;
      activePointerId = null;
      if (pointerId !== null && joystick.hasPointerCapture?.(pointerId)) {
        try { joystick.releasePointerCapture(pointerId); } catch (_) { /* Safari may already have released it. */ }
      }
      knob.style.transform = 'translate(0, 0)';
      gameEvents.emit('command', { type: 'move', x: 0, y: 0, active: false });
    };

    const update = event => {
      if (activePointerId !== event.pointerId) return;
      event.preventDefault();
      const rect = joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = event.clientX - cx;
      let dy = event.clientY - cy;
      const max = Math.max(1, Math.min(rect.width, rect.height) * 0.34);
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      gameEvents.emit('command', { type: 'move', x: dx / max, y: dy / max, active: len >= max * 0.08 });
    };

    joystick.addEventListener('pointerdown', event => {
      if (activePointerId !== null) return;
      event.preventDefault();
      activePointerId = event.pointerId;
      try { joystick.setPointerCapture(event.pointerId); } catch (_) { /* Global release listeners remain as a fallback. */ }
      update(event);
    });
    joystick.addEventListener('pointermove', update);
    joystick.addEventListener('pointerup', event => stop(event));
    joystick.addEventListener('pointercancel', event => stop(event));
    joystick.addEventListener('lostpointercapture', event => stop(event));
    window.addEventListener('pointerup', event => stop(event), true);
    window.addEventListener('pointercancel', event => stop(event), true);
    window.addEventListener('blur', () => stop(null, true));
    window.addEventListener('pagehide', () => stop(null, true));
    window.addEventListener('orientationchange', () => stop(null, true));
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(null, true); });
    this.resetTouchMovement = () => stop(null, true);

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

  openPanel(requestedPanel) {
    this.resetTouchMovement();
    const panel = requestedPanel === 'stats' ? 'character' : requestedPanel;
    if (!this.snapshot || !['inventory', 'character', 'quests'].includes(panel)) return;
    this.panel = panel;
    window.__ashfallUiBlocked = true;
    this.selectedItem = panel === 'inventory' ? this.selectedItem : null;
    if (panel === 'character') this.characterTab = 'overview';
    this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 };
    this.confirmingStats = false;
    $('#modal').classList.remove('hidden');
    $('#modal-title').textContent = panel === 'inventory' ? 'Inventory & Equipment' : panel === 'character' ? 'Character' : 'Quest Journal';
    this.renderPanel();
    $('#modal-close').focus();
  }

  closePanel() { this.panel = null; $('#modal').classList.add('hidden'); if ($('#dialogue-box').classList.contains('hidden') && $('#death-screen').classList.contains('hidden')) window.__ashfallUiBlocked = false; }
  renderPanel() { if (this.panel === 'inventory') this.renderInventory(); if (this.panel === 'character') this.renderCharacter(); if (this.panel === 'quests') this.renderQuests(); }

  equipmentSlotCards(state, { interactive = false, unequip = false } = {}) {
    const byId = new Map(state.inventory.map(item => [item.instanceId, item]));
    return EQUIPMENT_SLOTS.map(([slot, label]) => {
      const item = byId.get(state.equipment[slot]);
      const def = item && ITEM_DEFS[item.itemId];
      const rarity = item ? (RARITY[item.rarity] || RARITY.normal) : null;
      const stats = item ? this.itemStatSummary(item) : '';
      const locked = slot === 'wings' && !state.worldFlags?.wingsUnlocked && !item;
      const attrs = interactive && item ? `role="button" tabindex="0" data-equipped-item="${item.instanceId}"` : '';
      const name = def?.name || (locked ? 'Locked' : 'Empty');
      const sub = stats || (locked ? 'Advanced progression' : '—');
      return `<article class="equipment-slot-card ${item ? 'filled' : 'empty'} ${locked ? 'locked' : ''}" ${attrs}><small>${label}</small><strong style="${rarity ? `color:${rarity.color}` : ''}">${name}</strong><span>${sub}</span>${unequip && item ? `<button type="button" class="slot-unequip" data-char-unequip="${slot}" aria-label="Unequip ${def.name}">Unequip</button>` : ''}</article>`;
    }).join('');
  }

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
    $('#modal-content').innerHTML = `<div class="inventory-layout"><div><h3 class="section-heading">Equipped</h3><div class="equipment-strip">${this.equipmentSlotCards(state, { interactive: true })}</div><h3 class="section-heading inventory-heading">Pack</h3><div class="inventory-grid">${slots}</div><p class="empty-copy">${items.length}/30 slots • ${state.player.currency} ash coin</p></div><div class="item-details">${selected ? this.itemDetails(selected, equippedIds.has(selected.instanceId)) : '<h3>Select an item</h3><p>Tap gear to inspect its requirements, modifiers and equipped comparison. Multiple armor slots can be worn at the same time.</p>'}</div></div>`;
    document.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => { this.selectedItem = button.dataset.item; this.renderInventory(); }));
    document.querySelectorAll('[data-equipped-item]').forEach(card => {
      const select = () => { this.selectedItem = card.dataset.equippedItem; this.renderInventory(); };
      card.addEventListener('click', select);
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
    });
    $('[data-equip]')?.addEventListener('click', event => { gameEvents.emit('command', { type: 'equip', instanceId: event.currentTarget.dataset.equip }); setTimeout(() => this.panel === 'inventory' && this.renderInventory(), 0); });
    $('[data-unequip]')?.addEventListener('click', event => { gameEvents.emit('command', { type: 'unequip', slot: event.currentTarget.dataset.unequip }); setTimeout(() => this.panel === 'inventory' && this.renderInventory(), 0); });
  }

  itemDetails(item, equipped) {
    const def = ITEM_DEFS[item.itemId];
    const rarity = RARITY[item.rarity] || RARITY.normal;
    const stats = Object.entries(this.itemTotalStats(item)).map(([key, value]) => `<li>+${value} ${this.statLabel(key)}</li>`).join('') || '<li>No combat bonuses</li>';
    const requirements = [`Level ${def.levelReq || 1}`, ...Object.entries(def.requirements || {}).map(([key, value]) => `${key.toUpperCase()} ${value}`)].join(' • ');
    const gate = def.equipGate && !this.snapshot.state.worldFlags?.[def.equipGate] ? `<p class="requirements">Locked: ${def.gateLabel || 'advanced progression'}.</p>` : '';
    const playerReady = def.playerEquipReady !== false && !def.npcOnly && !(def.slot === 'weapon' && def.playerCombatReady === false);
    const animation = def.slot ? `<p>Player animation: ${playerReady ? (def.combatProfile === 'sword_four_hit' ? 'Full 4-hit sword combo' : def.animationClass === 'full_combo' ? 'Full combo compatible' : 'Player compatible') : 'NPC / legacy only'}</p>` : '';
    const equippedItemId = this.snapshot.state.equipment[def.slot];
    const equippedItem = this.snapshot.state.inventory.find(candidate => candidate.instanceId === equippedItemId);
    const compare = equippedItem && equippedItem.instanceId !== item.instanceId ? this.comparisonText(item, equippedItem) : '';
    return `<h3 style="color:${rarity.color}">${def.name}</h3><span class="rarity-label" style="color:${rarity.color}">${rarity.label}</span><p>${def.slot ? this.slotLabel(def.slot).toUpperCase() : 'QUEST ITEM'} • Enhancement +${item.enhancement || 0} • Value ${def.value}</p><ul>${stats}</ul><p class="requirements">Base requirements: ${requirements}</p>${gate}${animation}${compare}<footer>${def.slot ? equipped ? `<button type="button" data-unequip="${def.slot}">Unequip</button>` : playerReady ? `<button type="button" data-equip="${item.instanceId}">Equip to ${this.slotLabel(def.slot)}</button>` : `<span class="requirements">Reserved for humanoid/NPC loadouts until a full animation export exists.</span>` : ''}</footer>`;
  }

  comparisonText(item, equippedItem) {
    const candidate = this.itemTotalStats(item);
    const current = this.itemTotalStats(equippedItem);
    const keys = [...new Set([...Object.keys(candidate), ...Object.keys(current)])];
    const changes = keys.map(key => [key, (candidate[key] || 0) - (current[key] || 0)]).filter(([, value]) => value !== 0);
    if (!changes.length) return `<p>Compared with <strong>${ITEM_DEFS[equippedItem.itemId]?.name}</strong>: equivalent listed bonuses.</p>`;
    return `<p>Compared with <strong>${ITEM_DEFS[equippedItem.itemId]?.name}</strong>: ${changes.map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${this.statLabel(key)}`).join(' • ')}</p>`;
  }

  itemTotalStats(item) {
    const def = ITEM_DEFS[item.itemId];
    const totals = { ...(def?.baseStats || {}) };
    for (const [key, value] of Object.entries(item.modifiers || {})) totals[key] = (totals[key] || 0) + value;
    return totals;
  }

  itemStatSummary(item) {
    return Object.entries(this.itemTotalStats(item)).slice(0, 2).map(([key, value]) => `+${value} ${this.statLabel(key)}`).join(' • ');
  }

  slotLabel(slot) { return Object.fromEntries(EQUIPMENT_SLOTS)[slot] || slot; }
  statLabel(key) { return ({ maxHp: 'Max HP', maxEssence: 'Max Essence', moveSpeed: 'Move Speed', str: 'STR', dex: 'DEX', vit: 'VIT', spr: 'SPR' })[key] || key[0].toUpperCase() + key.slice(1); }
  formatNumber(value) { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, ''); }

  renderCharacter() {
    const tabs = `<nav class="character-tabs" aria-label="Character sections"><button type="button" data-character-tab="overview" class="${this.characterTab === 'overview' ? 'active' : ''}">Overview</button><button type="button" data-character-tab="growth" class="${this.characterTab === 'growth' ? 'active' : ''}">Growth <em class="tab-badge ${this.snapshot.state.player.unspentStatPoints ? '' : 'hidden'}">${this.snapshot.state.player.unspentStatPoints}</em></button></nav>`;
    if (this.characterTab === 'growth') this.renderGrowth(tabs);
    else this.renderCharacterOverview(tabs);
    document.querySelectorAll('[data-character-tab]').forEach(button => button.addEventListener('click', () => { this.characterTab = button.dataset.characterTab; this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 }; this.confirmingStats = false; this.renderCharacter(); }));
  }

  renderCharacterOverview(tabs) {
    const { state } = this.snapshot;
    const p = state.player;
    const breakdown = statBreakdown(state);
    const needed = p.level >= 10 ? null : xpForLevel(p.level);
    const primary = ['str', 'dex', 'vit', 'spr'].map(key => {
      const base = breakdown.basePrimary[key];
      const gear = breakdown.gear[key] || 0;
      const total = breakdown.totalPrimary[key];
      return `<div class="character-stat-row"><small>${key.toUpperCase()}</small><strong>${total}</strong><span>${base} base${gear ? ` <b>+${gear} gear</b>` : ''}</span></div>`;
    }).join('');
    const combat = ['maxHp', 'maxEssence', 'attack', 'defense', 'moveSpeed'].map(key => {
      const value = breakdown.totalDerived[key];
      const impact = breakdown.gearImpact[key] || 0;
      return `<div class="derived-card"><small>${this.statLabel(key)}</small><strong>${this.formatNumber(value)}</strong><span>${impact ? `+${this.formatNumber(impact)} from gear` : 'base value'}</span></div>`;
    }).join('');
    const directGear = Object.entries(equipmentBonuses(state)).filter(([, value]) => value).map(([key, value]) => `<span class="bonus-chip">+${value} ${this.statLabel(key)}</span>`).join('') || '<span class="empty-copy">No direct equipment bonuses.</span>';
    $('#modal-content').innerHTML = `${tabs}<div class="character-summary"><div><small>LEVEL</small><strong>${p.level}</strong></div><div><small>EXPERIENCE</small><strong>${p.level >= 10 ? 'CAP' : `${p.xp} / ${needed}`}</strong></div><div><small>ASH COIN</small><strong>${p.currency}</strong></div><div><small>STAT POINTS</small><strong>${p.unspentStatPoints}</strong></div></div><div class="character-layout"><section class="character-panel"><h3>Equipped Gear</h3><div class="equipment-sheet">${this.equipmentSlotCards(state, { unequip: true })}</div></section><section class="character-panel"><h3>Primary Stats</h3><div class="character-primary-grid">${primary}</div><h3 class="character-subheading">Combat Stats</h3><div class="derived-grid character-derived">${combat}</div><h3 class="character-subheading">Equipment Buffs</h3><div class="bonus-list">${directGear}</div><h3 class="character-subheading">Active Effects</h3><p class="empty-copy effect-copy">None active.</p></section></div>`;
    document.querySelectorAll('[data-char-unequip]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      gameEvents.emit('command', { type: 'unequip', slot: button.dataset.charUnequip });
      setTimeout(() => this.panel === 'character' && this.renderCharacter(), 0);
    }));
  }

  renderGrowth(tabs) {
    const { state } = this.snapshot;
    const p = state.player;
    const available = p.unspentStatPoints - Object.values(this.pendingStats).reduce((a, b) => a + b, 0);
    const descriptions = { str: 'Melee damage and heavy gear', dex: 'Speed, precision and light gear', vit: 'Health and defense', spr: 'Essence capacity' };
    const rows = ['str', 'dex', 'vit', 'spr'].map(key => `<div class="stat-row"><div><strong>${key.toUpperCase()}</strong><small>${descriptions[key]}</small></div><span>${p.stats[key]}${this.pendingStats[key] ? ` + ${this.pendingStats[key]}` : ''}</span><div class="stat-controls"><button type="button" data-stat-minus="${key}" ${this.pendingStats[key] <= 0 ? 'disabled' : ''}>−</button><b>${this.pendingStats[key]}</b><button type="button" data-stat-plus="${key}" ${available <= 0 ? 'disabled' : ''}>+</button></div></div>`).join('');
    const preview = previewDerivedStats(state, this.pendingStats);
    const spend = p.unspentStatPoints - available;
    $('#modal-content').innerHTML = `${tabs}<div class="stats-layout"><section class="stats-panel"><h3>Primary Stats</h3>${rows}<div class="stats-footer"><p>${available} unspent points<br>${p.unspentSkillPoints} skill point${p.unspentSkillPoints === 1 ? '' : 's'} reserved</p><button type="button" id="stats-apply" ${spend <= 0 ? 'disabled' : ''}>${this.confirmingStats ? `Confirm ${spend} points` : 'Apply Preview'}</button></div></section><section class="stats-panel"><h3>Derived Combat Preview</h3><div class="derived-grid">${['maxHp', 'maxEssence', 'attack', 'defense', 'moveSpeed'].map(key => `<div class="derived-card"><small>${this.statLabel(key)}</small><strong>${this.formatNumber(preview[key])}</strong></div>`).join('')}</div><p class="empty-copy">Preview includes your currently equipped gear. Nothing is permanent until the second confirmation.</p><h3>Direct Equipment Bonuses</h3><div class="bonus-list">${Object.entries(equipmentBonuses(state)).filter(([, v]) => v).map(([key, value]) => `<span class="bonus-chip">+${value} ${this.statLabel(key)}</span>`).join('') || '<p class="empty-copy">No direct equipment bonuses.</p>'}</div></section></div>`;
    document.querySelectorAll('[data-stat-plus]').forEach(button => button.addEventListener('click', () => { if (available > 0) this.pendingStats[button.dataset.statPlus] += 1; this.confirmingStats = false; this.renderCharacter(); }));
    document.querySelectorAll('[data-stat-minus]').forEach(button => button.addEventListener('click', () => { const key = button.dataset.statMinus; if (this.pendingStats[key] > 0) this.pendingStats[key] -= 1; this.confirmingStats = false; this.renderCharacter(); }));
    $('#stats-apply')?.addEventListener('click', () => { if (!this.confirmingStats) { this.confirmingStats = true; this.renderCharacter(); return; } gameEvents.emit('command', { type: 'allocateStats', points: { ...this.pendingStats } }); this.pendingStats = { str: 0, dex: 0, vit: 0, spr: 0 }; this.confirmingStats = false; setTimeout(() => this.panel === 'character' && this.renderCharacter(), 0); });
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
    this.resetTouchMovement();
    if (DEBUG) console.info('[Ashfall diagnostics] dialogue received', data.speaker);
    window.__ashfallUiBlocked = true;
    this.dialogueOpenAt = performance.now();
    $('#dialogue-speaker').textContent = data.speaker;
    $('#dialogue-role').textContent = data.role;
    $('#dialogue-text').textContent = data.text;
    $('#dialogue-box').classList.remove('hidden');
    $('#dialogue-close').focus();
  }

  toast({ text, tone = 'normal', short = false, key = text, cooldownMs = null }) {
    const now = performance.now();
    const cooldown = cooldownMs ?? (tone === 'muted' || tone === 'combat' ? 1400 : 350);
    const lastShown = this.toastCooldowns.get(key) ?? -Infinity;
    const stack = $('#toast-stack');
    const existing = stack.firstElementChild;
    const priorities = { muted: 0, combat: 0, normal: 1, magic: 1, noble: 2, quest: 3, level: 3, danger: 4 };
    const priority = priorities[tone] ?? 1;

    if (now - lastShown < cooldown) {
      if (existing?.dataset.toastKey === key) {
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.clearToast(existing), short ? 1200 : 2100);
      }
      return;
    }
    if (existing && priority < this.activeToastPriority) return;

    this.toastCooldowns.set(key, now);
    clearTimeout(this.toastTimer);
    stack.replaceChildren();
    const element = document.createElement('div');
    element.className = `toast ${tone}`;
    element.dataset.toastKey = key;
    element.textContent = text;
    stack.append(element);
    this.activeToastPriority = priority;
    this.toastTimer = setTimeout(() => this.clearToast(element), short ? 1200 : 2100);
  }

  clearToast(element) {
    if (element?.isConnected) element.remove();
    if (!$('#toast-stack').firstElementChild) this.activeToastPriority = -1;
    this.toastTimer = null;
  }
}
