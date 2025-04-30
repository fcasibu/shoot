import type { Camera2D } from '../lib/primitives/camera';
import { rectsOverlap } from '../lib/primitives/collision';
import type { Renderer } from '../lib/primitives/renderer';
import type { SoundManager } from '../lib/primitives/sound';
import type { CanvasWindow } from '../lib/primitives/window';
import type { Vec2 } from '../lib/types';
import { assert } from '../utils';
import { Enemy } from './enemy';
import { Player } from './player';
import { EnemyType, type AnimationSpriteConfig } from './types';

export class Game {
  private player: Player;
  private enemies: Enemy[] = [];
  private spawnTimer = 0;
  private readonly spawnInterval = 5;
  private score = 0;
  private gameOver = false;
  private readonly width: number;
  private readonly height: number;

  constructor(
    private readonly canvasWindow: CanvasWindow,
    private readonly renderer: Renderer,
    private readonly camera: Camera2D,
    private readonly soundManager: SoundManager,
    private readonly textures: {
      mainCharacterTexture: ImageBitmap;
      homeworkTexture: ImageBitmap;
      clownTexture: ImageBitmap;
      eyebugTexture: ImageBitmap;
      demondoorTexture: ImageBitmap;
      slashTexture: ImageBitmap;
      firecrackerTexture: ImageBitmap;
      explosionTexture: ImageBitmap;
      ghostTexture: ImageBitmap;
    },
  ) {
    this.width = canvasWindow.getWindowWidth();
    this.height = canvasWindow.getWindowHeight();

    this.player = new Player(
      canvasWindow,
      renderer,
      soundManager,
      textures.mainCharacterTexture,
      {
        x: this.width / 2,
        y: this.height / 2,
      },
      textures.slashTexture,
      textures.firecrackerTexture,
      textures.explosionTexture,
    );

    this.camera.setupCamera(this.player.getPosition());

    this.spawnEnemy(EnemyType.HOMEWORK);
    this.spawnEnemy(EnemyType.CLOWN);
    this.spawnEnemy(EnemyType.EYEBUG);

    soundManager.play('bgm');
    soundManager.setLoop('bgm', true);
  }

  private getRandomPosition(): Vec2 {
    return {
      x: Math.floor(Math.random() * this.width),
      y: Math.floor(Math.random() * this.height),
    };
  }

  private spawnEnemy(type: EnemyType): void {
    let texture: ImageBitmap | undefined;
    let spriteConfig: AnimationSpriteConfig | undefined;

    switch (type) {
      case EnemyType.HOMEWORK:
        texture = this.textures.homeworkTexture;
        spriteConfig = { frameHeight: 64, frameWidth: 64, frameCount: 4 };
        break;
      case EnemyType.CLOWN:
        texture = this.textures.clownTexture;
        spriteConfig = { frameHeight: 64, frameWidth: 64, frameCount: 6 };
        break;
      case EnemyType.EYEBUG:
        texture = this.textures.eyebugTexture;
        spriteConfig = { frameHeight: 64, frameWidth: 64, frameCount: 4 };
        break;
      case EnemyType.DEMONDOOR:
        texture = this.textures.demondoorTexture;
        spriteConfig = { frameHeight: 64, frameWidth: 64, frameCount: 4 };
        break;
    }

    this.enemies.push(
      new Enemy(
        this.canvasWindow,
        this.renderer,
        this.soundManager,
        () => this.player.getPosition(),
        this.textures.ghostTexture,
        type,
        texture,
        spriteConfig,
        this.getRandomPosition(),
      ),
    );
  }

  public update(dt: number): void {
    if (!this.player.isAlive()) {
      if (!this.gameOver) {
        this.gameOver = true;
        this.soundManager.stop('bgm');
        this.soundManager.play('playerDeath');
      }

      this.renderer.clearBackground('#000000');
      this.renderer.drawText(
        'GAME OVER',
        this.width / 2 - this.renderer.measureText('GAME OVER', 64).width / 2,
        this.height / 2 - 32,
        '#FF0000',
        64,
      );
      this.renderer.drawText(
        `Final Score: ${this.score}`,
        this.width / 2 -
          this.renderer.measureText(`Final Score: ${this.score}`, 32).width / 2,
        this.height / 2 + 32,
        '#FFFFFF',
        32,
      );
      this.canvasWindow.closeWindow();
      return;
    }

    this.renderer.clearBackground('#9AF764');

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      const types = [
        EnemyType.HOMEWORK,
        EnemyType.CLOWN,
        EnemyType.EYEBUG,
        EnemyType.DEMONDOOR,
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      assert(randomType, 'randomType should always give us a type');

      this.spawnEnemy(randomType);
    }

    for (const {
      collisionRect,
      damage,
    } of this.player.getWeaponCollisionAndDamage()) {
      if (!collisionRect) continue;

      for (const enemy of this.enemies) {
        if (!enemy.isAlive()) continue;

        if (rectsOverlap(collisionRect, enemy.getCollisionRect())) {
          enemy.takeDamage(this.player.getPosition(), damage);

          if (!enemy.isAlive()) {
            this.score += 10;
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      if (
        rectsOverlap(enemy.getCollisionRect(), this.player.getCollisionRect())
      ) {
        this.player.takeDamage(enemy.getPosition());
      }
    }

    this.renderer.drawText(
      `Health: ${this.player.getHealth()}`,
      10,
      10,
      '#FFFFFF',
      24,
    );
    this.renderer.drawText(
      `Score: ${this.score}`,
      this.width -
        this.renderer.measureText(`Score: ${this.score}`, 24).width -
        10,
      10,
      '#FFFFFF',
      24,
    );

    this.player.update(dt);
    for (const enemy of this.enemies) {
      enemy.update(dt);
    }

    this.camera.update({
      target: this.player.getPosition(),
    });

    this.camera.beginMode();
    this.player.draw();
    for (const enemy of this.enemies) {
      enemy.draw();
    }

    this.camera.endMode();
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }
}
