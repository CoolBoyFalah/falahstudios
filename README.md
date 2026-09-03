# Falah Studios - Full Stack Application

A production-grade, full-stack web application with an **exceptionally designed frontend** and **flawless backend infrastructure**. Built with Next.js, TypeScript, Express, and MongoDB.

## 🎨 Frontend Highlights

✨ **Completely Redesigned UI/UX** with:
- Modern interactive components (tabbed services, carousel testimonials, filterable portfolio)
- Smooth Framer Motion animations throughout
- Bold, modern typography hierarchy
- Responsive design for all devices
- Dark theme with amber accents
- High performance and accessibility

See [FRONTEND_REDESIGN.md](./FRONTEND_REDESIGN.md) and [apps/web/DESIGN_GUIDE.md](./apps/web/DESIGN_GUIDE.md) for detailed documentation.

## 🏗️ Architecture

This is a monorepo with two main applications:

- **`apps/web`** - Next.js 14 frontend with TypeScript (Completely redesigned)
- **`apps/api`** - Express.js backend API with TypeScript (Production-ready)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Yarn
- MongoDB instance (local or cloud)

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

### Development

```bash
# Start both frontend and backend
yarn dev

# Or run individually
yarn web:dev   # Frontend on http://localhost:3000
yarn api:dev   # API on http://localhost:5000
```

### Build & Deploy

```bash
# Build both applications
yarn build

# Start production API server
yarn start
```

## 📁 Project Structure

```
falah-studios/
├── apps/
│   ├── web/              # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   ├── lib/      # Utilities, hooks, API clients
│   │   │   ├── styles/   # Global styles
│   │   │   └── types/    # TypeScript types
│   │   └── public/
│   └── api/              # Express Backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── types/
│       └── tests/
├── package.json
└── README.md
```

## 🔑 Key Features

### Frontend
- ✨ Modern, responsive UI with Tailwind CSS
- 🎯 SEO optimized (metadata, structured data)
- ⚡ Server components & static generation
- 🔐 Secure API communication
- 📱 Mobile-first design

### Backend
- 🛡️ Comprehensive error handling
- ✅ Input validation & sanitization
- 🔑 JWT authentication & authorization
- 📊 Request logging & monitoring
- 🗄️ MongoDB with Mongoose
- 🚀 RESTful API architecture
- 📚 Comprehensive API documentation

## 📚 API Documentation

See `apps/api/API.md` for complete API documentation.

## 🧪 Testing

```bash
# Run tests
yarn test

# Run with coverage
yarn test:coverage
```

## 📦 Environment Variables

See `.env.example` files in each app directory.

## 🤝 Contributing

Follow the existing code style and structure.

## 📄 License

All rights reserved © Falah Studios
