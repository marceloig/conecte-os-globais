# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Reflex web application called "Conecte os Globais" - a game that helps users discover connections between Brazilian actors (from TV Globo) through the soap operas they've appeared in. The app visualizes these connections as an interactive graph where users can explore relationships and find the shortest path between actors.

## Development Commands

### Running the Application
```bash
reflex run
```

### Installing Dependencies
```bash
pip install -r requirements.txt
```

### Environment Setup
The application uses environment variables loaded via python-dotenv. Check for a `.env` file for database configurations.

## Architecture

### Core Structure
- **Entry Point**: `conecte_os_globais/conecte_os_globais.py` - Main Reflex app configuration
- **Routing**: Two main pages defined in `conecte_os_globais/pages/`
  - `/` (index.py) - Main game interface with ReactFlow graph visualization  
  - `/game` (game.py) - Alternative interface using Cytoscape (experimental)

### State Management
- **BaseState** (`state.py`): Base state class with session storage for tokens/credentials
- **IndexState** (`pages/index.py`): Main game state managing nodes, edges, actors, novelas, and user interactions
- **GameState** (`pages/game.py`): Alternative game state for Cytoscape implementation

### Data Layer
- **Neo4j Integration**: Primary database for storing actor-novela relationships
  - `src/neo4j.py`: Neo4j repository implementation
  - `src/service.py`: Business logic services (GlobalService, ReactFlowService)
- **Additional Databases**: 
  - `src/dynamodb.py`: AWS DynamoDB support
  - `src/neptune.py`: AWS Neptune graph database support

### Component Architecture
- **ReactFlow Components** (`components/reactflow.py`): Main graph visualization using ReactFlow
- **Template System** (`template.py`): Shared layout wrapper for pages

### Key Game Mechanics
- Users start by clicking "Sortear os Globais" to generate two random actors
- The system queries Neo4j to find all novelas and actors connected to current graph nodes
- Users can add new connections by typing actor/novela names and clicking "Adicionar"
- Graph automatically updates with new nodes and edges, repositioning elements dynamically
- Interactive table shows all available connections for the current graph state

### Data Flow
1. `GlobalService.get_random_global()` fetches random actors from Neo4j
2. `ReactFlowService.new_node()` creates positioned graph nodes
3. State queries find connected novelas/actors via `find_novelas_by_atores()` and `find_atores_by_novelas()`
4. User input triggers `add_node()` which searches records and creates new graph elements
5. ReactFlow handles user interactions (drag, connect) through event handlers

### Dependencies
- **reflex==0.8.2**: Web framework
- **neo4j==5.28.1**: Graph database driver
- **pynamodb==6.0.1**: DynamoDB ORM
- **python-dotenv==1.1.0**: Environment variable management

## File Organization
```
conecte_os_globais/
├── pages/           # Route handlers and page components
├── components/      # Reusable UI components (ReactFlow, Cytoscape)
├── src/            # Data access layer (Neo4j, DynamoDB, Neptune)
├── state.py        # Base state management
├── template.py     # Shared page template
└── conecte_os_globais.py  # Main app configuration
```