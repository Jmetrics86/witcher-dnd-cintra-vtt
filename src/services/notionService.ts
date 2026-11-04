import { ChatMessage, WitcherCharacter, MapScene } from '../types';
import { PREGEN_WITCHERS } from '../data/characters';
import { MONSTERS } from '../data/monsters';

export interface NotionSyncConfig {
  apiKey: string;
  parentPageId: string;
}

export class NotionService {
  /**
   * Generates a complete, structured Markdown bundle tailored for Notion import.
   * Notion allows dragging & dropping .md files to auto-generate pages, toggles, and tables.
   */
  public generateNotionWikiMarkdown(
    sessionMessages: ChatMessage[],
    activeCharacter?: WitcherCharacter,
    activeScene?: MapScene
  ): string {
    const timestamp = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const dialogueMessages = sessionMessages.filter(
      (m) => m.type === 'chat' || m.isVoiceTranscribed
    );
    const combatEvents = sessionMessages.filter(
      (m) => m.type === 'combat' || m.type === 'roll'
    );

    return `# 🐺 THE BLOOD OF MARNADAL: CAMPAIGN WIKI & SESSION CHRONICLE
> **Setting:** The Kingdom of Cintra (circa 1184 — Golden Era, pre-Fall of Cintra)  
> **Session Recorded:** ${timestamp}  
> **Current Scene:** ${activeScene?.name || 'Act I: The Lion & Lily'}  
> **Active Party Lead:** ${activeCharacter ? `${activeCharacter.name} (School of the ${activeCharacter.school})` : 'Witcher Company'}

---

## 🎙️ SESSION ROLEPLAY TRANSCRIPTS & CHRONICLE
*Automatically recorded from voice-to-text speech and party chat during gameplay.*

${
  dialogueMessages.length === 0
    ? '_No voice-transcribed dialogue recorded yet. Speak into the microphone in-app to log in-character speech._'
    : dialogueMessages
        .map((m) => {
          const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const badge = m.isVoiceTranscribed ? '🎙️ [VOICE RECORDED]' : '💬 [CHAT]';
          const mode = m.speechMode === 'ic' ? '🎭 (In-Character)' : m.speechMode === 'dm' ? '👑 (DM Narration)' : '🎲 (OOC)';
          return `* **[${time}] ${m.senderName}** ${mode} ${badge}:\n  > "${m.text}"`;
        })
        .join('\n\n')
}

---

## ⚔️ COMBAT & DICE ROLLS LOG
${
  combatEvents.length === 0
    ? '_No combat actions logged yet._'
    : combatEvents
        .slice(-25)
        .map((m) => {
          const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (m.type === 'roll' && m.rollData) {
            return `* **[${time}] ${m.rollData.senderName}** rolled **${m.rollData.title}**: \`${m.rollData.total}\` ${
              m.rollData.isCritical ? '🔥 **CRITICAL HIT!**' : m.rollData.isFumble ? '💀 **FUMBLE!**' : ''
            } (Dice: [${m.rollData.diceRolls.join(', ')}] ${m.rollData.modifier >= 0 ? `+${m.rollData.modifier}` : m.rollData.modifier})`;
          }
          return `* **[${time}]** ${m.text}`;
        })
        .join('\n')
}

---

## 📖 THE ADVENTURE ACTS (4-HOUR MODULE)

### Act I: The Lion & The Lily (0:00 - 0:45)
* **Location:** The Crossroads Waystation of Marnadal, Cintra
* **Synopsis:** The 4 Witchers meet under a storm. Sir Danek of Marnadal offers 2,000 orens for the "Woodland Demon."
* **Key Clues:** Mute lumberjack Kaelan has wounds infected by ancient fungal rot.

### Act II: The Tracker's Trail (0:45 - 1:45)
* **Location:** The Primeval Blackwood of the Yaruga Verge
* **Synopsis:** Following cloven tracks through the fog. Ambushed by 4 Barghest spectral hounds.
* **Witcher Tactics:** Yrden traps strip ethereal resistances; Moon Dust bomb forces physical vulnerability.

