@echo off
echo Starting web server...
start /B npm run dev

echo Waiting for server to start...
npx wait-on http://localhost:5000

echo Starting Electron...
cd electron
npm start
