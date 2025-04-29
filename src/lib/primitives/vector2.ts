import type { Vec2 } from '../types';

export function vector2Add(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function vector2Sub(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function vector2Scale(vec: Vec2, scalar: number): Vec2 {
  return {
    x: vec.x * scalar,
    y: vec.y * scalar,
  };
}

export function vector2Length(vec: Vec2): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

export function vector2Normalize(vec: Vec2): Vec2 {
  const len = vector2Length(vec);

  return len > 0 ? { x: vec.x / len, y: vec.y / len } : { x: 0, y: 0 };
}
