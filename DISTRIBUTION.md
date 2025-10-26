# Game Launcher - Distribution Package

## What's Included

This archive contains the complete desktop game launcher application.

### Files Included:
- `electron/` - Desktop application files (main.js, preload.js, package.json)
- `client/src/pages/launcher.tsx` - Launcher UI component
- `client/src/types/electron.d.ts` - TypeScript definitions
- `start-desktop.sh` - Linux/macOS startup script
- `start-desktop.bat` - Windows startup script
- `README-DESKTOP.md` - Complete documentation
- `RUN_DESKTOP.md` - Quick start guide

## Installation & Setup

### Prerequisites
You need Node.js installed on your system. Download from: https://nodejs.org/

### Setup Steps

1. **Extract this archive** to your project directory

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Run the desktop launcher**:
   
   **Linux/macOS:**
   ```bash
   ./start-desktop.sh
   ```
   
   **Windows:**
   ```bash
   start-desktop.bat
   ```

   **Or manually:**
   - Terminal 1: `npm run dev`
   - Terminal 2: `cd electron && npm start`

## Building Standalone Executable

To create a distributable application:

1. Build the web app:
   ```bash
   npm run build
   ```

2. Package the desktop app:
   ```bash
   cd electron
   npx electron-builder
   ```

3. Find your packaged app in the `release/` folder

## Quick Start

1. Launch the desktop app
2. Drag & drop your game executables (.exe, .app, etc.)
3. Click the download button on games to fetch Steam metadata
4. Click "Play" to launch your games!

## Support

For detailed documentation, see:
- `README-DESKTOP.md` - Full feature documentation
- `RUN_DESKTOP.md` - Running and building instructions

## System Requirements

- **OS**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: 2GB minimum
- **Disk**: 200MB for the app + space for game library metadata

## Features

✅ Drag & drop game management  
✅ Steam metadata integration  
✅ Quick game launching  
✅ Search and filter  
✅ Cross-platform support  

Enjoy your game launcher! 🎮
