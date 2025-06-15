# 🚀 SteppersLife Production Deployment Guide

This guide covers deploying SteppersLife to production using Docker, with automated CI/CD via GitHub Actions.

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Domain**: DNS configured to point to your server
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Git**: For code deployment

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
├─────────────────────────────────────────────────────────────┤
│  Cloudflare/CDN  │  Frontend (Vercel/Netlify)             │
├─────────────────────────────────────────────────────────────┤
│  Load Balancer   │  Nginx Reverse Proxy                   │
├─────────────────────────────────────────────────────────────┤
│  Application     │  FastAPI Backend (Docker)              │
├─────────────────────────────────────────────────────────────┤
│  Database        │  PostgreSQL (Docker/Managed)           │
├─────────────────────────────────────────────────────────────┤
│  Cache/Queue     │  Redis (Docker/Managed)                │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Quick Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL termination)
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. Clone Repository

```bash
cd /app
sudo git clone https://github.com/yourusername/steppers-life-2025-v2.git stepperslife
cd stepperslife
sudo chown -R $USER:$USER .
```

### 3. Environment Configuration

```bash
# Copy environment templates
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env

# Edit production environment variables
nano .env.production
nano backend/.env
```

### 4. SSL Certificate Setup

```bash
# Get SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Update nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/stepperslife
sudo ln -s /etc/nginx/sites-available/stepperslife /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Deploy Application

```bash
# Run the deployment script
./deploy.sh production
```

## 🔐 Environment Variables

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (backend/.env)

```env
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secure-secret-key-32-chars-min
DATABASE_URL=postgresql://user:pass@db:5432/stepperslife_prod

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Payments
SQUARE_ACCESS_TOKEN=your-production-square-token
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ENVIRONMENT=production

PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=live

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

## 📊 Monitoring & Health Checks

### Health Endpoints

- **Application**: `https://api.yourdomain.com/health`
- **Readiness**: `https://api.yourdomain.com/health/ready`
- **Liveness**: `https://api.yourdomain.com/health/live`

### Monitoring Stack

```bash
# Add monitoring with Prometheus + Grafana
docker-compose -f docker-compose.monitoring.yml up -d
```

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 CI/CD Pipeline

### GitHub Actions Secrets

Add these secrets to your GitHub repository:

```
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=your-ssh-user
PRODUCTION_SSH_KEY=your-private-ssh-key

REGISTRY_URL=your-docker-registry
REGISTRY_USERNAME=your-registry-user
REGISTRY_PASSWORD=your-registry-password

VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

SLACK_WEBHOOK_URL=your-slack-webhook (optional)
```

### Deployment Trigger

```bash
# Automatic deployment on push to main
git push origin main

# Manual deployment via GitHub Actions
# Go to Actions tab → "Deploy SteppersLife to Production" → "Run workflow"
```

## 🛡️ Security Checklist

- [ ] Strong passwords and secret keys
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured (ports 22, 80, 443)
- [ ] Database access restricted
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set in Nginx
- [ ] Regular security updates scheduled

## 📈 Performance Optimization

### Frontend Optimization

```bash
# Enable Brotli compression in Nginx
sudo apt install nginx-module-brotli
# Add to nginx.conf: load_module modules/ngx_http_brotli_filter_module.so;
```

### Database Optimization

```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### Redis Caching

```python
# Add Redis caching to backend
CACHE_TTL = 300  # 5 minutes
REDIS_URL = "redis://redis:6379/0"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.production.yml logs db

# Check connection string
docker-compose -f docker-compose.production.yml exec backend python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

#### 2. SSL Certificate Issues
```bash
# Renew Let's Encrypt certificate
sudo certbot renew --dry-run

# Test SSL configuration
sudo nginx -t
```

#### 3. Container Health Check Failing
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# View health check logs
docker-compose -f docker-compose.production.yml logs backend
```

### Performance Issues

#### 1. High Memory Usage
```bash
# Monitor container resources
docker stats

# Scale backend containers
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

#### 2. Slow Database Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();
```

## 📞 Support

- **Documentation**: `/docs` in your API
- **Health Status**: `/health` endpoint
- **Logs**: `docker-compose logs`
- **GitHub Issues**: Create issues for bugs/features

## 🔄 Maintenance

### Regular Tasks

```bash
# Update application
git pull origin main
./deploy.sh production

# Backup database
docker-compose -f docker-compose.production.yml exec db pg_dump -U stepperslife stepperslife_prod > backup_$(date +%Y%m%d).sql

# Update Docker images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Clean up old images
docker system prune -a
```

### Scaling

```bash
# Scale backend horizontally
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Add load balancer
# Configure Nginx upstream or use external load balancer
```

---

## 🎉 Success!

Your SteppersLife application is now running in production! 

- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Admin**: https://yourdomain.com/admin
- **Docs**: https://api.yourdomain.com/api/v1/docs

Happy stepping! 💃🕺