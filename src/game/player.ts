import type { SoundManager } from '../lib/primitives/sound';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Rectangle, Vec2 } from '../lib/types';
import { AnimationSprite, InputController, Transform } from './common';
import type { Entity, AnimationSpriteConfig } from './types';
import { Bat } from './weapons';

export class Player implements Entity {
  private transform: Transform;
  private animationSprite: AnimationSprite;
  private inputController: InputController;
  private movementSpeed = 200;
  private weapons: Bat[] = [];
  private health = 100;
  private isAliveState = true;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly soundManager: SoundManager<string>,
    public readonly texture: ImageBitmap,
    public position: Vec2,
    public readonly batSlashTexture: ImageBitmap,
    public readonly firecrackerTexture?: ImageBitmap,
    public readonly explosionTexture?: ImageBitmap,
  ) {
    this.inputController = new InputController(canvasWindow);

    const animationSpriteConfig: AnimationSpriteConfig = {
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 12,
    };

    this.transform = new Transform(position, {
      width: animationSpriteConfig.frameWidth,
      height: animationSpriteConfig.frameHeight,
    });

    this.animationSprite = new AnimationSprite(
      canvasWindow,
      texture,
      animationSpriteConfig,
    );

    const weaponConfig = {
      weaponTexture: batSlashTexture,
      damage: 40,
      cooldown: 1,
      radius: 50,
      visualDuration: 0.2,
      frameCount: 3,
      frameWidth: 84,
      frameHeight: 48,
    };

    const batWeapon = new Bat(
      canvasWindow,
      soundManager,
      {
        width: animationSpriteConfig.frameWidth,
        height: animationSpriteConfig.frameHeight,
      },
      weaponConfig,
    );

    this.weapons.push(batWeapon);
  }

  public update(dt: number) {
    if (!this.isAliveState) return;

    this.inputController.update();

    this.transform.move(
      this.inputController.getMoveDirection(),
      this.movementSpeed,
      dt,
    );

    this.animationSprite.setIsMoving(this.inputController.isMoving());
    this.animationSprite.update(dt);

    for (const weapon of this.weapons) {
      weapon.update(dt);

      if (
        !weapon.isAttacking() &&
        (this.canvasWindow.inputManager.isMouseButtonPressed(0) ||
          this.inputController.isActionTriggered())
      ) {
        weapon.activate();
      }
    }
  }

  public draw() {
    if (!this.isAliveState) return;

    this.animationSprite.draw(
      this.transform.position,
      this.transform.direction,
    );

    for (const weapon of this.weapons) {
      weapon.draw(this.transform.position, this.transform.direction);
    }
  }

  public takeDamage(sourcePosition: Vec2, damage = 1) {
    if (!this.isAliveState) return;

    this.health -= damage;
    this.transform.takeDamage(sourcePosition);

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.isAliveState = false;
    this.soundManager.play('playerDeath');
  }

  public getWeaponCollisionAndDamage() {
    const weaponRects = this.weapons
      .filter((weapon) => weapon.isAttacking())
      .map((weapon) => ({
        collisionRect: weapon.getAttackArea(
          this.transform.position,
          this.transform.direction,
        ),
        damage: weapon.getDamage(),
      }));

    return weaponRects;
  }

  public getCollisionRect(): Rectangle {
    return this.transform.getCollisionRect();
  }

  public getHealth(): number {
    return this.health;
  }

  public isAlive(): boolean {
    return this.isAliveState;
  }

  public getPosition(): Vec2 {
    return this.transform.position;
  }
}
