const SPECIAL_ACTIONS = new Set(['spellcast', 'thrust', 'shoot', 'hurt']);

export class AnimationResolver {
  static resolve(asset, geometry, requestedAction, layerKey = '') {
    if (!asset || !geometry) return null;
    if (geometry[requestedAction] && asset[geometry[requestedAction].source]) {
      return { geometry, animation: geometry[requestedAction], action: requestedAction };
    }
    // Expanded LPC actions are allowed to keep unsupported armor static rather
    // than exposing the naked base body. Weapons/shields hide during casts/hurt.
    // This special-action policy must run before generic attackFallback or old
    // slash-only gear would visibly swing/slip while the actor is spellcasting.
    if (SPECIAL_ACTIONS.has(requestedAction)) {
      if (/weapon|shield/.test(layerKey)) return null;
      if (geometry.idle && asset[geometry.idle.source]) return { geometry, animation: geometry.idle, action: 'idle' };
    }
    // True run is only selected by Player when every visible body/armor layer
    // explicitly supports it. Held items are allowed to reuse their walk cycle
    // so a compatible sword does not vanish while sprinting.
    if (requestedAction === 'run' && /weapon|shield/.test(layerKey) && geometry.walk && asset[geometry.walk.source]) {
      return { geometry, animation: geometry.walk, action: 'walk' };
    }
    if (asset.attackFallback && !['idle', 'walk'].includes(requestedAction) && geometry[asset.attackFallback] && asset[geometry[asset.attackFallback].source]) {
      return { geometry, animation: geometry[asset.attackFallback], action: asset.attackFallback };
    }
    return null;
  }
}
