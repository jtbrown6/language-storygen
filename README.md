# Language Story Generator - Advanced Spanish Learning Application

A comprehensive Docker-containerized web application that generates custom Spanish stories with advanced features including audio pronunciation, mobile-optimized text selection, password authentication, and intelligent study tools.

## 🚀 Features

### **Story Generation**
- **Custom Story Creation**: Generate stories or conversations based on user-defined scenarios
- **Advanced Parameters**:
  - Specify verbs to include in stories
  - Set indirect object usage level (1-3)
  - Set reflexive verb usage level (1-3)
  - Toggle idiomatic expressions
  - Select difficulty level (A1, A2, B1, B2)
  - Choose between story and conversation formats

### **🎵 Audio Features**
- **Word/Phrase Pronunciation**: Tap any selected text to hear Spanish pronunciation
- **Full Story Audio**: Complete story narration with play/pause/seek controls
- **Mobile-Optimized Audio**: Touch-friendly controls with proper buffering
- **High-Quality TTS**: OpenAI "nova" voice at optimized learning speed

### **📱 Mobile-First Design**
- **Touch Text Selection**: Double-tap words, long-press sentences
- **Mobile-Responsive Header**: 2x2 grid navigation on mobile devices
- **Touch-Friendly Controls**: 48px+ touch targets for optimal mobile experience
- **Haptic Feedback**: Vibration feedback on supported devices

### **🔐 Authentication & Security**
- **Password Protection**: Simple password authentication to protect API resources
- **Session Persistence**: 30-day session storage across browser sessions
- **Rate Limiting**: Protection against brute force attacks
- **Mobile-Optimized Login**: Beautiful full-screen login modal

### **📚 Translation & Study Tools**
- **Intelligent Translation**: Context-aware word and phrase translation
- **Interactive Text Selection**: Click, double-tap, or long-press for translations
- **Study List Management**: Save words and phrases with translations
- **Story Library**: Save and organize generated stories
- **Progress Tracking**: Track learning progress with saved vocabulary

### **🎨 User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Professional UI**: Modern gradient design with smooth animations
- **Loading States**: Clear feedback during story generation and audio loading
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠 Tech Stack

### **Frontend**
- **React.js** with Context API for state management
- **Mobile-First Responsive Design** with CSS Grid and Flexbox
- **Touch Gesture Support** for mobile text selection
- **HTML5 Audio API** for pronunciation and story audio
- **localStorage** for authentication and session management

### **Backend**
- **Node.js** with Express framework
- **OpenAI API Integration** for story generation, translation, and TTS
- **MongoDB** with Mongoose for data persistence
- **CORS Configuration** for production domain support
- **RESTful API Design** with comprehensive error handling

### **Infrastructure**
- **Docker & Docker Compose** for containerized deployment
- **Multi-stage Builds** for optimized production images
- **Health Checks** for service monitoring
- **Volume Management** for persistent data storage

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **OpenAI API Key** with access to GPT and TTS models
- **AWS EC2 Instance** (for production deployment)
- **Domain/Subdomain** (optional, for custom domain access)

## 🚀 Quick Start

### **1. Clone Repository**
```bash
git clone https://github.com/jtbrown6/language-storygen.git
cd language-storygen
```

### **2. Environment Configuration**
Create a `.env` file in the root directory:

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Required: Authentication Password
REACT_APP_PASSWORD=your_secure_password_here

# Optional: Custom API URL (defaults to localhost for development)
REACT_APP_API_URL=http://localhost:5000

# Optional: Additional CORS origins
CORS_ORIGIN=https://yourdomain.com,http://your-ip:port
```

### **3. Development Setup**
```bash
# Start development environment with hot-reloading
docker-compose -f docker-compose.dev.yml up --build

# Access application
open http://localhost:3000
```

### **4. Production Deployment**
```bash
# Build and start production environment
docker-compose up --build -d

# Access application (adjust ports as configured)
open http://your-server-ip:3002
```

## 🌐 Production Deployment Guide

### **AWS EC2 Setup**

#### **1. Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **2. Application Deployment**
```bash
# Clone repository
git clone https://github.com/jtbrown6/language-storygen.git
cd language-storygen

# Configure environment
cp .env.example .env
nano .env  # Edit with your values
```

#### **3. Production Environment Variables**
```bash
# .env file for production
OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_PASSWORD=your_secure_password_here
REACT_APP_API_URL=http://3.227.197.24:5002
CORS_ORIGIN=https://storytime.komebacklans.lan,http://3.227.197.24:3020
```

#### **4. Deploy Application**
```bash
# Build and start services
docker-compose up --build -d

# Verify deployment
docker-compose ps
docker-compose logs -f
```

### **Domain Configuration**

#### **ElasticIP Setup**
- **Frontend**: `http://3.227.197.24:3020`
- **Backend**: `http://3.227.197.24:5002`
- **MongoDB**: `3.227.197.24:27017` (internal)

#### **Cloudflare Tunnel**
- **Domain**: `https://storytime.komebacklans.lan`
- **Target**: `http://3.227.197.24:3020`
- **CORS**: Automatically configured for both domains

