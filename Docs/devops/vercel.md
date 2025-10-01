# Vercel Deployment Guide

## Safe Deployment Workflow

To ensure successful deployments to Vercel, always test locally with the Vercel CLI before pushing to GitHub.

### Prerequisites

```bash
# Install Vercel CLI globally
npm i -g vercel

# Link to your Vercel project (first time only)
vercel link
```

### Deployment Steps

#### 1. Test Build Locally with Vercel CLI

Before pushing any code changes to GitHub, run the Vercel CLI locally to simulate the exact production build environment:

```bash
# Clean caches and run production build
rm -rf .vercel && vercel --prod --yes
```

**What this does:**
- Removes cached build artifacts
- Uploads your code to Vercel's build environment
- Runs the exact same build process as GitHub auto-deployment
- Shows you any errors before they reach production

#### 2. Fix Any Build Errors

If the build fails, fix the errors and repeat step 1 until the build passes successfully.

Common issues to check:
- TypeScript strict mode errors (unused imports/variables)
- Missing dependencies in `package.json`
- Path resolution issues with `@/` imports
- Environment variables

#### 3. Push to GitHub

Once the Vercel CLI build succeeds locally:

```bash
git add -A
git commit -m "Your commit message"
git push
```

#### 4. Monitor Vercel Deployment

After pushing to GitHub:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `beeri-manager`
3. Watch the deployment progress
4. Check for any errors in the build logs

Or use the CLI:

```bash
# View latest deployment logs
vercel logs
```

### Quick Reference Commands

```bash
# Local production build (recommended before push)
rm -rf .vercel && vercel --prod --yes

# View deployment logs
vercel logs

# Redeploy the last deployment
vercel redeploy

# List all deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>
```

### Important Notes

  **Always test with `vercel --prod --yes` before pushing to git**

- Local `npm run build` may succeed while Vercel fails due to:
  - Different Node.js versions
  - Different dependency resolution
  - Missing environment variables
  - Webpack configuration differences

 **If Vercel CLI passes locally, GitHub deployment will succeed**

### Troubleshooting

#### Build fails with "Module not found"
- Check that all `@types/*` packages are in `dependencies`, not `devDependencies`
- Verify `typescript` is in `dependencies`
- Check that `baseUrl: "."` is set in `tsconfig.json`

#### TypeScript strict mode errors
- Run `npm run build` locally first to see all errors
- Fix unused imports and variables
- Check `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json`

#### Environment variables missing
- Check that all required env vars are set in Vercel dashboard
- Don't reference secrets in `vercel.json` - set them in the dashboard instead

### Workflow Summary

```
1. Make code changes
2. Run: rm -rf .vercel && vercel --prod --yes
3. If fails: Fix errors, go to step 2
4. If passes: git add -A && git commit -m "..." && git push
5. Monitor Vercel dashboard for successful deployment
```

This ensures zero-downtime deployments and catches errors before they reach production.
