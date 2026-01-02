# Deploy to GitHub - Step by Step Guide

This guide will help you deploy your Software Support Ticket System to GitHub.

## Prerequisites

- Git installed on your computer
- GitHub account
- Your project is ready to deploy

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `Software-Support-Ticket-System` (or your preferred name)
   - **Description**: "A full-featured support ticket management system"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Add Files to Git (if not already done)

If you haven't committed your files yet:

```bash
# Add all files
git add .

# Commit with a message
git commit -m "Initial commit: Software Support Ticket System"
```

## Step 3: Connect to GitHub Repository

Copy the repository URL from GitHub (it will look like: `https://github.com/yourusername/Software-Support-Ticket-System.git`)

Then run:

```bash
# Add remote repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/Software-Support-Ticket-System.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/yourusername/Software-Support-Ticket-System.git
```

## Step 4: Push to GitHub

```bash
# Push to GitHub
git push -u origin main
```

If you're using a different branch name (like `master`), use:
```bash
git push -u origin master
```

## Step 5: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env` files are NOT visible (they should be ignored)

## Important Notes

### ⚠️ Security Checklist

Before pushing, make sure:

- ✅ `.env` files are in `.gitignore` (they are!)
- ✅ No passwords or API keys are in the code
- ✅ `node_modules/` is ignored
- ✅ Uploaded files in `backend/uploads/` are ignored

### Files That Should NOT Be on GitHub

These are automatically ignored by `.gitignore`:
- `.env` files (contain database passwords, JWT secrets)
- `node_modules/` (dependencies - too large)
- `backend/uploads/*` (user-uploaded files)
- Build outputs (`dist/`, `build/`)

### Files That SHOULD Be on GitHub

- ✅ Source code (`.js`, `.jsx`, `.sql`)
- ✅ Configuration files (`package.json`, `tailwind.config.cjs`)
- ✅ Documentation (`README.md`)
- ✅ Database schema (`db/migrations/schema.sql`)

## Step 6: Create .env.example Files

Create example environment files (without real passwords) so others know what variables are needed:

### `backend/.env.example`
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ssts_db
JWT_SECRET=your-secret-key-here
PORT=4000
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env.example`
```env
VITE_API_URL=http://localhost:4000/api
```

Then commit these:
```bash
git add backend/.env.example frontend/.env.example
git commit -m "Add .env.example files"
git push
```

## Step 7: Update README.md

Make sure your `README.md` includes:
- Installation instructions
- How to set up the database
- How to configure environment variables
- How to run the project

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/yourusername/your-repo.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: Authentication failed
- Use GitHub Personal Access Token instead of password
- Or use SSH: `git@github.com:username/repo.git`

## Next Steps After Deployment

1. **Add a README badge** showing the project status
2. **Add screenshots** to the README
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Add issues and project boards** for tracking
5. **Consider deploying** to a hosting service (Vercel, Netlify, Heroku, etc.)

## Quick Commands Reference

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View remote
git remote -v
```

## Need Help?

- [GitHub Docs](https://docs.github.com/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Desktop](https://desktop.github.com/) - GUI alternative

---

**Remember**: Never commit `.env` files with real passwords or API keys!

