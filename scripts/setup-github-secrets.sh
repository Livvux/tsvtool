#!/bin/bash
# =============================================================================
# Setup GitHub Secrets - TSVTool
# =============================================================================
# This script helps set up GitHub secrets for CI/CD workflows.
# =============================================================================

set -e

echo "🔐 GitHub Secrets Setup for TSVTool"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "   Install it: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Check if Vercel token is already set
if gh secret list | grep -q "VERCEL_TOKEN"; then
    echo "✅ VERCEL_TOKEN is already set"
else
    echo "⚠️  VERCEL_TOKEN is missing"
    echo ""
    echo "To get your Vercel token:"
    echo "1. Go to https://vercel.com/account/tokens"
    echo "2. Click 'Create Token'"
    echo "3. Give it a name (e.g., 'GitHub Actions')"
    echo "4. Copy the token"
    echo "5. Run this command:"
    echo ""
    echo "   gh secret set VERCEL_TOKEN"
    echo ""
    echo "   (It will prompt you to paste the token)"
    echo ""
    read -p "Press Enter after you've set VERCEL_TOKEN, or Ctrl+C to cancel..."
fi

# Verify all required secrets
echo ""
echo "📋 Checking required secrets..."
echo ""

REQUIRED_SECRETS=(
    "VERCEL_TOKEN"
    "VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID"
    "CONVEX_DEPLOY_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "NEXT_PUBLIC_CONVEX_URL"
    "CONVEX_DEPLOYMENT"
)

MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if gh secret list | grep -q "^${secret}"; then
        echo "✅ ${secret}"
    else
        echo "❌ ${secret} (missing)"
        MISSING_SECRETS+=("${secret}")
    fi
done

echo ""

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    echo "🎉 All required secrets are configured!"
    echo ""
    echo "Your GitHub Actions workflows are ready to use!"
else
    echo "⚠️  Missing secrets: ${MISSING_SECRETS[*]}"
    echo ""
    echo "Set them using:"
    echo "  gh secret set SECRET_NAME"
    exit 1
fi

