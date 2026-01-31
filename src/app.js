import { IfaEntropyCaster } from './lib/EntropyCaster.js';
import { IfaOduMapper } from './lib/OduMapper.js';
import { SoundEngine } from './lib/SoundEngine.js'; // NEW IMPORT

/**
 * IFA DIVINATION APP - MAIN CONTROLLER
 * Connects UI, Logic, Data, and Audio.
 */

// 1. Initialize Logic Classes
const caster = new IfaEntropyCaster();
const mapper = new IfaOduMapper();
const sfx = new SoundEngine(); // NEW INSTANCE

// 2. DOM Elements Selection
const ui = {
    container: document.getElementById('app-container'),
    opon: document.getElementById('opon'),
    chainLegs: document.querySelector('.chain-legs'),
    instruction: document.getElementById('instruction-text'),
    oduTitle: document.getElementById('odu-name'),
    verseContainer: document.getElementById('verse-content'),
    shrineHeader: document.querySelector('.shrine-header') 
};

// State Variable
let isCasting = false;

// 3. Event Listeners
ui.opon.addEventListener('click', handleInteraction);
ui.shrineHeader.addEventListener('click', handleReset);
window.addEventListener('opele-impact', handleAutoCast); 

/**
 * MAIN INTERACTION HANDLER
 */
async function handleInteraction() {
    if (ui.container.classList.contains('state-reading')) return;

    // --- AUDIO HOOK: Unlock Audio Context on first tap ---
    sfx.init(); 

    if (!isCasting) {
        // STEP A: START CASTING
        try {
            ui.instruction.innerText = "Initializing Sensors...";
            
            await caster.startSession();
            
            isCasting = true;
            ui.instruction.innerText = "SHAKE DEVICE OR DROP ON PAD";
            ui.instruction.style.color = "#ffdd9e"; 
            ui.opon.style.transform = "scale(1.05)";

        } catch (error) {
            console.error("Sensor Error:", error);
            ui.instruction.innerText = "Sensors blocked. Tap again to force cast.";
            // Fallback: Enable manual mode immediately
            isCasting = true; 
        }
    } else {
        // STEP B: MANUAL STOP
        revealOdu("Manual Stop");
    }
}

/**
 * AUTO CAST HANDLER
 */
function handleAutoCast() {
    if (isCasting) {
        revealOdu("Drop Impact Detected");
    }
}

/**
 * REVEAL LOGIC
 */
async function revealOdu(method) {
    console.log(`Casting via: ${method}`);
    
    // 1. Play Sound Effect
    sfx.playDrop();

    // 2. Get the Seed (The Random Number)
    const seed = caster.stopAndCast(); 
    isCasting = false;

    // 3. Identify the Odu
    const profile = mapper.getOduProfile(seed);
    console.log("Odu Profile:", profile);

    // --- BUG CHECK: OYEKU MEJI (Index 0) ---
    // Explicitly logging this to ensure 0 is handled as a valid number, not False.
    if (profile.index === 0) {
        console.info("🌑 OYEKU MEJI DETECTED (Index 0). Handling zero-index logic...");
    }

    // 4. Render the Chain Visuals
    renderChainVisuals(profile.visuals);

    // 5. Update Text & Transition
    ui.oduTitle.innerText = profile.name;
    ui.instruction.innerText = "";
    ui.instruction.style.opacity = "0";
    
    // 6. Fetch Content
    await loadVerseContent(profile.index);

    // 7. Trigger Animation State
    setTimeout(() => {
        ui.container.classList.add('state-reading');
        ui.opon.style.transform = ""; 
    }, 600); 
}

/**
 * VISUAL RENDERER
 */
function renderChainVisuals(visuals) {
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
 */
async function loadVerseContent(oduIndex) {
    ui.verseContainer.innerHTML = "<p style='text-align:center;'>Consulting the oracle...</p>";

    try {
        const response = await fetch('./src/data/odu_database.json');
        const data = await response.json();
        
        // .find() works correctly with 0 because strict equality (0 === 0) is true
        const oduData = data.find(item => item.index === oduIndex);

        if (oduData && oduData.verses.length > 0) {
            const verse = oduData.verses[0]; 
            
            ui.verseContainer.innerHTML = `
                <div class="verse-yoruba">"${verse.chant_yoruba}"</div>
                <div class="odu-divider"></div>
                <div class="verse-english">"${verse.translation}"</div>
                <br>
                <p><strong>Message:</strong> ${verse.message}</p>
                <p><strong>Prescription:</strong> ${verse.prescription}</p>
            `;
            
            if(oduData.alias) {
                ui.oduTitle.innerHTML += `<br><span style="font-size: 1rem; opacity: 0.8;">(${oduData.alias[0]})</span>`;
            }

        } else {
            // Error handling for missing data
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
 */
function handleReset(e) {
    if (ui.container.classList.contains('state-reading')) {
        if (!e.target.closest('.scroll-panel')) {
            ui.container.classList.remove('state-reading');
            ui.instruction.innerText = "SHAKE OR TAP TO CAST";
            ui.instruction.style.opacity = "1";
            ui.instruction.style.color = "#cbb486";
        }
    }
}