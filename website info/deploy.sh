#!/bin/bash

# SteppersLife Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting SteppersLife Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${1:-production}
FRONTEND_BUILD_DIR="dist"
BACKEND_DIR="backend"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed."; exit 1; }
    command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is required but not installed."; exit 1; }
    
    print_success "Prerequisites check passed"
}

# Check environment files
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Creating from example..."
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your production values before continuing."
        read -p "Press enter when ready to continue..."
    fi
    
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env not found. Creating from example..."
        cp backend/.env.production.example backend/.env
        print_warning "Please edit backend/.env with your production values before continuing."
        read -p "Press enter when ready to continue..."
    fi
    
    print_success "Environment configuration ready"
}

# Build frontend
build_frontend() {
    print_status "Building frontend for production..."
    
    # Install dependencies
    npm ci --only=production
    
    # Build with production environment
    cp .env.production .env.local
    npm run build
    
    if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
        print_error "Frontend build failed - $FRONTEND_BUILD_DIR directory not found"
        exit 1
    fi
    
    print_success "Frontend build completed"
}

# Build backend
build_backend() {
    print_status "Building backend for production..."
    
    cd $BACKEND_DIR
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    # Build Docker image
    docker build -f Dockerfile.production -t stepperslife-backend:latest .
    
    cd ..
    print_success "Backend build completed"
}

# Deploy with Docker Compose
deploy_containers() {
    print_status "Deploying containers..."
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down
    
    # Start new containers
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for health checks
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        print_success "Containers deployed successfully"
    else
        print_error "Container deployment failed"
        docker-compose -f docker-compose.production.yml logs
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Run migrations in the backend container
    docker-compose -f docker-compose.production.yml exec -T backend python scripts/init_database.py
    
    print_success "Database migrations completed"
}

# Deploy frontend to CDN/Static hosting
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # This would typically deploy to Vercel, Netlify, or S3
    # For now, we'll just show instructions
    print_status "Frontend built in $FRONTEND_BUILD_DIR directory"
    print_status "Deploy this directory to your static hosting provider:"
    print_status "- Vercel: vercel --prod"
    print_status "- Netlify: netlify deploy --prod --dir=$FRONTEND_BUILD_DIR"
    print_status "- AWS S3: aws s3 sync $FRONTEND_BUILD_DIR s3://your-bucket-name"
    
    print_success "Frontend deployment instructions provided"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check backend health
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Check database connection
    if docker-compose -f docker-compose.production.yml exec -T db pg_isready >/dev/null 2>&1; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
        exit 1
    fi
}

# Show deployment summary
show_summary() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${BLUE}Deployment Summary:${NC}"
    echo "- Environment: $DEPLOY_ENV"
    echo "- Backend: http://localhost:8000"
    echo "- API Docs: http://localhost:8000/docs"
    echo "- Database: PostgreSQL (localhost:5432)"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Set up SSL certificates (Let's Encrypt recommended)"
    echo "3. Deploy frontend to your static hosting provider"
    echo "4. Configure monitoring and alerting"
    echo "5. Set up automated backups"
    echo ""
    echo -e "${GREEN}Happy stepping! 💃🕺${NC}"
}

# Main deployment process
main() {
    echo "🎯 Deploying to: $DEPLOY_ENV"
    
    check_prerequisites
    check_environment
    build_frontend
    build_backend
    deploy_containers
    run_migrations
    health_check
    deploy_frontend
    show_summary
}

# Run main function
main "$@"