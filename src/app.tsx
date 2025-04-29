import { useEffect, useRef, useState } from 'react';
import { CanvasWindow } from './lib/primitives/window';
import { InputManager } from './lib/primitives/input';
import { TextureManager } from './lib/primitives/texture';
import { assert } from './utils';
import { SoundManager } from './lib/primitives/sound';
import { Game } from './game/game-manager';

const inputManager = new InputManager();
const canvasWindow = new CanvasWindow(inputManager);

export function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const textures = new TextureManager({
      mainCharacter: {
        src: '/textures/kid-male-spritesheet.png',
        lazy: false,
      },
      homework: {
        src: '/textures/homework-spritesheet.png',
        lazy: false,
      },
      clown: {
        src: '/textures/clown-spritesheet.png',
        lazy: false,
      },
      eyebug: {
        src: '/textures/4eyebug-spritesheet.png',
        lazy: false,
      },
      demondoor: {
        src: '/textures/demondoor-spritesheet.png',
        lazy: false,
      },
      slash: {
        src: '/textures/bat-swing-spritesheet.png',
        lazy: true,
      },
      firecracker: {
        src: '/textures/weapon-firecracker-spritesheet.png',
        lazy: true,
      },
      explosion: {
        src: '/textures/small-explosion-spritesheet.png',
        lazy: true,
      },
      ghost: {
        src: '/textures/ghost-spritesheet.png',
        lazy: true,
      },
    });

    const sounds = new SoundManager({
      bgm: {
        src: '/sounds/Goblins_Den_(Regular).wav',
        lazy: true,
      },
      battleMusic: {
        src: '/sounds/Goblins_Dance_(Battle).wav',
        lazy: true,
      },
      slash: {
        src: '/sounds/07_human_atk_sword_3.wav',
        lazy: true,
      },
      swordHit: {
        src: '/sounds/26_sword_hit_3.wav',
        lazy: true,
      },
      paperCrumple: {
        src: '/sounds/04_sack_open_3.wav',
        lazy: true,
      },
      clownSound: {
        src: '/sounds/10_human_special_atk_2.wav',
        lazy: true,
      },
      bugSquish: {
        src: '/sounds/21_orc_damage_3.wav',
        lazy: true,
      },
      doorClose: {
        src: '/sounds/06_door_close_1.mp3',
        lazy: true,
      },
      explosion: {
        src: '/sounds/08_human_charge_2.wav',
        lazy: true,
      },
      damage: {
        src: '/sounds/11_human_damage_2.wav',
        lazy: true,
      },
      playerDeath: {
        src: '/sounds/14_human_death_spin.wav',
        lazy: true,
      },
    });

    canvasWindow.initWindow(ref.current);
    canvasWindow.setFps(60);

    void textures.loadAll().then(async () => {
      const mainCharacterTexture = await textures.get('mainCharacter');
      const homeworkTexture = await textures.get('homework');
      const clownTexture = await textures.get('clown');
      const eyebugTexture = await textures.get('eyebug');
      const demondoorTexture = await textures.get('demondoor');
      const slashTexture = await textures.get('slash');
      const firecrackerTexture = await textures.get('firecracker');
      const explosionTexture = await textures.get('explosion');
      const ghostTexture = await textures.get('ghost');

      assert(mainCharacterTexture);
      assert(homeworkTexture);
      assert(clownTexture);
      assert(eyebugTexture);
      assert(demondoorTexture);
      assert(slashTexture);
      assert(firecrackerTexture);
      assert(explosionTexture);
      assert(ghostTexture);

      const game = new Game(canvasWindow, sounds, {
        mainCharacterTexture,
        homeworkTexture,
        clownTexture,
        eyebugTexture,
        demondoorTexture,
        slashTexture,
        firecrackerTexture,
        explosionTexture,
        ghostTexture,
      });

      canvasWindow.run((dt) => {
        game.update(dt);

        if (game.isGameOver() && !gameOver) {
          setGameOver(true);
        }
      });
    });
  }, [gameOver]);

  return (
    <div className="flex justify-center items-center h-full">
      <canvas ref={ref} width={1280} height={720}></canvas>
    </div>
  );
}