### Act III: Secrets of the Barrow (1:45 - 2:30)
* **Location:** The Forgotten Crypt of King Elidyr
* **Synopsis:** Slaying the Marnadal Grave Hag. Uncovering Baron Raymond's conspiracy: he stole the sacred Sun Stone from the Heart Tree.
* **Dilemma:** The Leshen is not a mindless killer; it is the awakened guardian of ancient treaties.

### Act IV: The Heart of the Wood (2:30 - 3:30)
* **Location:** The Corrupted Monolith Grove
* **Climax Encounter:** Ancient Leshen (CR 8) & Primeval Chort (CR 6).
* **Tactics:** Igni deals double fire damage; dismantle 3 wooden totems to end its 15 HP/turn regeneration.

---

## 🐺 THE FOUR WITCHER DOSSIERS

${PREGEN_WITCHERS.map(
  (w) => `### ${w.name} — School of the ${w.school}
* **Combat Role:** Level 5 Witcher | AC ${w.armorClass} | HP ${w.maxHp} | Vigor ${w.maxVigor}
* **School Mastery:** **${w.schoolPerk.name}** — ${w.schoolPerk.description}
* **Silver Blade:** ${w.silverWeapon.name} (+${w.silverWeapon.attackBonus} to hit, ${w.silverWeapon.damage})
* **Backstory:** ${w.backstory}
* **Motto:** _"${w.schoolMotto}"_
`
).join('\n')}

---

## 💀 MONSTER BESTIARY

${MONSTERS.map(
  (m) => `### ${m.name} (${m.category} — CR ${m.cr})
* **Armor Class:** ${m.ac} | **Hit Points:** ${m.hp} | **Speed:** ${m.speed}
* **Vulnerabilities:** ${m.vulnerabilities.join(', ')}
* **Tactical Notes:** ${m.witcherTactics}
`
).join('\n')}
`;
  }

  /**
   * Directly pushes a session update to Notion API if an integration token is provided.
   */
  public async syncToNotionApi(
    config: NotionSyncConfig,
    title: string,
    contentMarkdown: string
  ): Promise<{ success: boolean; message: string }> {
    if (!config.apiKey || !config.parentPageId) {
      return {
        success: false,
        message: 'Missing Notion API Token or Parent Page ID.',
      };
    }

    try {
      // Direct Notion API call to create a child page
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey.trim()}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { page_id: config.parentPageId.trim() },
          properties: {
            title: {
              title: [{ text: { content: title } }],
            },
          },
          children: [
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                rich_text: [{ text: { content: '🐺 Witcher Campaign Chronicle' } }],
              },
            },
            {
              object: 'block',
              type: 'callout',
              callout: {
                rich_text: [
                  {
                    text: {
                      content: 'Synchronized live from the Witcher 5e VTT session in Cintra, 1184.',
                    },
                  },
                ],
                icon: { emoji: '⚔️' },
              },
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    text: {
                      content: contentMarkdown.slice(0, 1800), // Notion block char limit safety
                    },
                  },
                ],
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `Notion API returned status ${response.status}`,
        };
      }

      return {
        success: true,
        message: 'Successfully published session wiki page to your Notion workspace!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error connecting to Notion API. (Browser CORS may require Notion Integration via server/export)',
      };
    }
  }

  /**
   * Triggers a browser download of the complete Notion Wiki bundle (.md file).
   */
  public downloadNotionWikiFile(
    sessionMessages: ChatMessage[],
    activeCharacter?: WitcherCharacter,
    activeScene?: MapScene
  ) {
    const markdown = this.generateNotionWikiMarkdown(
      sessionMessages,
      activeCharacter,
      activeScene
    );
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Witcher_Cintra_Wiki_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const notionService = new NotionService();
