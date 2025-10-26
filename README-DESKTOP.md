# Desktop Game Launcher

A cross-platform desktop game launcher built with Electron that helps you organize your game library and fetches metadata from Steam.

![Game Launcher](https://via.placeholder.com/800x450?text=Game+Launcher)

## Features

✨ **Drag & Drop Support** - Simply drag game executables into the launcher  
🎮 **Steam Integration** - Automatically fetch game metadata from Steam's database  
🚀 **Quick Launch** - Launch your games with a single click  
🔍 **Search & Filter** - Easily find games in your library  
💾 **Local Storage** - Your game library is stored locally on your machine  
🌐 **Cross-Platform** - Works on Windows, macOS, and Linux  

## Quick Start

### Running in Development

1. **Start the web server**:
   ```bash
   npm run dev
   ```

2. **In a separate terminal, start Electron**:
   ```bash
   cd electron && npm start
   ```

**Or use the quick start script:**

- **Linux/macOS**: `./start-desktop.sh`
- **Windows**: `start-desktop.bat`

### Building for Production

1. **Build the web application**:
   ```bash
   npm run build
   ```

2. **Package the desktop app**:
   ```bash
   cd electron
   npx electron-builder
   ```

The packaged app will be in the `release/` directory.

## How to Use

### Adding Games

1. Click the **"Add Game"** button or drag & drop game executables into the drop zone
2. Supported formats: `.exe`, `.app`, `.sh`, `.bat`, `.lnk`
3. The game will appear in your library with its filename

### Downloading Metadata

1. Click the **download icon** (⬇) on any game card
2. The launcher will search Steam's database for matching games
3. Game information will be updated with:
   - Official game name
   - Cover art and screenshots
   - Description
   - Developer & publisher
   - Release date
   - Genres and categories
   - Metacritic score (if available)

### Launching Games

1. Click the **"Play"** button on any game card
2. The game will launch using your system's default handler

### Removing Games

1. Click the **trash icon** (🗑️) on any game card
2. Confirm removal
3. Note: This only removes the game from the launcher, not from your computer

## Technical Details

### Architecture

- **Electron**: Desktop application framework
- **React + TypeScript**: Modern UI with type safety
- **Steam Web API**: Metadata source
- **Local JSON Storage**: Game library persistence

### File Locations

Your game library is stored in:

- **Windows**: `%APPDATA%/Electron/games.json`
- **macOS**: `~/Library/Application Support/Electron/games.json`
- **Linux**: `~/.config/Electron/games.json`

### Security

- Game paths are validated before execution
- Uses Electron's `shell.openPath` for secure game launching
- No shell command execution with user input
- Steam metadata is cached for 24 hours to improve performance

## Development

### Project Structure

```
.
├── electron/
│   ├── main.js           # Electron main process
│   ├── preload.js        # Preload script (IPC bridge)
│   └── package.json      # Electron configuration
├── client/
│   └── src/
│       ├── pages/
│       │   └── launcher.tsx    # Main launcher UI
│       └── types/
│           └── electron.d.ts   # TypeScript definitions
├── start-desktop.sh      # Linux/macOS start script
├── start-desktop.bat     # Windows start script
└── README-DESKTOP.md     # This file
```

### Available Scripts

- `npm run dev` - Start web development server
- `cd electron && npm start` - Start Electron in development mode
- `npm run build` - Build web application for production
- `cd electron && npx electron-builder` - Package desktop app

## Troubleshooting

### Game won't launch

- Verify the game executable exists at the path shown
- Check file permissions
- Try running the game directly from your file system

### Metadata not found

- The game might not be on Steam
- Try editing the game name to match Steam's database
- Some games have different names on Steam vs. their executables

### Can't add games

- Ensure you're dragging executable files
- Check that the file format is supported
- Try using the "Add Game" button instead of drag & drop

## Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

## License

MIT License - See LICENSE file for details
