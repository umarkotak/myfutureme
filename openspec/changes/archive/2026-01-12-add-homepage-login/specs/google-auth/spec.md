## ADDED Requirements

### Requirement: Login Page Display

The system SHALL display a login page at `/login` with Google OAuth as the authentication method.

#### Scenario: User visits login page

- **WHEN** a user navigates to `/login`
- **THEN** a login page with Google sign-in button is displayed

### Requirement: Google Sign-In Button

The login page SHALL include a Google sign-in button that initiates the OAuth flow.

#### Scenario: User clicks Google sign-in

- **WHEN** the user clicks the "Sign in with Google" button
- **THEN** the user is redirected to the Google OAuth consent screen

### Requirement: OAuth Callback Handling

The system SHALL handle the OAuth callback and redirect to the appropriate page.

#### Scenario: Successful authentication

- **WHEN** the user completes Google authentication
- **AND** the backend returns a successful response
- **THEN** the user is redirected to the dashboard

#### Scenario: Authentication failure

- **WHEN** the user cancels Google authentication or an error occurs
- **THEN** the user is redirected to the login page with an error message

### Requirement: Login Page Design

The login page SHALL have a clean, minimal design consistent with the overall application branding.

#### Scenario: Login page appearance

- **WHEN** the login page loads
- **THEN** the page displays centered login card with Google button
- **AND** the page includes WorkNote branding
