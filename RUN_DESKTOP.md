# Game Launcher Desktop Application

This is a desktop game launcher application built with Electron that allows you to:
- Drag and drop game executables
- Fetch metadata from Steam Web API
- Launch games directly from the launcher

## Running the Desktop App

### Development Mode

1. **Start the web server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Start Electron** (in another terminal):
   ```bash
   cd electron
   npm start
   ```

Or use the quick start script:
```bash
./start-desktop.sh
```

### Production Build

1. **Build the web application**:
   ```bash
   npm run build
   ```

2. **Build the Electron app**:
   ```bash
   cd electron
   npx electron-builder
   ```

The built application will be in the `release/` directory.

## How to Use

1. **Add Games**: 
   - Drag and drop game executable files (.exe, .app, etc.) into the drop zone
   - Or click "Add Game" to browse for files

2. **Download Metadata**:
   - Click the download icon button on any game card
   - The app will search Steam for matching game information
   - Metadata includes: game name, description, screenshots, developers, release date, etc.

3. **Launch Games**:
   - Click the "Play" button on any game card to launch it

4. **Remove Games**:
   - Click the trash icon to remove a game from your library
   - Note: This only removes it from the launcher, not from your computer

## Features

- **Steam Integration**: Automatically fetches game metadata from Steam's public API
- **Local Storage**: Games library stored in your user data folder
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Drag & Drop**: Easy game management
- **Search**: Filter your game library

## Technical Details

- **Electron**: Desktop application framework
- **React**: UI framework
- **Steam Web API**: Metadata source
- **Local JSON Database**: Game library storage

## File Locations

- **Windows**: `%APPDATA%/game-launcher/games.json`
- **macOS**: `~/Library/Application Support/game-launcher/games.json`
- **Linux**: `~/.config/game-launcher/games.json`
