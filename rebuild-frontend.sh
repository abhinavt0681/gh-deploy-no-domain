#!/bin/bash

echo "======================================="
echo "Rebuilding the frontend container"
echo "======================================="

echo "Stopping the frontend container..."
docker stop grace_harbor_frontend
docker rm grace_harbor_frontend

echo "Removing old images..."
docker rmi grace-harbor-app-deploy-nextjs-frontend

echo "Switching to use simple Dockerfile..."
./use-simple-dockerfile.sh

echo "Building frontend with clean cache..."
docker compose build --no-cache frontend

echo "Starting the frontend container..."
docker compose up -d frontend

echo "Container logs:"
docker logs grace_harbor_frontend

echo "======================================="
echo "Rebuild complete!"
echo "The frontend should be accessible at: http://3.147.77.205:3000"
echo "Making API calls to: http://3.147.77.205:8000"
echo "=======================================" 