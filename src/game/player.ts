import { createRectangle } from '../lib/primitives/shape';
import type { SoundManager } from '../lib/primitives/sound';
import {
  vector2Add,
  vector2Length,
  vector2Normalize,
  vector2Scale,
  vector2Sub,
} from '../lib/primitives/vector2';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Rectangle, Vec2 } from '../lib/types';
import type { Renderable, Component } from './types';

class Transform {
  public direction = 1;

  constructor(
    public position: Vec2,
    private readonly size: { width: number; height: number },
  ) {}

  public move(direction: Vec2, speed: number, dt: number) {
    if (vector2Length(direction) > 0) {
      const normalizedDirection = vector2Normalize(direction);
      this.position = vector2Add(
        this.position,
        vector2Scale(normalizedDirection, speed * dt),
      );

      if (direction.x < 0) {
        this.direction = -1;
      } else if (direction.x > 0) {
        this.direction = 1;
      }
    }
  }

  public takeDamage(enemyPosition: Vec2) {
    const knockbackDistance = 5.0;

    const directionToEnemy = vector2Sub(enemyPosition, this.position);

    const normalizedDirection = vector2Normalize(directionToEnemy);
    const knockback = vector2Scale(normalizedDirection, -knockbackDistance);

    this.position = vector2Add(this.position, knockback);
  }

  public getCollisionRect(): Rectangle {
    return createRectangle(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
      '',
    );
  }
}

interface WeaponConfig {
  weaponTexture: ImageBitmap;
  damage: number;
  cooldown: number;
  radius: number;
  visualDuration: number;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

abstract class Weapon implements Component, Renderable {
  private isActive = false;
  protected activeTimer = 0;
  protected timer = 0;

  constructor(protected readonly weaponConfig: WeaponConfig) {}

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

  private activate() {
    this.timer = this.weaponConfig.cooldown;
    this.isActive = true;
    this.activeTimer = this.weaponConfig.visualDuration;
  }
}

class Bat extends Weapon {
  private animationProgress = 0;

  constructor(
    public readonly canvasWindow: CanvasWindow,
    public readonly soundManager: SoundManager<string>,
    public readonly characterSize: { width: number; height: number },
    protected override readonly weaponConfig: WeaponConfig,
  ) {
    super(weaponConfig);
  }

  public override update(dt: number) {
    super.update(dt);

    if (this.timer === 1) {
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

    this.canvasWindow.drawTextureRegion(
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

class InputController implements Component {
  private moveDirection: Vec2 = { x: 0, y: 0 };

  constructor(private readonly canvasWindow: CanvasWindow) {}

  public update(): void {
    this.moveDirection = { x: 0, y: 0 };

    if (this.canvasWindow.inputManager.isKeyPressed('w'))
      this.moveDirection.y -= 1;
    if (this.canvasWindow.inputManager.isKeyPressed('s'))
      this.moveDirection.y += 1;
    if (this.canvasWindow.inputManager.isKeyPressed('a'))
      this.moveDirection.x -= 1;
    if (this.canvasWindow.inputManager.isKeyPressed('d'))
      this.moveDirection.x += 1;
  }

  public getMoveDirection() {
    return this.moveDirection;
  }

  public isMoving() {
    return vector2Length(this.moveDirection) > 0;
  }
}

interface AnimationSpriteConfig {
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

class AnimationSprite implements Component, Renderable {
  private currentFrame = 0;
  private frameTime = 0;
  private isMoving = false;
  private readonly animationFPS = 10;
  private readonly frameDuration = 1 / this.animationFPS;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly texture: ImageBitmap,
    private readonly config: AnimationSpriteConfig,
  ) {}

  public update(dt: number) {
    this.frameTime += dt;

    if (this.frameTime >= this.frameDuration) {
      this.currentFrame =
        (this.currentFrame + 1) % (this.config.frameCount / 2);
      this.frameTime = 0;
    }
  }

  public draw(position: Vec2, direction: number) {
    const animationFrame = this.isMoving ? this.config.frameCount / 2 : 0;
    const source = createRectangle(
      this.config.frameWidth * (this.currentFrame + animationFrame),
      0,
      this.config.frameWidth,
      this.config.frameHeight,
      '',
    );

    const shouldFlip = direction === -1;

    this.canvasWindow.drawTextureRegion(
      this.texture,
      source,
      position,
      shouldFlip,
      2,
    );
  }

  public setIsMoving(isMoving: boolean) {
    this.isMoving = isMoving;
  }
}

export class Player implements Component, Renderable {
  private transform: Transform;
  private animationSprite: AnimationSprite;
  private inputController: InputController;
  private movementSpeed = 200;
  public weapons: Weapon[] = [];

  constructor(
    public readonly canvasWindow: CanvasWindow,
    public readonly soundManager: SoundManager<string>,
    public readonly texture: ImageBitmap,
    public readonly position: Vec2,
    public readonly batSlashTexture: ImageBitmap,
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

    const weaponConfig: WeaponConfig = {
      weaponTexture: batSlashTexture,
      damage: 10,
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
    }
  }

  public draw() {
    this.animationSprite.draw(
      this.transform.position,
      this.transform.direction,
    );

    for (const weapon of this.weapons) {
      weapon.draw(this.transform.position, this.transform.direction);
    }
  }

  public takeDamage(enemyPosition: Vec2) {
    this.transform.takeDamage(enemyPosition);
  }

  public getWeaponCollisionRects() {
    return this.weapons
      .filter((weapon) => weapon.isAttacking())
      .map((weapon) =>
        weapon.getAttackArea(this.transform.position, this.transform.direction),
      );
  }

  public getCollisionRect() {
    return this.transform.getCollisionRect();
  }
}
