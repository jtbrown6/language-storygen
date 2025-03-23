# Story Generator - Language Learning Application

A Docker-containerized web application that generates custom Spanish stories based on user-defined parameters, helping language learners practice specific grammar concepts.

## Features

- **Custom Story Generation**: Create stories or conversations based on a scenario of your choice
- **Customizable Parameters**:
  - Specify verbs to include
  - Set indirect object usage level (1-3)
  - Set reflexive verb usage level (1-3)
  - Toggle idiomatic expressions
  - Select difficulty level (A1, A2, B1, B2)
- **Translation Features**:
  - Inline translation for individual words and phrases
  - Full story translation with show/hide option
- **Study Tools**:
  - Save words and phrases to a study list
  - Save generated stories for future reference
- **Containerized Deployment**:
  - Docker containers for both frontend and backend
  - Easy deployment with Docker Compose

## Future Enhancements

- **Tab Session Consistency**: Currently when looking for verbs and going back to generator tab, the screen refreshes and user looses their written responses
- **Audio Integration**: Text-to-speech functionality for stories
- **Persistent Storage**: Change the volume to mount from the host instead of a docker-volume to control the data
- **User Authentication**: Personal accounts to save progress
- **Extended Language Support**: Add more languages beyond Spanish
- **Progress Tracking**: Track mastered vocabulary and grammar concepts

## Tech Stack

- **Frontend**:
  - React.js
  - Context API for state management
  - Responsive design with CSS
  - Interactive word selection for translations

- **Backend**:
  - Node.js with Express
  - OpenAI API integration for story generation and translation
  - RESTful API design

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/jtbrown6/language-storygen.git
   cd story-generator
   ```

2. Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start the application:
   ```
   docker-compose up
   ```

4. Access the application at http://localhost:3000

### Development

For development with hot-reloading:

```
docker-compose -f docker-compose.dev.yml up
```

#### Production - DockerHost

Within my personal environment, this application is running on a DockerHost VM with multiple containers. We need to change the exposed ports on the frontend to the `XXX2` octet so the exposed ports are `3002` and `5002` respectively.

```bash
docker compose --build
docker compose up -d
```

## API Endpoints

### Story Endpoints
- `POST /api/story/generate` - Generate a new story
- `GET /api/story` - Get all saved stories
- `GET /api/story/:id` - Get a specific story
- `POST /api/story/save` - Save a story
- `DELETE /api/story/:id` - Delete a story
- `GET /api/story/random-scenario` - Get a random scenario

### Translation Endpoints
- `POST /api/translate/inline` - Translate a word or phrase
- `POST /api/translate/full` - Translate a full story

### Study List Endpoints
- `GET /api/study-list` - Get all study list items
- `POST /api/study-list` - Add an item to the study list
- `DELETE /api/study-list/:id` - Remove an item from the study list
- `GET /api/study-list/:id` - Get a specific study item


## License

MIT
