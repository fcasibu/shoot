export type Color = string;

export interface Camera {
  target: Vec2;
  offset: Vec2;
  rotation: number;
  zoom: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rectangle {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
}

export interface Circle {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  color: Color;
}

export type Shape = Rectangle | Circle;
