import { useEffect, useRef } from 'react';
import { CanvasWindow } from './lib/primitives/window';
import { InputManager } from './lib/primitives/input';
import { circleRectOverlap } from './lib/primitives/collision';
import { createCircle, createRectangle } from './lib/primitives/shape';

const inputManager = new InputManager();
const canvasWindow = new CanvasWindow(inputManager);

export function App() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    canvasWindow.initWindow(ref.current);
    canvasWindow.setFps(60);
    const width = canvasWindow.getWindowWidth();

    let x = 0;
    let dir = 1;

    canvasWindow.run((dt) => {
      canvasWindow.clearBackground('#FF0000');

      if (inputManager.isKeyPressed('l')) {
        dir = -1;
      }

      if (inputManager.isKeyPressed('j')) {
        dir = 1;
      }

      const mousePosition = inputManager.getMousePosition();
      const dx = width - x;
      const rect = createRectangle(x, 0, 1280, 200, '#FFF000');
      const circle = createCircle(
        mousePosition.x,
        mousePosition.y,
        100,
        '#FFF000',
      );

      if (circleRectOverlap(circle, rect)) {
        dir = dir === 1 ? -1 : 1;
      }
      canvasWindow.drawShape(rect);
      canvasWindow.drawShape(circle);
      const text = 'Hello, World!';
      canvasWindow.drawText(text, 0, 0, 42, '#FFFFFF');

      if (dx < 1280) {
        const wrappingRect = createRectangle(0, 0, 1280 - dx, 200, '#FFF000');

        if (circleRectOverlap(circle, wrappingRect)) {
          dir = dir === 1 ? -1 : 1;
        }
        canvasWindow.drawShape(wrappingRect);
      }
      x = (x + dir * dt + width) % width;
    });
  }, []);

  return <canvas ref={ref} width={1920} height={1080}></canvas>;
}
