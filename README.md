# Grace Harbor Real Estate Analytics

A comprehensive real estate analytics platform for Massachusetts properties.

## Overview

Grace Harbor Real Estate Analytics provides insights into real estate market trends across different property types and locations in Massachusetts. The application allows users to visualize and compare metrics such as median prices, days on market, and total listings over time.

## Features

- **Interactive Dashboard**: Visualize real estate metrics with interactive charts
- **Property Type Filtering**: Filter data by condos, multi-family, or single-family properties
- **Location Comparison**: Compare metrics between different locations
- **Time Series Analysis**: Analyze trends over customizable time periods
- **Responsive Design**: Access insights on any device

## Tech Stack

- **Frontend**: Next.js, React, Recharts, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: AWS RDS (PostgreSQL)
- **Deployment**: Docker, Docker Compose, EC2

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/grace-harbor.git
   cd grace-harbor
   ```

2. Start the application:
   ```
   docker compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Deployment

### EC2 Deployment

The application is currently deployed on AWS EC2:

1. SSH into the instance:
   ```
   ssh -i your-key.pem ec2-user@3.147.77.205
   ```

2. Clone the repository:
   ```
   git clone https://github.com/yourusername/grace-harbor-analytics.git
   cd grace-harbor-analytics
   ```

3. Run the deployment script:
   ```
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. The application will be available at:
   - Frontend: http://3.147.77.205:3000
   - Backend API: http://3.147.77.205:8000

### Database

The application connects directly to an AWS RDS PostgreSQL instance:
- Host: gh-housing.c5cg280s45ed.us-east-2.rds.amazonaws.com
- Database: property
- Username: graceharbor
- Password: [Secured]

No local PostgreSQL container is needed when deploying.

### Updating the Deployment

To update your deployment with the latest changes:

1. Connect to your EC2 instance
2. Navigate to the project directory
3. Run the deployment script:
   ```
   ./deploy.sh
   ```

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn app.main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Project Structure

```
grace-harbor/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── deploy.sh
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com). 