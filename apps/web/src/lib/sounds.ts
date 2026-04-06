"use client";

type SoundName =
  | "click"
  | "hover"
  | "success"
  | "fail"
  | "tick"
  | "reveal"
  | "transition"
  | "submit";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("cc-muted") === "true";
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  detune = 0
) {
  if (isMuted()) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.05) {
  if (isMuted()) return;
  const ctx = getContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(ctx.currentTime);
}

const sounds: Record<SoundName, () => void> = {
  click: () => {
    playTone(800, 0.08, "sine", 0.12);
    playNoise(0.03, 0.03);
  },

  hover: () => {
    playTone(600, 0.05, "sine", 0.06);
  },

  success: () => {
    // Ascending arpeggio
    playTone(523, 0.15, "sine", 0.12); // C5
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 80); // E5
    setTimeout(() => playTone(784, 0.25, "sine", 0.15), 160); // G5
    setTimeout(() => playTone(1047, 0.35, "sine", 0.1), 260); // C6
  },

  fail: () => {
    // Descending minor
    playTone(440, 0.2, "sine", 0.12); // A4
    setTimeout(() => playTone(370, 0.25, "sine", 0.12), 120); // F#4
    setTimeout(() => playTone(330, 0.4, "sine", 0.1), 240); // E4
  },

  tick: () => {
    playTone(1200, 0.03, "sine", 0.08);
  },

  reveal: () => {
    // Sweeping reveal
    const ctx = getContext();
    if (isMuted()) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  },

  transition: () => {
    playTone(440, 0.12, "sine", 0.06);
    playNoise(0.06, 0.02);
  },

  submit: () => {
    playTone(660, 0.1, "sine", 0.1);
    setTimeout(() => playTone(880, 0.15, "sine", 0.12), 60);
  },
};

export function playSound(name: SoundName) {
  try {
    sounds[name]();
  } catch {
    // Ignore audio errors
  }
}
