#!/bin/bash

# Display banner
echo "======================================="
echo "Grace Harbor Analytics Deployment Script"
echo "======================================="

# Pull latest changes from Git
echo "Pulling latest changes from Git..."
git pull

# Build and start containers
echo "Building and starting containers..."
echo "Note: Using RDS database directly - no local PostgreSQL container"
docker compose up --build -d

# Check if containers are running
echo "Checking container status..."
docker ps

echo "======================================="
echo "Deployment complete! The application should be accessible at:"
echo "http://3.147.77.205:3000"
echo "Backend API at: http://3.147.77.205:8000"
echo "Using AWS RDS Database: gh-housing.c5cg280s45ed.us-east-2.rds.amazonaws.com"
echo "=======================================" 