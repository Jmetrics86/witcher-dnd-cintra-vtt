// Procedural Audio Synthesizer using Web Audio API
// Generates immersive fantasy SFX without requiring external audio assets.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playDiceRollSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const delay = i * 0.05;
      const freq = 120 + Math.random() * 200;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.08);

      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    }
  } catch (e) {
    console.debug('Audio not allowed yet:', e);
  }
};

// Ability & combat SFX temporarily disabled per user request — will revisit later.
export const playSwordClash = () => {
  // Disabled
};

export const playSignSound = (_sign: 'Aard' | 'Igni' | 'Quen' | 'Yrden' | 'Axii') => {
  // Disabled
};

export const playCriticalHitSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major triumph
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + 0.75);
    });
  } catch (e) {
    console.debug('Crit audio error:', e);
  }
};

// Consumable SFX temporarily disabled per user request — will revisit later.
export const playPotionDrink = () => {
  // Disabled
};
