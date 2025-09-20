# Branch Protection Rules

This document outlines the recommended branch protection rules for the Suriez Kitchen repository.

## Recommended GitHub Settings

### For `main` branch (Production)

**Required Settings:**

- ✅ **Require a pull request before merging**

  - Require approvals: `1` (or more based on team size)
  - Dismiss stale PR approvals when new commits are pushed
  - Require review from code owners (if configured)

- ✅ **Require status checks to pass before merging**

  - Require branches to be up to date before merging
  - Status checks required:
    - `test-and-build` (from production.yml)
    - `deploy-production` (from production.yml)

- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits** (optional but recommended)
- ✅ **Require linear history** (optional)
- ✅ **Include administrators** (apply rules to admins too)

**Restrictions:**

- ✅ **Restrict pushes that create files** (optional)
- ✅ **Allow force pushes**: `Everyone` (or restrict to specific users)
- ✅ **Allow deletions**: `Everyone` (or restrict to specific users)

### For `sandbox` branch (Development)

**Required Settings:**

- ✅ **Require a pull request before merging**

  - Require approvals: `0` (or `1` for larger teams)
  - Dismiss stale PR approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**

  - Require branches to be up to date before merging
  - Status checks required:
    - `test-and-build` (from sandbox.yml)

- ✅ **Require conversation resolution before merging**
- ✅ **Include administrators** (apply rules to admins too)

**Restrictions:**

- ✅ **Allow force pushes**: `Everyone` (or restrict to specific users)
- ✅ **Allow deletions**: `Everyone` (or restrict to specific users)

## How to Set Up Branch Protection

1. **Go to your GitHub repository**
2. **Navigate to Settings → Branches**
3. **Click "Add rule" or "Add branch protection rule"**
4. **Configure the rules as outlined above**

## Workflow Summary

### Development Flow

1. **Create feature branch** from `sandbox`
2. **Develop and test** your changes
3. **Create PR** to `sandbox` branch
4. **Review and merge** to `sandbox`
5. **Automatic deployment** to staging environment

### Production Flow

1. **Create PR** from `sandbox` to `main`
2. **Code review** and approval required
3. **Merge to main** (triggers production deployment)
4. **Automatic deployment** to production environment

## Environment Protection

### Production Environment

- **Manual approval required** (configure in GitHub Actions)
- **Only deployable from `main` branch**
- **Requires successful CI/CD pipeline**

### Sandbox Environment

- **Automatic deployment** on successful build
- **Deployable from `sandbox` branch**
- **Used for testing and validation**

## Security Considerations

1. **Environment Variables**: Store sensitive data in GitHub Secrets
2. **API Keys**: Never commit API keys to the repository
3. **Database Credentials**: Use environment-specific configurations
4. **Access Control**: Limit who can merge to production

## Monitoring and Alerts

- **Set up notifications** for failed deployments
- **Monitor build status** in GitHub Actions
- **Track deployment history** in your hosting platform
- **Set up error monitoring** (e.g., Sentry, LogRocket)

## Rollback Strategy

- **Keep deployment artifacts** for quick rollbacks
- **Database migrations** should be reversible
- **Feature flags** for gradual rollouts
- **Blue-green deployments** for zero-downtime updates
