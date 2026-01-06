# Nebulytix News - The Future Feed

A modern, production-ready news application built with the MERN stack (MongoDB, Express, React, Node.js). Features Clerk authentication, an admin panel, and a sleek, BBC/Google News-inspired UI.


## 🚀 Features

### Core Features
- **📰 Dynamic News Feed** - Browse 100+ categorized news articles with infinite scroll
- **🔐 Clerk Authentication** - Secure user login/signup with Clerk
- **💾 Save Articles** - Bookmark articles for later reading
- **📅 Calendar Filter** - Browse news from the past 100 days
- **🏷️ Category Filtering** - Filter by Technology, Business, Science, World, Health
- **🔥 Trending Section** - Horizontal scroll strip of trending news
- **⭐ Featured Stories** - Highlighted top stories

### Admin Panel
- **📊 Dashboard Analytics** - View stats, category distribution
- **✏️ CRUD Operations** - Create, edit, delete news articles
- **🎯 Feature/Trending** - Toggle featured and trending status
- **🔍 Search & Filter** - Find articles quickly

### UI/UX
- **🌓 Dark/Light Mode** - Beautiful theme toggle
- **📱 Fully Responsive** - Works on all devices
- **✨ Smooth Animations** - Framer Motion powered transitions
- **🎨 Glass Morphism** - Modern design with depth and shadows
- **🌍 Interactive 3D Globe** - News globe with particle effects

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **TailwindCSS** + **shadcn/ui** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Router** for navigation
- **Clerk React** for authentication
- **Three.js** for 3D globe

### Backend
- **Express.js** for REST API
- **MongoDB** + **Mongoose** for database
- **Clerk** for authentication

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd nebulytix-news-the-future-feed
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env` in the root directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_URL=http://localhost:5000/api
```

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nebulytix-news
CLERK_SECRET_KEY=sk_test_your_clerk_secret
JWT_SECRET=your-jwt-secret-key
PORT=5000
NODE_ENV=development
```

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start Development
```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run dev           # Frontend only (port 5173)
npm run server:dev    # Backend only (port 5000)
```

## 🔑 Environment Variables

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_URL` | Backend API URL |

### Backend (server/.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Server port (default: 5000) |

## 📁 Project Structure

```
nebulytix-news/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API
│   ├── hooks/             # Custom React hooks
│   └── data/              # Mock data
├── server/                 # Backend source
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth middleware
│   └── seed.ts            # Database seeder
├── public/                # Static assets
└── package.json
```

## 🌐 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Get all news (with pagination) |
| GET | `/api/news/featured` | Get featured articles |
| GET | `/api/news/trending` | Get trending articles |
| GET | `/api/news/:id` | Get single article |
| GET | `/api/news/categories/list` | Get all categories |
| GET | `/api/health` | Health check |

### Protected Routes (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/sync` | Sync user with database |
| POST | `/api/user/save/:newsId` | Toggle save article |
| GET | `/api/user/saved/all` | Get saved articles |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/verify` | Verify admin access |
| POST | `/api/admin/news/create` | Create article |
| PUT | `/api/admin/news/:id` | Update article |
| DELETE | `/api/admin/news/:id` | Delete article |
| PATCH | `/api/admin/news/:id/featured` | Toggle featured |
| PATCH | `/api/admin/news/:id/trending` | Toggle trending |
| GET | `/api/admin/stats` | Get dashboard stats |

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Backend Options
- **Railway**: Connect repo, add MongoDB, deploy
- **Render**: Create web service, configure env vars
- **DigitalOcean App Platform**: Deploy container

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add database user and get connection string
3. Whitelist IPs or allow access from anywhere (0.0.0.0/0)

## 📝 Scripts

```bash
npm run dev          # Start frontend dev server
npm run dev:all      # Start frontend + backend
npm run build        # Build frontend for production
npm run server:dev   # Start backend with hot reload
npm run seed         # Seed database with 100 articles
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built for Nebulytix Team