# Tasks: Revamp Worklog Monthly Layout

## 1. Update Grouping Logic

- [ ] 1.1 Add `formatMonthYear(dateStr)` helper function to format dates as "Month YYYY"
- [ ] 1.2 Update `sortedLogs` rendering to group by month instead of comparing daily dates

## 2. Remove Left Icon

- [ ] 2.1 Remove the avatar div (gradient circle with 📝 emoji) from log entries
- [ ] 2.2 Adjust flex layout to account for removed element

## 3. Chat Bubble Timestamp

- [ ] 3.1 Move timestamp display inside the chat bubble card
- [ ] 3.2 Style timestamp to appear at bottom-right or top-right of bubble
- [ ] 3.3 Show full date format (e.g., "Mon, Jan 12" or "January 12, 2026")

## 4. Sticky Month Headers

- [ ] 4.1 Create `MonthHeader` sub-component with sticky positioning
- [ ] 4.2 Apply `position: sticky; top: 0;` with proper z-index
- [ ] 4.3 Style header with background to prevent content overlap

## 5. Header Action Buttons

- [ ] 5.1 Add placeholder action buttons to month header (expand/collapse, filter, etc.)
- [ ] 5.2 Style buttons to be subtle but accessible

## 6. Testing & Polish

- [ ] 6.1 Test scroll behavior across different viewport sizes
- [ ] 6.2 Verify monthly grouping logic handles edge cases (year boundaries)
- [ ] 6.3 Visual review and adjustments
