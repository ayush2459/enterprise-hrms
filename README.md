# Enterprise HRMS — Premium Local V2

A premium local-only V2 upgrade of the existing **Enterprise HRMS** platform.

> **Important:** This V2 is intended strictly for local development and testing. **GitHub, the existing production codebase, and production deployments remain untouched.**

---

## 🚀 What's New in V2

Enterprise HRMS Premium Local V2 focuses on improving the local development experience and resolving the Next.js 15 production-build issue affecting workspace pages.

### ✅ Next.js 15 Build Fix

V2 resolves the Next.js 15 build failure caused by `useSearchParams()` being used outside a React `Suspense` boundary.

The affected areas include:

* Manager Workspace
* Employee Workspace
* `WorkspaceShell`
* Other workspace components relying on URL search parameters

The affected components have been structured to use the appropriate `Suspense` boundaries, allowing the application to successfully complete the production build.

### ✨ Premium Local Experience

The V2 environment is designed to provide a clean, stable local version of the existing HRMS without modifying the deployed application.

You can safely experiment with:

* UI improvements
* Workspace enhancements
* Dashboard refinements
* Employee-management features
* Manager workflows
* HR/Admin workflows
* Frontend architecture changes
* New local features and experiments

All changes remain local unless explicitly committed and pushed.

---

## 🛡️ Production Safety

This version is **LOCAL ONLY**.

### Production

* ❌ No production deployment changes
* ❌ No production backend changes
* ❌ No production database changes
* ❌ No changes to the deployed frontend
* ❌ No changes to Render/Vercel configuration
* ❌ No changes to existing production environment variables

### GitHub

* ❌ No automatic GitHub changes
* ❌ No requirement to push V2 changes
* ✅ Existing repository remains untouched unless you explicitly commit/push changes

### Local Environment

* ✅ Safe for experimentation
* ✅ Safe for UI changes
* ✅ Safe for testing new features
* ✅ Safe for build validation
* ✅ Safe for local debugging

---

# 🧑‍💻 Getting Started

## 1. Navigate to the Frontend

From the Enterprise HRMS project root:

```bash
cd frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Run Type Checking

Verify that the frontend contains no TypeScript errors:

```bash
npm run type-check
```

Expected result:

```text
No TypeScript errors
```

---

## 4. Create a Production Build

Run the production build locally:

```bash
npm run build
```

This validates that the Next.js application can successfully compile and generate the production build.

The V2 build specifically addresses the previous `useSearchParams()` / `Suspense` issue.

---

## 5. Start the Local Development Server

```bash
npm run dev
```

The frontend will be available at:

**http://localhost:3007**

---

# 📋 Recommended Development Flow

For the most reliable workflow, run:

```bash
cd frontend
npm install
npm run type-check
npm run build
npm run dev
```

Then open:

```text
http://localhost:3007
```

---

# 🔧 Available Commands

| Command              | Purpose                             |
| -------------------- | ----------------------------------- |
| `npm install`        | Install frontend dependencies       |
| `npm run type-check` | Run TypeScript validation           |
| `npm run build`      | Create a production build           |
| `npm run dev`        | Start the local development server  |
| `npm run start`      | Start the built Next.js application |

---

# 🏗️ V2 Architecture Notes

V2 continues to use the existing Enterprise HRMS frontend architecture while addressing compatibility with **Next.js 15**.

A key change is the correct handling of components that depend on:

```tsx
useSearchParams()
```

These components must be rendered within an appropriate:

```tsx
<Suspense>
  ...
</Suspense>
```

boundary so that Next.js can correctly handle client-side URL state during the build and rendering process.

This is particularly important for:

* Workspace navigation
* Search/filter parameters
* Employee workspace state
* Manager workspace state
* URL-driven UI state

---

# 🧪 Local Testing Checklist

Before considering a V2 change complete:

* [ ] `npm install` completes successfully
* [ ] `npm run type-check` passes
* [ ] `npm run build` passes
* [ ] Local server starts successfully
* [ ] Login works
* [ ] Dashboard loads
* [ ] Employee workspace loads
* [ ] Manager workspace loads
* [ ] Workspace navigation works
* [ ] Search/filter URL parameters work
* [ ] No unexpected console errors
* [ ] No production configuration is modified

---

# ⚠️ Important Development Rule

**Do not deploy this V2 directly to production.**

This branch/version exists to provide a safe local environment for development and experimentation.

If a V2 change is eventually considered production-ready, it should first be:

1. Tested locally
2. Type-checked
3. Production-built
4. Functionally tested
5. Reviewed
6. Explicitly approved for integration

Only then should changes be considered for the main production codebase.

---

# 📌 Current Status

**Enterprise HRMS Premium Local V2**

| Area                            | Status             |
| ------------------------------- | ------------------ |
| Local development               | ✅                  |
| Next.js 15 compatibility        | ✅                  |
| `useSearchParams()` build issue | ✅ Fixed            |
| Suspense boundaries             | ✅ Updated          |
| Type checking                   | ✅ Supported        |
| Production build                | ✅ Supported        |
| Local server                    | ✅ `localhost:3007` |
| GitHub production               | 🔒 Untouched       |
| Production deployment           | 🔒 Untouched       |
| Production database             | 🔒 Untouched       |

---

## 🎯 Goal

The goal of Premium Local V2 is to provide a **stable, modern, and safe development environment** for continuing Enterprise HRMS development without risking the currently deployed production system.

**Local first. Test thoroughly. Deploy only when explicitly approved.**
