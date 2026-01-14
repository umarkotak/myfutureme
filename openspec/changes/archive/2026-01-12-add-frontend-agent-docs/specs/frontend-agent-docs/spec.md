## ADDED Requirements

### Requirement: API Base Information

The API documentation SHALL provide base URL and authentication requirements for AI agents to construct valid requests.

#### Scenario: Agent retrieves base configuration

- **WHEN** an AI agent needs to make API requests
- **THEN** it uses the base URL configured for the Worknote API
- **AND** includes `Authorization: Bearer <access_token>` header for protected routes

---

### Requirement: Authentication API

The API SHALL document the Google OAuth authentication endpoint for obtaining access tokens.

#### Scenario: Agent authenticates user via Google

- **WHEN** an agent has a Google ID token from the user
- **THEN** it sends POST to `/auth/google` with body:
  ```json
  { "id_token": "<google_id_token>" }
  ```
- **AND** receives response:
  ```json
  {
    "access_token": "<jwe_token>",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user123",
      "name": "John Doe",
      "picture_url": "https://...",
      "role": "user",
      "google_id": "...",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  }
  ```

#### Scenario: Agent validates current user

- **WHEN** an agent needs to verify the current authenticated user
- **THEN** it sends GET to `/me` with Authorization header
- **AND** receives the user info object

---

### Requirement: Job Application API

The API documentation SHALL provide complete CRUD operations for job applications.

#### Scenario: Agent creates job application

- **WHEN** an agent creates a new job application
- **THEN** it sends POST to `/job-applications/` with body:
  ```json
  {
    "company_name": "Acme Inc",
    "job_title": "Software Engineer",
    "job_url": "https://careers.acme.com/job/123",
    "salary_range": "$100k-$150k",
    "email": "jobs@acme.com",
    "notes": "Referred by John",
    "state": "todo"
  }
  ```
- **AND** `company_name` and `job_title` are required
- **AND** `state` accepts: `todo`, `applied`, `in-progress`, `rejected`, `accepted`, `dropped` (defaults to `todo`)
- **AND** receives `JobApplicationResponse` with assigned `id`

#### Scenario: Agent lists job applications

- **WHEN** an agent lists job applications
- **THEN** it sends GET to `/job-applications/`
- **AND** optionally includes query params: `?search=<text>&state=<state>`
- **AND** receives response:
  ```json
  {
    "data": [
      {
        "id": 1,
        "company_name": "Acme Inc",
        "job_title": "Software Engineer",
        "job_url": "https://...",
        "salary_range": "$100k-$150k",
        "email": "jobs@acme.com",
        "notes": "...",
        "state": "applied",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 1
  }
  ```

#### Scenario: Agent retrieves single job application

- **WHEN** an agent retrieves a specific job application
- **THEN** it sends GET to `/job-applications/:id`
- **AND** receives the `JobApplicationResponse` object

#### Scenario: Agent updates job application

- **WHEN** an agent updates a job application
- **THEN** it sends PUT to `/job-applications/:id` with partial body:
  ```json
  {
    "state": "applied",
    "notes": "Applied on 2026-01-11"
  }
  ```
- **AND** only provided fields are updated
- **AND** receives updated `JobApplicationResponse`

#### Scenario: Agent deletes job application

- **WHEN** an agent deletes a job application
- **THEN** it sends DELETE to `/job-applications/:id`
- **AND** receives success confirmation
- **AND** all associated logs are also deleted

---

### Requirement: Job Application Log API

The API documentation SHALL provide CRUD operations for job application logs (nested under applications).

#### Scenario: Agent creates application log

- **WHEN** an agent adds a log to a job application
- **THEN** it sends POST to `/job-applications/:id/logs` with body:
  ```json
  {
    "process_name": "Phone Screen",
    "note": "30 min call with recruiter",
    "audio_url": "https://storage.example.com/recording.mp3"
  }
  ```
- **AND** `process_name` is required
- **AND** receives `JobApplicationLogResponse`:
  ```json
  {
    "id": 1,
    "job_application_id": 1,
    "process_name": "Phone Screen",
    "note": "30 min call with recruiter",
    "audio_url": "https://...",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
  ```

