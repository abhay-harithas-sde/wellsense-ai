# Repository Accessibility Verification Guide

## Overview

This guide provides a comprehensive checklist for ensuring the WellSense AI GitHub repository is publicly accessible and ready for demo day submission. Follow these steps to verify that judges and reviewers can access all project materials without authentication.

**Validates**: Requirements 4.1, 9.3

---

## 1. Making the Repository Public

### Steps to Make Repository Public

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click on **Settings** tab (top right)
   - Scroll down to the **Danger Zone** section at the bottom

2. **Change Visibility**
   - Click **Change visibility**
   - Select **Make public**
   - GitHub will ask you to confirm by typing the repository name
   - Type the repository name exactly as shown
   - Click **I understand, change repository visibility**

3. **Verify Public Status**
   - Look for the **Public** badge next to your repository name
   - The repository URL should be accessible without login

### Important Considerations Before Making Public

- ✅ Ensure `.env` file is in `.gitignore` (already configured)
- ✅ Verify no API keys or secrets are committed (use security scanner)
- ✅ Check that sensitive credentials are removed from code
- ✅ Confirm README is complete and professional
- ✅ Verify all documentation is up to date

---

## 2. Testing Repository Access Without Authentication

### Method 1: Incognito/Private Browser Window

1. **Open Incognito Mode**
   - Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Edge: `Ctrl+Shift+N` (Windows)

2. **Navigate to Repository**
   - Go to: `https://github.com/YOUR_USERNAME/wellsense-ai`
   - Replace `YOUR_USERNAME` with your actual GitHub username

3. **Verify Access**
   - ✅ Repository page loads without login prompt
   - ✅ All tabs are visible (Code, Issues, Pull requests, etc.)
   - ✅ README.md displays correctly on the main page
   - ✅ File tree is visible and browsable

### Method 2: Ask a Team Member

1. **Share Repository URL**
   - Send the repository URL to a team member who is NOT a collaborator
   - Ask them to access it without logging into GitHub

2. **Verify They Can**
   - View all files and folders
   - Read the README
   - Browse code files
   - View commit history
   - Download or clone the repository

### Method 3: Use GitHub API

Test programmatically using curl:

```bash
# Test repository accessibility
curl -I https://api.github.com/repos/YOUR_USERNAME/wellsense-ai

# Should return HTTP 200 OK
# If it returns 404, the repository is private or doesn't exist
```

---

## 3. Verifying All Important Files Are Accessible

### Essential Files Checklist

Use this checklist to verify all critical files are present and accessible:

#### Root Directory Files

- [ ] **README.md** - Main project documentation
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai`
  - Verify it displays on the repository homepage
  - Check all sections are complete (Overview, Tech Stack, Installation, etc.)

- [ ] **LICENSE** - Project license
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/LICENSE`
  - Verify file is accessible and contains MIT License text

- [ ] **.gitignore** - Git ignore configuration
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/.gitignore`
  - Verify it includes `node_modules/`, `.env`, and build artifacts

- [ ] **package.json** - Project dependencies
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/package.json`
  - Verify file is accessible and contains all dependencies

#### Source Code Directories

