# Nebulytix News - The Future Feed

A modern, production-ready news application built with the MERN stack (MongoDB, Express, React, Node.js). Features Clerk authentication, JWT-based admin panel, and a sleek, BBC/Google News-inspired UI.

![Nebulytix News](https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=400&fit=crop)

## 🚀 Features

### Core Features
- **📰 Dynamic News Feed** - Browse categorized news articles with infinite scroll
- **🔐 Clerk Authentication** - Secure user login/signup with Clerk
- **💾 Save Articles** - Bookmark articles for later reading
- **📅 Calendar Filter** - Browse news from the past 100 days
- **🏷️ Category Filtering** - Filter by Technology, Business, Science, World, Health
- **🔥 Trending Section** - Horizontal scroll strip of trending news
- **⭐ Featured Stories** - Highlighted top stories
- **🔄 Offline Fallback** - Mock data when backend unavailable

### Admin Panel
- **🔐 JWT Authentication** - Secure admin login with JWT tokens
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
- **JWT** for admin authentication
- **Helmet** + **Rate Limiting** for security
- **Clerk** for user authentication

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)

### 1. Clone the repository
```bash
git clone https://github.com/wajiddaudtamboli/NEBULYTIX-News-Application.git
cd NEBULYTIX-News-Application
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env` in the root directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_URL=http://localhost:5000/api/v1
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nebulytix-news
JWT_SECRET=your-super-secret-jwt-key
ADMIN_SETUP_KEY=your-admin-setup-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nebulytix-news
CLERK_SECRET_KEY=sk_test_your_clerk_secret
JWT_SECRET=your-super-secret-jwt-key
ADMIN_SETUP_KEY=your-admin-setup-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### 4. MongoDB Atlas Setup (IMPORTANT)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Network Access** in left sidebar
4. Click **+ ADD IP ADDRESS**
5. **For development**: Add `0.0.0.0/0` (allows all IPs)
6. **For production**: Add your server's IP address
7. Wait 1-2 minutes for changes to propagate

### 5. Seed the Database (Optional)
```bash
npm run seed
```

### 6. Start Development
```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run dev           # Frontend only (port 8080)
npm run server:dev    # Backend only (port 5000)
```

### 7. Admin Setup
1. Visit `http://localhost:8080/admin/login`
2. Click **"First Time Setup"** tab
3. Enter setup key: `nebulytix-admin-setup-2024` (or your custom key)
4. Create your admin account
5. Login with your credentials

## 🔑 Environment Variables

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_URL` | Backend API URL (optional, defaults to /api/v1) |

### Backend (server/.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_SETUP_KEY` | Key for first admin setup |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS |

## 📁 Project Structure

```
nebulytix-news/
├── api/                    # Vercel serverless functions
│   ├── auth/              # Admin auth endpoints
│   ├── admin/             # Admin CRUD endpoints
│   ├── news/              # News endpoints
│   └── user/              # User endpoints
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── lib/               # Utilities and API
│   ├── hooks/             # Custom React hooks
│   └── data/              # Mock data
├── server/                 # Backend source (local dev)
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth middleware
│   └── seed.ts            # Database seeder
├── public/                # Static assets
├── vercel.json            # Vercel configuration
└── package.json
```

## 🌐 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/news` | Get all news (with pagination) |
| GET | `/api/v1/news/featured` | Get featured articles |
| GET | `/api/v1/news/trending` | Get trending articles |
| GET | `/api/v1/news/:id` | Get single article |
| GET | `/api/health` | Health check |

### Auth Routes (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/admin/login` | Admin login |
| POST | `/api/v1/auth/admin/setup` | First-time admin setup |
| GET | `/api/v1/auth/admin/verify` | Verify admin token |

### Protected Routes (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/sync` | Sync user with database |
| POST | `/api/v1/user/save/:newsId` | Toggle save article |
| GET | `/api/v1/user/saved/all` | Get saved articles |

### Admin Routes (Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Get dashboard stats |
| GET | `/api/v1/admin/news/all` | Get all news (admin) |
| POST | `/api/v1/admin/news/create` | Create article |
| PUT | `/api/v1/admin/news/:id` | Update article |
| DELETE | `/api/v1/admin/news/:id` | Delete article |
| PATCH | `/api/v1/admin/news/:id/featured` | Toggle featured |
| PATCH | `/api/v1/admin/news/:id/trending` | Toggle trending |

## 📝 Scripts

```bash
npm run dev          # Start frontend dev server (port 8080)
npm run dev:all      # Start frontend + backend
npm run build        # Build frontend for production
npm run server:dev   # Start backend with hot reload
npm run seed         # Seed database with articles
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## 🔧 Troubleshooting

### MongoDB Connection Failed
**Error**: "Could not connect to any servers in your MongoDB Atlas cluster"

**Solution**: 
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to whitelist all IPs
3. Wait 1-2 minutes and restart the server

### Admin Login Not Working
1. Visit `/admin/login`
2. Use "First Time Setup" tab to create admin
3. Use setup key from your `.env` file

### Frontend Shows Mock Data
This is normal when backend is unavailable. The app uses fallback mock data for offline functionality.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by Nebulytix Team**

## 🚀 Deployment

### Vercel (Recommended - Full Stack)
This project is configured for **Vercel serverless deployment**. Both frontend and API work together.

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework

2. **Set Environment Variables in Vercel Dashboard:**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-jwt-secret
   ADMIN_SETUP_KEY=your-setup-key
   CLERK_SECRET_KEY=sk_test_your_key
   ```

3. **MongoDB Atlas - Whitelist Vercel IPs:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` to allow all IPs (required for serverless)

4. **Deploy!**
   - Click Deploy and Vercel handles the rest

### Alternative Backend Deployments

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render
1. Create a new Web Service
2. Connect your GitHub repo
3. Set Build Command: `npm install`
4. Set Start Command: `npm run server:dev`
5. Add environment variables

### MongoDB Atlas Setup
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user with password
3. Get connection string from "Connect" button
4. **IMPORTANT**: Whitelist IPs:
   - Development: Add your IP or `0.0.0.0/0`
   - Production/Vercel: Add `0.0.0.0/0` (serverless IPs change)

## 🔑 Environment Variables

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `VITE_API_URL` | Backend API URL | No (defaults to /api/v1) |

### Backend (server/.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ADMIN_SETUP_KEY` | Key for first admin setup | Yes |
| `PORT` | Server port (default: 5000) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

### Vercel (Environment Variables)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string for JWT |
| `ADMIN_SETUP_KEY` | Key to create first admin |
| `CLERK_SECRET_KEY` | Your Clerk secret key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |