# Falah Studios Web Frontend

Modern, high-performance Next.js frontend for Falah Studios.

## Features

- ✨ Modern, responsive UI with Tailwind CSS
- 🎯 SEO optimized with Next.js
- ⚡ Server components & static generation
- 🔐 Secure API communication
- 📱 Mobile-first design
- 🎨 Beautiful animations with Framer Motion

## Getting Started

```bash
# Install dependencies
yarn install

# Set environment variables
cp .env.example .env.local

# Run development server
yarn dev

# Open http://localhost:3000
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # Reusable React components
├── lib/             # Utilities and API clients
├── styles/          # Global styles
└── types/           # TypeScript types
```

## Building

```bash
yarn build
yarn start
```