### **Port Configuration**
The production setup uses custom ports to avoid conflicts:
- **Frontend**: `3002` (mapped to container port 3000)
- **Backend**: `5002` (mapped to container port 5000)
- **MongoDB**: `27017` (standard MongoDB port)

## 📡 API Documentation

### **Story Endpoints**
```
POST   /api/story/generate        # Generate new story
GET    /api/story                 # Get all saved stories
GET    /api/story/:id             # Get specific story
POST   /api/story/save            # Save a story
DELETE /api/story/:id             # Delete story
GET    /api/story/random-scenario # Get random scenario
```

### **Translation Endpoints**
```
POST   /api/translate/inline      # Translate word/phrase
POST   /api/translate/full        # Translate full story
```

### **Audio Endpoints** *(New)*
```
POST   /api/audio/pronounce       # Generate pronunciation audio
POST   /api/audio/story           # Generate full story audio
```

### **Study List Endpoints**
```
GET    /api/study-list            # Get all study items
POST   /api/study-list            # Add study item
DELETE /api/study-list/:id        # Remove study item
GET    /api/study-list/:id        # Get specific study item
```

### **Health Check**
```
GET    /api/health/check          # Service health status
```

## 📱 Mobile Features Guide

### **Text Selection Methods**
- **Single Tap**: Quick word selection (fallback)
- **Double Tap**: Enhanced word selection with visual feedback
- **Long Press (500ms)**: Sentence selection with haptic feedback

### **Audio Controls**
- **Word Audio**: Tap speaker icon in translation tooltips
- **Story Audio**: Use play/pause controls in story panel
- **Progress Control**: Tap progress bar to seek to specific time

### **Mobile Navigation**
- **Header Layout**: Title at top, 2x2 button grid below
- **Touch Targets**: Minimum 48px for optimal touch interaction
- **Responsive Design**: Adapts to all screen sizes

## 🔐 Authentication Guide

### **Password Setup**
1. Set `REACT_APP_PASSWORD` in your `.env` file
2. Users enter password once per browser/device
3. Session persists for 30 days
4. Rate limiting prevents brute force attacks

### **Security Features**
- **Session Management**: Secure localStorage with expiration
- **Rate Limiting**: 5 attempts per 5 minutes
- **Input Validation**: Proper password sanitization
- **Auto-Logout**: Sessions expire after 30 days

## 🔧 Development Guide

### **Development Environment**
```bash
# Start development with hot-reloading
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up --build frontend
```

### **Environment Variables**
```bash
# Development .env
OPENAI_API_KEY=your_key_here
REACT_APP_PASSWORD=demo123
REACT_APP_API_URL=http://localhost:5000
```

### **File Structure**
```
language-storygen/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   └── Dockerfile.dev      # Development Dockerfile
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── utils/             # Server utilities
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
└── README.md              # This file
```

## 🐛 Troubleshooting

### **Common Issues**

#### **CORS Errors**
```bash
# Check allowed origins in server logs
docker-compose logs backend | grep CORS

# Verify environment variables
docker-compose exec backend env | grep CORS
```

#### **Authentication Issues**
```bash
# Check password environment variable
docker-compose exec frontend env | grep REACT_APP_PASSWORD

# Clear browser localStorage
# Open browser dev tools > Application > Local Storage > Clear
```

#### **Audio Not Working**
```bash
# Check OpenAI API key
docker-compose logs backend | grep "OpenAI"

# Verify audio endpoints
curl -X POST http://localhost:5002/api/audio/pronounce \
  -H "Content-Type: application/json" \
  -d '{"text": "hola"}'
```

#### **Mobile Issues**
- Ensure touch events are enabled
- Check viewport meta tag in HTML
- Verify CSS media queries are working
- Test on actual mobile devices

### **Performance Optimization**
- **Audio Caching**: Frequently used pronunciations are cached
- **Image Optimization**: Optimized Docker images for production
- **Database Indexing**: MongoDB indexes for faster queries
- **GZIP Compression**: Enabled for static assets

## 📊 Monitoring & Logs

### **Service Health**
```bash
# Check all services
docker-compose ps

# View service logs
docker-compose logs -f [service_name]

# Health check endpoint
curl http://localhost:5002/api/health/check
```

### **Database Management**
```bash
# Access MongoDB
docker-compose exec mongodb mongosh language-storygen

# Backup database
docker-compose exec mongodb mongodump --db language-storygen

# View database stats
docker-compose exec mongodb mongosh --eval "db.stats()"
```

## 🔄 Updates & Maintenance

### **Updating the Application**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Clean up old images
docker system prune -f
```

### **Database Migrations**
```bash
# Backup before updates
docker-compose exec mongodb mongodump --db language-storygen --out /backup

# Apply migrations (if any)
docker-compose exec backend npm run migrate
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Create an issue on GitHub
4. Include relevant logs and environment details

---

**Note**: This application is optimized for Spanish language learning but can be adapted for other languages by modifying the OpenAI prompts and TTS configuration.
