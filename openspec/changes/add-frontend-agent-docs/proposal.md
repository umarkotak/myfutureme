# Change: Add Frontend Agent Documentation

## Why

The Worknote API needs comprehensive documentation for AI agents to interact with the backend services. This enables agents to help users manage job applications, application logs, and work logs programmatically. Currently, the frontend only has Google login implemented, but the backend has full CRUD operations for job hunting and work logging features.

Additionally, the user needs a **VS Code-like compact UI** to manage job applications and work logs efficiently.

## What Changes

- **API Documentation Spec**: Create a specification document describing all API endpoints for AI agents
  - Authentication endpoints (Google OAuth, user validation)
  - Job Application CRUD operations (create, read, update, delete, list with search/filter)
  - Job Application Log nested CRUD operations
  - Work Log operations (upsert, list, retrieve by date)
  - Error handling format and status codes
- **Frontend API Client Extension**: Add missing API methods to `lib/api.js` to support all documented endpoints
- **VS Code-like Dashboard UI**: Create a compact, efficient dashboard with:
  - Sidebar navigation (like VS Code's activity bar)
  - Panel-based layout for job applications and work logs
  - Collapsible sections and tree views
  - Quick actions and keyboard shortcuts
  - Dark/light theme support

## Impact

- Affected specs: `frontend-agent-docs` (new capability)
- Affected code:
  - `lib/api.js` - Add new API methods
  - `pages/dashboard.js` - New VS Code-like dashboard page
  - `components/dashboard/` - New dashboard components (Sidebar, Panel, TreeView, etc.)
  - Documentation for AI agents to use the API
