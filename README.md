# Collision Synth

Use this library to procedurally generate and use sounds for the collision of your game objects in tandem w/ the physics, audio and render engine of your choice.

npm: [https://www.npmjs.com/package/collision-synth](https://www.npmjs.com/package/collision-synth)
playground: [https://csynth.heaust.org/](https://csynth.heaust.org/)

you can play around the simple UI in the playground or access the `window.synth` variable exposed in the dev console to fully test the capabilities of this library.

## How to use

### API

there are 3 APIs of note,

```javascript
import { getWAVBlob } from "collision-synth";

const options = {
  frequency: "e4",  // name of a note, or a numerical frequency in Hz
  metalness: 0.2,  // metalness from 0 to 1, though you can overload
  loudness: 0.5,  // how loud the sound is
};

const blob = getWAVBlob(options);
// use this blob however
```

You can pass in some basic options and call `getWAVBlob` to get the blob of the .wav file generated.

```javascript
import { getWAVURL, playURL } from "collision-synth";

const options = {
  frequency: "e4",  // name of a note, or a numerical frequency in Hz
  metalness: 0.2,  // metalness from 0 to 1, though you can overload
  loudness: 0.5,  // how loud the sound is
};

const blobUrl = getWAVURL(options);
playUrl(blobUrl, true);
```

Chances are though, that your audio engine uses URLs and not blobs, you can call `getWAVURL` of the .wav sound file.

You can then play the url using `playUrl`, the 2nd argument `true` makes it dispose the URL immediately after.

```javascript
URL.revokeObjectURL(blobUrl);
```

You have to be careful to manage your blobUrls, since these are saved in the browser, recklessly making new ones will cause memory issues. Instead you can dispose a blobUrl like above.

it's better to cache the sound of a material so you don't have to re-gen it, since generation is an expensive process.

### Options

In the examples above we saw 3 basic options, but there are more that you can configure to customize the sound to your bespoke needs.

#### falloff

This controls how the sound dies.

```typescript
type AmplitudeFactor = number;


const falloff: (amplitude: number, time: number, metalness: number) => AmplitudeFactor = (_, time, metalness) => Math.pow(Math.E, -time / (80 + metalness * 5000)); // default
```

This function determines how metalness changes the sound. The default relies on the fact that metals are sonorous and non-metals are not.

Making the falloff exponentially die w/ metals taking time and non-metals dying quicker, we make our default falloff loosely mimic reality.

You can also choose from presets by passing in strings.

#### seconds

This controls how long the sound in the wav file is. Default is `1`.

#### timbre

If you sing do-re-mi, play it on a guitar, or a piano, even though you're hitting the same notes, it will all sound different. Why?

The answer is harmonics, whenever an object in real world sings a note, it also makes sounds in harmonics of that note (1 octave higher, 2 octaves higher and so on).

The ratio of how much varies from object to object, and person to person. That's why everything can play the same notes but still sound different.

```typescript
const timbre = (harmonic: number) => 1 / Math.pow(2, harmonic);
```

You can define timbre as this Harmonic-Amplitude function.

You can also choose from presets by passing in strings.

#### distortion

Sounds in real world are rarely pure, they are often distorted by the environment. You can control this distortion.

```typescript
type Distortion = {
    frequency: {
      sum: (time: number, freq: number, period: number) => number;
      factor: (time: number, freq: number, period: number) => number;
    };
    amplitude: {
      sum: (time: number, period: number) => number;
      factor: (time: number, period: number) => number;
    };
};

const distortion: Distortion = {
    frequency: {
      sum: () => 1,
      factor: () => 1,
    },
    amplitude: {
      sum: () => Math.random() * 10 - 5,
      factor: (time: number, period: number) =>
        0.5 + (0.5 + 100 * Math.sin((2 * Math.PI * time) / period)) * 0.25,
    },
}
```

you can control how the frequency and amplitude is distorted by the environment.

### Defaults

You're free to skip any or pass no options at all. The defaults are sensibly configured.

```javascript
const defaultOptions = {
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
}
```

Have fun :)
