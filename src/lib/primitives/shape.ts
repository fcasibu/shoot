import type { Circle, Color, Rectangle } from '../types';

export function createCircle(
  x: number,
  y: number,
  radius: number,
  color: Color,
): Circle {
  return {
    type: 'circle',
    x,
    y,
    radius,
    color,
  };
}

export function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color,
): Rectangle {
  return {
    type: 'rectangle',
    x,
    y,
    width,
    height,
    color,
  };
}
