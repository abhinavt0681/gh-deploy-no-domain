#!/bin/bash

echo "Modifying docker-compose.yml to use the simpler Dockerfile.simple..."
sed -i 's/dockerfile: Dockerfile/dockerfile: Dockerfile.simple/' docker-compose.yml

echo "Done! Now you can run: docker compose up --build -d" 