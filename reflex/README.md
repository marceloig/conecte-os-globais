# Conecte os Globais - React + FastAPI Version

This is the converted version of the Conecte os Globais application, now split into a React frontend with Vite and a FastAPI backend.

## Project Structure

```
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
├── conecte_os_globais/ # Original Reflex application (legacy)
└── README.md
```

## Prerequisites

- Node.js (v18+)
- Python (3.9+)
- Neo4j Database

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit the `.env` file with your Neo4j credentials:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_AUTH_USER=neo4j
NEO4J_AUTH_PASSWORD=your_password_here
```

6. Start the backend server:
```bash
python run.py
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

The FastAPI backend provides the following endpoints:

- `GET /api/random-actors` - Get two random actors to start the game
- `POST /api/records-by-actors` - Find novelas connected to given actors
- `POST /api/records-by-novelas` - Find actors connected to given novelas
- `POST /api/find-item` - Find an item in current records based on search
- `POST /api/shortest-path` - Find shortest path between actors
- `GET /api/search-novelas/{novela}` - Search for novelas containing string
- `GET /api/search-actors/{actor}` - Search for actors containing string

## Features

- **Interactive Graph**: ReactFlow-based visualization of actor-novela connections
- **Real-time Search**: Add new actors and novelas to expand the graph
- **Path Finding**: Automatically detect when shortest path is found
- **Responsive Design**: Works on desktop and mobile devices

## Development

### Backend Development

The backend uses FastAPI with:
- Neo4j for graph database operations
- Pydantic for data validation
- CORS middleware for frontend communication

### Frontend Development  

The frontend uses React with:
- TypeScript for type safety
- ReactFlow for graph visualization
- Axios for API communication
- Vite for fast development builds

## Original Reflex Version

The original Reflex application code is preserved in the `conecte_os_globais/` directory for reference.