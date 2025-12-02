# GitHub Workflows Documentation 🚀

This document describes the GitHub Actions workflows configured for TSVTool.

## Overview

TSVTool uses a comprehensive CI/CD pipeline with the following workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| 🔍 CI | Push/PR to main branches | Type checking, linting, testing, build verification |
| 🚀 Preview | PR opened/updated | Deploy preview to Vercel with Lighthouse audit |
| 🌐 Production | Push to master/main | Deploy to production with Convex sync |
| 🔒 Security | Weekly + PR to main | CodeQL analysis, dependency audit, secret scanning |
| 🕐 Stale | Daily | Mark and close inactive issues/PRs |
| 🏷️ Labeler | PR opened/updated | Auto-label PRs based on changed files |
| 📦 Release | Tag push | Create GitHub releases with changelog |

---

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Vercel Deployment

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` after `vercel link` |

### Convex Deployment

| Secret | Description | How to Get |
|--------|-------------|------------|
| `CONVEX_DEPLOY_KEY` | Convex deploy key | [Convex Dashboard](https://dashboard.convex.dev) → Project Settings → Deploy Keys |

### Application Secrets (for CI build)

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Convex deployment name |

---

## Workflow Details

### 🔍 CI Workflow (`ci.yml`)

**Triggers:** Push/PR to `master`, `main`, `develop`

**Jobs:**
1. **Setup** - Install dependencies and cache
2. **Type Check** - Run TypeScript compiler
3. **Lint** - Run ESLint
4. **Test** - Run Vitest tests
5. **Build** - Verify production build succeeds
6. **CI Success** - Final status check for branch protection

**Features:**
- Parallel job execution for speed
- Aggressive caching (pnpm, Next.js build cache)
- Concurrency control (cancels in-progress runs)
- Coverage report upload

### 🚀 Preview Workflow (`preview.yml`)

**Triggers:** PR opened/synchronized/reopened

**Jobs:**
1. **Deploy Preview** - Build and deploy to Vercel preview
2. **Lighthouse** - Run performance audit

**Features:**
- Automatic PR comments with preview URL
- Lighthouse scores in PR comment
- Environment URL in GitHub UI

### 🌐 Production Workflow (`production.yml`)

**Triggers:** Push to `master`/`main`, manual dispatch

**Jobs:**
1. **Pre-flight Checks** - Type check, lint, test
2. **Deploy Convex** - Deploy Convex functions
3. **Deploy Production** - Deploy to Vercel production
4. **Health Check** - Verify deployment is healthy
5. **Create Release** - Tag the release
6. **Notify Failure** - Alert on failures

**Features:**
- Emergency deploy option (skip tests)
- Automatic release tagging
- Health check with retry
- Failure notifications

### 🔒 Security Workflow (`security.yml`)

**Triggers:** Push/PR to main branches, weekly schedule

**Jobs:**
1. **CodeQL Analysis** - Static code analysis
2. **Dependency Audit** - Check for vulnerable dependencies
3. **Secret Scan** - Scan for leaked secrets
4. **License Check** - Verify dependency licenses

**Features:**
- Security-extended CodeQL queries
- TruffleHog secret scanning
- License compliance report

### 🕐 Stale Workflow (`stale.yml`)

**Triggers:** Daily at midnight UTC

**Features:**
- Marks issues stale after 60 days
- Marks PRs stale after 30 days
- Closes stale items after 14 days
- Exempts pinned/security/critical items

### 🏷️ Labeler Workflow (`labeler.yml`)

**Triggers:** PR opened/synchronized/reopened

**Auto-labels:**
- `frontend` - Changes to app/, components/
- `backend` - Changes to convex/
- `config` - Configuration file changes
- `ci` - GitHub Actions changes
- `documentation` - Docs and markdown
- `tests` - Test file changes
- `security` - Security-sensitive files
- And more...

### 📦 Release Workflow (`release.yml`)

**Triggers:** Tag push (`v*`), manual dispatch

**Features:**
- Automatic changelog generation
- GitHub release creation
- Pre-release detection (alpha/beta/rc)

---

## Branch Protection Rules

Recommended settings for `master`/`main`:

1. **Require pull request reviews**
   - Required approving reviews: 1
   - Dismiss stale reviews: ✅
   - Require review from CODEOWNERS: ✅

2. **Require status checks**
   - Required checks:
     - `🔷 Type Check`
     - `🧹 Lint`
     - `🧪 Test`
     - `🏗️ Build`
     - `✅ CI Success`

3. **Other settings**
   - Require branches to be up to date: ✅
   - Require signed commits: Optional
   - Include administrators: ✅

---

## Dependabot Configuration

Dependabot is configured to:

- Check for updates weekly (Mondays at 9am Berlin time)
- Group related updates (React, Next.js, Convex, etc.)
- Ignore major version updates (review manually)
- Update GitHub Actions

---

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow
act push

# Run specific job
act push -j typecheck

# Run with secrets
act push --secret-file .secrets
```

---

## Troubleshooting

### Build Fails in CI but Works Locally

1. Check environment variables are set as secrets
2. Verify `pnpm-lock.yaml` is committed
3. Check Node.js version matches (20)

### Preview Deployment Fails

1. Verify Vercel secrets are configured
2. Check Vercel project is linked
3. Review Vercel build logs

### Convex Deploy Fails

1. Verify `CONVEX_DEPLOY_KEY` is set
2. Check Convex schema is valid
3. Review Convex dashboard logs

### Stale Bot Closing Valid Issues

Add one of these labels to exempt:
- `pinned`
- `security`
- `critical`
- `in-progress`

---

## Adding New Workflows

1. Create workflow file in `.github/workflows/`
2. Use existing workflows as templates
3. Follow naming convention: `name.yml`
4. Add documentation to this file
5. Test with `act` before pushing

---

*Last Updated: December 2025*

