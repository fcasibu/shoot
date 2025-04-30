import { assert } from '../../utils';
import type { InputManager } from './input';

const DEFAULT_STATE = {
  isRunning: false,
  frameTime: 0.0,
  lastUpdate: 0,
  fps: 30,
  width: 0,
  height: 0,
};

export class CanvasWindow {
  private state = DEFAULT_STATE;

  private context: CanvasRenderingContext2D;

  constructor(
    public readonly canvas: HTMLCanvasElement,
    public readonly inputManager: InputManager,
  ) {
    this.state.width = canvas.width;
    this.state.height = canvas.height;
    const ctx = canvas.getContext('2d');
    assert(ctx, 'Failed to get 2D rendering context');

    this.context = ctx;
    this.inputManager.registerListeners(canvas);
  }

  public getContext() {
    return this.context;
  }

  public getWindowWidth() {
    return this.state.width;
  }

  public getWindowHeight() {
    return this.state.height;
  }

  public setGlobalAlpha(globalAlpha: number) {
    this.context.globalAlpha = globalAlpha;
  }

  public setFps(fps: number) {
    if (fps <= 0) {
      throw new Error('FPS must be greater than 0');
    }
    this.state.fps = fps;
  }

  public run(callback: (timeStep: number) => void) {
    this.state.isRunning = true;
    this.state.lastUpdate = performance.now() / 1000;
    const targetFrameTime = 1 / this.state.fps;
    const maxUpdates = 5;

    assert(targetFrameTime > 0, 'Target frame time must be positive');

    const loop = (timestampMs: number) => {
      if (!this.state.isRunning) return;

      const timestamp = timestampMs / 1000;
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

  public getFPS() {
    return this.state.fps;
  }

  public closeWindow() {
    this.state.isRunning = false;
    this.inputManager.unregisterListeners();
    this.state = DEFAULT_STATE;
  }
}
