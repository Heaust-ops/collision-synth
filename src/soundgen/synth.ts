import {
  Struct,
  I16s,
  RawString,
  SizeOf32,
  U32,
  U16,
  Endian,
} from "construct-js";
import {
  defaultOptions,
  timbreOptions,
  TimbreOptions,
  falloffOptions,
  FalloffOptions,
  baseFrequencies,
} from "./defaults";
import { SoundOptions } from "./interfaces";

const sampleRate = 44100;

const getFrequency = (note: string | number): number => {
  if (typeof note === "number") return note;
  if (note.length === 1) return getFrequency(`${note}4`);
  if (note.length > 3) {
    console.error("Bad Note");
    return 440;
  }
  if (note.length === 3 && note[1] !== "#") {
    console.error("Bad Note");
    return 440;
  }
  const base =
    baseFrequencies[`${note[0].toLowerCase()}${note.length === 3 ? "#" : ""}`];
  const exp = ~~(note.length === 3 ? note[2] : note[1]);

  return base * Math.pow(2, exp);
};

const secondsToSamples = (seconds: number) => seconds * sampleRate;
const soundGenerator = (soundOptions: Partial<SoundOptions>) => {
  const { loudness, seconds, distortion, ...options } = {
    ...defaultOptions,
    ...soundOptions,
  };

  const freq = getFrequency(options.frequency);
  const samples = secondsToSamples(seconds);
  const period = Math.round(sampleRate / freq / 2);

  const calculateSound = (i: number) => {
    /** Sine with specified time period */
    const sin = (T: number) => 100 * Math.sin((2 * Math.PI * i) / T);

    /** Making Timbre Function */
    const timbre =
      typeof options.timbre === "string"
        ? timbreOptions[options.timbre as keyof TimbreOptions]
        : options.timbre;

    /** Making Falloff Function */
    const falloff =
      typeof options.falloff === "string"
        ? falloffOptions[options.falloff as keyof FalloffOptions]
        : options.falloff;

    /** distorting period */
    const distortedPeriod =
      distortion.frequency.factor(i, freq, period) * period +
      distortion.frequency.sum(i, freq, period);

    /** Generating Wave Position */
    const amp = Array.from({ length: 10 }, (_, j) => timbre(j));
    let y = amp
      .map((A, I) => A * sin((I + 1) * distortedPeriod))
      .reduce((a, b) => a + b);

    /** Distorting Wave */
    y *= distortion.amplitude.factor(i, period);
    y += distortion.amplitude.sum(i, period);

    /** Applying Loudness */
    y *= loudness * 10;

    /** Damping Wave */
    y *= falloff(y, i, options.metalness);
    return Math.round(y);
  };

  const baseSound = Array.from({ length: Math.round(samples) }, (_, i) => {
    return calculateSound(i);
  });

  return baseSound;
};

const getWave = (soundDataArray: number[]) => {
  const soundData = I16s(soundDataArray);

  const wave = Struct("wave");

  const header = Struct("header")
    .field("magic", RawString("RIFF"))
    .field("chunkSize", SizeOf32(wave))
    .field("format", U32(0x57415645, Endian.Big));

  const formatSection = Struct("formatSection")
    .field("subChunk1ID", RawString("fmt "))
    .field("subChunk1Size", U32(16))
    .field("audioFormat", U16(1))
    .field("numChannels", U16(1))
    .field("sampleRate", U32(sampleRate))
    .field("byteRate", U32(sampleRate * 2))
    .field("blockAlign", U16(2))
    .field("bitsPerSample", U16(16));

  const dataSection = Struct("dataSection")
    .field("subChunk2ID", RawString("data"))
    .field("subChunk2Size", SizeOf32(soundData))
    .field("soundData", soundData);

  wave
    .field("header", header)
    .field("formatSection", formatSection)
    .field("dataSection", dataSection);

  return wave;
};

export const getWAVBlob = (soundOptions: Partial<SoundOptions> = {}) => {
  const sound = soundGenerator(soundOptions);
  const waveBuffer = getWave(sound).toUint8Array();

  const name = `collisionsynth_${
    soundOptions.frequency ?? "e4"
  }_metal${Math.floor((soundOptions.metalness ?? 0.5) * 100)}_loud${Math.floor(
    (soundOptions.loudness ?? 0.5) * 100,
  )}.wav`;

  return new File([waveBuffer], name, {
    lastModified: new Date().getTime(),
    type: "audio/wav",
  });
};

export const getWAVURL = (soundOptions: Partial<SoundOptions> = {}) => {
  const blob = getWAVBlob(soundOptions);
  return URL.createObjectURL(blob);
};

let revocationUrl = "";

export const playURL = (url: string, revokeAfterPlaying = false) => {
  const a = new Audio(url);
  a.play();
  a.currentTime = 0;
  a.onended = () => {
    if (revocationUrl && revokeAfterPlaying) URL.revokeObjectURL(revocationUrl);
    revocationUrl = url;
  };
};
