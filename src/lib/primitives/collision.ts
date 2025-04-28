import type { Vec2, Rectangle, Circle } from '../types';

export function rectsOverlap(a: Rectangle, b: Rectangle) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function pointInRect(p: Vec2, r: Rectangle) {
  return (
    p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
  );
}

export function circlesOverlap(a: Circle, b: Circle) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const radii = a.radius + b.radius;
  return distSq <= radii * radii;
}

export function pointInCircle(p: Vec2, c: Circle) {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const distSq = dx * dx + dy * dy;
  return distSq <= c.radius * c.radius;
}

export function circleRectOverlap(circle: Circle, rect: Rectangle) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distSq = dx * dx + dy * dy;
  return distSq <= circle.radius * circle.radius;
}
