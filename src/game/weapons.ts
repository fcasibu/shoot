import type { Renderer } from '../lib/primitives/renderer';
import { createRectangle } from '../lib/primitives/shape';
import type { SoundManager } from '../lib/primitives/sound';
import { vector2Add } from '../lib/primitives/vector2';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Rectangle, Vec2 } from '../lib/types';
import type { Component, Renderable, Size, WeaponConfig } from './types';

export abstract class Weapon implements Component, Renderable {
  private isActive = false;
  protected activeTimer = 0;
  protected timer = 0;

  constructor(public readonly weaponConfig: WeaponConfig) {}

  public update(dt: number) {
    this.timer -= dt;
    this.activeTimer -= dt;

    if (this.activeTimer <= 0) {
      this.isActive = false;
    }

    if (this.timer <= 0) {
      this.activate();
    }
  }

  public abstract draw(position?: Vec2, direction?: number): void;
  public abstract getAttackArea(
    position: Vec2,
    direction: number,
  ): Rectangle | null;

  public getDamage() {
    return this.weaponConfig.damage;
  }

  public isAttacking() {
    return this.isActive;
  }

  public activate() {
    if (this.timer <= 0) {
      this.timer = this.weaponConfig.cooldown;
      this.isActive = true;
      this.activeTimer = this.weaponConfig.visualDuration;
    }
  }
}

export class Bat extends Weapon {
  private animationProgress = 0;

  constructor(
    public readonly canvasWindow: CanvasWindow,
    private readonly renderer: Renderer,
    private readonly soundManager: SoundManager,
    private readonly characterSize: Size,
    public override readonly weaponConfig: WeaponConfig,
  ) {
    super(weaponConfig);
  }

  public override update(dt: number) {
    super.update(dt);

    if (this.timer === this.weaponConfig.cooldown) {
      this.soundManager.play('slash');
    }

    if (this.isAttacking()) {
      this.animationProgress = Math.min(
        1,
        1 - this.activeTimer / this.weaponConfig.visualDuration,
      );
    } else {
      this.animationProgress = 0;
    }
  }

  public draw(position: Vec2, direction: number) {
    if (!this.isAttacking()) return;

    const exactFrame =
      this.animationProgress * (this.weaponConfig.frameCount - 1);
    const currentFrameIndex = Math.floor(exactFrame);

    const source = createRectangle(
      this.weaponConfig.frameWidth * currentFrameIndex,
      0,
      this.weaponConfig.frameWidth,
      this.weaponConfig.frameHeight,
      '',
    );

    const baseOffsetX = this.characterSize.width / 2;
    const slashOffsetX = this.weaponConfig.frameWidth / 2;
    const baseOffsetY = this.characterSize.height / 2;
    const slashOffsetY = -10;

    const shouldFlip = direction === -1;

    const xOffset =
      direction * (baseOffsetX + slashOffsetX) +
      (shouldFlip ? -this.characterSize.width / 2 : 0);

    const yOffset = baseOffsetY + slashOffsetY;

    const effectPosition: Vec2 = vector2Add(position, {
      x: xOffset,
      y: yOffset,
    });

    this.renderer.drawTextureRegion(
      this.weaponConfig.weaponTexture,
      source,
      effectPosition,
      shouldFlip,
    );
  }

  public override getAttackArea(
    position: Vec2,
    direction: number,
  ): Rectangle | null {
    if (!this.isAttacking()) return null;

    const frameWidth = this.weaponConfig.frameWidth;
    const frameHeight = this.weaponConfig.frameHeight;

    const baseOffsetX = this.characterSize.width / 2;
    const slashOffsetX = frameWidth / 2;
    const baseOffsetY = this.characterSize.height / 2;
    const slashOffsetY = -10;

    const shouldFlip = direction === -1;

    const xOffset =
      direction * (baseOffsetX + slashOffsetX) +
      (shouldFlip ? -this.characterSize.width / 2 : 0);

    const yOffset = baseOffsetY + slashOffsetY;

    const effectPosition: Vec2 = vector2Add(position, {
      x: xOffset,
      y: yOffset,
    });

    return createRectangle(
      effectPosition.x,
      effectPosition.y,
      frameWidth,
      frameHeight,
      '',
    );
  }
}
