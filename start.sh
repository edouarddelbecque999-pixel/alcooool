#!/bin/bash
set -e

# Start static HTML server on port 5001
cd /tmp/cc-agent/68162356/project
node static-server.js &

# Start reverse proxy (port 5000 -> Static:5001)
cd /tmp/cc-agent/68162356/project
node proxy.js &

echo "Server starting on port 5000..."
wait
