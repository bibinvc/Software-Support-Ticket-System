# Free Deployment Guide - Software Support Ticket System

This guide shows you how to deploy your full-stack application for **FREE** using various hosting services.

## 🎯 Deployment Strategy

For a full-stack app, you need to deploy:
1. **Frontend** (React) - Static hosting
2. **Backend** (Node.js/Express) - Server hosting
3. **Database** (PostgreSQL) - Database hosting

## Option 1: All-in-One Solution (Easiest) ⭐ Recommended

### Railway.app (Free Tier Available)

Railway can host everything in one place:

1. **Sign up**: Go to [railway.app](https://railway.app) (use GitHub to sign in)
2. **Create New Project**: Click "New Project"
3. **Add Services**:
   - **PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
   - **Backend**: Click "New" → "GitHub Repo" → Select your repo → Select `backend` folder
   - **Frontend**: Click "New" → "GitHub Repo" → Select your repo → Select `frontend` folder

4. **Configure Backend**:
   - Set root directory: `backend`
   - Add environment variables:
     ```
     DATABASE_URL=<from PostgreSQL service>
     JWT_SECRET=your-secret-key
     PORT=4000
     FRONTEND_URL=<frontend URL>
     ```
   - Build command: (leave empty, Railway auto-detects)
   - Start command: `npm start`

5. **Configure Frontend**:
   - Set root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=<backend URL>
     ```

6. **Deploy**: Railway automatically deploys on every push to GitHub!

**Free Tier**: $5 credit/month (usually enough for small projects)

---

## Option 2: Separate Services (More Control)

### Frontend: Vercel (Free Forever) ⭐

1. **Sign up**: [vercel.com](https://vercel.com) (use GitHub)
2. **Import Project**: 
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - **Root Directory**: `frontend`
3. **Configure**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-url.com/api
     ```
4. **Deploy**: Automatic on every push!

**Free Tier**: Unlimited deployments, 100GB bandwidth

### Backend: Render.com (Free Tier)

1. **Sign up**: [render.com](https://render.com) (use GitHub)
2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   ```
   DATABASE_URL=<your-database-url>
   JWT_SECRET=your-secret-key
   PORT=4000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. **Deploy**: Automatic!

**Free Tier**: Free tier available (spins down after 15 min inactivity)

### Database: Supabase (Free Forever) ⭐

1. **Sign up**: [supabase.com](https://supabase.com) (use GitHub)
2. **Create Project**: Click "New Project"
3. **Get Connection String**: 
   - Go to Settings → Database
   - Copy the connection string
4. **Update Backend**: Use this connection string in your backend's `DATABASE_URL`

**Free Tier**: 500MB database, unlimited API requests

---

## Option 3: GitHub Pages (Frontend Only)

Since you already have GitHub, you can deploy the frontend to GitHub Pages:

### Steps:

1. **Build your frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Create `gh-pages` branch**:
   ```bash
   git checkout -b gh-pages
   git add frontend/dist
   git commit -m "Deploy frontend to GitHub Pages"
   git push origin gh-pages
   ```

3. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: `gh-pages` branch
   - Folder: `/frontend/dist` (or root)
   - Save

4. **Update API URL**:
   - In `frontend/.env.production`:
     ```
     VITE_API_URL=https://your-backend-url.com/api
     ```

**Note**: You'll still need to host backend and database separately.

---

## Quick Setup Scripts

### For Railway (Recommended)

Create these files in your repo:

#### `railway.json` (in root)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  }
}
```

#### `Procfile` (in backend folder)
```
web: npm start
```

---

## Step-by-Step: Deploy to Railway (Easiest)

### 1. Prepare Your Repository

Make sure your `.gitignore` is set up (already done ✅)

### 2. Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### 3. Deploy Database

1. In Railway dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database
4. Click on the database service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` (you'll need this)

### 4. Deploy Backend

1. Click "New" → "GitHub Repo"
2. Select your repository: `Software-Support-Ticket-System`
3. Railway will detect it's a Node.js project
4. **Settings**:
   - Root Directory: `backend`
   - Build Command: (auto-detected)
   - Start Command: `npm start`
5. **Environment Variables** (Variables tab):
   ```
   DATABASE_URL=<paste from PostgreSQL service>
   JWT_SECRET=your-super-secret-key-change-this
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=<will add after frontend deploys>
   ```
6. Click "Deploy"
7. Wait for deployment
8. Copy the generated URL (e.g., `https://your-app.up.railway.app`)

### 5. Deploy Frontend

1. Click "New" → "GitHub Repo"
2. Select the same repository
3. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Start Command: (leave empty, it's static)
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
5. Click "Deploy"
6. Copy the frontend URL

### 6. Update Backend CORS

1. Go back to backend service
2. Update `FRONTEND_URL` variable to your frontend URL
3. Redeploy backend

### 7. Run Database Migrations

1. In Railway, go to your backend service
2. Click "Deployments" → Latest deployment
3. Click "View Logs"
4. Or use Railway's built-in terminal:
   - Click on backend service
   - Go to "Deployments" tab
   - Click on latest deployment
   - Use the terminal to run: `npm run setup-db`

---

## Alternative: Render.com (Free Tier)

### Database: Render PostgreSQL

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "PostgreSQL"
4. Create database (free tier available)
5. Copy the connection string

### Backend: Render Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. **Settings**:
   - Name: `ssts-backend`
   - Region: Choose closest
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables**:
   ```
   DATABASE_URL=<from PostgreSQL>
   JWT_SECRET=your-secret
   PORT=10000
   FRONTEND_URL=<frontend URL>
   ```
5. Deploy!

### Frontend: Vercel

Follow Option 2 above.

---

## Environment Variables Checklist

### Backend (.env)
```env
DATABASE_URL=postgres://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
UPLOAD_DIR=./uploads
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Backend API is accessible
- [ ] Frontend can connect to backend
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Test user registration
- [ ] Test ticket creation
- [ ] Test file uploads (if using)

---

## Troubleshooting

### Backend won't start
- Check logs in Railway/Render dashboard
- Verify `DATABASE_URL` is correct
- Ensure `PORT` is set (Railway uses `PORT` env var automatically)

### Frontend can't connect to backend
- Check `VITE_API_URL` is correct
- Verify CORS settings in backend
- Check browser console for errors

### Database connection fails
- Verify `DATABASE_URL` format
- Check database is running
- Ensure IP whitelist allows connections (if applicable)

### File uploads not working
- Check `UPLOAD_DIR` is writable
- Verify file permissions
- Check storage limits on free tier

---

## Cost Comparison

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Railway** | $5 credit/month | All-in-one deployment |
| **Vercel** | Unlimited | Frontend hosting |
| **Render** | Free tier (spins down) | Backend hosting |
| **Supabase** | 500MB DB | Database hosting |
| **GitHub Pages** | Unlimited | Static sites |

---

## Recommended Setup (Free)

1. **Frontend**: Vercel (unlimited, fast)
2. **Backend**: Render.com (free tier)
3. **Database**: Supabase (500MB free)

**Total Cost**: $0/month ✅

---

## Next Steps

1. Choose your deployment option
2. Follow the steps above
3. Test your deployed application
4. Share your live URL! 🎉

---

## Need Help?

- Check service documentation
- Review error logs in deployment dashboard
- Test locally first before deploying
- Start with one service at a time

Good luck with your deployment! 🚀

