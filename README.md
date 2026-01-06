# NEBULYTIX NEWS

A modern, premium news application featuring an interactive 3D globe, smooth animations, and a sleek dark/light mode interface.

## Running the Frontend

```bash
npm install
npm run dev
```

## Features

- Interactive 3D news globe with particle effects
- Animated news cards with hover effects
- Dark/light theme with smooth transitions
- Category filtering
- Save articles functionality
- Responsive glassmorphism design

## Environment Variables

For future backend integration:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## API Endpoints (Backend - Coming Soon)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | User authentication |
| GET | /api/news | Fetch news articles |
| POST | /api/news/save | Save an article (protected) |