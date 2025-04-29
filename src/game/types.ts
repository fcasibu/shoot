import type { Rectangle, Vec2 } from '../lib/types';

export interface Component {
  update(dt: number): void;
}

export interface Renderable {
  draw(position?: Vec2, direction?: number): void;
}

export interface Entity extends Component, Renderable {
  getCollisionRect(): Rectangle;
  takeDamage(source: Vec2): void;
  isAlive(): boolean;
}

export interface AnimationSpriteConfig {
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  animationFPS?: number;
}

export interface SpriteSheetConfig extends AnimationSpriteConfig {
  texture: ImageBitmap;
}

export interface WeaponConfig {
  weaponTexture: ImageBitmap;
  damage: number;
  cooldown: number;
  radius: number;
  visualDuration: number;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

export enum EnemyType {
  HOMEWORK = 'homework',
  CLOWN = 'clown',
  EYEBUG = '4eyebug',
  DEMONDOOR = 'demondoor',
}

export interface Size {
  width: number;
  height: number;
}