export type AmplitudeFactor = number;
export interface SoundOptions {
  frequency: string | number;
  loudness: number;
  seconds: number;
  metalness: number;
  falloff:
    | ((amplitude: number, time: number, metalness: number) => AmplitudeFactor)
    | "exp";
  timbre: ((harmonic: number) => AmplitudeFactor) | "zeno";
  distortion: {
    frequency: {
      sum: (time: number, freq: number, period: number) => number;
      factor: (time: number, freq: number, period: number) => number;
    };
    amplitude: {
      sum: (time: number, period: number) => number;
      factor: (time: number, period: number) => number;
    };
  };
}
