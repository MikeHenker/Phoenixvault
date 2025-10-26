const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
const GAMES_DB_PATH = path.join(app.getPath('userData'), 'games.json');

// Ensure games database exists
function initializeGamesDB() {
  if (!fs.existsSync(GAMES_DB_PATH)) {
    fs.writeFileSync(GAMES_DB_PATH, JSON.stringify({ games: [] }, null, 2));
  }
}

// Read games from database
function getGames() {
  try {
    const data = fs.readFileSync(GAMES_DB_PATH, 'utf8');
    return JSON.parse(data).games;
  } catch (error) {
    console.error('Error reading games:', error);
    return [];
  }
}

// Save games to database
function saveGames(games) {
  try {
    fs.writeFileSync(GAMES_DB_PATH, JSON.stringify({ games }, null, 2));
  } catch (error) {
    console.error('Error saving games:', error);
    throw new Error('Failed to save games to disk');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a',
    frame: true,
    title: 'Game Launcher'
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/public/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initializeGamesDB();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Get all games
ipcMain.handle('get-games', async () => {
  return getGames();
});

// Add game from file path
ipcMain.handle('add-game', async (event, filePath) => {
  try {
    const games = getGames();
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Check if game already exists
    if (games.some(g => g.path === filePath)) {
      throw new Error('Game already exists in library');
    }

    const newGame = {
      id: Date.now().toString(),
      name: fileName,
      path: filePath,
      addedAt: new Date().toISOString(),
      steamData: null
    };

    games.push(newGame);
    saveGames(games);
    return newGame;
  } catch (error) {
    throw error;
  }
});

// Cache for Steam app list (refresh every 24 hours)
let steamAppListCache = null;
let steamAppListCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getSteamAppList() {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (steamAppListCache && (now - steamAppListCacheTime) < CACHE_DURATION) {
    return steamAppListCache;
  }

  // Fetch new data
  const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
  const data = await response.json();
  
  steamAppListCache = data.applist.apps;
  steamAppListCacheTime = now;
  
  return steamAppListCache;
}

// Fetch Steam metadata
ipcMain.handle('fetch-steam-metadata', async (event, gameId, gameName) => {
  try {
    const games = getGames();
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex === -1) {
      throw new Error('Game not found');
    }

    // Get Steam app list (cached)
    const apps = await getSteamAppList();
    
    // Find the best match for the game name
    const steamApp = apps.find(app => 
      app.name.toLowerCase() === gameName.toLowerCase()
    ) || apps.find(app => 
      app.name.toLowerCase().includes(gameName.toLowerCase())
    );

    if (!steamApp) {
      throw new Error('Game not found on Steam');
    }

    // Fetch detailed game information
    const detailsResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${steamApp.appid}`
    );
    const detailsData = await detailsResponse.json();

    if (!detailsData[steamApp.appid]?.success) {
      throw new Error('Failed to fetch game details from Steam');
    }

    const gameData = detailsData[steamApp.appid].data;

    // Update game with Steam metadata
    games[gameIndex].steamData = {
      appId: steamApp.appid,
      name: gameData.name,
      description: gameData.short_description || gameData.detailed_description,
      developers: gameData.developers || [],
      publishers: gameData.publishers || [],
      releaseDate: gameData.release_date?.date,
      headerImage: gameData.header_image,
      screenshots: gameData.screenshots?.map(s => s.path_thumbnail) || [],
      genres: gameData.genres?.map(g => g.description) || [],
      categories: gameData.categories?.map(c => c.description) || [],
      metacriticScore: gameData.metacritic?.score
    };

    // Update the display name to Steam's official name
    games[gameIndex].name = gameData.name;

    saveGames(games);
    return games[gameIndex];
  } catch (error) {
    console.error('Steam metadata fetch error:', error);
    throw error;
  }
});

// Launch game
ipcMain.handle('launch-game', async (event, gamePath) => {
  try {
    // Validate that the file exists
    if (!fs.existsSync(gamePath)) {
      throw new Error('Game executable not found');
    }

    // Use shell.openPath for better security - it uses the OS's default handler
    // without shell command execution
    const result = await shell.openPath(gamePath);
    
    if (result) {
      // If result is not empty, it's an error message
      throw new Error(result);
    }

    return { success: true };
  } catch (error) {
    console.error('Launch error:', error);
    throw error;
  }
});

// Delete game from library
ipcMain.handle('delete-game', async (event, gameId) => {
  try {
    const games = getGames();
    const filteredGames = games.filter(g => g.id !== gameId);
    saveGames(filteredGames);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

// Open file dialog to select game executable
ipcMain.handle('select-game-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe', 'app', 'sh', 'bat', 'lnk'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Update game metadata manually
ipcMain.handle('update-game', async (event, gameId, updates) => {
  try {
    const games = getGames();
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex === -1) {
      throw new Error('Game not found');
    }

    games[gameIndex] = { ...games[gameIndex], ...updates };
    saveGames(games);
    return games[gameIndex];
  } catch (error) {
    throw error;
  }
});
