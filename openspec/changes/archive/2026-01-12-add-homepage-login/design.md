# Design: Homepage and Google Login

## Context

WorkNote is a new application that needs an entry point for users. The homepage should communicate the product's value proposition and guide users to sign in via Google OAuth.

## Goals

- Create a visually appealing, professional homepage
- Provide a simple, frictionless Google login experience
- Establish patterns for API communication with the Go backend

## Non-Goals

- Email/password authentication (only Google OAuth for now)
- User registration flow (handled by backend on first login)
- Dashboard implementation (separate change)

## Decisions

### 1. UI Library: Shadcn UI

- **Rationale**: Already specified in project.md; provides accessible, customizable components
- **Alternative**: Custom components from scratch (rejected: slower development)

### 2. Centralized API Handler

- **Rationale**: Single point for API configuration, auth headers, and error handling
- **Pattern**: `lib/api.js` with methods for each endpoint

### 3. Google OAuth Flow

- **Backend**: `http://localhost:8080`
- **Endpoint**: `POST /auth/google` with `{ id_token: string }` body
- **Flow**:
  1. User clicks "Sign in with Google" button
  2. Google Sign-In client library displays consent popup
  3. Frontend receives Google ID token
  4. Frontend POSTs id_token to backend `/auth/google`
  5. Backend validates, returns session/auth token
  6. Frontend stores token and redirects to dashboard

## Risks / Trade-offs

- **Risk**: Backend API not available → Mock API responses during development
- **Trade-off**: Google-only auth limits users without Google accounts

## Open Questions

- What is the exact backend API URL?
- Are there specific Google OAuth endpoints already implemented?
