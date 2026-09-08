export const PROJECTILE_DEFS = Object.freeze({
  celestial_judgment: Object.freeze({
    id: 'celestial_judgment', speed: 430, lifetimeMs: 1500, radius: 16, texture: 'projectile-celestial',
    damageType: 'celestial', trail: 'celestial', impact: 'celestial', knockback: 210, wallCollision: true
  }),
  lumen_bolt: Object.freeze({
    id: 'lumen_bolt', speed: 285, lifetimeMs: 1800, radius: 8, texture: 'projectile-lumen',
    damageType: 'celestial', trail: 'celestial', impact: 'celestial', wallCollision: true
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
  }),
  abyss_bolt: Object.freeze({
    id: 'abyss_bolt', speed: 235, lifetimeMs: 1900, radius: 9, texture: 'projectile-abyss',
    damageType: 'shadow', trail: 'abyss', impact: 'abyss', wallCollision: true
  }),
  hellfire_orb: Object.freeze({
    id: 'hellfire_orb', speed: 245, lifetimeMs: 1850, radius: 10, texture: 'projectile-hellfire',
    damageType: 'fire', trail: 'hellfire', impact: 'hellfire', wallCollision: true
  }),
  soul_shard: Object.freeze({
    id: 'soul_shard', speed: 265, lifetimeMs: 1750, radius: 8, texture: 'projectile-ashbone',
    damageType: 'shadow', trail: 'ashbone', impact: 'ashbone', wallCollision: true
  }),
  blood_lance: Object.freeze({
    id: 'blood_lance', speed: 300, lifetimeMs: 1750, radius: 9, texture: 'projectile-blood',
    damageType: 'shadow', trail: 'blood', impact: 'blood', wallCollision: true
  }),
  warden_hellbrand: Object.freeze({
    id: 'warden_hellbrand', speed: 318, lifetimeMs: 1800, radius: 10, texture: 'projectile-warden',
    damageType: 'shadow', trail: 'warden', impact: 'warden', knockback: 72, wallCollision: true
  })
});
