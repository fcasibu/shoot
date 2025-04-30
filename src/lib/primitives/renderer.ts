import type { Circle, Color, Shape, Rectangle, Vec2 } from '../types';

export class Renderer {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  public clearBackground(color: Color) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public drawShape(shape: Shape) {
    const type = shape.type;
    switch (type) {
      case 'rectangle': {
        this.drawRectangle(shape);
        break;
      }
      case 'circle': {
        this.drawCircle(shape);
        break;
      }
      default: {
        const exhaustive: never = type;
        throw new Error(`Unknown shape type: ${exhaustive}`);
      }
    }
  }

  public drawTexture(texture: ImageBitmap, x: number, y: number, tint?: Color) {
    this.ctx.drawImage(texture, x, y);

    if (tint) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'source-atop';
      this.ctx.fillStyle = tint;
      this.ctx.fillRect(x, y, texture.width, texture.height);
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.restore();
    }
  }

  public drawTextureRegion(
    texture: ImageBitmap,
    source: Rectangle,
    position: Vec2,
    flipX: boolean,
    scale = 1,
    color?: Color,
    blendMode: GlobalCompositeOperation = 'source-over',
  ) {
    this.ctx.save();

    this.ctx.translate(position.x, position.y);

    if (flipX) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-source.width * scale, 0);
    }

    if (color && blendMode !== 'source-over') {
      const buffer = document.createElement('canvas');
      buffer.width = source.width * scale;
      buffer.height = source.height * scale;
      const btx = buffer.getContext('2d')!;

      btx.drawImage(
        texture,
        source.x,
        source.y,
        source.width,
        source.height,
        0,
        0,
        source.width * scale,
        source.height * scale,
      );

      btx.fillStyle = color;
      btx.globalCompositeOperation = blendMode;
      btx.fillRect(0, 0, buffer.width, buffer.height);

      btx.globalCompositeOperation = 'destination-in';

      btx.drawImage(
        texture,
        source.x,
        source.y,
        source.width,
        source.height,
        0,
        0,
        source.width * scale,
        source.height * scale,
      );

      this.ctx.drawImage(buffer, 0, 0);
    } else {
      this.ctx.drawImage(
        texture,
        source.x,
        source.y,
        source.width,
        source.height,
        0,
        0,
        source.width * scale,
        source.height * scale,
      );
    }

    this.ctx.restore();
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    color: Color,
    fontSize: number,
    fontFamily = 'system-ui',
  ) {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    const { actualBoundingBoxAscent } = this.ctx.measureText(text);
    this.ctx.fillText(text, x, y + actualBoundingBoxAscent);
  }

  public measureText(
    text: string,
    fontSize: number,
    fontFamily = 'system-ui',
  ): TextMetrics {
    const currentFont = this.ctx.font;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
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
