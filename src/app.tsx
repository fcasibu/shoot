import { useEffect, useRef } from 'react';
import { CanvasWindow } from './lib/primitives/window';
import { InputManager } from './lib/primitives/input';
import { TextureManager } from './lib/primitives/texture';
import { Player } from './game/player';
import { assert } from './utils';
import { SoundManager } from './lib/primitives/sound';
import { Enemy } from './game/enemy';
import { rectsOverlap } from './lib/primitives/collision';

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
      homeWorkBook: {
        src: '/textures/homework-spritesheet.png',
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
      swordHit: {
        src: '/sounds/26_sword_hit_3.wav',
        lazy: true,
      },
    });

    canvasWindow.initWindow(ref.current);
    canvasWindow.setFps(60);
    const width = canvasWindow.getWindowWidth();
    const height = canvasWindow.getWindowHeight();

    void textures.loadAll().then(async () => {
      const mainCharacterTexture = await textures.get('mainCharacter');
      const homeWorkBookTexture = await textures.get('homeWorkBook');
      const slash = await textures.get('slash');

      sounds.play('bgm');

      assert(mainCharacterTexture);
      assert(homeWorkBookTexture);
      assert(slash);
      const player = new Player(
        canvasWindow,
        sounds,
        mainCharacterTexture,
        { x: width / 2, y: height / 2 },
        slash,
      );
      const enemy = new Enemy(
        canvasWindow,
        sounds,
        homeWorkBookTexture,
        { frameHeight: 64, frameWidth: 64, frameCount: 4 },
        player,
        {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
        },
      );

      let hp = 100;
      let enemyHp = 100;

      let hit = new Set();

      canvasWindow.run((dt) => {
        canvasWindow.clearBackground('#9AF764');
        for (const weaponCollisionRect of player.getWeaponCollisionRects()) {
          if (rectsOverlap(weaponCollisionRect!, enemy.getCollisionRect())) {
            enemy.takeDamage();
            enemyHp -= 1;
            sounds.play('swordHit');
          }
        }

        if (rectsOverlap(enemy.getCollisionRect(), player.getCollisionRect())) {
          const { x, y } = enemy.getCollisionRect();
          player.takeDamage({ x, y });
          hp -= 1;
        }

        canvasWindow.drawText(`HP: ${hp}`, 0, 0, 32, '#FFFFFF');
        canvasWindow.drawText(
          `ENEMY HP: ${enemyHp}`,
          width - canvasWindow.measureText(`ENEMY HP: ${enemyHp}`, 32).width,
          0,
          32,
          '#FFFFFF',
        );
        player.update(dt);
        enemy.update(dt);

        player.draw();
        enemy.draw();
      });
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-full">
      <canvas ref={ref} width={1920} height={1080}></canvas>
    </div>
  );
}
