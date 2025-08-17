# Conecte os Globais - Backend API

FastAPI backend for the Conecte os Globais application.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py
│   │       └── endpoints.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── db/
│   │   └── __init__.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt
```

## Getting Started

### Prerequisites

- Python 3.11+
- Docker (optional)

### Local Development

1. Clone the repository and navigate to the backend directory:
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

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

### Production Docker

1. Build the Docker image:
```bash
docker build -t conecte-os-globais-api .
```

2. Run the container:
```bash
docker run -p 8000:8000 conecte-os-globais-api
```

## API Documentation

- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative API docs (ReDoc): `http://localhost:8000/redoc`
- OpenAPI schema: `http://localhost:8000/api/v1/openapi.json`

## Testing

Run tests with pytest:
```bash
pytest
```

## Health Check

- Health endpoint: `GET /health`
- Detailed health endpoint: `GET /api/v1/health`

## Environment Variables

See `.env.example` for all available environment variables.

## Features

- ✅ FastAPI with automatic API documentation
- ✅ Pydantic for data validation
- ✅ CORS middleware configured
- ✅ Health check endpoints
- ✅ Docker support with security best practices
- ✅ Testing setup with pytest
- ✅ Environment-based configuration
- ✅ Structured project layout following FastAPI best practices