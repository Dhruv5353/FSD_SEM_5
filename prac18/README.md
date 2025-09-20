# Notes API - Mobile Backend 📱📝

A robust RESTful API built with Express.js and MongoDB for a mobile notes-taking application. This backend provides comprehensive CRUD operations, search functionality, and data persistence for managing notes.

## 🚀 Features

- **Complete CRUD Operations** - Create, Read, Update, Delete notes
- **Advanced Search** - Search notes by title, content, or tags
- **Priority Management** - Categorize notes by priority (low, medium, high)
- **Archive Functionality** - Archive/unarchive notes
- **Pagination Support** - Efficient data retrieval with pagination
- **Data Validation** - Comprehensive input validation and error handling
- **Timestamps** - Automatic creation and update timestamps
- **Flexible Filtering** - Filter by priority, archive status, and search terms
- **Security** - Built-in security headers with Helmet.js
- **CORS Support** - Cross-origin resource sharing enabled
- **Environment Configuration** - Configurable via environment variables

## 📋 API Endpoints

### Core Operations

- `GET /api/notes` - Get all notes (with pagination and filtering)
- `GET /api/notes/:id` - Get specific note by ID
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note

### Additional Features

- `PATCH /api/notes/:id/archive` - Toggle archive status
- `GET /api/notes/priority/:priority` - Get notes by priority
- `GET /api/notes/search/:term` - Search notes

### Utility

- `GET /api/health` - Health check endpoint
- `GET /api` - API documentation

## 🗄️ Data Model

Each note contains:

- **title** (required) - Note title (max 100 characters)
- **content** (required) - Note content (max 5000 characters)
- **tags** (optional) - Array of tags for categorization
- **priority** (optional) - Priority level: low, medium, high
- **isArchived** - Archive status (default: false)
- **createdAt** - Auto-generated creation timestamp
- **updatedAt** - Auto-generated update timestamp

## 🛠️ Technology Stack

- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Express-validator
- **Security:** Helmet.js, CORS
- **Environment:** Node.js with dotenv

## 📦 Installation & Setup

1. **Clone/Navigate to project:**

   ```bash
   cd "e:\FSD Lab\prac18"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   - Copy `.env` file and configure your MongoDB connection
   - Default: `mongodb://localhost:27017/notesapp`

4. **Start MongoDB:**

   - Local: Start MongoDB service
   - Cloud: Use MongoDB Atlas connection string

5. **Run the application:**

   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify installation:**
   - Visit: http://localhost:5000/api/health
   - Should show API health status

## 🧪 Testing

The API can be tested using:

- **Postman** - Import endpoints from `API_TESTING_GUIDE.md`
- **curl** - Command line testing
- **Thunder Client** (VS Code extension)
- **Insomnia** - API testing tool

### Quick Test Example:

```bash
# Health check
curl http://localhost:5000/api/health

# Create a note
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note",
    "priority": "medium"
  }'

# Get all notes
curl http://localhost:5000/api/notes
```

## 📊 Query Parameters

### GET /api/notes supports:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `priority` - Filter by priority (low/medium/high)
- `search` - Search term for title/content/tags
- `archived` - Show archived notes (true/false)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

## 🔒 Security Features

- **Input Validation** - All inputs validated and sanitized
- **Error Handling** - Comprehensive error handling with appropriate HTTP status codes
- **Security Headers** - Added via Helmet.js
- **CORS** - Configurable cross-origin resource sharing
- **Data Limits** - Request size limits to prevent abuse

## 🌐 Environment Variables

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/notesapp

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
API_VERSION=v1
```

## 📱 Mobile App Integration

This API is designed for mobile applications with:

- **Lightweight responses** - Optimized JSON responses
- **Pagination** - Efficient data loading for mobile
- **Search capabilities** - Quick note discovery
- **Offline sync ready** - Structure supports offline-first apps
- **RESTful design** - Standard HTTP methods and status codes

## 🔧 Development

### Project Structure:

```
prac18/
├── models/
│   └── Note.js          # Mongoose schema and model
├── routes/
│   └── notes.js         # API route handlers
├── server.js            # Main application file
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
├── README.md            # Project documentation
└── API_TESTING_GUIDE.md # Comprehensive testing guide
```

### Adding New Features:

1. Update the Note model in `models/Note.js`
2. Add new routes in `routes/notes.js`
3. Update validation rules as needed
4. Test thoroughly with various scenarios

## 🚀 Deployment

For production deployment:

1. **Environment Variables:**

   - Set `NODE_ENV=production`
   - Use production MongoDB connection string
   - Configure appropriate PORT

2. **Database:**

   - Use MongoDB Atlas or managed MongoDB service
   - Ensure proper indexing for performance
   - Set up automated backups

3. **Hosting Options:**
   - Heroku, Vercel, AWS, DigitalOcean
   - Ensure MongoDB connectivity
   - Configure environment variables

## 📈 Performance Considerations

- **Database Indexing** - Text indexes on title/content for search
- **Pagination** - Prevents large data transfers
- **Validation** - Client-side and server-side validation
- **Error Handling** - Graceful error responses
- **Connection Pooling** - MongoDB connection optimization

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly before submission

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Happy Coding! 🎉**

For detailed testing instructions, see `API_TESTING_GUIDE.md`
