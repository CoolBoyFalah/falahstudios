# Falah Studios - Complete Setup Guide

## Project Overview

This is a production-grade full-stack application for Falah Studios consisting of:
- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: Express.js with TypeScript, MongoDB, and comprehensive error handling

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
yarn install

# Install workspace dependencies
cd apps/web && yarn install
cd ../api && yarn install
cd ../..
```

### 2. Environment Setup

#### Backend Setup (API)

```bash
# Create .env.local in apps/api/
cp apps/api/.env.example apps/api/.env.local

# Edit apps/api/.env.local with your values:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/falah-studios
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

#### Frontend Setup (Web)

```bash
# Create .env.local in apps/web/
cp apps/web/.env.example apps/web/.env.local

# Edit apps/web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

#### Local MongoDB

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/falah-studios?retryWrites=true&w=majority`
4. Add to `apps/api/.env.local`

### 4. Run the Application

#### Development Mode (Both apps)

```bash
# From root directory - starts both frontend and backend
yarn dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

#### Individual Development

```bash
# Terminal 1 - Backend
yarn api:dev

# Terminal 2 - Frontend
yarn web:dev
```

#### Production Build

```bash
# Build both applications
yarn build

# Start production server (API only, frontend is static)
yarn start
```

## Project Structure

```
falah-studios/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/              # Next.js pages and layouts
│   │   │   │   ├── admin/        # Admin dashboard
│   │   │   │   ├── layout.tsx    # Root layout
│   │   │   │   ├── page.tsx      # Home page
│   │   │   │   └── globals.css   # Global styles
│   │   │   ├── components/       # Reusable React components
│   │   │   ├── lib/              # API clients and utilities
│   │   │   ├── styles/           # Style files
│   │   │   └── types/            # TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   │
│   └── api/
│       ├── src/
│       │   ├── config/           # Database & app configuration
│       │   ├── controllers/      # Request handlers
│       │   ├── models/           # MongoDB schemas
│       │   ├── services/         # Business logic layer
│       │   ├── routes/           # API route definitions
│       │   ├── middleware/       # Express middleware
│       │   │   ├── auth.ts       # JWT authentication
│       │   │   ├── error-handler.ts
│       │   │   └── validation.ts
│       │   ├── utils/            # Utility functions
│       │   └── index.ts          # Express app entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── package.json                  # Root workspace config
└── README.md
```

## API Endpoints

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/slug/:slug` - Get service by slug
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Portfolio
- `GET /api/portfolio` - List all projects
- `GET /api/portfolio?category=web` - Filter by category
- `GET /api/portfolio/featured` - Get featured projects
- `GET /api/portfolio/:id` - Get project by ID
- `GET /api/portfolio/slug/:slug` - Get project by slug
- `POST /api/portfolio` - Create project (admin)
- `PUT /api/portfolio/:id` - Update project (admin)
- `DELETE /api/portfolio/:id` - Delete project (admin)

### Contact
- `GET /api/contact` - List all inquiries (admin)
- `GET /api/contact/:id` - Get inquiry (admin)
- `POST /api/contact` - Submit inquiry (public)
- `PATCH /api/contact/:id/status` - Update status (admin)
- `DELETE /api/contact/:id` - Delete inquiry (admin)

### Blog
- `GET /api/blog` - List published posts (paginated)
- `GET /api/blog?page=1&limit=10` - Pagination
- `GET /api/blog/:slug` - Get post by slug
- `POST /api/blog` - Create post (admin)
- `PUT /api/blog/:id` - Update post (admin)
- `DELETE /api/blog/:id` - Delete post (admin)

## Key Features

### Backend
✅ **Architecture**
- Controller → Service → Model pattern
- Comprehensive error handling
- Input validation with Joi
- TypeScript for type safety

✅ **Security**
- CORS protection
- Rate limiting (100 req/15min)
- Helmet.js for security headers
- Password hashing with bcryptjs
- JWT authentication

✅ **Database**
- MongoDB with Mongoose ODM
- Proper indexing and validation
- Cascade operations
- Timestamps on all models

✅ **Logging & Monitoring**
- Morgan request logging
- Error tracking
- Database connection monitoring

### Frontend
✅ **Performance**
- Server-side rendering
- Static site generation
- Image optimization
- Code splitting

✅ **UX/UI**
- Responsive design
- Dark theme
- Smooth animations (Framer Motion)
- Accessible components

✅ **Type Safety**
- Full TypeScript
- Component prop validation
- API response types

## Testing

```bash
# Run linting
yarn lint

# Type checking
yarn type-check
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect Vercel to repository
3. Set environment variables
4. Deploy automatically on push

### Backend (Render/Railway/Heroku)
1. Push to GitHub
2. Connect to deployment service
3. Set environment variables
4. Deploy automatically on push

### Database (MongoDB Atlas)
1. Create cluster on Atlas
2. Use connection string in API .env.local
3. Set up backup and monitoring

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
yarn install
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run `yarn lint` and `yarn type-check`
4. Create a pull request

## Support

For issues or questions, contact: support@falahstudios.com

## License

All rights reserved © Falah Studios
