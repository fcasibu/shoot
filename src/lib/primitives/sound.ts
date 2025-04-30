import { Howl } from 'howler';
import { assert } from '../../utils';

interface SoundConfigEntry {
  src: string;
  lazy: boolean;
}

export class SoundManager {
  private entries = new Map<string, Howl | (() => Howl)>();

  constructor(public readonly config: Record<string, SoundConfigEntry>) {
    Howler.volume(0.5);

    for (const [name, { src, lazy }] of Object.entries(config)) {
      this.entries.set(
        name,
        lazy ? () => new Howl({ src: [src] }) : new Howl({ src: [src] }),
      );
    }
  }

  public play(name: string) {
    this.getAudio(name).play();
  }

  public pause(name: string) {
    this.getAudio(name).pause();
  }

  public stop(name: string) {
    this.getAudio(name).stop();
  }

  public setVolume(name: string, volume: number) {
    assert(
      volume >= 0 && volume <= 1,
      'Volume must be within the range of 0-1',
    );
    this.getAudio(name).volume(volume);
  }

  public setLoop(name: string, loop: boolean) {
    this.getAudio(name).loop(loop);
  }

  public setGlobalVolume(volume: number) {
    assert(
      volume >= 0 && volume <= 1,
      'Volume must be within the range of 0-1',
    );
    Howler.volume(volume);
  }

  public unloadAll() {
    for (const [, value] of this.entries) {
      if (value instanceof Howl) {
        value.unload();
      }
    }

    this.entries.clear();
  }

  private getAudio(name: string): Howl {
    const entry = this.entries.get(name);
    if (!entry) {
      throw new Error(`Failed to load audio with name: ${name}`);
    }
    if (entry instanceof Howl) return entry;

    const resolved = entry();
    this.entries.set(name, resolved);
    return resolved;
  }
}
