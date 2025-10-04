# Development Workflow

## 🎯 Sandbox Environment Setup

### Branch Structure:
- **`main`**: Production environment (live site)
- **`sandbox`**: Development/testing environment
- **`feature/*`**: Feature-specific branches

### Development Workflow:

#### 1. Make Changes in Sandbox:
```bash
# Switch to sandbox branch
git checkout sandbox

# Make your changes
# Edit files, test locally, etc.

# Commit changes
git add .
git commit -m "Your changes here"

# Push to sandbox (creates preview deployment)
git push origin sandbox
```

#### 2. Test in Preview:
- Vercel automatically creates a preview URL
- Test all functionality in the preview environment
- Check admin panel, video management, etc.

#### 3. Deploy to Production:
```bash
# Merge sandbox to main
git checkout main
git merge sandbox
git push origin main
```

### Preview URLs:
- **Production**: https://suriez-kitchen.vercel.app
- **Sandbox**: https://suriez-kitchen-git-sandbox-suriezkitchen.vercel.app

### Environment Variables:
Both environments use the same environment variables from Vercel dashboard.

### Database:
Both environments share the same Neon PostgreSQL database, so be careful with:
- Admin user creation
- Data modifications
- Schema changes

## 🛡️ Safe Development Tips:

1. **Test First**: Always test in sandbox before production
2. **Backup Data**: Export important data before major changes
3. **Feature Flags**: Use environment variables for feature toggles
4. **Database Migrations**: Test migrations in sandbox first

## 🔧 Local Development:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run database migrations
npm run db:migrate
```
