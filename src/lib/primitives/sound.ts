import { Howl } from 'howler';
import { assert } from '../../utils';

export class SoundManager<Name extends string> {
  private entries = new Map<Name, Howl | (() => Howl)>();

  constructor(
    public readonly config: Record<Name, { src: string; lazy: boolean }>,
  ) {
    Howler.volume(0.5);

    for (const [name, { src, lazy }] of Object.entries(config) as [
      Name,
      { src: string; lazy: boolean },
    ][]) {
      this.entries.set(
        name,
        lazy ? () => new Howl({ src: [src] }) : new Howl({ src: [src] }),
      );
    }
  }

  public play(name: Name) {
    this.getAudio(name)?.play();
  }

  public pause(name: Name) {
    this.getAudio(name)?.pause();
  }

  public stop(name: Name) {
    this.getAudio(name)?.stop();
  }

  public setVolume(name: Name, volume: number) {
    assert(
      volume >= 0 && volume <= 1,
      'Volume must be within the range of 0-1',
    );
    this.getAudio(name)?.volume(volume);
  }

  public setLoop(name: Name, loop: boolean) {
    this.getAudio(name)?.loop(loop);
  }

  public setGlobalVolume(volume: number) {
    assert(
      volume >= 0 && volume <= 1,
      'Volume must be within the range of 0-1',
    );
    Howler.volume(volume);
  }

  private getAudio(name: Name): Howl | undefined {
    const entry = this.entries.get(name);
    if (!entry) return undefined;

    if (entry instanceof Howl) return entry;

    const resolved = entry();
    this.entries.set(name, resolved);
    return resolved;
  }
}