- [ ] **src/** - Frontend React source code
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/src`
  - Verify folder is accessible and contains components

- [ ] **lib/** - Backend utilities
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/lib`
  - Verify folder contains `ai.js`, `auth.js`, `database.js`, `firebase.js`

- [ ] **routes/** - Express API routes
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/routes`
  - Verify folder is accessible

- [ ] **prisma/** - Database schema
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/prisma`
  - Verify `schema.prisma` is accessible

#### Configuration Files

- [ ] **docker/docker-compose.yml** - Docker configuration
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/docker/docker-compose.yml`
  - Verify file is accessible

- [ ] **vite.config.js** - Vite configuration
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/vite.config.js`
  - Verify file is accessible

- [ ] **tailwind.config.js** - Tailwind CSS configuration
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/blob/main/tailwind.config.js`
  - Verify file is accessible

#### Documentation

- [ ] **docs/** - Additional documentation
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/docs`
  - Verify folder is accessible

- [ ] **presentation/** - Demo day materials
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/presentation`
  - Verify folder is accessible (if it contains public materials)

#### Scripts

- [ ] **scripts/** - Utility scripts
  - Navigate to: `https://github.com/YOUR_USERNAME/wellsense-ai/tree/main/scripts`
  - Verify validation and data population scripts are accessible

### Files That Should NOT Be Accessible

Verify these sensitive files are NOT visible in the repository:

- [ ] **.env** - Environment variables (should be in .gitignore)
- [ ] **.env.local** - Local environment overrides
- [ ] **node_modules/** - Dependencies (should be in .gitignore)
- [ ] **dist/** - Build artifacts (should be in .gitignore)
- [ ] Any files containing API keys or secrets

---

## 4. Common Issues and Resolutions

### Issue 1: Repository Shows as Private

**Symptoms:**
- 404 error when accessing repository URL without login
- "This repository is private" message

**Resolution:**
1. Go to repository Settings
2. Scroll to Danger Zone
3. Click "Change visibility" → "Make public"
4. Confirm the change

### Issue 2: README Not Displaying

**Symptoms:**
- Repository page shows file list but no README content
- README.md exists but doesn't render

**Resolution:**
1. Ensure file is named exactly `README.md` (case-sensitive)
2. Verify file is in the root directory
3. Check file is not empty
4. Ensure file uses valid Markdown syntax
5. Try renaming to `README.md` if it has a different extension

### Issue 3: Files Showing 404 Errors

**Symptoms:**
- Specific files or folders return 404 when accessed
- File tree shows files but clicking them fails

**Resolution:**
1. Verify files are committed and pushed to GitHub
2. Check branch name (ensure you're on `main` or `master`)
3. Verify file paths are correct (case-sensitive)
4. Run `git push origin main` to ensure all commits are pushed

### Issue 4: .env File Visible in Repository

**Symptoms:**
- `.env` file appears in file tree
- Environment variables are exposed publicly

**Resolution:**
1. **CRITICAL**: Immediately rotate all exposed API keys and secrets
2. Add `.env` to `.gitignore`:
   ```
   # Environment variables
   .env
   .env.local
   .env.*.local
   ```
3. Remove `.env` from Git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   git push origin main
   ```
4. Create `.env.example` with placeholder values:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_database_url_here
   ```

### Issue 5: Large Files Causing Issues

**Symptoms:**
- Repository clone is very slow
- GitHub shows warnings about large files
- Files over 100MB fail to push

**Resolution:**
1. Identify large files:
   ```bash
   find . -type f -size +10M
   ```
2. Add large files to `.gitignore`
3. Use Git LFS for necessary large files:
   ```bash
   git lfs install
   git lfs track "*.mp4"
   git lfs track "*.zip"
   ```
4. Consider hosting large demo videos externally (YouTube, Vimeo)

### Issue 6: Broken Links in README

**Symptoms:**
- Links in README return 404 errors
- Images don't display
- Relative links don't work

**Resolution:**
1. Use relative paths for internal files:
   ```markdown
   [Documentation](./docs/GUIDE.md)
   ![Logo](./LOGO/L1.png)
   ```
2. Verify file paths are correct and case-sensitive
3. Test all links in incognito mode
4. Use absolute URLs for external resources

### Issue 7: Repository Not Found

**Symptoms:**
- Repository URL returns 404
- GitHub says repository doesn't exist

**Resolution:**
1. Verify repository name is correct
2. Check if repository was accidentally deleted
3. Ensure you're using the correct GitHub username
4. Verify repository wasn't transferred to another account

---

## 5. Pre-Submission Verification Checklist

Complete this checklist before submitting the repository URL for demo day:

### Repository Status
- [ ] Repository is set to **Public**
- [ ] Repository name is professional and descriptive
- [ ] Repository has a clear description

### Documentation
- [ ] README.md is complete and displays correctly
- [ ] README includes project overview
- [ ] README includes tech stack
- [ ] README includes installation instructions
- [ ] README includes running instructions for port 3000
- [ ] README includes team member information
- [ ] LICENSE file is present

### Security
- [ ] No `.env` files are committed
- [ ] No API keys or secrets are exposed
- [ ] Security scan has been run (use `node scripts/security-scan.js`)
- [ ] All sensitive data uses environment variables
- [ ] `.gitignore` is properly configured

### Code Quality
- [ ] All source code is accessible
- [ ] No broken links in documentation
- [ ] No placeholder text in code or docs
- [ ] Code is properly organized in directories
- [ ] All dependencies are listed in `package.json`

### Accessibility Test
- [ ] Repository accessible in incognito mode
- [ ] All files can be viewed without login
- [ ] README displays on repository homepage
- [ ] File tree is browsable
- [ ] Clone/download works without authentication

### Submission Requirements
- [ ] Repository URL is correct and accessible
- [ ] Repository URL has been tested by a non-collaborator
- [ ] Repository URL has been added to submission materials
- [ ] Team roster includes GitHub usernames (if required)

---

## 6. Quick Verification Script

Use this script to quickly verify repository accessibility:

```bash
#!/bin/bash

# Repository Accessibility Verification Script
# Usage: ./verify-repo-access.sh YOUR_USERNAME wellsense-ai

USERNAME=$1
REPO=$2

echo "🔍 Verifying repository accessibility..."
echo "Repository: https://github.com/$USERNAME/$REPO"
echo ""

# Test repository API endpoint
echo "1. Testing repository API..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.github.com/repos/$USERNAME/$REPO)

if [ $STATUS -eq 200 ]; then
    echo "✅ Repository is accessible (HTTP $STATUS)"
else
    echo "❌ Repository is NOT accessible (HTTP $STATUS)"
    echo "   Make sure the repository is public"
    exit 1
fi

# Test README
echo ""
echo "2. Testing README..."
README_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/$USERNAME/$REPO/main/README.md)

if [ $README_STATUS -eq 200 ]; then
    echo "✅ README.md is accessible"
else
    echo "❌ README.md is NOT accessible (HTTP $README_STATUS)"
fi

# Test package.json
echo ""
echo "3. Testing package.json..."
PACKAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/$USERNAME/$REPO/main/package.json)

if [ $PACKAGE_STATUS -eq 200 ]; then
    echo "✅ package.json is accessible"
else
    echo "❌ package.json is NOT accessible (HTTP $PACKAGE_STATUS)"
fi

# Test .env is NOT accessible (should return 404)
echo ""
echo "4. Verifying .env is NOT exposed..."
ENV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/$USERNAME/$REPO/main/.env)

if [ $ENV_STATUS -eq 404 ]; then
    echo "✅ .env is properly hidden (HTTP $ENV_STATUS)"
else
    echo "⚠️  WARNING: .env might be exposed (HTTP $ENV_STATUS)"
    echo "   Immediately check if .env is in .gitignore"
fi

echo ""
echo "✅ Verification complete!"
echo "Repository URL: https://github.com/$USERNAME/$REPO"
```

Save this as `scripts/verify-repo-access.sh` and run:

```bash
chmod +x scripts/verify-repo-access.sh
./scripts/verify-repo-access.sh YOUR_USERNAME wellsense-ai
```

---

## 7. Final Submission Checklist

Before submitting the repository URL to demo day organizers:

- [ ] Repository is public and accessible
- [ ] Tested access in incognito mode
- [ ] All essential files are accessible
- [ ] No sensitive data is exposed
- [ ] README is complete and professional
- [ ] Repository URL has been verified by another team member
- [ ] Repository URL is copied to submission form
- [ ] Backup copy of repository URL is saved

**Repository URL Format:**
```
https://github.com/YOUR_USERNAME/wellsense-ai
```

---

## 8. Emergency Procedures

### If Repository Becomes Inaccessible During Demo Day

1. **Immediate Actions:**
   - Check GitHub status: https://www.githubstatus.com/
   - Verify repository is still public (Settings → Danger Zone)
   - Test access from another device/network

2. **Backup Options:**
   - Have repository URL written down on paper
   - Keep a local clone on USB drive
   - Have screenshots of repository homepage
   - Prepare to share screen showing local repository

3. **Communication:**
   - Inform judges immediately if there's an issue
   - Explain the situation calmly
   - Offer alternative ways to view the code (local clone, USB)

---

## Summary

This guide ensures your WellSense AI repository is fully accessible for demo day submission. The key steps are:

1. ✅ Make repository public
2. ✅ Test access without authentication
3. ✅ Verify all important files are accessible
4. ✅ Resolve any common issues
5. ✅ Complete pre-submission checklist
6. ✅ Run verification script
7. ✅ Submit repository URL with confidence

**Remember:** Always test repository accessibility from an incognito browser window before final submission!

---

**Last Updated:** Demo Day Preparation
**Validates:** Requirements 4.1, 9.3
