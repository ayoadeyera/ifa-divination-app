Here is a comprehensive **Project Synopsis & Technical Specification** generated from our brainstorming session.

You can copy and paste this entire block directly into Gemini Canvas (or the `README.md` of your repository). It provides the full context, architecture, and current state of the application so the AI knows exactly where to pick up.

---

# Project Synopsis: Digital Opon Ifa (Divination App)

### 1. Project Overview

We are building a **skeuomorphic, mobile-first web application** for Ifa Divination. The goal is to bridge ancient spiritual tradition with modern technology, focusing on **authenticity (Ile-Ife tradition)** and **"True Randomness"** derived from physical entropy rather than pseudo-random computer algorithms.

### 2. Core Philosophy

* **Source of Truth:** The Odu hierarchy and verses strictly follow the **Ile-Ife** lineage.
* **Visual Style:** **Skeuomorphic**. The UI mimics a physical shrine with textures of wood (Opon), woven mats, and cowrie shells/seeds (Opele).
* **Interaction:** tactile and physical. The user must **Shake** the device or **Drop** it (simulated impact) to cast, utilizing the device's sensors.

### 3. Technical Architecture

The project uses a **Vanilla JavaScript (ES6 Modules)** structure to ensure performance and simplicity without heavy frameworks.

**File Structure:**

```text
ifa-app/
├── index.html              # Entry point. Contains the "Shrine" (Header) and "Parchment" (Panel).
├── src/
│   ├── app.js              # The Main Controller. Connects UI events to Logic classes.
│   ├── data/
│   │   └── odu_database.json   # The Data Layer. Stores Odu names, binary codes, and verses.
│   ├── lib/
│   │   ├── EntropyCaster.js    # LOGIC: Handles DeviceMotion/Accelerometer to generate seed (0-255).
│   │   └── OduMapper.js        # LOGIC: Maps seed (0-255) to Odu Name and Visual Binary Pattern.
│   └── styles/
│       ├── main.css        # Global resets and environment (Mat background).
│       ├── shrine.css      # Styling for the Opon Ifa (Tray) and Opele (Chain).
│       └── panel.css       # Styling for the sliding Reading Panel (Parchment).

```

### 4. Logic & Mechanics

* **The Randomness (EntropyCaster):**
* Uses the `devicemotion` API to listen for acceleration data.
* Accumulates sensor noise into an "Entropy Pool" during the shake/drop event.
* Calculates a modulo 256 integer from the chaos sum to determine the Odu.


* **The Mapping (OduMapper):**
* Treats the Odu as an 8-bit binary number.
* **1 (Open)** = Single Mark. **0 (Closed)** = Double Mark.
* Maps the binary signature to the 16 Principal Odu (Ile-Ife Order).


* **The Data (JSON):**
* Structure: `index` (0-255), `name`, `binary_code`, `verses` (Array of objects with Yoruba/English text).



### 5. UI/UX Flow

1. **State A (The Sanctuary):**
* User sees the Opon Ifa on a mat.
* Action: Shake device or Tap (fallback).
* Visual: Opele chain renders dynamically based on the binary result.


2. **State B (The Reading):**
* Trigger: After casting is complete.
* Animation: The Opon shrinks and moves to the top header.
* Action: A "Parchment" panel slides up from the bottom containing the Odu Name and Verses.



### 6. Current Development Status

* **Completed:**
* Project file structure established.
* Core Logic classes (`EntropyCaster`, `OduMapper`) written and functional.
* UI Styling (CSS) for both Shrine and Reading modes implemented.
* `app.js` Controller written to handle the fetch logic and DOM manipulation.


* **Resolved Bugs:**
* Removed the "Simulated Odu" testing script from `index.html` that was causing the app to show fake data (e.g., "Simulated Odu: 120") instead of the real sensor result.


* **Immediate Next Steps:**
* Verify the `odu_database.json` fetch logic is correctly matching seeds to verses.
* Implement **Sound Effects** (Audio API) for the "clatter" of the chain.
* Expand the JSON database beyond the first 4 principal Odu.



---
