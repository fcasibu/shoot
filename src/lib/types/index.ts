export interface CanvasWindowState {
  isRunning: boolean;
  isDrawing: boolean;
  frameTime: number;
  lastUpdate: number;
  fps: number;
  width: number;
  height: number;
}

export type Color = string;
