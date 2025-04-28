import type { Circle, Color, Shape, Rectangle } from '../types';

export class Renderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly width: number,
    private readonly height: number,
  ) {}

  public clearBackground(color: Color) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  public drawShape(shape: Shape) {
    switch (shape.type) {
      case 'rectangle':
        this.drawRectangle(shape);
        break;
      case 'circle':
        this.drawCircle(shape);
        break;
      default:
        console.error('Unknown shape type:', shape);
        break;
    }
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
  ) {
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = color;
    const { actualBoundingBoxAscent } = this.ctx.measureText(text);
    this.ctx.fillText(text, x, y + actualBoundingBoxAscent);
  }

  public measureText(text: string, fontSize: number): TextMetrics {
    const currentFont = this.ctx.font;
    this.ctx.font = `${fontSize}px Arial`;
    const metrics = this.ctx.measureText(text);
    this.ctx.font = currentFont;
    return metrics;
  }

  private drawRectangle(rect: Rectangle) {
    const { x, y, width, height, color } = rect;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  private drawCircle(circle: Circle) {
    const { x, y, radius, color } = circle;

    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}
