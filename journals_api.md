# Journals API Documentation

## Overview

The Journals API allows users to create and manage video journal entries. Users can take notes while watching YouTube videos, with automatic metadata enrichment (thumbnails, captions, etc.).

---

## Authentication

All journal endpoints require authentication. Include a valid Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Create Journal

Create a new journal entry with a video URL and title.

**Endpoint:** `POST /journals`

**Request Body:**

```json
{
  "title": "My YouTube Notes",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "content": "Initial notes (optional)"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Journal entry title |
| `video_url` | string | Yes | YouTube video URL |
| `content` | string | No | Initial journal content/notes |

**Response:** `201 Created`

```json
{
  "id": 1,
  "title": "My YouTube Notes",
  "content": "Initial notes (optional)",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "video_type": "youtube",
  "video_timestamp": 0,
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "caption": {
    "tracks": [
      {"language": "en", "name": "English", "is_default": true}
    ]
  },
  "is_public": false,
  "slug": "",
  "tags": [],
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:00:00Z"
}
```

**Auto-populated fields on creation:**
- `thumbnail_url` - Fetched from YouTube API or constructed from video ID
- `video_type` - Set to "youtube"
- `caption` - Available caption tracks from YouTube API

---

### 2. List Journals

Retrieve a paginated list of journals with optional title filtering.

**Endpoint:** `GET /journals`

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `title` | string | "" | - | Filter by title (case-insensitive partial match) |
| `page` | int | 1 | - | Page number |
| `limit` | int | 10 | 100 | Items per page |

**Example Request:**

```
GET /journals?title=golang&page=1&limit=10
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 5,
      "title": "Golang Tutorial Notes",
      "content": "Learned about goroutines...",
      "video_url": "https://www.youtube.com/watch?v=abc123",
      "video_type": "youtube",
      "video_timestamp": 120,
      "thumbnail_url": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
      "caption": {},
      "is_public": false,
      "slug": "golang-tutorial-notes",
      "tags": ["golang", "tutorial"],
      "created_at": "2026-02-26T10:00:00Z",
      "updated_at": "2026-02-26T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

**Notes:**
- Results are ordered by `id DESC` (newest first)
- `total` represents the total count of matching records (for pagination)

---

### 3. Get Journal Detail

Retrieve a single journal entry by ID.

**Endpoint:** `GET /journals/:id`

**Example Request:**

```
GET /journals/1
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "title": "My YouTube Notes",
  "content": "Detailed notes about the video...",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "video_type": "youtube",
  "video_timestamp": 350,
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "caption": {
    "tracks": [
      {"language": "en", "name": "English", "is_default": true},
      {"language": "es", "name": "Spanish", "is_default": false}
    ]
  },
  "is_public": true,
  "slug": "my-youtube-notes",
  "tags": ["learning", "video"],
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T12:00:00Z"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 404 | journal not found |
| 400 | invalid journal id |

---

### 4. Update Journal

Update any field(s) of an existing journal entry.

**Endpoint:** `PUT /journals/:id`

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content with more notes...",
  "video_timestamp": 450,
  "is_public": true,
  "slug": "my-shareable-notes",
  "tags": ["golang", "backend", "tutorial"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Update title |
| `content` | string | Update journal content |
| `video_url` | string | Change video URL (triggers re-enrichment) |
| `video_type` | string | Update video type |
| `video_timestamp` | int | Current position in video (seconds) |
| `thumbnail_url` | string | Custom thumbnail URL |
| `caption` | object | Custom caption data |
| `is_public` | boolean | Set public/private visibility |
| `slug` | string | URL-friendly identifier |
| `tags` | string[] | Array of tags |

**Response:** `200 OK`

Returns the updated journal object (same format as Get Journal Detail).

**Notes:**
- Only provided fields are updated (partial update)
- Changing `video_url` triggers YouTube metadata re-enrichment
- Empty strings are ignored (fields retain previous values)

---

### 5. Delete Journal

Delete a journal entry by ID.

**Endpoint:** `DELETE /journals/:id`

**Example Request:**

```
DELETE /journals/1
```

**Response:** `200 OK`

```json
{
  "message": "deleted"
}
```

---

## Data Models

### Journal

| Field | Type | Description |
|-------|------|-------------|
| `id` | int64 | Unique identifier |
| `title` | string | Journal entry title |
| `content` | string | Main journal content/notes |
| `video_url` | string | YouTube video URL |
| `video_type` | string | Video platform (default: "youtube") |
| `video_timestamp` | int | Current video position in seconds |
| `thumbnail_url` | string | Video thumbnail URL |
| `caption` | object | JSONB caption data |
| `is_public` | boolean | Public visibility flag |
| `slug` | string | URL-friendly identifier |
| `tags` | string[] | Array of category tags |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |

### Caption Data Structure (JSONB)

```json
{
  "tracks": [
    {
      "language": "en",
      "name": "English",
      "is_default": true
    },
    {
      "language": "es",
      "name": "Spanish",
      "is_default": false
    }
  ]
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT` | No* | Google Service Account JSON for YouTube API |

*If not set, thumbnail URLs are constructed directly from video IDs without API calls.

**Example:**

```bash
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"my-service@my-project.iam.gserviceaccount.com",...}'
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Database Migration

Run the migration before using the API:

```bash
# Using your migration tool
make migrate-up

# Or manually
psql -d myfutureme -f db/migrations/006_create_journals.sql
```

---

## Usage Examples

### cURL

**Create a journal:**

```bash
curl -X POST https://api.example.com/journals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learning Go","video_url":"https://www.youtube.com/watch?v=CF9S4qZu5g8"}'
```

**List journals:**

```bash
curl -X GET "https://api.example.com/journals?title=go&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update a journal:**

```bash
curl -X PUT https://api.example.com/journals/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Notes from the video...","tags":["golang","learning"]}'
```

**Delete a journal:**

```bash
curl -X DELETE https://api.example.com/journals/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
