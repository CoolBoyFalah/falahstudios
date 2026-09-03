# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "details": { ... }
}
```

## Endpoints

### Health Check
```
GET /health
```

### Services

#### Get All Services
```
GET /services
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Web Development",
      "slug": "web-development",
      "description": "...",
      "icon": "🌐",
      "features": ["..."],
      "price": 5000,
      "deliveryTime": "4-6 weeks",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Service by ID
```
GET /services/:id
```

#### Get Service by Slug
```
GET /services/slug/:slug
```

#### Create Service (Admin)
```
POST /services
Authorization: Bearer <token>

Body:
{
  "title": "Service Name",
  "description": "Description",
  "icon": "🎨",
  "features": ["Feature 1", "Feature 2"],
  "price": 5000,
  "deliveryTime": "4-6 weeks"
}
```

#### Update Service (Admin)
```
PUT /services/:id
Authorization: Bearer <token>

Body:
{
  "title": "Updated Name",
  ...
}
```

#### Delete Service (Admin)
```
DELETE /services/:id
Authorization: Bearer <token>
```

### Portfolio

#### Get All Projects
```
GET /portfolio
Query Params:
  - category: "Web Development" | "Branding" | "Content" | "Automation" | "Marketing"
```

#### Get Featured Projects
```
GET /portfolio/featured
```

#### Get Project by ID
```
GET /portfolio/:id
```

#### Get Project by Slug
```
GET /portfolio/slug/:slug
```

#### Create Project (Admin)
```
POST /portfolio
Authorization: Bearer <token>

Body:
{
  "title": "Project Name",
  "description": "Full description",
  "shortDescription": "Short summary",
  "category": "Web Development",
  "image": "image-url",
  "images": ["url1", "url2"],
  "link": "https://project-link.com",
  "technologies": ["React", "Node.js"],
  "results": ["300% increase in engagement"],
  "clientName": "Client Name",
  "startDate": "2024-01-01",
  "endDate": "2024-03-01",
  "featured": true
}
```

### Contact Inquiries

#### Get All Inquiries (Admin)
```
GET /contact
Query Params:
  - status: "new" | "read" | "responded" | "archived"
Authorization: Bearer <token>
```

#### Create Inquiry (Public)
```
POST /contact

Body:
{
  "name": "Name",
  "email": "email@example.com",
  "phone": "+971...",
  "company": "Company Name",
  "message": "Message content",
  "budget": "10,000 - 50,000 AED",
  "services": ["Web Development", "Branding"]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Message received. We'll get back to you soon!"
}
```

#### Update Inquiry Status (Admin)
```
PATCH /contact/:id/status
Authorization: Bearer <token>

Body:
{
  "status": "read" | "responded" | "archived"
}
```

### Blog

#### Get All Posts
```
GET /blog
Query Params:
  - page: number (default: 1)
  - limit: number (default: 10)
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "_id": "...",
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "Short excerpt",
      "content": "Full content",
      "author": "Author Name",
      "category": "Technology",
      "image": "image-url",
      "tags": ["tag1", "tag2"],
      "published": true,
      "views": 150,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Get Post by Slug
```
GET /blog/:slug
```

#### Create Post (Admin)
```
POST /blog
Authorization: Bearer <token>

Body:
{
  "title": "Blog Title",
  "excerpt": "Summary",
  "content": "Full content",
  "author": "Author Name",
  "category": "Technology",
  "image": "image-url",
  "tags": ["tag1", "tag2"],
  "published": false
}
```

#### Update Post (Admin)
```
PUT /blog/:id
Authorization: Bearer <token>

Body:
{
  "title": "Updated Title",
  ...
}
```

#### Delete Post (Admin)
```
DELETE /blog/:id
Authorization: Bearer <token>
```

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for resource |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Rate Limiting

- Limit: 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Example Requests

### cURL

```bash
# Get all services
curl http://localhost:5000/api/services

# Create contact inquiry
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I need a website"
  }'

# Get blog posts
curl "http://localhost:5000/api/blog?page=1&limit=5"
```

### JavaScript/Fetch

```javascript
// Get services
const response = await fetch('http://localhost:5000/api/services');
const data = await response.json();

// Post inquiry
const response = await fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'I need a website'
  })
});
```

## Pagination

All list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response includes:**
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```
