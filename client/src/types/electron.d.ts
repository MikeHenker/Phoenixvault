export interface ElectronAPI {
  getGames: () => Promise<Game[]>;
  addGame: (filePath: string) => Promise<Game>;
  deleteGame: (gameId: string) => Promise<{ success: boolean }>;
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<Game>;
  fetchSteamMetadata: (gameId: string, gameName: string) => Promise<Game>;
  launchGame: (gamePath: string) => Promise<{ success: boolean }>;
  selectGameFile: () => Promise<string | null>;
  platform: string;
}

export interface Game {
  id: string;
  name: string;
  path: string;
  addedAt: string;
  steamData?: SteamData;
}

export interface SteamData {
  appId: number;
  name: string;
  description: string;
  developers: string[];
  publishers: string[];
  releaseDate: string;
  headerImage: string;
  screenshots: string[];
  genres: string[];
  categories: string[];
  metacriticScore?: number;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
