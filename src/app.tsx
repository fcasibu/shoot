import { useEffect, useRef } from 'react';
import { CanvasWindow } from './lib/primitives/window';

const canvasWindow = new CanvasWindow();

export function App() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    canvasWindow.initWindow(ref.current);
    canvasWindow.setFps(60);
    const width = canvasWindow.getWindowWidth();
    const height = canvasWindow.getWindowHeight();

    let x = 0;
    let dir = 1;
    let circleDir = 1;
    let circleY = height / 2;

    canvasWindow.run((dt) => {
      canvasWindow.beginDrawing();
      canvasWindow.clearBackground('#FF0000');

      if (x >= canvasWindow.getWindowWidth() - 200) {
        dir = -1;
      }

      if (x <= 0) {
        dir = 1;
      }

      if (circleY >= height - 200) {
        circleDir = -1;
      }

      if (circleY <= 200) {
        circleDir = 1;
      }

      canvasWindow.drawRectangle(x, 0, 200, 200, '#FFFFFF');
      canvasWindow.drawCircle(width / 2, circleY, 200, '#FFFFFF');
      x += dir * dt;
      circleY += circleDir * dt;
      canvasWindow.endDrawing();
    });
  }, []);

  return <canvas ref={ref} width={1920} height={1080}></canvas>;
}
