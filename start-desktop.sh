#!/bin/bash

# Start the web development server in the background
echo "Starting web server..."
npm run dev &
WEB_PID=$!

# Wait for the server to be ready
echo "Waiting for server to start..."
npx wait-on http://localhost:5000

# Start Electron
echo "Starting Electron..."
cd electron && NODE_ENV=development npm start

# Cleanup: kill the web server when Electron closes
kill $WEB_PID
