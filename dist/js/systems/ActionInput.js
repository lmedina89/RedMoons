export class ActionInput {
  constructor() {
    this.moveX = 0;
    this.moveY = 0;
    this.attackQueued = false;
    this.interactQueued = false;
    this.run = false;
    this.keys = null;
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
  }

  bind(scene) {
    this.keys = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      up2: 'UP', down2: 'DOWN', left2: 'LEFT', right2: 'RIGHT',
      attack: 'SPACE', interact: 'E', run: 'SHIFT', inventory: 'I', character: 'C', quests: 'Q'
    });
    scene.input.keyboard.on('keydown-I', () => window.dispatchEvent(new CustomEvent('ashfall-ui', { detail: { action: 'inventory' } })));
    scene.input.keyboard.on('keydown-C', () => window.dispatchEvent(new CustomEvent('ashfall-ui', { detail: { action: 'character' } })));
    scene.input.keyboard.on('keydown-Q', () => window.dispatchEvent(new CustomEvent('ashfall-ui', { detail: { action: 'quests' } })));
  }

  setTouchMovement(x, y, active = true) {
    let nextX = Number.isFinite(Number(x)) ? Number(x) : 0;
    let nextY = Number.isFinite(Number(y)) ? Number(y) : 0;
    const length = Math.hypot(nextX, nextY);
    if (length > 1) { nextX /= length; nextY /= length; }
    const moving = Boolean(active) && Math.hypot(nextX, nextY) >= 0.08;
    this.touchActive = moving;
    this.touchX = moving ? nextX : 0;
    this.touchY = moving ? nextY : 0;
    if (!moving) { this.moveX = 0; this.moveY = 0; }
    if (typeof window !== 'undefined') window.__ashfallTouchMoving = moving;
  }

  resetTouchMovement() {
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
    this.moveX = 0;
    this.moveY = 0;
    if (typeof window !== 'undefined') {
      window.__ashfallTouchMoving = false;
      window.__ashfallRun = false;
    }
  }

  update() {
    if (!this.keys) return;
    const keyboardX = (this.keys.right.isDown || this.keys.right2.isDown ? 1 : 0) - (this.keys.left.isDown || this.keys.left2.isDown ? 1 : 0);
    const keyboardY = (this.keys.down.isDown || this.keys.down2.isDown ? 1 : 0) - (this.keys.up.isDown || this.keys.up2.isDown ? 1 : 0);
    if (keyboardX || keyboardY) {
      this.moveX = keyboardX;
      this.moveY = keyboardY;
    } else if (this.touchActive) {
      this.moveX = this.touchX;
      this.moveY = this.touchY;
    } else {
      this.moveX = 0;
      this.moveY = 0;
    }
    this.run = this.keys.run.isDown || (typeof window !== 'undefined' && window.__ashfallRun === true);
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) this.attackQueued = true;
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interactQueued = true;
  }

  consumeAttack() { const value = this.attackQueued; this.attackQueued = false; return value; }
  consumeInteract() { const value = this.interactQueued; this.interactQueued = false; return value; }
}

export const actionInput = new ActionInput();
