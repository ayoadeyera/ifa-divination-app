import { IfaEntropyCaster } from './lib/EntropyCaster.js';
import { IfaOduMapper } from './lib/OduMapper.js';

/**
 * IFA DIVINATION APP - MAIN CONTROLLER
 * Connects UI, Logic, and Data.
 */

// 1. Initialize Logic Classes
const caster = new IfaEntropyCaster();
const mapper = new IfaOduMapper();

// 2. DOM Elements Selection
const ui = {
    container: document.getElementById('app-container'),
    opon: document.getElementById('opon'),
    chainLegs: document.querySelector('.chain-legs'),
    instruction: document.getElementById('instruction-text'),
    oduTitle: document.getElementById('odu-name'),
    verseContainer: document.getElementById('verse-content'),
    shrineHeader: document.querySelector('.shrine-header') // For reset click
};

// State Variable
let isCasting = false;

// 3. Event Listeners
ui.opon.addEventListener('click', handleInteraction);
ui.shrineHeader.addEventListener('click', handleReset);
window.addEventListener('opele-impact', handleAutoCast); // Listens for the "Drop" event

/**
 * MAIN INTERACTION HANDLER
 * Handles the flow: Idle -> Request Sensors -> Shaking -> Result
 */
async function handleInteraction() {
    // If we are already in reading mode, ignore clicks on the Opon
    if (ui.container.classList.contains('state-reading')) return;

    if (!isCasting) {
        // STEP A: START CASTING
        try {
            ui.instruction.innerText = "Initializing Sensors...";
            
            // This triggers the permission popup on iOS
            await caster.startSession();
            
            isCasting = true;
            ui.instruction.innerText = "SHAKE DEVICE OR DROP ON PAD";
            ui.instruction.style.color = "#ffdd9e"; // Make it glow/bright
            
            // Add a visual 'shaking' effect to the UI (CSS animation could go here)
            ui.opon.style.transform = "scale(1.05)";

        } catch (error) {
            console.error("Sensor Error:", error);
            ui.instruction.innerText = "Sensors blocked. Tap again to force cast.";
            // Fallback: If sensors fail, clicking again runs a simulation
            isCasting = true; 
        }
    } else {
        // STEP B: MANUAL STOP (User tapped again instead of waiting/dropping)
        revealOdu("Manual Stop");
    }
}

/**
 * AUTO CAST HANDLER
 * Triggered when EntropyCaster detects a physical drop impact
 */
function handleAutoCast() {
    if (isCasting) {
        revealOdu("Drop Impact Detected");
    }
}

/**
 * REVEAL LOGIC
 * Calculates result, fetches data, and updates UI
 */
async function revealOdu(method) {
    console.log(`Casting via: ${method}`);
    
    // 1. Get the Seed (The Random Number)
    const seed = caster.stopAndCast(); // Returns 0-255
    isCasting = false;

    // 2. Identify the Odu
    const profile = mapper.getOduProfile(seed);
    console.log("Odu Profile:", profile);

    // 3. Render the Chain Visuals (Open/Closed Seeds)
    renderChainVisuals(profile.visuals);

    // 4. Update Text & Transition
    ui.oduTitle.innerText = profile.name;
    ui.instruction.innerText = "";
    ui.instruction.style.opacity = "0";
    
    // 5. Fetch Content from Database
    await loadVerseContent(profile.index);

    // 6. Trigger Animation State (Slide up parchment)
    setTimeout(() => {
        ui.container.classList.add('state-reading');
        ui.opon.style.transform = ""; // Reset scale
    }, 600); // Slight delay for dramatic effect
}

/**
 * VISUAL RENDERER
 * Dynamically builds the HTML for the Opele seeds
 */
function renderChainVisuals(visuals) {
    // Visuals structure: { right: ['open', 'closed'...], left: [...] }
    
    const rightLegHTML = visuals.right.map(state => 
        `<div class="seed" data-state="${state}"></div>`
    ).join('');

    const leftLegHTML = visuals.left.map(state => 
        `<div class="seed" data-state="${state}"></div>`
    ).join('');

    ui.chainLegs.innerHTML = `
        <div class="leg right-leg">${rightLegHTML}</div>
        <div class="leg left-leg">${leftLegHTML}</div>
    `;
}

/**
 * CONTENT FETCHER
 * Loads JSON data
 */
async function loadVerseContent(oduIndex) {
    ui.verseContainer.innerHTML = "<p style='text-align:center;'>Consulting the oracle...</p>";

    try {
        const response = await fetch('./src/data/odu_database.json');
        const data = await response.json();
        
        // Find the matching Odu
        const oduData = data.find(item => item.index === oduIndex);

        if (oduData && oduData.verses.length > 0) {
            const verse = oduData.verses[0]; // Just showing first verse for MVP
            
            ui.verseContainer.innerHTML = `
                <div class="verse-yoruba">"${verse.chant_yoruba}"</div>
                <div class="odu-divider"></div>
                <div class="verse-english">"${verse.translation}"</div>
                <br>
                <p><strong>Message:</strong> ${verse.message}</p>
                <p><strong>Prescription:</strong> ${verse.prescription}</p>
            `;
            
            // Update Title with Alias if available
            if(oduData.alias) {
                ui.oduTitle.innerHTML += `<br><span style="font-size: 1rem; opacity: 0.8;">(${oduData.alias[0]})</span>`;
            }

        } else {
            // Fallback if Odu isn't in JSON yet
            ui.verseContainer.innerHTML = `
                <p style="text-align:center; color: #888;">
                    The verse for this Odu (Index: ${oduIndex}) is not yet in the library.
                    <br><br>
                    <strong>Binary Signature:</strong> ${mapper.toBinary(oduIndex)}
                </p>
            `;
        }

    } catch (error) {
        console.error("DB Error:", error);
        ui.verseContainer.innerHTML = "<p>Error connecting to the spirit realm (Database not found).</p>";
    }
}

/**
 * RESET HANDLER
 * Return to main screen
 */
function handleReset(e) {
    // Only reset if we clicked the header area while in reading mode
    if (ui.container.classList.contains('state-reading')) {
        // Check if click target is NOT the parchment (prevent accidental close while reading)
        if (!e.target.closest('.scroll-panel')) {
            ui.container.classList.remove('state-reading');
            ui.instruction.innerText = "SHAKE OR TAP TO CAST";
            ui.instruction.style.opacity = "1";
            ui.instruction.style.color = "#cbb486";
        }
    }
}