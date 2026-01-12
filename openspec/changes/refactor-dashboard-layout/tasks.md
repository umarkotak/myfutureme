# Tasks

## 1. Install react-toastify dependency

- [x] Run `npm install react-toastify`
- [x] Verify installation in `package.json`

## 2. Configure ToastContainer in \_app.js

- [x] Import `ToastContainer` and CSS from react-toastify
- [x] Add `ToastContainer` to the app layout
- [x] Test toast notification works

## 3. Create DashboardLayout component

- [x] Create `components/layouts/DashboardLayout.js`
- [x] Extract header, ActivityBar, and layout structure from `dashboard.js`
- [x] Accept `children`, `user`, `onLogout` props
- [x] Accept `activeSection`, `onSectionChange` for activity bar

## 4. Refactor dashboard.js to use DashboardLayout

- [x] Import new `DashboardLayout` component
- [x] Replace inline header and layout with component
- [x] Ensure all functionality preserved

## 5. Create JobLogList component (replaces JobLogForm)

- [x] Create `components/dashboard/JobLogList.js`
- [x] Display logs in chronological order (oldest top, newest bottom)
- [x] Style each log entry as a chat message card
- [x] Show datetime and process_name as metadata

## 6. Implement auto-scroll to bottom

- [x] Use `useRef` to track container element
- [x] Auto-scroll to bottom on initial load and when new logs added
- [x] Preserve scroll position when loading older logs

## 7. Implement infinite scroll for loading older logs

- [x] Detect when user scrolls near top of list
- [x] Load older logs via API (may need pagination support)
- [x] Prepend older logs without disrupting scroll position

## 8. Add input bar at bottom

- [x] Create fixed input area at bottom of log list
- [x] Include text input, datetime picker, and "Add Log" button
- [x] Handle form submission to create new log

## 9. Implement debounced auto-save for editing

- [x] Detect changes to log content
- [x] Wait 1 second after last keystroke before auto-saving
- [x] Show toast notification on save success/failure

## 10. Replace alert() calls with toast notifications

- [x] Find all `alert()` calls in dashboard-related components
- [x] Replace with `toast.success()` or `toast.error()` calls
- [x] Test all error and success scenarios

## 11. Delete old JobLogForm.js

- [x] Remove `components/dashboard/JobLogForm.js`
- [x] Update imports in `dashboard.js`

## 12. Verification

- [x] Manually test dashboard layout renders correctly
- [x] Auth guard works correctly
- [ ] Test log list displays with newest at bottom (requires login)
- [ ] Test infinite scroll loads older logs
- [ ] Test auto-save shows toast after 1 second
- [ ] Test add log functionality
