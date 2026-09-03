# Falah Studios API

Production-grade backend API built with Express.js, TypeScript, and MongoDB.

## Features

- ✅ Comprehensive error handling
- ✅ Input validation & sanitization
- ✅ TypeScript throughout
- ✅ MongoDB/Mongoose integration
- ✅ JWT authentication & authorization
- ✅ Rate limiting & security headers (Helmet)
- ✅ Request logging (Morgan)
- ✅ CORS support
- ✅ RESTful API architecture
- ✅ Async/await error handling

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB instance (local or cloud)

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local

# Run development server
yarn dev
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/falah-studios
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/slug/:slug` - Get service by slug
- `POST /api/services` - Create new service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Portfolio
- `GET /api/portfolio` - Get all projects
- `GET /api/portfolio/featured` - Get featured projects
- `GET /api/portfolio/:id` - Get project by ID
- `GET /api/portfolio/slug/:slug` - Get project by slug
- `POST /api/portfolio` - Create project (admin only)
- `PUT /api/portfolio/:id` - Update project (admin only)
- `DELETE /api/portfolio/:id` - Delete project (admin only)

### Contact
- `GET /api/contact` - Get all inquiries (admin only)
- `GET /api/contact/:id` - Get inquiry by ID (admin only)
- `POST /api/contact` - Create new inquiry
- `PATCH /api/contact/:id/status` - Update inquiry status (admin only)
- `DELETE /api/contact/:id` - Delete inquiry (admin only)

### Blog
- `GET /api/blog` - Get all published posts (paginated)
- `GET /api/blog/:slug` - Get post by slug
- `POST /api/blog` - Create post (admin only)
- `PUT /api/blog/:id` - Update post (admin only)
- `DELETE /api/blog/:id` - Delete post (admin only)

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── models/          # Mongoose schemas
├── services/        # Business logic
├── middleware/      # Express middleware
├── routes/          # API routes
├── utils/           # Utilities
└── index.ts         # Entry point
```

## Building

```bash
yarn build
yarn start
```

## Testing

```bash
yarn test
```

## Error Handling

All errors are handled consistently with the following response format:

```json
{
  "success": false,
  "message": "Error message",
  "details": {}
}
```

## Security

- CORS enabled for frontend origin
- Helmet for security headers
- Rate limiting on all API routes
- Password hashing with bcryptjs
- JWT for authentication
- Input validation with Joi
