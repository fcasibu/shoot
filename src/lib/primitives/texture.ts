export class TextureManager<Name extends string> {
  private entries = new Map<Name, ImageBitmap | (() => Promise<ImageBitmap>)>();

  constructor(
    public readonly config: Record<Name, { src: string; lazy: boolean }>,
  ) {}

  public async loadAll() {
    const promises = Object.entries<{ src: string; lazy: boolean }>(
      this.config,
    ).map(async ([name, { src, lazy }]) => {
      const n = name as Name;
      if (!lazy) {
        const bitmap = await this.loadBitmap(src);
        this.entries.set(n, bitmap);
      } else {
        this.entries.set(n, () => this.loadBitmap(src));
      }
    });
    await Promise.all(promises);
  }

  public async get(name: Name): Promise<ImageBitmap> {
    const entry = this.entries.get(name);
    if (!entry) {
      throw new Error(`Failed to load image with name: ${name}`);
    }

    if (entry instanceof ImageBitmap) return entry;

    const resolved = await entry();
    this.entries.set(name, resolved);
    return resolved;
  }

  private async loadBitmap(src: string): Promise<ImageBitmap> {
    const img = new Image();
    img.src = src;
    await img.decode();
    return await createImageBitmap(img);
  }
}
