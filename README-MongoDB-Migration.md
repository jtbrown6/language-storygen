# MongoDB Migration Guide

This guide walks you through the process of migrating your Language StoryGen application to use MongoDB for persistent storage across devices.

## Overview of Changes

- Added MongoDB as a database service in Docker Compose
- Created database models for Stories and Study Items
- Updated server controllers to use MongoDB instead of in-memory storage
- Ensured frontend code works with MongoDB's ID format (_id)
- Created data migration utilities

## Migration Steps

### 1. Backup Current Data

Before starting the migration, extract the current in-memory data:

```bash
# Run the extraction script to backup current data
cd server
node utils/extractCurrentData.js
```

This will create backup files in the `server/data` directory.

### 2. Stop the Current Application

```bash
# Stop and remove existing containers
docker-compose down
```

### 3. Build and Start the MongoDB-enabled Application

```bash
# Build and start the new version with MongoDB
docker-compose up --build -d
```

The application will now be running with MongoDB for persistent storage. You may need to wait a minute for MongoDB to initialize properly.

### 4. Migrate Existing Data (if needed)

If you had existing stories or study items, migrate them to MongoDB:

```bash
# Connect to the backend container
docker-compose exec backend bash

# Inside the container, run the migration script
cd /app
node utils/migrateData.js

# Exit the container
exit
```

### 5. Verify the Migration

- Open the application in your browser (http://192.168.1.214:3002)
- Check that any previously saved stories and study items are available
- Try creating a new story and study item
- Access the application from a different device or browser to verify that data persists

## How It Works

- Data is now stored in MongoDB, which persists even when the application restarts
- Data is accessible from any device or browser since it's stored on the server
- The application still has a local storage fallback if the server is temporarily unavailable

## Troubleshooting

If you encounter any issues:

1. Check the container logs:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f mongodb
   ```

2. Verify MongoDB connection:
   ```bash
   docker-compose exec mongodb mongosh language-storygen
   # Inside MongoDB shell
   db.stories.find()
   db.studyitems.find()
   # Exit MongoDB shell
   exit
   ```

3. If needed, restart the application:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Database Backup

To backup your MongoDB data:

```bash
# Create a directory for backups if it doesn't exist
mkdir -p mongodb-backups

# Backup the database
docker-compose exec mongodb mongodump --out=/data/db/backup --db=language-storygen

# Copy the backup from the container to your host
docker cp $(docker-compose ps -q mongodb):/data/db/backup ./mongodb-backups/
```

## Database Restore

To restore from a backup:

```bash
# Copy the backup to the container
docker cp ./mongodb-backups/backup $(docker-compose ps -q mongodb):/data/db/

# Restore the database
docker-compose exec mongodb mongorestore --db=language-storygen /data/db/backup/language-storygen
