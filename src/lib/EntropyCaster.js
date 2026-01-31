/**
 * ENTROPY CASTER
 * Generates a "True Random" seed (0-255) based on user movement (Entropy).
 * Includes a fallback for devices without sensors (Desktop/Laptop).
 */
export class IfaEntropyCaster {
    constructor() {
        this.entropyAccumulator = 0;
        this.motionListener = this.handleMotion.bind(this);
        this.isCollecting = false;
        this.hasSensorData = false; // Track if we are actually getting readings
    }

    /**
     * Starts listening to the device accelerometer.
     */
    startSession() {
        if (this.isCollecting) return;
        
        this.entropyAccumulator = 0; // Reset for new cast
        this.hasSensorData = false;
        this.isCollecting = true;

        // Request permission for iOS 13+ devices
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('devicemotion', this.motionListener);
                    } else {
                        console.warn("Sensor permission denied. Using fallback RNG.");
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS 13+ devices
            window.addEventListener('devicemotion', this.motionListener);
        }
    }

    /**
     * Captures motion data to build entropy.
     */
    handleMotion(event) {
        if (!this.isCollecting) return;

        // Get acceleration data (x, y, z)
        const x = event.accelerationIncludingGravity.x || 0;
        const y = event.accelerationIncludingGravity.y || 0;
        const z = event.accelerationIncludingGravity.z || 0;

        // Calculate magnitude of movement
        const magnitude = Math.abs(x + y + z);

        // Only accumulate if there is significant movement (filtering out sensor noise)
        if (magnitude > 1) {
            this.hasSensorData = true;
            // Add to accumulator (simple hashing simulation)
            this.entropyAccumulator += magnitude * (Math.random() * 10); 
        }
    }

    /**
     * Stops collection and returns the final Seed (0-255).
     */
    stopAndCast() {
        this.isCollecting = false;
        window.removeEventListener('devicemotion', this.motionListener);

        let finalSeed;

        if (this.hasSensorData && this.entropyAccumulator > 50) {
            // SCENARIO A: Physical Device with Movement
            // Modulo 256 ensures result is between 0-255 (The 8-bit Ifa Signature)
            console.log("🔮 Casting Source: Physical Entropy");
            finalSeed = Math.floor(this.entropyAccumulator) % 256;
        } else {
            // SCENARIO B: Desktop / No Movement
            // Fallback to standard RNG so the app is testable on laptops
            console.log("💻 Casting Source: Simulated (Fallback)");
            finalSeed = Math.floor(Math.random() * 256);
        }

        return finalSeed;
    }
}