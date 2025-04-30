interface TextureConfiigEntry {
  src: string;
  lazy: boolean;
}

export class TextureManager {
  private entries = new Map<
    string,
    ImageBitmap | (() => Promise<ImageBitmap>)
  >();

  constructor(public readonly config: Record<string, TextureConfiigEntry>) {}

  public async loadAll() {
    const promises = Object.entries<TextureConfiigEntry>(this.config).map(
      async ([name, { src, lazy }]) => {
        const n = name;
        if (!lazy) {
          const bitmap = await this.loadBitmap(src);
          this.entries.set(n, bitmap);
        } else {
          this.entries.set(n, () => this.loadBitmap(src));
        }
      },
    );
    await Promise.all(promises);
  }

  public unloadAll() {
    for (const [, value] of this.entries) {
      if (value instanceof ImageBitmap) {
        value.close();
      }
    }

    this.entries.clear();
  }

  public async get(name: string): Promise<ImageBitmap> {
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
