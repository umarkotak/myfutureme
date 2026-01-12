# Job Log List

## ADDED Requirements

### Requirement: Chronological Chat-Style Log Display

The job application logs MUST display in a chat/messaging style interface with the oldest logs at the top and newest logs at the bottom.

#### Scenario: Log list shows newest at bottom

- **WHEN** a job application has multiple logs
- **AND** the user views the logs for that application
- **THEN** logs should be ordered from oldest (top) to newest (bottom)

#### Scenario: Page auto-scrolls to bottom on load

- **WHEN** a user opens the log view for an application
- **THEN** the view should automatically scroll to the bottom (newest logs)

### Requirement: Infinite Scroll for Older Logs

The log list MUST support infinite scroll upward to load older logs progressively.

#### Scenario: Scrolling to top loads more logs

- **WHEN** a job application has more logs than initially displayed
- **AND** the user scrolls to the top of the log list
- **THEN** older logs should be loaded and prepended to the list
- **AND** the scroll position should be maintained at the current viewing position

### Requirement: Bottom Input Bar

The system MUST provide a fixed input area at the bottom of the log list for adding new log entries.

#### Scenario: User adds new log via input bar

- **WHEN** the user is viewing logs for an application
- **AND** the user enters text in the input field, selects a datetime, and clicks "Add Log"
- **THEN** a new log should be created with the entered data
- **AND** the new log should appear at the bottom of the list

### Requirement: Debounced Auto-Save on Edit

The system MUST automatically save log edits after 1 second of no typing activity.

#### Scenario: Edit triggers auto-save after delay

- **WHEN** the user is editing an existing log's content
- **AND** the user stops typing for 1 second
- **THEN** the log should be automatically saved via API
- **AND** a success toast should confirm the save

#### Scenario: Continued typing resets auto-save timer

- **WHEN** the user is editing a log and types continuously
- **AND** each keystroke occurs before the 1-second delay completes
- **THEN** the auto-save should not trigger until 1 second after the last keystroke
