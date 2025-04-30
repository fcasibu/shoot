import { createRectangle } from '../lib/primitives/shape';
import type { CanvasWindow } from '../lib/primitives/window';
import {
  vector2Add,
  vector2Length,
  vector2Normalize,
  vector2Scale,
  vector2Sub,
} from '../lib/primitives/vector2';
import type { Rectangle, Vec2 } from '../lib/types';
import {
  type AnimationSpriteConfig,
  type Component,
  type Renderable,
  type Size,
} from './types';

export class Transform {
  public direction = 1;

  constructor(
    public position: Vec2,
    private readonly size: Size,
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

  public moveToTarget(targetPosition: Vec2, speed: number, dt: number) {
    const direction = vector2Sub(targetPosition, this.position);
    this.move(direction, speed, dt);
  }

  public takeDamage(sourcePosition: Vec2, knockbackDistance = 5.0) {
    const directionToSource = vector2Sub(sourcePosition, this.position);
    const normalizedDirection = vector2Normalize(directionToSource);
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

export class InputController implements Component {
  private moveDirection: Vec2 = { x: 0, y: 0 };
  private actionTriggered = false;

  constructor(private readonly canvasWindow: CanvasWindow) {}

  public update(): void {
    this.moveDirection = { x: 0, y: 0 };
    this.actionTriggered = false;

    if (
      this.canvasWindow.inputManager.isKeyPressed('w') ||
      this.canvasWindow.inputManager.isKeyPressed('ArrowUp')
    )
      this.moveDirection.y -= 1;
    if (
      this.canvasWindow.inputManager.isKeyPressed('s') ||
      this.canvasWindow.inputManager.isKeyPressed('ArrowDown')
    )
      this.moveDirection.y += 1;
    if (
      this.canvasWindow.inputManager.isKeyPressed('a') ||
      this.canvasWindow.inputManager.isKeyPressed('ArrowLeft')
    )
      this.moveDirection.x -= 1;
    if (
      this.canvasWindow.inputManager.isKeyPressed('d') ||
      this.canvasWindow.inputManager.isKeyPressed('ArrowRight')
    )
      this.moveDirection.x += 1;

    if (this.canvasWindow.inputManager.isKeyPressed(' '))
      this.actionTriggered = true;
  }

  public getMoveDirection() {
    return this.moveDirection;
  }

  public isMoving() {
    return vector2Length(this.moveDirection) > 0;
  }

  public isActionTriggered() {
    return this.actionTriggered;
  }
}

export class AnimationSprite implements Component, Renderable {
  private currentFrame = 0;
  private frameTime = 0;
  private readonly animationFPS: number;
  private readonly frameDuration: number;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly texture: ImageBitmap,
    private readonly config: AnimationSpriteConfig,
    private readonly scale = 2,
  ) {
    this.animationFPS = config.animationFPS ?? 10;
    this.frameDuration = 1 / this.animationFPS;
  }

  public update(dt: number) {
    this.frameTime += dt;

    if (this.frameTime >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.config.frameCount;
      this.frameTime = 0;
    }
  }

  public draw(position: Vec2, direction: number) {
    const source = createRectangle(
      this.config.frameWidth * this.currentFrame,
      0,
      this.config.frameWidth,
      this.config.frameHeight,
      '',
    );

    const shouldFlip = direction === 1;

    this.canvasWindow.drawTextureRegion(
      this.texture,
      source,
      position,
      shouldFlip,
      this.scale,
    );
  }
}

export class GhostEffect implements Component, Renderable {
  private readonly visualDuration = 2.0;
  private readonly fadeOutTime = 1.0;
  private timer = 0;
  private sprite: AnimationSprite;
  private isActive = false;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly position: Vec2,
    private readonly direction: number,
    public readonly ghostTexture: ImageBitmap,
  ) {
    this.sprite = new AnimationSprite(canvasWindow, ghostTexture, {
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 5,
    });
    this.isActive = true;
    this.timer = this.visualDuration;
  }

  public update(dt: number): void {
    if (!this.isActive) return;

    this.timer -= dt;
    this.sprite.update(dt);

    if (this.timer <= 0) {
      this.isActive = false;
    }
  }

  public draw(): void {
    if (!this.isActive) return;

    let opacity = 1.0;
    if (this.timer < this.fadeOutTime) {
      opacity = this.timer / this.fadeOutTime;
    }

    this.canvasWindow.setGlobalAlpha(opacity);
    this.sprite.draw(this.position, this.direction);
    this.canvasWindow.setGlobalAlpha(1.0);
  }

  public isFinished(): boolean {
    return !this.isActive;
  }
}
