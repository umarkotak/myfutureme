# Tasks: Add Frontend Agent Documentation

## 1. API Client Implementation

- [x] 1.1 Add Job Application API methods to `lib/api.js`

  - [x] `createJobApplication(data)` - POST `/job-applications/`
  - [x] `listJobApplications(params)` - GET `/job-applications/`
  - [x] `getJobApplication(id)` - GET `/job-applications/:id`
  - [x] `updateJobApplication(id, data)` - PUT `/job-applications/:id`
  - [x] `deleteJobApplication(id)` - DELETE `/job-applications/:id`

- [x] 1.2 Add Job Application Log API methods to `lib/api.js`

  - [x] `createJobApplicationLog(applicationId, data)` - POST `/job-applications/:id/logs`
  - [x] `listJobApplicationLogs(applicationId)` - GET `/job-applications/:id/logs`
  - [x] `getJobApplicationLog(applicationId, logId)` - GET `/job-applications/:id/logs/:log_id`
  - [x] `updateJobApplicationLog(applicationId, logId, data)` - PUT `/job-applications/:id/logs/:log_id`
  - [x] `deleteJobApplicationLog(applicationId, logId)` - DELETE `/job-applications/:id/logs/:log_id`

- [x] 1.3 Add Work Log API methods to `lib/api.js`

  - [x] `upsertWorkLog(data)` - PUT `/work-logs/`
  - [x] `listWorkLogs()` - GET `/work-logs/`
  - [x] `getWorkLogByDate(date)` - GET `/work-logs/:date`

- [x] 1.4 Add user validation method to `lib/api.js`
  - [x] `getCurrentUser()` - GET `/me`

## 2. Dashboard UI Components (VS Code-like)

- [x] 2.1 Create `components/dashboard/ActivityBar.js`

  - Icon-based sidebar navigation (48px width)
  - Job Applications and Work Logs icons
  - Active state highlighting

- [x] 2.2 Create `components/dashboard/TreeView.js`

  - Collapsible tree items
  - Support for nested items (applications → logs)
  - Status badges with color coding

- [x] 2.3 Create `components/dashboard/DetailPanel.js`

  - Display selected item details
  - Edit and Delete actions
  - Add Log button for applications

- [x] 2.4 Create `components/dashboard/JobApplicationForm.js`

  - Create/Edit job application form
  - All fields: company, title, URL, salary, email, notes, state

- [x] 2.5 Create `components/dashboard/WorkLogPanel.js`
  - Date selector
  - Content text area with markdown support
  - Upsert behavior

## 3. Dashboard Page

- [x] 3.1 Create `pages/dashboard.js`

  - VS Code-like layout with ActivityBar + MainPanel
  - Split view: TreeView + DetailPanel
  - Connect to API client

- [x] 3.2 Add authentication guard

  - Redirect to login if not authenticated

- [x] 3.3 Add responsive mobile layout
  - Using flexible layout that works on smaller screens

## 4. Verification

- [x] 4.1 Build passes successfully
- [ ] 4.2 Test dashboard UI with running backend (manual)
