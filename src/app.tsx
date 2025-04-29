import { useEffect, useRef } from 'react';
import { CanvasWindow } from './lib/primitives/window';
import { InputManager } from './lib/primitives/input';
import { TextureManager } from './lib/primitives/texture';
import { Player } from './game/player';
import { assert } from './utils';
import { SoundManager } from './lib/primitives/sound';

const inputManager = new InputManager();
const canvasWindow = new CanvasWindow(inputManager);

export function App() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const textures = new TextureManager({
      mainCharacter: {
        src: '/textures/kid-male-spritesheet.png',
        lazy: false,
      },
      slash: {
        src: '/textures/bat-swing-spritesheet.png',
        lazy: true,
      },
    });

    const sounds = new SoundManager({
      bgm: {
        src: '/sounds/Goblins_Den_(Regular).wav',
        lazy: true,
      },
      slash: {
        src: '/sounds/07_human_atk_sword_3.wav',
        lazy: true,
      },
    });

    canvasWindow.initWindow(ref.current);
    canvasWindow.setFps(60);
    const width = canvasWindow.getWindowWidth();
    const height = canvasWindow.getWindowHeight();

    void textures.loadAll().then(async () => {
      const mainCharacterTexture = await textures.get('mainCharacter');
      const slash = await textures.get('slash');

      sounds.play('bgm');

      assert(mainCharacterTexture);
      assert(slash);

      const player = new Player(
        canvasWindow,
        sounds,
        mainCharacterTexture,
        { x: width / 2, y: height / 2 },
        slash,
      );
      canvasWindow.run((dt) => {
        canvasWindow.clearBackground('#FFF');
        player.update(dt);
        player.draw();
      });
    });
  }, []);

  return <canvas ref={ref} width={1920} height={1080}></canvas>;
}
