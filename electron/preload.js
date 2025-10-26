const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Game management
  getGames: () => ipcRenderer.invoke('get-games'),
  addGame: (filePath) => ipcRenderer.invoke('add-game', filePath),
  deleteGame: (gameId) => ipcRenderer.invoke('delete-game', gameId),
  updateGame: (gameId, updates) => ipcRenderer.invoke('update-game', gameId, updates),
  
  // Steam integration
  fetchSteamMetadata: (gameId, gameName) => ipcRenderer.invoke('fetch-steam-metadata', gameId, gameName),
  
  // Game launching
  launchGame: (gamePath) => ipcRenderer.invoke('launch-game', gamePath),
  
  // File selection
  selectGameFile: () => ipcRenderer.invoke('select-game-file'),
  
  // Platform info
  platform: process.platform
});
