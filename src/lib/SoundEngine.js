/**
 * SOUND ENGINE (Synthesizer Version)
 * Generates procedural audio to mimic physical seeds on wood.
 * No external MP3 files required.
 */
export class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.isUnlocked = false;
    }

    /**
     * Initialize AudioContext
     * Must be triggered by a user gesture.
     */
    async init() {
        if (this.isUnlocked) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isUnlocked = true;
            console.log("🔊 Synthesizer Engine: Unlocked");
        } catch (e) {
            console.error("Audio init failed", e);
        }
    }

    /**
     * Synthesizes a "Drop" sound.
     * Combines Noise (impact) and Sine (resonance).
     */
    playDrop() {
        if (!this.isUnlocked || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // We simulate 3-4 distinct "seed impacts" in rapid succession 
        // to mimic a chain hitting the board.
        for (let i = 0; i < 4; i++) {
            const delay = i * (0.02 + Math.random() * 0.05);
            this.createSeedImpact(now + delay);
        }
    }

    /**
     * Creates a single seed impact sound using White Noise and a Sine wave.
     */
    createSeedImpact(time) {
        // 1. Noise Component (The "Scrape/Thud" of the shell)
        const noiseBuffer = this.createNoiseBuffer();
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800 + Math.random() * 400, time);

        const noiseEnvelope = this.audioContext.createGain();
        noiseEnvelope.gain.setValueAtTime(0, time);
        noiseEnvelope.gain.linearRampToValueAtTime(0.2, time + 0.01);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.audioContext.destination);

        // 2. Tonal Component (The "Clink" of the hard seed)
        const osc = this.audioContext.createOscillator();
        const oscEnvelope = this.audioContext.createGain();
        
        osc.type = 'sine';
        // Randomized frequency to sound like different sized seeds
        osc.frequency.setValueAtTime(150 + Math.random() * 100, time);
        
        oscEnvelope.gain.setValueAtTime(0, time);
        oscEnvelope.gain.linearRampToValueAtTime(0.3, time + 0.005);
        oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.connect(oscEnvelope);
        oscEnvelope.connect(this.audioContext.destination);

        noiseSource.start(time);
        noiseSource.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    /**
     * Synthesizes a "Paper Slide" sound for the parchment.
     */
    playTransition() {
        if (!this.isUnlocked) return;
        
        const now = this.audioContext.currentTime;
        const duration = 0.6;

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = this.createNoiseBuffer();

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + duration);

        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.05, now + 0.1);
        envelope.gain.linearRampToValueAtTime(0, now + duration);

        noiseSource.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.audioContext.destination);

        noiseSource.start(now);
        noiseSource.stop(now + duration);
    }

    /**
     * Helper to create 1 second of white noise
     */
    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }
}