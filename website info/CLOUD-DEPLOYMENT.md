# ☁️ SteppersLife Cloud Platform Deployment

This guide walks you through deploying SteppersLife to cloud platforms in the optimal order.

## 🗺️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloud Architecture                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Vercel)     │  https://stepperslife.vercel.app      │
│                        │  ↓ API calls                          │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Railway)     │  https://your-app.railway.app         │
│                        │  ↓ Database queries                   │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase)   │  PostgreSQL + Auth + Storage          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Deployment (30 minutes)

### **Step 1: Database Setup (Supabase) - 5 minutes**

1. **Go to [Supabase](https://supabase.com/dashboard)**
   - Create account or sign in
   - Click "New Project"

2. **Create Project**
   ```
   Name: SteppersLife Production
   Organization: Your Organization
   Database Password: [Generate strong password - SAVE THIS!]
   Region: Choose closest to your users
   Pricing: Free tier (500MB, 2GB bandwidth)
   ```

3. **Set up Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `setup-supabase-db.sql`
   - Click "Run" to execute

4. **Get Connection Details**
   ```
   Settings → Database → Connection parameters:
   
   Host: [your-project].supabase.co
   Database: postgres
   Port: 5432
   User: postgres
   Password: [your-password]
   
   Connection string format:
   postgresql://postgres:[password]@[host]:5432/postgres
   ```

5. **Get API Keys**
   ```
   Settings → API:
   
   Project URL: https://[your-project].supabase.co
   anon public: eyJ... (for frontend)
   service_role: eyJ... (for backend - keep secret!)
   ```

### **Step 2: Backend Deployment (Railway) - 10 minutes**

1. **Go to [Railway](https://railway.app)**
   - Sign up with GitHub
   - Connect your GitHub account

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `steppers-life-2025-v2` repository
   - Select the `backend` folder as root

3. **Configure Environment Variables**
   Go to Variables tab and add:
   ```
   ENVIRONMENT=production
   DEBUG=false
   
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   
   # JWT Security (generate strong 32+ char key)
   SECRET_KEY=your-super-secure-32-character-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Supabase
   SUPABASE_URL=https://[your-project].supabase.co
   SUPABASE_KEY=[your-anon-key]
   SUPABASE_JWT_SECRET=[your-service-role-key]
   
   # Email (SendGrid recommended)
   SENDGRID_API_KEY=your-sendgrid-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   
   # Payment Providers (sandbox for testing)
   SQUARE_ACCESS_TOKEN=sandbox-token
   SQUARE_APPLICATION_ID=sandbox-app-id
   SQUARE_ENVIRONMENT=sandbox
   
   PAYPAL_CLIENT_ID=sandbox-client-id
   PAYPAL_CLIENT_SECRET=sandbox-secret
   PAYPAL_MODE=sandbox
   
   # Frontend URL (will update after Vercel deploy)
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete (2-3 minutes)
   - Note your Railway URL: `https://your-app.railway.app`

5. **Test Backend**
   ```bash
   curl https://your-app.railway.app/health
   # Should return: {"status": "healthy", ...}
   
   curl https://your-app.railway.app/api/v1/docs
   # Should show API documentation
   ```

### **Step 3: Frontend Deployment (Vercel) - 10 minutes**

1. **Go to [Vercel](https://vercel.com)**
   - Sign up with GitHub
   - Import your repository

2. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: / (leave default)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm ci
   ```

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-app.railway.app/api/v1
   VITE_SUPABASE_URL=https://[your-project].supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Note your Vercel URL: `https://your-app.vercel.app`

5. **Update Backend CORS**
   - Go back to Railway project
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Redeploy backend

### **Step 4: Custom Domain (Optional) - 5 minutes**

1. **Frontend Domain (Vercel)**
   - Domains tab → Add domain
   - Follow DNS configuration instructions

2. **Backend Domain (Railway)**
   - Settings → Domains → Add custom domain
   - Update `VITE_API_URL` in Vercel to use custom domain

## 🧪 Testing Your Deployment

### **1. Health Checks**
```bash
# Backend health
curl https://your-app.railway.app/health

# Frontend (should load the app)
open https://your-app.vercel.app
```

### **2. Authentication Flow**
1. Go to your frontend URL
2. Click "Sign Up" 
3. Create a test account
4. Verify email works
5. Login and test navigation

### **3. Database Connection**
```bash
# Check API endpoints
curl https://your-app.railway.app/api/v1/events
curl https://your-app.railway.app/api/v1/categories
```

## 🔧 Environment Variables Reference

### **Frontend (Vercel)**
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

### **Backend (Railway)**
```env
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-32-char-secret-key

# Database
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ...your-anon-key
SUPABASE_JWT_SECRET=eyJ...your-service-role-key

# Email
SENDGRID_API_KEY=SG.your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Payments (use sandbox initially)
SQUARE_ACCESS_TOKEN=sandbox-token
SQUARE_APPLICATION_ID=sandbox-app-id
SQUARE_ENVIRONMENT=sandbox

PAYPAL_CLIENT_ID=sandbox-client-id
PAYPAL_CLIENT_SECRET=sandbox-secret
PAYPAL_MODE=sandbox

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🚨 Troubleshooting

### **Database Connection Issues**
```sql
-- Test in Supabase SQL Editor
SELECT 1;

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Backend Issues**
```bash
# Check Railway logs
# Go to Railway dashboard → Your project → Deployments → View logs

# Common issues:
# 1. Environment variables not set
# 2. Database connection string incorrect
# 3. Missing dependencies in requirements.txt
```

### **Frontend Issues**
```bash
# Check Vercel deployment logs
# Go to Vercel dashboard → Your project → Functions → View logs

# Common issues:
# 1. Environment variables not set
# 2. API URL incorrect
# 3. CORS issues (check backend FRONTEND_URL)
```

### **CORS Errors**
If you see CORS errors in browser console:
1. Check `FRONTEND_URL` in Railway environment variables
2. Make sure it matches your Vercel URL exactly
3. Redeploy backend after changing

## 📊 Monitoring & Maintenance

### **Railway Monitoring**
- Dashboard shows CPU, Memory, Network usage
- View logs in real-time
- Set up alerts for downtime

### **Vercel Analytics**
- Enable Web Analytics in project settings
- Monitor page views and performance
- Core Web Vitals tracking

### **Supabase Monitoring**
- Database usage in dashboard
- Query performance monitoring
- Automatic backups included

## 💰 Cost Estimates

### **Free Tier Limits**
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Railway**: $5 credit/month (covers small apps)
- **Vercel**: Unlimited for personal projects

### **Scaling Costs** (when you outgrow free tiers)
- **Supabase Pro**: $25/month (8GB database, 250GB bandwidth)
- **Railway**: Pay-per-use after $5 credit (~$10-20/month)
- **Vercel Pro**: $20/month (for teams/commercial use)

## 🔄 CI/CD Setup

Your GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
1. Run tests on every push
2. Deploy to production on main branch
3. Update both frontend and backend

### **Required GitHub Secrets**
```
VITE_API_URL=https://your-app.railway.app/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

RAILWAY_TOKEN=your-railway-token
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

## 🎉 Success Checklist

- [ ] ✅ Supabase database created and schema deployed
- [ ] ✅ Railway backend deployed and healthy
- [ ] ✅ Vercel frontend deployed and loading
- [ ] ✅ Environment variables configured
- [ ] ✅ Authentication flow working
- [ ] ✅ API endpoints responding
- [ ] ✅ Database queries working
- [ ] ✅ CORS configured correctly
- [ ] ✅ Custom domains set up (optional)
- [ ] ✅ CI/CD pipeline working

## 📞 Support Resources

- **Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

## 🚀 You're Live!

After completing these steps, your SteppersLife application will be running on:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Database**: Supabase PostgreSQL
- **Admin Panel**: `https://your-app.vercel.app/admin`
- **API Docs**: `https://your-app.railway.app/api/v1/docs`

**Happy stepping in the cloud!** ☁️💃🕺