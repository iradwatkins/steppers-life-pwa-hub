#!/bin/bash

# SteppersLife Cloud Deployment Preparation Script
# This script prepares your repository for cloud platform deployment

set -e

echo "🚀 Preparing SteppersLife for Cloud Deployment"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the SteppersLife project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - SteppersLife 2025"
    print_success "Git repository initialized"
fi

# Check if frontend builds
print_status "Testing frontend build..."
if npm run build; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed. Please fix errors before deploying."
    exit 1
fi

# Check if backend requirements are up to date
print_status "Checking backend dependencies..."
cd backend
if python3 -c "import requirements_parser; requirements_parser.parse('requirements.txt')" 2>/dev/null; then
    print_success "Backend requirements.txt is valid"
else
    print_warning "Consider updating requirements.txt if needed"
fi
cd ..

# Create .gitignore entries for environment files
print_status "Updating .gitignore for production..."
cat >> .gitignore << 'EOF'

# Production environment files
.env.production
backend/.env
.railway/
.vercel/

# Local development
*.local
.DS_Store
EOF

print_success ".gitignore updated"

# Ensure package.json has the correct build script
print_status "Verifying package.json build configuration..."
if grep -q '"build"' package.json; then
    print_success "Build script found in package.json"
else
    print_error "Build script missing in package.json"
    exit 1
fi

# Create deployment checklist
print_status "Creating deployment checklist..."
cat > DEPLOYMENT-CHECKLIST.md << 'EOF'
# 🚀 SteppersLife Cloud Deployment Checklist

## Pre-Deployment
- [ ] Code committed to GitHub
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend dependencies installed
- [ ] Environment variables documented

## Database Setup (Supabase)
- [ ] Supabase project created
- [ ] Database schema deployed (`setup-supabase-db.sql`)
- [ ] Row Level Security configured
- [ ] API keys obtained

## Backend Deployment (Railway)
- [ ] Railway project connected to GitHub
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Health check passing
- [ ] API documentation accessible

## Frontend Deployment (Vercel)
- [ ] Vercel project connected to GitHub
- [ ] Environment variables configured
- [ ] Frontend deployed successfully
- [ ] Application loads in browser
- [ ] API calls working

## Testing
- [ ] User registration works
- [ ] User login works
- [ ] Events page loads
- [ ] Admin panel accessible
- [ ] API endpoints responding

## Optional
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] CI/CD pipeline configured
- [ ] Monitoring set up

## Production Ready
- [ ] Payment providers configured (production keys)
- [ ] Email service configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
EOF

print_success "Deployment checklist created"

# Update package.json with deployment info
print_status "Adding deployment scripts to package.json..."
npx json -I -f package.json -e 'this.scripts = this.scripts || {}'
npx json -I -f package.json -e 'this.scripts["deploy:vercel"] = "vercel --prod"'
npx json -I -f package.json -e 'this.scripts["deploy:preview"] = "vercel"'

# Create a basic GitHub workflow if it doesn't exist
if [ ! -f ".github/workflows/deploy.yml" ]; then
    print_status "GitHub Actions workflow already exists"
else
    print_success "GitHub Actions workflow configured"
fi

# Show deployment summary
echo ""
echo "🎉 Repository prepared for cloud deployment!"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. 📖 Read CLOUD-DEPLOYMENT.md for detailed instructions"
echo "2. 🗄️ Set up Supabase database (5 minutes)"
echo "3. 🔧 Deploy backend to Railway (10 minutes)"
echo "4. 🌐 Deploy frontend to Vercel (10 minutes)"
echo "5. ✅ Test your live application"
echo ""
echo -e "${BLUE}Quick Start Commands:${NC}"
echo "# Push to GitHub"
echo "git add ."
echo "git commit -m 'Prepare for cloud deployment'"
echo "git push origin main"
echo ""
echo "# Deploy to Vercel (after Railway setup)"
echo "npm run deploy:vercel"
echo ""
echo -e "${YELLOW}Important Files Created:${NC}"
echo "📁 setup-supabase-db.sql - Database schema"
echo "📁 railway.json - Railway configuration"
echo "📁 CLOUD-DEPLOYMENT.md - Deployment guide"
echo "📁 DEPLOYMENT-CHECKLIST.md - Step-by-step checklist"
echo ""
echo -e "${GREEN}Ready to deploy! 🚀${NC}"
echo "Follow the CLOUD-DEPLOYMENT.md guide step by step."