#### Scenario: Agent lists application logs

- **WHEN** an agent lists logs for a job application
- **THEN** it sends GET to `/job-applications/:id/logs`
- **AND** receives response:
  ```json
  {
    "data": [
      /* array of JobApplicationLogResponse */
    ]
  }
  ```

#### Scenario: Agent retrieves single application log

- **WHEN** an agent retrieves a specific log
- **THEN** it sends GET to `/job-applications/:id/logs/:log_id`
- **AND** receives the `JobApplicationLogResponse` object

#### Scenario: Agent updates application log

- **WHEN** an agent updates an application log
- **THEN** it sends PUT to `/job-applications/:id/logs/:log_id` with partial body
- **AND** receives updated `JobApplicationLogResponse`

#### Scenario: Agent deletes application log

- **WHEN** an agent deletes an application log
- **THEN** it sends DELETE to `/job-applications/:id/logs/:log_id`
- **AND** receives success confirmation

---

### Requirement: Work Log API

The API documentation SHALL provide operations for daily work log management.

#### Scenario: Agent creates or updates work log

- **WHEN** an agent records a work log entry
- **THEN** it sends PUT to `/work-logs/` with body:
  ```json
  {
    "date": "2026-01-11",
    "content": "Worked on frontend feature X. Fixed bug in component Y."
  }
  ```
- **AND** `date` (YYYY-MM-DD format) and `content` are required
- **AND** if entry exists for date, it is updated (upsert behavior)
- **AND** receives `WorkLogResponse`:
  ```json
  {
    "id": 1,
    "date": "2026-01-11",
    "content": "Worked on frontend feature X...",
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T15:30:00Z"
  }
  ```

#### Scenario: Agent lists all work logs

- **WHEN** an agent lists work logs
- **THEN** it sends GET to `/work-logs/`
- **AND** receives response:
  ```json
  {
    "data": [
      /* array of WorkLogResponse, ordered by date descending */
    ]
  }
  ```

#### Scenario: Agent retrieves work log by date

- **WHEN** an agent retrieves a specific day's work log
- **THEN** it sends GET to `/work-logs/:date` (format: YYYY-MM-DD)
- **AND** receives the `WorkLogResponse` object

---

### Requirement: Error Handling

The API documentation SHALL describe error response format for agents to handle failures.

#### Scenario: Agent handles error response

- **WHEN** an API request fails
- **THEN** the response contains:
  ```json
  {
    "error": "Error message describing the issue"
  }
  ```
- **AND** HTTP status codes indicate error type:
  - `400` - Bad Request (validation errors)
  - `401` - Unauthorized (missing/invalid token)
  - `404` - Not Found (resource doesn't exist or not owned by user)
  - `500` - Internal Server Error

---

### Requirement: VS Code-like Dashboard UI

The application SHALL provide a compact, VS Code-inspired dashboard for managing job applications and work logs.

#### Scenario: User views dashboard layout

- **WHEN** an authenticated user navigates to the dashboard
- **THEN** they see an ActivityBar on the left with icons for Job Applications and Work Logs
- **AND** the main panel displays the selected section content
- **AND** the layout uses a split view with list/tree on top and details below

#### Scenario: User navigates between sections

- **WHEN** a user clicks an icon in the ActivityBar
- **THEN** the main panel switches to display that section
- **AND** the selected icon is highlighted

#### Scenario: User views job applications tree

- **WHEN** a user is in the Job Applications section
- **THEN** they see a searchable, filterable tree view
- **AND** each job application is collapsible to show nested logs
- **AND** status badges display with appropriate colors (todo=gray, applied=blue, in-progress=yellow, rejected=red, accepted=green, dropped=muted)

#### Scenario: User selects an item

- **WHEN** a user clicks on a job application or log in the tree
- **THEN** the detail panel shows the full information for that item
- **AND** action buttons (Edit, Delete) are available

#### Scenario: User manages work logs

- **WHEN** a user is in the Work Logs section
- **THEN** they see a date-based list of work logs
- **AND** they can create or update a log for any date
- **AND** content changes are saved (upsert behavior)
