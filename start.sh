#!/bin/bash
set -e

# Start MongoDB
mkdir -p /home/runner/workspace/data/db
mongod --dbpath /home/runner/workspace/data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /home/runner/workspace/data/mongod.log

# Start Backend
cd /home/runner/workspace/backend
uvicorn server:app --host localhost --port 8001 --reload &

# Start reverse proxy (port 5000 -> Expo:5001 + Backend:8001)
cd /home/runner/workspace
node proxy.js &

# Start Expo web on port 5001 (proxied via port 5000)
cd /home/runner/workspace/frontend
EXPO_NO_TELEMETRY=1 npx expo start --web --port 5001 --localhost
