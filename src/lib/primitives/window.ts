import type { Color, Rectangle, Shape, Vec2 } from '../types';
import { assert } from '../utils';
import type { InputManager } from './input';
import { Renderer } from './renderer';

// TODO(fcasibu): canvas resizing
export class CanvasWindow {
  private state = {
    isRunning: false,
    frameTime: 0.0,
    lastUpdate: 0,
    fps: 30,
    width: 0,
    height: 0,
  };

  private context: CanvasRenderingContext2D | null = null;
  private renderer: Renderer | null = null;

  constructor(private readonly inputManager: InputManager) {}

  public initWindow(canvas: HTMLCanvasElement) {
    if (this.context) {
      return;
    }

    this.state.width = canvas.width;
    this.state.height = canvas.height;
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Failed to get 2D rendering context');

    this.context = ctx;
    this.renderer = new Renderer(
      this.context,
      this.state.width,
      this.state.height,
    );
    this.inputManager.registerListeners(canvas);
  }

  public getWindowWidth() {
    return this.state.width;
  }

  public getWindowHeight() {
    return this.state.height;
  }

  public clearBackground(color: Color) {
    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );
    this.renderer.clearBackground(color);
  }

  public drawShape(shape: Shape) {
    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );
    this.renderer.drawShape(shape);
  }

  public drawTexture(texture: ImageBitmap | undefined, x: number, y: number) {
    if (!texture) {
      console.warn(`Tried to draw undefined texture at X:${x}, Y:${y}`);
      return;
    }

    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );
    this.renderer.drawTexture(texture, x, y);
  }

  public drawTextureRec(
    texture: ImageBitmap | undefined,
    source: Rectangle,
    position: Vec2,
    scale = 1,
  ) {
    if (!texture) {
      console.warn(
        `Tried to draw undefined texture at X:${position.x}, Y:${position.y}`,
      );
      return;
    }

    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );

    this.renderer.drawTextureRec(texture, source, position, scale);
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
  ) {
    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );
    this.renderer.drawText(text, x, y, fontSize, color);
  }

  public measureText(text: string, fontSize: number) {
    assert(
      this.renderer,
      'CanvasWindow renderer is not initialized. Call initWindow first.',
    );
    return this.renderer.measureText(text, fontSize);
  }

  public setFps(fps: number) {
    assert(fps > 0, 'FPS must be greater than 0');
    this.state.fps = fps;
  }

  public run(callback: (timeStep: number) => void) {
    this.state.isRunning = true;
    this.state.lastUpdate = performance.now();
    const targetFrameTime = 1000 / this.state.fps;
    const maxUpdates = 5;

    assert(targetFrameTime > 0, 'Target frame time must be positive');

    const loop = (timestamp: number) => {
      if (!this.state.isRunning) return;

      const dt = timestamp - this.state.lastUpdate;
      this.state.frameTime += dt;
      this.state.lastUpdate = timestamp;

      let updates = 0;

      while (this.state.frameTime >= targetFrameTime && updates < maxUpdates) {
        callback(targetFrameTime);
        this.state.frameTime -= targetFrameTime;
        updates += 1;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  public closeWindow() {
    this.state.isRunning = false;
    this.inputManager.unregisterListeners();
    this.renderer = null;
    this.context = null;
  }
}
