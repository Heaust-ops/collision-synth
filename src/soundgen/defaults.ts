import { SoundOptions } from "./interfaces";

export const defaultOptions = {
  frequency: "e4",
  loudness: 0.5,
  metalness: 0.5,
  seconds: 1,
  falloff: "exp",
  timbre: "zeno",
  distortion: {
    frequency: {
      sum: () => 1,
      factor: () => 1,
    },
    amplitude: {
      sum: () => Math.random() * 10 - 5,
      factor: (time: number, period: number) =>
        0.5 + (0.5 + 100 * Math.sin((2 * Math.PI * time) / period)) * 0.25,
    },
  },
} as SoundOptions;

export type TimbreOptions = Record<"zeno", (harmonic: number) => number>;
export const timbreOptions = {
  zeno: (harmonic) => 1 / Math.pow(2, harmonic),
} as TimbreOptions;

export type FalloffOptions = Record<
  "exp",
  (amplitude: number, time: number, metalness: number) => number
>;
export const falloffOptions = {
  exp: (_, time, metalness) =>
    Math.pow(Math.E, -time / (80 + metalness * 5000)),
} as FalloffOptions;

export const baseFrequencies = {
  c: 16.35,
  "c#": 17.32,
  d: 18.35,
  "d#": 19.45,
  e: 20.6,
  f: 21.83,
  "f#": 23.12,
  g: 24.5,
  "g#": 25.96,
  a: 27.5,
  "a#": 29.14,
  b: 30.87,
} as Record<string, number>;
