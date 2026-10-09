# Project Workflow Rules: BST Tech Club

## Deployment & Collaboration Protocol (Vercel CI/CD)

This repository is connected to **Vercel Production Deployments** under the repository owner account (`XiaoArnav`). 

To prevent Vercel deployment permission failures (`"Author is not a team member"`), all collaborators and AI coding agents must follow this **Branch & Pull Request Protocol**:

---

### Collaborator Workflow (Pull Request Protocol)

Collaborators (e.g., Vikas, and other contributors) **must NEVER push directly to the `main` branch**. Always use feature branches and Pull Requests:

1. **Pull Latest Main**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or fix/your-bugfix-name
   ```

3. **Implement Changes & Test**:
   Make modifications cleanly, preserving existing structure and documentation integrity.

4. **Stage & Commit**:
   ```bash
   git add .
   git commit -m "feat/fix: descriptive summary of changes"
   ```

5. **Push Feature Branch to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request (PR)**:
   - Go to GitHub and open a Pull Request targeting `main`.
   - Vercel will automatically generate a **Preview Deployment** link for your PR.
   - Notify the repository owner (`XiaoArnav`) to review and merge.

---

### Production Deployment (Repository Owner `XiaoArnav`)

When the repository owner (`XiaoArnav`) merges a Pull Request (or deploys authorized fixes directly from the primary environment):
- GitHub automatically triggers the Vercel production build.
- Because the merge/commit is authorized by the repository owner, **all 3 Vercel production deployments (`bst-tech-club`, `bst-tech-club-2gvj`, `bst-club-portal`) build and turn green immediately**.
- Production sites:
  - `https://bst-tech-club-2gvj.vercel.app`
  - `https://bst-club-portal.vercel.app`

