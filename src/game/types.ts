import type { Vec2 } from '../lib/types';

export interface Component {
  update(dt: number): void;
}

export interface Renderable {
  draw(position?: Vec2, direction?: number): void;
}
