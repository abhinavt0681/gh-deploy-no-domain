#!/bin/bash

# Display banner
echo "======================================="
echo "Grace Harbor Analytics Health Check"
echo "======================================="

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
else
    echo "✅ Docker is installed"
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed or not in PATH"
        exit 1
    else
        echo "✅ Docker Compose is installed (docker-compose)"
        COMPOSE_CMD="docker-compose"
    fi
else
    echo "✅ Docker Compose is installed (docker compose)"
    COMPOSE_CMD="docker compose"
fi

# Check if containers are running
echo -e "\nChecking containers status:"
echo "---------------------------------------"

# Check backend container
if docker ps | grep -q "grace_harbor_backend"; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container is not running"
    exit 1
fi

# Check frontend container
if docker ps | grep -q "grace_harbor_frontend"; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is not running"
    exit 1
fi

# Check RDS connection through the backend
echo -e "\nChecking RDS Database connection:"
echo "---------------------------------------"
if curl -s http://localhost:8000/api/v1/health | grep -q "database.*connected"; then
    echo "✅ RDS Database connection is working"
else
    echo "⚠️ Unable to verify RDS connection. Check backend logs with: docker logs grace_harbor_backend"
fi

# Check if backend API is accessible
echo -e "\nChecking API accessibility:"
echo "---------------------------------------"
if curl -s http://localhost:8000/api/v1/health | grep -q "status.*ok"; then
    echo "✅ Backend API is accessible"
else
    echo "❌ Backend API is not accessible"
fi

# Check if frontend is accessible
echo -e "\nChecking frontend accessibility:"
echo "---------------------------------------"
if curl -s -I http://localhost:3000 | grep -q "HTTP/1.1 200"; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo -e "\n======================================="
echo "Health check completed!"
echo "If all checks passed, the application is running correctly."
echo "Frontend: http://3.147.77.205:3000"
echo "API: http://3.147.77.205:8000"
echo "Using AWS RDS: gh-housing.c5cg280s45ed.us-east-2.rds.amazonaws.com"
echo "=======================================" 