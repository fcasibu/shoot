interface MouseState {
  position: { x: number; y: number };
  pressedButtons: Set<number>;
}

interface KeyboardState {
  pressedKeys: Set<string>;
}

export class InputManager {
  private mouseState: MouseState = {
    position: {
      x: 0,
      y: 0,
    },
    pressedButtons: new Set<number>(),
  };
  private keyboardState: KeyboardState = {
    pressedKeys: new Set(),
  };
  private abortController = new AbortController();

  public getMousePosition() {
    return structuredClone(this.mouseState.position);
  }

  public isKeyPressed(key: string): boolean {
    return this.keyboardState.pressedKeys.has(key);
  }
  public areKeysPressed(keys: string[]): boolean {
    return keys.every((key) => this.keyboardState.pressedKeys.has(key));
  }
  public isMouseButtonPressed(button: number): boolean {
    return this.mouseState.pressedButtons.has(button);
  }

  public unregisterListeners() {
    this.abortController.abort();
  }

  public registerListeners(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mouseup', this.mouseUp.bind(this), {
      signal: this.abortController.signal,
    });
    canvas.addEventListener('mousedown', this.mouseDown.bind(this), {
      signal: this.abortController.signal,
    });
    canvas.addEventListener('mousemove', this.mouseMove.bind(this), {
      signal: this.abortController.signal,
    });

    window.addEventListener('keyup', this.keyUp.bind(this), {
      signal: this.abortController.signal,
    });

    window.addEventListener('keydown', this.keyDown.bind(this), {
      signal: this.abortController.signal,
    });
  }

  private mouseUp(event: MouseEvent) {
    this.mouseState.pressedButtons.delete(event.button);
  }

  private mouseDown(event: MouseEvent) {
    this.mouseState.pressedButtons.add(event.button);
  }

  private mouseMove(event: MouseEvent) {
    this.mouseState.position = {
      x: event.x,
      y: event.y,
    };
  }

  private keyUp(event: KeyboardEvent) {
    this.keyboardState.pressedKeys.delete(event.key);
  }

  private keyDown(event: KeyboardEvent) {
    this.keyboardState.pressedKeys.add(event.key);
  }
}
