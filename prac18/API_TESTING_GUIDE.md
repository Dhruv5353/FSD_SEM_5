# Notes API Testing Guide

## Setup Instructions

1. **Install Dependencies:**

   ```bash
   cd "e:\FSD Lab\prac18"
   npm install
   ```

2. **Setup MongoDB:**

   - Install MongoDB locally OR use MongoDB Atlas
   - Update `.env` file with your MongoDB connection string
   - Default: `mongodb://localhost:27017/notesapp`

3. **Start the Server:**

   ```bash
   npm run dev
   # or
   npm start
   ```

4. **Verify Setup:**
   - Open: http://localhost:5000/api/health
   - Should show API health status

## API Endpoints Testing

### Base URL: `http://localhost:5000/api`

---

## 1. **Health Check**

**GET** `/api/health`

- **Purpose:** Check if API is running
- **Expected Response:** 200 OK with server status

---

## 2. **API Documentation**

**GET** `/api`

- **Purpose:** View all available endpoints
- **Expected Response:** 200 OK with API documentation

---

## 3. **Create Note**

**POST** `/api/notes`

**Headers:**

```
Content-Type: application/json
```

**Sample Request Body:**

```json
{
  "title": "My First Note",
  "content": "This is the content of my first note. It contains important information.",
  "tags": ["personal", "important"],
  "priority": "high"
}
```

**Expected Response:** 201 Created

```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "...",
    "title": "My First Note",
    "content": "This is the content of my first note...",
    "tags": ["personal", "important"],
    "priority": "high",
    "createdAt": "2024-...",
    "updatedAt": "2024-...",
    "isArchived": false
  }
}
```

---

## 4. **Get All Notes**

**GET** `/api/notes`

**Query Parameters (Optional):**

- `page=1` - Page number
- `limit=10` - Items per page
- `priority=high` - Filter by priority
- `search=important` - Search term
- `archived=false` - Show archived notes
- `sortBy=createdAt` - Sort field
- `sortOrder=desc` - Sort order

**Sample URLs:**

- `/api/notes` - Get all notes
- `/api/notes?page=1&limit=5` - Pagination
- `/api/notes?priority=high` - Filter by priority
- `/api/notes?search=important` - Search notes

**Expected Response:** 200 OK with notes array and pagination info

---

## 5. **Get Single Note**

**GET** `/api/notes/:id`

**Example:** `/api/notes/647abc123def456789012345`

**Expected Response:** 200 OK with single note data

---

## 6. **Update Note**

**PUT** `/api/notes/:id`

**Headers:**

```
Content-Type: application/json
```

**Sample Request Body:**

```json
{
  "title": "Updated Note Title",
  "content": "Updated content with new information.",
  "tags": ["updated", "modified"],
  "priority": "medium"
}
```

**Expected Response:** 200 OK with updated note data

---

## 7. **Archive/Unarchive Note**

**PATCH** `/api/notes/:id/archive`

**Expected Response:** 200 OK with toggled archive status

---

## 8. **Delete Note**

**DELETE** `/api/notes/:id`

**Expected Response:** 200 OK with deleted note data

---

## 9. **Get Notes by Priority**

**GET** `/api/notes/priority/:priority`

**Examples:**

- `/api/notes/priority/high`
- `/api/notes/priority/medium`
- `/api/notes/priority/low`

**Expected Response:** 200 OK with filtered notes

---

## 10. **Search Notes**

**GET** `/api/notes/search/:term`

**Example:** `/api/notes/search/important`

**Expected Response:** 200 OK with matching notes

---

## Sample Test Data

### Test Note 1:

```json
{
  "title": "Meeting Notes",
  "content": "Discussed project timeline and deliverables. Need to follow up on resource allocation.",
  "tags": ["work", "meeting", "project"],
  "priority": "high"
}
```

### Test Note 2:

```json
{
  "title": "Shopping List",
  "content": "Milk, Bread, Eggs, Apples, Bananas, Chicken",
  "tags": ["personal", "shopping"],
  "priority": "low"
}
```

### Test Note 3:

```json
{
  "title": "Book Ideas",
  "content": "Collection of interesting book recommendations from friends and colleagues.",
  "tags": ["books", "reading", "personal"],
  "priority": "medium"
}
```

### Test Note 4:

```json
{
  "title": "Travel Planning",
  "content": "Research destinations for summer vacation. Consider budget, weather, and activities.",
  "tags": ["travel", "vacation", "planning"],
  "priority": "medium"
}
```

---

## Testing Scenarios

### Scenario 1: Basic CRUD Operations

1. Create a new note
2. Get all notes (verify creation)
3. Get the specific note by ID
4. Update the note
5. Delete the note

### Scenario 2: Search and Filter

1. Create multiple notes with different priorities
2. Search by keyword
3. Filter by priority
4. Test pagination

### Scenario 3: Archive Functionality

1. Create a note
2. Archive the note
3. Verify it doesn't appear in regular listing
4. Get archived notes
5. Unarchive the note

### Scenario 4: Validation Testing

1. Try creating note without title (should fail)
2. Try creating note without content (should fail)
3. Try creating note with invalid priority (should fail)
4. Try accessing non-existent note ID (should return 404)

### Scenario 5: Edge Cases

1. Create note with maximum length content
2. Create note with empty tags array
3. Search with special characters
4. Test pagination with large datasets

---

## Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Note not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Failed to create note",
  "error": "Detailed error message"
}
```

---

## Postman Collection Import

You can import this API into Postman using the following collection:

1. Open Postman
2. Click "Import"
3. Create new requests for each endpoint above
4. Set the base URL to `http://localhost:5000`
5. Add the request bodies and headers as specified

---

## MongoDB Database Structure

After testing, you can verify the data in MongoDB:

**Database:** `notesapp`
**Collection:** `notes`

**Sample Document:**

```json
{
  "_id": ObjectId("..."),
  "title": "My Note",
  "content": "Note content...",
  "tags": ["tag1", "tag2"],
  "priority": "medium",
  "isArchived": false,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("..."),
  "__v": 0
}
```
