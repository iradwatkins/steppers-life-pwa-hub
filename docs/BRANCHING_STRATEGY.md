# Git Branching Strategy

## Overview
SteppersLife PWA follows a **Git Flow** branching strategy with dedicated branches for different environments.

## Branch Structure

### 🏭 `main` - Production Branch
- **Purpose:** Production-ready code only
- **Database:** Production Supabase (`https://nvryyufpbcruyqqndyjn.supabase.co`)
- **Deployment:** Automatically deploys to production
- **Protection:** Direct pushes not allowed, only via PR from `development`

### 🚧 `development` - Development Branch  
- **Purpose:** Active development and testing
- **Database:** Development Supabase (`https://nwoteszpvvefbopbbvrl.supabase.co`)
- **Default for:** New features, bug fixes, experiments
- **Testing:** All features must be tested here before production

### 🌿 `feature/*` - Feature Branches (Optional)
- **Purpose:** Individual features or major changes
- **Created from:** `development` branch
- **Merged to:** `development` branch via PR
- **Naming:** `feature/epic-a-story-001`, `feature/admin-dashboard`, etc.

## Environment Configuration

### Automatic Database Switching
The application automatically uses the correct database based on branch:

```bash
# On development branch
VITE_SUPABASE_URL=https://nwoteszpvvefbopbbvrl.supabase.co (dev)

# On main branch  
VITE_SUPABASE_URL=https://nvryyufpbcruyqqndyjn.supabase.co (prod)
```

### Environment Files
- `.env.development` - Development branch default config
- `.env.production` - Production branch default config  
- `.env.local` - Local overrides (gitignored)
- `.env.example` - Template for all environments

## Workflow

### 1. Daily Development
```bash
# Work on development branch
git checkout development
git pull origin development

# Make changes and commit
git add .
git commit -m "feat: your feature description"
git push origin development
```

### 2. Feature Development (Optional)
```bash
# Create feature branch from development
git checkout development
git checkout -b feature/your-feature-name

# Work on feature
git add .
git commit -m "feat: implement feature"
git push origin feature/your-feature-name

# Create PR to development branch
# After review, merge to development
```

### 3. Production Release
```bash
# When development is stable and ready for production
# Create PR from development → main
# After review and testing, merge to main
# Production deployment happens automatically
```

## Database Management

### Development Database
- **URL:** `https://nwoteszpvvefbopbbvrl.supabase.co`
- **Purpose:** Testing, development, experiments
- **Data:** Can be reset/modified freely
- **Schema:** Should match production but may have test data

### Production Database  
- **URL:** `https://nvryyufpbcruyqqndyjn.supabase.co`
- **Purpose:** Live user data
- **Data:** Real user accounts and events
- **Schema:** Must be stable and backed up

## Best Practices

### ✅ Do
- Always work on `development` branch for new features
- Test thoroughly on development database before production
- Use descriptive commit messages following conventional commits
- Keep `main` branch stable and production-ready
- Review all changes before merging to `main`

### ❌ Don't
- Push directly to `main` branch
- Test experimental code on production database
- Mix development and production environment variables
- Commit sensitive keys or credentials

## Emergency Procedures

### Hotfix for Production
```bash
# For critical production bugs only
git checkout main
git checkout -b hotfix/critical-issue
# Fix the issue
git commit -m "fix: critical production issue"
# Create PR to main
# After merge, also merge main back to development
```

### Database Issues
- Development database issues: Can reset/restore from schema
- Production database issues: Contact admin, use backups only

## Environment Verification

### Check Current Environment
```bash
# View current branch
git branch

# Check environment configuration  
npm run dev
# Look for console log: "🔧 Environment Configuration"
```

### Switch Environments
```bash
# Switch to development
git checkout development

# Switch to production branch (careful!)
git checkout main
```

## Support

For questions about branching strategy or environment setup:
1. Check this documentation
2. Review commit history for examples  
3. Test changes on development first
4. Ask team before making production changes