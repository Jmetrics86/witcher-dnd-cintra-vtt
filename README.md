# 🐺 The Blood of Marnadal: Witcher 5e Multiplayer VTT

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-PeerJS-FF6F00?logo=webrtc&logoColor=white)](https://peerjs.com/)

A Witcher-themed D&D 5e virtual tabletop (VTT) and 4-hour one-shot module set in **The Kingdom of Cintra (circa 1184 — Golden Era, pre-Fall of Cintra, before Geralt of Rivia was born)**. Built with serverless Peer-to-Peer (WebRTC) multiplayer, speech-to-text voice roleplay recording, and automatic Notion Campaign Wiki synchronization.

---

## ⚔️ Key Features

- **🐺 4 Pre-Generated Book-Canon Witchers:**
  - **Vane of Kaer Morhen (School of the Wolf):** Balanced frontliner & parry riposte tactician.
  - **Sybilla "The Lynx" (School of the Cat):** Lethal critical fencer (crits on 19-20), dual sabres, +2d6 ambush strikes.
  - **Alden of Kaer Seren (School of the Griffin):** Scholarly sign-weaver, 6 Vigor, +10 Quen shield, bonus melee strikes after signs.
  - **Bram of Haern Caduch (School of the Bear):** Towering juggernaut, two-handed executioner blade, knockdown immunity, physical damage resistance under Quen.
- **🗺️ Interactive Tactical Battle Map:**
  - 4 scene maps corresponding to the 4 acts (Tavern, Primeval Blackwood, Barrow Crypt, Corrupted Monolith).
  - Tactical grid overlay, live token drag/drop repositioning, ping tool, and GM monster spawner.
- **🌐 Serverless P2P Multiplayer (WebRTC / PeerJS):**
  - Host a room with a custom room code or join directly. Zero backend server required.
  - Real-time synchronization of token positions, dice rolls, character vitality/toxicity/vigor, chat, and scene transitions.
- **🎙️ Speech-to-Text Roleplay Recording:**
  - Web Speech API integration in the chat bar.
  - Toggle live mic to transcribe in-character dialogue (`🎭 In-Character`, `👑 DM Narration`, `🎲 OOC`) directly into the shared chronicle.
- **📓 Automatic Notion Campaign Wiki:**
  - One-click `.md` bundle download formatted specifically for Notion drag-and-drop import.
  - Direct Notion REST API sync (supports integration secret and page ID) to maintain an evolving campaign wiki and roleplay transcript.
- **🔊 Procedural Fantasy Audio Engine:**
  - Synthesized Web Audio API sound effects for all 5 Signs (Aard, Igni, Quen, Yrden, Axii), metallic blade parries, dice rattles, critical hits, and elixirs without external audio files.

---

## 📜 The 4-Hour Adventure: The Blood of Marnadal

| Act | Duration | Scene / Location | Synopsis & Encounter |
| :--- | :--- | :--- | :--- |
| **Act I** | 0:00 - 0:45 | *The Lion & Lily Waystation* | The 4 Witchers meet under a storm; Sir Danek offers 2,000 orens for the "Woodland Demon". |
| **Act II** | 0:45 - 1:45 | *The Primeval Blackwood* | Tracking the wagon massacre through sulfurous fog; ambushed by 4 Barghest spectral hounds. |
| **Act III** | 1:45 - 2:30 | *Secrets of the Barrow* | Slaying the Marnadal Grave Hag; discovering Baron Raymond stole the sacred Sun Stone from the Heart Tree. |
| **Act IV** | 2:30 - 3:30 | *The Heart of the Wood* | Climax showdown against the Ancient Leshen (CR 8) and bound Primeval Chort (CR 6). |
| **Epilogue** | 3:30 - 4:00 | *The Price of Neutrality* | Three distinct moral resolutions (Mercenary, Purifier, or Extortionist). |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Jmetrics86/witcher-cintra-vtt.git

# Enter the project directory
cd witcher-cintra-vtt

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Google Fonts (Cinzel, Cormorant Garamond, Inter)
- **Icons:** Lucide React
- **P2P Networking:** PeerJS (WebRTC DataChannels)
- **Voice Recognition:** Web Speech API
- **Audio:** Web Audio API (procedural synthesis)
- **Documentation:** Markdown module compendium (`THE_BLOOD_OF_MARNADAL_MODULE.md`)

---

## 📄 License
MIT License. Inspired by the Witcher universe created by Andrzej Sapkowski and adapted for D&D 5e tabletop play.
