# TuneForge

TuneForge is a sophisticated microservices-based music generation and analysis platform that converts musical notes into audio while providing mood analysis of the generated music.

## Demo
Watch the demo here: https://youtu.be/DuF4sxc7YPc

## Technical Overview

TuneForge employs a microservices architecture with the following key components:

1. **Core Backend Service** (Flask)
   - Orchestrates communication between microservices
   - Implements caching for improved performance
   - Handles file management and blob storage
   - Provides RESTful API endpoints

2. **Microservices**
   - Notes Converter: Transforms musical notes into MIDI format
   - Wave Exporter: Converts MIDI files to WAV format
   - Sound Mood Analyzer: Performs sentiment analysis on audio files

3. **Storage Solutions**
   - Azure Blob Storage for file management
   - PostgreSQL database for data persistence
   - Local cache implementation for performance optimization

## Technical Challenges & Solutions

### 1. Microservices Communication
**Challenge:** Maintaining reliable communication between distributed services
**Solution:** Implemented a robust service discovery mechanism with caching and error handling

### 2. Audio Processing Pipeline
**Challenge:** Managing the complex pipeline from notes to audio generation
**Solution:** Created a modular architecture with clear separation of concerns:
- Notes → MIDI conversion
- MIDI → WAV transformation
- Audio analysis for mood detection

### 3. Performance Optimization
**Challenge:** Handling potentially resource-intensive audio processing
**Solution:** 
- Implemented caching using Flask-Caching
- Efficient blob storage management
- Asynchronous processing where applicable

## Technology Stack

- **Backend Framework:** Flask
- **Cloud Storage:** Azure Blob Storage
- **Database:** PostgreSQL
- **Additional Libraries:**
  - flask-caching for performance optimization
  - psycopg for PostgreSQL interaction
  - azure-storage-blob for cloud storage management

## Setup and Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd TuneForge
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Required environment variables
CACHE_RESET_PWD=[your-cache-password]
# Azure Storage credentials
# Database credentials
```

4. Run the application:
```bash
python -m flask run
```

## API Endpoints

- `GET /`: Home page
- `POST /download`: Generate and download WAV file from notes
- `POST /get_mood`: Analyze the mood of generated music
- `POST /clearcache`: Clear system cache (requires authentication)

## Architecture Diagram

```
[Client] → [Flask Backend] → [Notes Converter Service]
                         → [Wave Exporter Service]
                         → [Sound Mood Service]
                         ↔ [Azure Blob Storage]
                         ↔ [PostgreSQL Database]
```
