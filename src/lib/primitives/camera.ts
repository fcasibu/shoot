import { assert } from '../../utils';
import type { Camera, Vec2 } from '../types';

export class Camera2D {
  private target: Vec2 | null = null;
  private offset: Vec2;
  private rotation: number;
  private zoom: number;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(private readonly ctx: CanvasRenderingContext2D) {
    this.offset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.rotation = 0;
    this.zoom = 1.0;

    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
  }

  public setupCamera(playerPosition: Vec2) {
    this.target = Camera2D.clampCameraTarget(
      {
        target: playerPosition,
        zoom: this.zoom,
        rotation: this.rotation,
        offset: this.offset,
      },
      this.canvasWidth,
      this.canvasHeight,
    );
  }

  public update(camera: Partial<Camera>) {
    for (const [key, value] of Object.entries(camera) as [
      keyof Camera,
      Camera[keyof Camera],
    ][]) {
      switch (key) {
        case 'target': {
          this.target = Camera2D.clampCameraTarget(
            {
              target: value as Vec2,
              zoom: this.zoom,
              rotation: this.rotation,
              offset: this.offset,
            },
            this.canvasWidth,
            this.canvasHeight,
          );
          break;
        }
        case 'offset': {
          this.offset = value as Vec2;
          break;
        }
        case 'rotation': {
          this.rotation = value as number;
          break;
        }
        case 'zoom': {
          if (this.zoom <= 0 || this.zoom > 1) {
            throw new Error('Zoom must be within the range of 0-1');
          }

          this.zoom = value as number;
          break;
        }
        default: {
          const exhaustive: never = key;
          throw new Error(`Unknown key: ${exhaustive}`);
        }
      }
    }
  }

  public beginMode() {
    assert(this.target);

    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.rotate(this.rotation);
    this.ctx.translate(-this.target.x, -this.target.y);
  }

  public endMode() {
    this.ctx.restore();
  }

  public getWorldToScreen(world: Vec2): Vec2 {
    assert(this.target);

    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);

    const x = (world.x - this.target.x) * this.zoom;
    const y = (world.y - this.target.y) * this.zoom;

    return {
      x: x * cosR - y * sinR + this.offset.x,
      y: x * sinR + y * cosR + this.offset.y,
    };
  }

  public getScreenToWorld(screen: Vec2): Vec2 {
    assert(this.target);

    const cosR = Math.cos(-this.rotation);
    const sinR = Math.sin(-this.rotation);

    const x = (screen.x - this.offset.x) / this.zoom;
    const y = (screen.y - this.offset.y) / this.zoom;

    return {
      x: x * cosR - y * sinR + this.target.x,
      y: x * sinR + y * cosR + this.target.y,
    };
  }

  private static clampCameraTarget(
    camera: Camera,
    width: number,
    height: number,
  ): Vec2 {
    assert(camera.zoom !== 0);

    const halfWidth = camera.offset.x / camera.zoom;
    const halfHeight = camera.offset.y / camera.zoom;

    return {
      x: Math.max(halfWidth, Math.min(camera.target.x, width - halfWidth)),
      y: Math.max(halfHeight, Math.min(camera.target.y, height - halfHeight)),
    };
  }
}
