# Contributing to Suriez Kitchen

Thank you for your interest in contributing to Suriez Kitchen! This document provides guidelines and information for contributors.

## Development Workflow

### Branch Strategy

We use a two-branch strategy:

- **`sandbox`**: Development and staging branch
- **`main`**: Production branch

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/suriez-kitchen.git
   cd suriez-kitchen
   ```

3. **Create a feature branch** from `sandbox`:

   ```bash
   git checkout sandbox
   git pull origin sandbox
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

### Making Changes

1. **Make your changes** following the coding standards
2. **Test your changes** locally
3. **Commit your changes** with descriptive messages:

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** from your feature branch to `sandbox`

### Pull Request Process

1. **Target the correct branch**:

   - Feature/fix PRs → `sandbox`
   - Production releases → `main` (from `sandbox`)

2. **Fill out the PR template** completely
3. **Ensure all checks pass** (CI/CD pipeline)
4. **Request review** from team members
5. **Address feedback** and make necessary changes

### Deployment Process

- **Sandbox deployments**: Automatic on push to `sandbox` branch
- **Production deployments**: Automatic on push to `main` branch (with optional manual approval)

### Code Standards

- Use TypeScript for type safety
- Follow existing code style and patterns
- Add comments for complex logic
- Ensure responsive design for all UI components
- Test your changes thoroughly

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:

- `SESSION_SECRET`: Session encryption secret
- `YOUTUBE_API_KEY`: YouTube API key (if using YouTube features)
- `YOUTUBE_CHANNEL_ID`: YouTube channel ID

### Database

The project uses Drizzle ORM with SQLite for local development and Cloudflare D1 for production.

**Local development**:

```bash
npm run db:push  # Push schema changes
npm run db:generate  # Generate migrations
```

**Production**:

```bash
npm run db:migrate  # Apply migrations to D1
```

### Testing

Run the following commands to ensure code quality:

```bash
npm run check  # TypeScript type checking
npm run build  # Build verification
```

### Reporting Issues

- Use the bug report template for issues
- Use the feature request template for new features
- Provide clear reproduction steps for bugs
- Include relevant screenshots or logs

### Getting Help

- Check existing issues and discussions
- Create a new issue with the appropriate template
- Tag maintainers for urgent issues

## Thank You

Your contributions help make Suriez Kitchen better for everyone! 🍽️
