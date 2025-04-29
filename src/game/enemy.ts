import type { SoundManager } from '../lib/primitives/sound';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Rectangle, Vec2 } from '../lib/types';
import { AnimationSprite, GhostEffect, Transform } from './common';
import { type Entity, type AnimationSpriteConfig, EnemyType } from './types';

export class Enemy implements Entity {
  private transform: Transform;
  private animationSprite: AnimationSprite;
  private movementSpeed = 50;
  private isActiveEnemy = true;
  private health = 100;
  private ghosts: GhostEffect[] = [];
  private hitCooldown = 0;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly soundManager: SoundManager<string>,
    private readonly targetPosition: () => Vec2,
    private readonly ghostTexture: ImageBitmap,
    public readonly type: EnemyType,
    public readonly texture: ImageBitmap,
    public readonly animationSpriteConfig: AnimationSpriteConfig,
    public position: Vec2,
    public initialHealth = 100,
  ) {
    this.transform = new Transform(position, {
      width: animationSpriteConfig.frameWidth,
      height: animationSpriteConfig.frameHeight,
    });

    this.animationSprite = new AnimationSprite(
      canvasWindow,
      texture,
      animationSpriteConfig,
    );

    this.health = initialHealth;

    switch (type) {
      case EnemyType.HOMEWORK:
        this.movementSpeed = 40;
        break;
      case EnemyType.CLOWN:
        this.movementSpeed = 80;
        break;
      case EnemyType.EYEBUG:
        this.movementSpeed = 50;
        break;
      case EnemyType.DEMONDOOR:
        this.movementSpeed = 40;
        this.health = 200;
        break;
    }
  }

  public update(dt: number) {
    if (this.isActiveEnemy) {
      const target = this.targetPosition();
      this.transform.moveToTarget(target, this.movementSpeed, dt);
      this.animationSprite.setIsMoving(true);
      this.animationSprite.update(dt);

      if (this.hitCooldown > 0) {
        this.hitCooldown -= dt;
      }
    }

    for (const ghost of this.ghosts) {
      ghost.update(dt);
    }

    this.ghosts = this.ghosts.filter((ghost) => !ghost.isFinished());
  }

  public draw() {
    if (this.isActiveEnemy) {
      this.animationSprite.draw(
        this.transform.position,
        this.transform.direction,
      );
    }

    for (const ghost of this.ghosts) {
      ghost.draw();
    }
  }

  public takeDamage(sourcePosition: Vec2, damage = 10) {
    if (!this.isActiveEnemy || this.hitCooldown > 0) return;

    this.hitCooldown = 0.5;

    const soundName = this.getSoundName();
    if (soundName) {
      this.soundManager.play(soundName);
    }

    this.health -= damage;
    this.transform.takeDamage(sourcePosition);

    if (this.health <= 0) {
      this.die();
    }
  }

  private getSoundName(): string | undefined {
    switch (this.type) {
      case EnemyType.HOMEWORK:
        return 'paperCrumple';
      case EnemyType.CLOWN:
        return 'clownSound';
      case EnemyType.EYEBUG:
        return 'bugSquish';
      case EnemyType.DEMONDOOR:
        return 'doorClose';
      default:
        return undefined;
    }
  }

  private die() {
    this.isActiveEnemy = false;

    const ghost = new GhostEffect(
      this.canvasWindow,
      this.transform.position,
      this.transform.direction,
      this.ghostTexture,
    );

    this.ghosts.push(ghost);
  }

  public getCollisionRect(): Rectangle {
    if (!this.isActiveEnemy)
      return { type: 'rectangle', x: 0, y: 0, width: 0, height: 0, color: '' };
    return this.transform.getCollisionRect();
  }

  public isAlive(): boolean {
    return this.isActiveEnemy;
  }

  public getPosition(): Vec2 {
    return this.transform.position;
  }
}
