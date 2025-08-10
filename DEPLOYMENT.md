# EcoSort Deployment Guide

## Frontend Deployment (Vercel)

### Quick Deploy
1. Connect your GitHub repository to Vercel
2. Set the following configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/ecosort`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

### Environment Variables
Set these in your Vercel dashboard:
```
VITE_API_URL=your-backend-api-url/api
VITE_APP_NAME=EcoSort
VITE_APP_DESCRIPTION=Smart Waste Management System
```

### Build Configuration
The repository includes:
- `.npmrc` with legacy-peer-deps for compatibility
- React 18 for better package compatibility
- Optimized build configuration

## Backend Deployment

### Railway/Render/Heroku
1. Set environment variables:
   ```
   DATABASE_URL=your-postgresql-url
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=your-frontend-url
   ```

2. Build command: `npm install && npx prisma generate && npx prisma db push`
3. Start command: `npm start`

### Database Setup
1. Create PostgreSQL database (recommended: Neon, Supabase)
2. Run migrations: `npx prisma db push`
3. Seed data: `npm run db:seed`

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend  
```bash
cd frontend/ecosort
npm install --legacy-peer-deps
npm run dev
```

## Features
- ✅ Waste logging with points system
- ✅ Smart bin locator and reporting
- ✅ Leaderboard and user profiles
- ✅ Valuable materials guide
- ✅ Scrap price tracking
- ✅ Admin dashboard with analytics
- ✅ Mobile-responsive design
- ✅ Real-time notifications
