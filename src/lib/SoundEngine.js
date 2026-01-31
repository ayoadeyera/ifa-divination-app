/**
 * SOUND ENGINE
 * Manages audio context, preloading, and playback.
 * vital for ensuring sounds play instantly on mobile without lag.
 */
export class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.isUnlocked = false;
        
        // Define our sound assets based on your sitemap
        this.assets = {
            clatters: [
                './assets/audio/sfx/drop_clatter_1.mp3',
                './assets/audio/sfx/drop_clatter_2.mp3',
                './assets/audio/sfx/drop_clatter_3.mp3'
            ],
            // We can add a subtle UI click later if needed
        };

        this.buffers = {};
    }

    /**
     * Initialize AudioContext (Must be called on user interaction!)
     */
    async init() {
        if (this.isUnlocked) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        // Resume context if suspended (common browser policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Play silent buffer to unlock iOS audio engine
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);

        this.isUnlocked = true;
        console.log("🔊 Audio Engine: Unlocked & Ready");
        
        // Start preloading actual sounds now that we have permission
        this.preloadSounds();
    }

    /**
     * Preload all SFX files into memory buffers
     */
    async preloadSounds() {
        // Load Clatters
        this.assets.clatters.forEach((url, index) => {
            this.loadBuffer(url, `clatter_${index}`);
        });
    }

    async loadBuffer(url, key) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers[key] = audioBuffer;
        } catch (error) {
            console.warn(`Audio file missing or failed to load: ${url}`);
        }
    }

    /**
     * Play a randomized chain drop sound
     */
    playDrop() {
        if (!this.audioContext) return;

        // Pick a random variation (0, 1, or 2)
        const randomIndex = Math.floor(Math.random() * this.assets.clatters.length);
        const key = `clatter_${randomIndex}`;

        this.playSound(key);
    }

    playSound(key) {
        if (!this.buffers[key]) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers[key];
        
        // Add a GainNode for volume control if needed
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.8; // 80% volume
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
    }
}