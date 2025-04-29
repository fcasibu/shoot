import { createRectangle } from '../lib/primitives/shape';
import type { SoundManager } from '../lib/primitives/sound';
import {
  vector2Add,
  vector2Normalize,
  vector2Scale,
  vector2Sub,
} from '../lib/primitives/vector2';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Rectangle, Vec2 } from '../lib/types';
import type { Player } from './player';
import type { Renderable, Component } from './types';

class Transform {
  public direction = 1;

  constructor(
    public position: Vec2,
    private readonly size: { width: number; height: number },
  ) {}

  public move(playerPosition: Vec2, speed: number, dt: number) {
    const dist = vector2Sub(playerPosition, this.position);
    const dir = vector2Normalize(dist);

    this.position = vector2Add(this.position, vector2Scale(dir, speed * dt));

    this.direction = dir.x < 0 ? 1 : -1;
  }

  public takeDamage() {
    this.position =
      this.direction > 0
        ? vector2Add(this.position, {
            x: this.size.width,
            y: 0,
          })
        : vector2Sub(this.position, {
            x: this.size.width,
            y: 0,
          });
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

interface AnimationSpriteConfig {
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

class AnimationSprite implements Component, Renderable {
  private currentFrame = 0;
  private frameTime = 0;
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
    const source = createRectangle(
      this.config.frameWidth * this.currentFrame,
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
}

export class Enemy implements Component, Renderable {
  private transform: Transform;
  private animationSprite: AnimationSprite;
  private movementSpeed = 100;

  constructor(
    public readonly canvasWindow: CanvasWindow,
    public readonly soundManager: SoundManager<string>,
    public readonly texture: ImageBitmap,
    public readonly animationSpriteConfig: AnimationSpriteConfig,
    public readonly player: Player,
    public readonly position: Vec2,
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
  }

  public update(dt: number) {
    const { x, y } = this.player.getCollisionRect();
    this.transform.move({ x, y }, this.movementSpeed, dt);

    this.animationSprite.update(dt);
  }

  public draw() {
    this.animationSprite.draw(
      this.transform.position,
      this.transform.direction,
    );
  }

  public takeDamage() {
    this.transform.takeDamage();
  }

  public getCollisionRect() {
    return this.transform.getCollisionRect();
  }
}
