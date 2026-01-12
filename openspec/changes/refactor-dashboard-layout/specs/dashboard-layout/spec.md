# Dashboard Layout

## ADDED Requirements

### Requirement: DashboardLayout Component

The system MUST provide a reusable `DashboardLayout` component that encapsulates the header, activity bar, and main content area layout for dashboard pages.

#### Scenario: Dashboard page renders with layout component

- **WHEN** a user navigates to the dashboard page
- **THEN** the header should display the WorkNote logo and user info
- **AND** the activity bar should be visible on the left
- **AND** the main content area should display the active section

#### Scenario: Layout handles logout action

- **WHEN** a user clicks the logout button in the header
- **THEN** the user should be logged out and redirected to the login page

### Requirement: Toast Notifications

The system MUST use react-toastify for toast notifications instead of native `alert()` dialogs.

#### Scenario: Success toast shows on save

- **WHEN** a user saves a job application or log
- **AND** the save operation succeeds
- **THEN** a success toast notification should appear

#### Scenario: Error toast shows on failure

- **WHEN** a user attempts an action that fails
- **AND** the API returns an error
- **THEN** an error toast notification should appear with the error message
