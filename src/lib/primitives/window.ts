import type { CanvasWindowState, Color } from '../types';

export class CanvasWindow {
  private state: CanvasWindowState = {
    isRunning: false,
    isDrawing: false,
    frameTime: 0.0,
    lastUpdate: 0,
    fps: 30,
    width: 0,
    height: 0,
  };

  private frameBuffer: HTMLCanvasElement;
  private backContext: CanvasRenderingContext2D;
  private frontContext: CanvasRenderingContext2D | null = null;

  constructor() {
    this.frameBuffer = document.createElement('canvas');
    this.backContext = this.frameBuffer.getContext('2d')!;
  }

  public initWindow(canvas: HTMLCanvasElement) {
    this.state.width = canvas.width;
    this.state.height = canvas.height;
    this.frontContext = canvas.getContext('2d')!;

    this.frameBuffer.width = canvas.width;
    this.frameBuffer.height = canvas.height;
  }

  public getWindowWidth() {
    return this.state.width;
  }

  public getWindowHeight() {
    return this.state.height;
  }

  public beginDrawing() {
    this.state.isDrawing = true;
    this.backContext.clearRect(0, 0, this.state.width, this.state.height);
    this.backContext.beginPath();
  }

  public endDrawing() {
    if (!this.frontContext) {
      throw new Error('Window was not initialized with initWindow');
    }

    if (!this.state.isDrawing) {
      throw new Error('Need to run beginDrawing first');
    }

    this.frontContext.drawImage(this.frameBuffer, 0, 0);
    this.state.isDrawing = false;
    this.backContext.closePath();
  }

  public clearBackground(color: Color) {
    this.backContext.clearRect(0, 0, this.state.width, this.state.height);
    this.backContext.fillStyle = color;
    this.backContext.fillRect(0, 0, this.state.width, this.state.height);
  }

  public drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
  ) {
    this.backContext.fillStyle = color;
    this.backContext.fillRect(x, y, width, height);
  }

  public drawCircle(centerX: number, centerY: number, r: number, color: Color) {
    this.backContext.fillStyle = color;
    this.backContext.arc(centerX, centerY, r, 0, 2 * Math.PI);
    this.backContext.fill();
  }

  public setFps(fps: number) {
    this.state.fps = fps;
  }

  public run(callback: (dt: number) => void) {
    this.state.isRunning = true;

    const loop = (timestamp: number) => {
      if (!this.state.isRunning) return;

      const dt = timestamp - (this.state.lastUpdate || timestamp);
      const targetFrameTime = 1000 / this.state.fps;
      this.state.frameTime += dt;
      this.state.lastUpdate = timestamp;

      while (this.state.frameTime >= targetFrameTime) {
        callback(this.state.frameTime);
        this.state.frameTime -= targetFrameTime;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  public close() {
    this.state.isRunning = false;
  }
}
