# Change: Add Professional Homepage and Google Login

## Why

WorkNote needs a professional landing page to introduce the product and a simple authentication flow using Google login to allow users to access their workspace.

## What Changes

- Add a professional, modern homepage with hero section, features overview, and call-to-action
- Add a Google login page with OAuth integration
- Set up centralized API handler for backend communication
- Install and configure Shadcn UI components

## Impact

- Affected specs: `homepage`, `google-auth`
- Affected code: `pages/index.js`, `pages/login.js` (new), `lib/api.js` (new)
