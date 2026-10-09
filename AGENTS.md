# Project Workflow Rules: BST Tech Club

## Deployment & Collaboration Protocol

Whenever you perform an update, fix, or feature addition in this repository:

1. **Pull First**: Run `git pull origin main` to ensure we have the latest commits from all collaborators before making changes.
2. **Implement Changes**: Make the requested code modifications cleanly.
3. **Stage & Commit**: Stage changed files with `git add .` and create a descriptive commit:
   ```bash
   git commit -m "feat/fix: descriptive summary of changes"
   ```
4. **Push to Collaborator Remote**:
   Push the commit directly to the `main` branch of the shared repository:
   ```bash
   git push origin main
   ```
5. **Vercel Deployment Verification**:
   Since the GitHub repository is linked to Vercel with automatic CI/CD:
   - Pushing to `origin main` automatically triggers a fresh production build on Vercel.
   - Verify that the deployment succeeds and that `https://bst-tech-club-2gvj.vercel.app` is responding with HTTP 200.
   - Report the deployment status and live link to the user.
