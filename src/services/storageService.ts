import { MapToken, ChatMessage } from '../types';

export interface CampaignSaveState {
  version: number;
  savedAt: number;
  roomCode?: string;
  currentSceneId: string;
  tokens: MapToken[];
  messages: ChatMessage[];
  selectedCharacterId: string;
}

const STORAGE_KEY = 'witcher_cintra_campaign_v1';

export class StorageService {
  private debounceTimer: any = null;

  /**
   * Saves the current campaign state to the Game Master's browser localStorage.
   */
  public saveCampaignState(state: Omit<CampaignSaveState, 'version' | 'savedAt'>) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      try {
        const payload: CampaignSaveState = {
          ...state,
          version: 1,
          savedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to auto-save campaign to localStorage:', e);
      }
    }, 400);
  }

  /**
   * Loads the existing campaign state from the Game Master's browser localStorage.
   */
  public loadCampaignState(): CampaignSaveState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CampaignSaveState;
    } catch (e) {
      console.warn('Failed to parse campaign save from localStorage:', e);
      return null;
    }
  }

  /**
   * Clears saved campaign state from local storage.
   */
  public clearCampaignState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  /**
   * Exports the entire campaign state as a downloadable JSON file.
   */
  public exportSaveFile(state: Omit<CampaignSaveState, 'version' | 'savedAt'>) {
    const payload: CampaignSaveState = {
      ...state,
      version: 1,
      savedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `witcher_campaign_save_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parses an uploaded JSON campaign file.
   */
  public parseSaveFile(file: File): Promise<CampaignSaveState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as CampaignSaveState;
          if (!parsed.tokens || !parsed.currentSceneId) {
            throw new Error('Invalid Witcher campaign file structure.');
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }
}

export const storageService = new StorageService();
