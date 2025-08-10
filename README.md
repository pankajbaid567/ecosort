# 🌱 EcoSort - Smart Waste Management System

Welcome to EcoSort! This is a full-stack web application that helps users learn proper waste disposal methods, track their eco-friendly activities, and contribute to a more sustainable future.

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- Prisma ORM + PostgreSQL
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React.js (Vite)
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications

**Planned Features:**
- Chart.js for data visualizations
- React Leaflet for maps (OpenStreetMap)
- Real-time bin status updates

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **PostgreSQL** (v12 or higher)

## 🚀 Quick Start Guide

### 1. Clone and Setup

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd ecosort

# The project structure should be:
# ecosort/
# ├── backend/
# └── frontend/ecosort/
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL="postgresql://username:password@localhost:5432/ecosort_db?schema=public"
# JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
# PORT=5000
```

### 3. Database Setup

```bash
# Make sure PostgreSQL is running and create database
createdb ecosort_db

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data (50+ waste items)
npm run db:seed
```

### 4. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# The backend will be running at: http://localhost:5001
# Health check: http://localhost:5001/health
```

### 5. Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend/ecosort

# Install dependencies
npm install

# Start development server
npm run dev

# The frontend will be running at: http://localhost:5173
```

## 🧪 Testing the Application

### Demo Accounts
The seed script creates these demo accounts:

**Demo User:**
- Email: `demo@ecosort.com`
- Password: `demo123`
- Points: 150

**Eco Warrior:**
- Email: `warrior@ecosort.com`  
- Password: `eco123`
- Points: 300

### API Endpoints for Testing

**Health Check:**
```bash
curl http://localhost:5001/health
```

**Authentication:**
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ecosort.com","password":"demo123"}'
```

**Waste Items:**
```bash
# Get all waste items
curl http://localhost:5001/api/waste-items

# Search waste items
curl "http://localhost:5001/api/waste-items?search=plastic"

# Get item by ID
curl http://localhost:5001/api/waste-items/[ITEM_ID]
```

## 🎯 Key Features Implemented

### ✅ Backend Features
- [x] Complete REST API with `/api` prefix
- [x] JWT authentication system
- [x] User registration and login
- [x] 50+ waste items with disposal instructions
- [x] Waste logging with points system
- [x] Bin location management
- [x] User leaderboard
- [x] Search and filtering
- [x] Comprehensive error handling
- [x] Database seeding script

### ✅ Frontend Features
- [x] Responsive React application
- [x] Modern UI with TailwindCSS
- [x] Waste Guide with search and filters
- [x] User authentication (login/register)
- [x] Interactive waste item details modal
- [x] Points system integration
- [x] Mobile-responsive navigation
- [x] Toast notifications
- [x] Protected routes

### 🚧 Planned Features
- [ ] Interactive map with React Leaflet
- [ ] Data visualization charts
- [ ] User dashboard with analytics
- [ ] Real-time bin status updates
- [ ] Achievement system
- [ ] Social features (community challenges)

## 📁 Project Structure

```
ecosort/
├── backend/
│   ├── app.js                 # Main Express application
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env                  # Environment variables
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Database seeding script
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User management
│   │   ├── wasteItems.js    # Waste guide API
│   │   ├── bins.js          # Bin management
│   │   └── wasteLogs.js     # Waste logging
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── controllers/          # Route controllers (placeholder)
│   └── services/             # Business logic (placeholder)
│
└── frontend/ecosort/
    ├── index.html            # Main HTML template
    ├── package.json          # Frontend dependencies
    ├── tailwind.config.js    # TailwindCSS configuration
    ├── .env                  # Frontend environment vars
    ├── src/
    │   ├── App.jsx           # Main app component with routing
    │   ├── main.jsx          # React entry point
    │   ├── index.css         # Global styles & Tailwind
    │   ├── components/       # React components
    │   │   ├── WasteGuide.jsx    # Main waste guide component
    │   │   ├── Layout.jsx        # App layout wrapper
    │   │   ├── Header.jsx        # Navigation header
    │   │   ├── Footer.jsx        # App footer
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── Profile.jsx       # User profile
    │   │   ├── Leaderboard.jsx   # Points leaderboard
    │   │   ├── MapView.jsx       # Map interface (placeholder)
    │   │   └── Auth/             # Authentication components
    │   │       ├── Login.jsx
    │   │       └── Register.jsx
    │   ├── contexts/         # React contexts
    │   │   └── AuthContext.jsx   # Authentication state
    │   └── services/         # API integration
    │       └── api.js            # Axios API client
    └── public/               # Static assets
```

## 🔧 Development Commands

### Backend Commands
```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Production mode
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:reset       # Reset database
npm run db:studio      # Open Prisma Studio

# Testing
npm test
npm run test:watch
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🌍 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecosort_db?schema=public"

# Authentication
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# App Configuration
VITE_APP_NAME=EcoSort
VITE_APP_DESCRIPTION="Smart Waste Management System"
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Check if database exists
psql -l | grep ecosort_db
```

**2. Port Already in Use**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in .env
PORT=5001
```

**3. Prisma Migration Issues**
```bash
# Reset database and remigrate
npm run db:reset
npm run db:migrate
npm run db:seed
```

**4. Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/verify-token` - Token verification

### User Endpoints
- `GET /api/users/me` - Get current user (protected)
- `PUT /api/users/me` - Update profile (protected)
- `GET /api/users/me/waste-logs` - Get user's logs (protected)
- `GET /api/users/leaderboard` - Get top users

### Waste Items Endpoints
- `GET /api/waste-items` - List all items (with search & pagination)
- `GET /api/waste-items/:id` - Get item details
- `GET /api/waste-items/search/:query` - Search items
- `GET /api/waste-items/stats/categories` - Category statistics

### Waste Logs Endpoints
- `POST /api/waste-logs` - Log waste disposal (protected)
- `GET /api/waste-logs` - Get user's logs (protected)
- `GET /api/waste-logs/stats/overview` - Usage statistics (protected)

### Bins Endpoints  
- `GET /api/bins` - List all bins
- `GET /api/bins/nearby/:lat/:lng` - Find nearby bins
- `GET /api/bins/type/:type` - Get bins by type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- Database with [Prisma](https://prisma.io/) + PostgreSQL
- Frontend built with [Vite](https://vitejs.dev/) + React

---

**Happy coding! 🌱 Let's make waste management smarter together!**
