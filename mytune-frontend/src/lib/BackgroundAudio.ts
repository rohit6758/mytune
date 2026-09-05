import { registerPlugin } from '@capacitor/core';

export interface BackgroundAudioPlugin {
  play(options: { url: string; title: string; artist: string }): Promise<void>;
  stop(): Promise<void>;
}

export const BackgroundAudio = registerPlugin<BackgroundAudioPlugin>('BackgroundAudio');
