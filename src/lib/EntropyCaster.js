export class IfaEntropyCaster {
  constructor() {
    this.entropyPool = []; // We collect raw sensor data here
    this.isListening = false;
    this.thresholds = {
      shake: 15,    // m/s² needed to register a shake
      freefall: 2,  // m/s² (near 0 means falling)
      impact: 20    // m/s² (sharp spike means landing)
    };
    this.state = 'idle'; // idle, shaking, falling, landed
  }

  // 1. Start listening to the hardware sensors
  startSession() {
    return new Promise((resolve, reject) => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+ requires permission trigger
        DeviceMotionEvent.requestPermission()
          .then(response => {
            if (response == 'granted') {
              this.addListeners();
              resolve("Permission Granted");
            } else {
              reject("Permission Denied");
            }
          })
          .catch(console.error);
      } else {
        // Android/Standard usually just works
        this.addListeners();
        resolve("Sensors Active");
      }
    });
  }

  addListeners() {
    this.isListening = true;
    this.entropyPool = []; // Clear previous energy
    this.boundHandleMotion = this.handleMotion.bind(this); // Bind context for removal later
    window.addEventListener('devicemotion', this.boundHandleMotion);
    console.log("Ifa Caster: Listening to the spirit realm (Sensors)...");
  }

  // 2. The Core "Chaos" Collector
  handleMotion(event) {
    if (!this.isListening) return;

    // Get raw acceleration (including gravity for drop detection)
    const acc = event.accelerationIncludingGravity;
    
    // Get acceleration without gravity (better for shake detection)
    const userAcc = event.acceleration;

    if (!acc || !userAcc) return; // Safety check for some devices

    // Calculate total force vector (magnitude)
    const totalForce = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    
    // COLLECT ENTROPY: 
    // We push the raw decimal values into our pool. 
    this.entropyPool.push(totalForce * (event.interval || 1));

    // --- MODE A: SHAKE DETECTION ---
    const userForce = Math.sqrt(userAcc.x**2 + userAcc.y**2 + userAcc.z**2);
    if (userForce > this.thresholds.shake) {
      this.state = 'shaking';
    }

    // --- MODE B: DROP (Freefall -> Impact) ---
    // Step 1: Detect Freefall (Force drops near 0)
    if (totalForce < this.thresholds.freefall) {
      this.state = 'falling';
    }
    
    // Step 2: Detect Impact (Force spikes after falling)
    if (this.state === 'falling' && totalForce > this.thresholds.impact) {
      this.state = 'landed';
      // Dispatch an event so the UI knows to trigger the cast immediately
      window.dispatchEvent(new CustomEvent('opele-impact'));
    }
  }

  // 3. Stop and Calculate
  stopAndCast() {
    this.isListening = false;
    window.removeEventListener('devicemotion', this.boundHandleMotion);

    // THE ALGORITHM:
    // If pool is empty (e.g. testing on laptop), fallback to Math.random
    if (this.entropyPool.length === 0) {
      console.warn("No sensor data detected. Using fallback randomness.");
      return Math.floor(Math.random() * 256);
    }

    let chaosSum = 0;
    // Sum every micro-movement recorded in the pool
    for (let i = 0; i < this.entropyPool.length; i++) {
      chaosSum += this.entropyPool[i] * (i + 1); 
    }

    // Use the decimal distinctiveness to create an integer
    const cleanInteger = Math.floor(chaosSum * 100000);
    
    // Map to 256 Odu (0 - 255)
    const oduIndex = cleanInteger % 256;

    console.log(`Entropy Pool Size: ${this.entropyPool.length} samples`);
    console.log(`Resulting Odu Index: ${oduIndex}`);

    return oduIndex;
  }
}