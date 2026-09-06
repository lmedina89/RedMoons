export class ActionInput {
  constructor() {
    this.moveX = 0;
    this.moveY = 0;
    this.attackQueued = false;
    this.interactQueued = false;
    this.run = false;
    this.keys = null;
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

  update() {
    if (!this.keys) return;
    const keyboardX = (this.keys.right.isDown || this.keys.right2.isDown ? 1 : 0) - (this.keys.left.isDown || this.keys.left2.isDown ? 1 : 0);
    const keyboardY = (this.keys.down.isDown || this.keys.down2.isDown ? 1 : 0) - (this.keys.up.isDown || this.keys.up2.isDown ? 1 : 0);
    if (keyboardX || keyboardY) { this.moveX = keyboardX; this.moveY = keyboardY; }
    else if (!window.__ashfallTouchMoving) { this.moveX = 0; this.moveY = 0; }
    this.run = this.keys.run.isDown || window.__ashfallRun === true;
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) this.attackQueued = true;
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interactQueued = true;
  }

  consumeAttack() { const value = this.attackQueued; this.attackQueued = false; return value; }
  consumeInteract() { const value = this.interactQueued; this.interactQueued = false; return value; }
}

export const actionInput = new ActionInput();

