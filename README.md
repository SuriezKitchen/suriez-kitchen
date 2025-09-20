# ChefVlog - Culinary Content Management System

A modern full-stack web application for managing and showcasing culinary content, specifically designed for Suriez Kitchen cooking vlog.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + SQLite + Drizzle ORM
- **Deployment**: Cloudflare Pages + Cloudflare D1
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chefvlog-cicd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5175
   - Admin: http://localhost:5175/admin/login

## 🌿 Branch Strategy

### Branches

- **`main`** - Production branch (automatically deployed to production)
- **`sandbox`** - Development branch (automatically deployed to staging)

### Workflow

1. **Development**: Work on `sandbox` branch
2. **Testing**: Create Pull Request from `sandbox` to `main`
3. **Review**: Code review and approval process
4. **Deployment**: Merge to `main` triggers production deployment

## 🔄 CI/CD Pipeline

### Automated Processes

- **On Push to `sandbox`**:
  - Run tests and build validation
  - Deploy to staging environment
  - Notify team of staging deployment

- **On Push to `main`**:
  - Run tests and build validation
  - Deploy to production environment
  - Run database migrations
  - Notify team of production deployment

- **On Pull Request**:
  - Run validation checks
  - Build and test
  - Post PR status comments

### Manual Steps

1. **Create Feature Branch** (from `sandbox`)
2. **Develop and Test** locally
3. **Push to `sandbox`** for staging deployment
4. **Create Pull Request** to `main`
5. **Code Review** and approval
6. **Merge to `main`** for production deployment

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run database migrations

# Deployment
npm run deploy       # Deploy to Cloudflare Pages
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

- `YOUTUBE_API_KEY` - YouTube Data API key
- `YOUTUBE_CHANNEL_ID` - YouTube channel ID
- `SESSION_SECRET` - Session encryption secret
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

### GitHub Secrets

Configure these secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STAGING_PROJECT_NAME`
- `CLOUDFLARE_PRODUCTION_PROJECT_NAME`

## 📊 Database Schema

The application uses SQLite with the following main entities:

- **dishes** - Culinary creations
- **videos** - YouTube video metadata
- **categories** - Dish organization
- **social_links** - Social media links
- **settings** - Configuration storage
- **admin_users** - Admin authentication

## 🔒 Security Features

- Session-based authentication
- Password strength validation
- Rate limiting for login attempts
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM

## 🎨 Features

### Public Website
- Hero section with video background
- Gallery of culinary creations
- YouTube video integration
- Contact form
- Responsive design

### Admin Dashboard
- Dish management (CRUD)
- Category management
- YouTube API configuration
- Settings management
- Password management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `sandbox`
3. Make your changes
4. Test thoroughly
5. Push to `sandbox` branch
6. Create a Pull Request to `main`
7. Address review feedback
8. Merge when approved

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check existing issues
2. Create a new issue with detailed description
3. Contact the development team

---

**Happy Cooking! 👨‍🍳👩‍🍳**
