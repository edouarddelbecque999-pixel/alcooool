#!/bin/bash
set -e

# Start reverse proxy (port 5000 -> Frontend:5001)
cd /tmp/cc-agent/68162356/project
node proxy-vite.js &

# Start Vite frontend on port 5001
cd /tmp/cc-agent/68162356/project/frontend
npm run dev
