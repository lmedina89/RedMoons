export const PROJECTILE_DEFS = Object.freeze({
  celestial_judgment: Object.freeze({
    id: 'celestial_judgment', speed: 430, lifetimeMs: 1500, radius: 13, texture: 'projectile-celestial',
    damageType: 'celestial', trail: 'celestial', impact: 'celestial', knockback: 210, wallCollision: true
  }),
  toxic_spit: Object.freeze({
    id: 'toxic_spit', speed: 190, lifetimeMs: 1800, radius: 9, texture: 'projectile-poison',
    damageType: 'poison', trail: 'poison', impact: 'poison', wallCollision: true
  }),
  blueflame_bolt: Object.freeze({
    id: 'blueflame_bolt', speed: 255, lifetimeMs: 1800, radius: 9, texture: 'projectile-blueflame',
    damageType: 'fire', trail: 'blueflame', impact: 'fire', wallCollision: true
  }),
  bone_arrow: Object.freeze({
    id: 'bone_arrow', speed: 335, lifetimeMs: 1700, radius: 7, texture: 'projectile-arrow',
    damageType: 'physical', trail: 'arrow', impact: 'physical', wallCollision: true
  }),
  grave_hex: Object.freeze({
    id: 'grave_hex', speed: 175, lifetimeMs: 2200, radius: 10, texture: 'projectile-shadow',
    damageType: 'shadow', trail: 'shadow', impact: 'shadow', wallCollision: true
  })
});
