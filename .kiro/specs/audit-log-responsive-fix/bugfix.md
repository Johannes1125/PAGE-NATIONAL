# Bugfix Requirements Document

## Introduction

The Audit Log page (`frontend/app/admin-dashboard/audit-log/`) displays a dense tabular view of user activities backed by the `user_activities` table (columns: user_id, action, ip_address, created_at). The current implementation has responsive layout issues that render the activity table unreadable and unusable on mobile (< 640px) and tablet (640px - 1024px) viewports.

The page features:
- A grid-based table with 5 columns: Timeline Window, Author/Registrar, Document Type, Manuscript Title, and Actions
- Filter controls: search input, category dropdown, and sort dropdown
- Status cards displaying statistics
- Pagination controls

The root cause stems from:
1. The fixed grid layout (`grid-template-columns`) doesn't adapt to narrow viewports
2. The table lacks horizontal scroll containment, causing layout overflow
3. Filter controls are laid out in a fixed row without proper wrapping on mobile
4. Long text content (IP addresses, timestamps, action strings) forces column widths that break the layout on small screens

This bugfix ensures the audit log table remains readable, scrollable, and fully functional across all device sizes while maintaining visual consistency with the existing Manage Users table styling conventions.

---

## Bug Analysis

### Current Behavior (Defect)

#### 1. Table Layout Breakage

1.1 WHEN viewport width is less than 640px (mobile) THEN the table grid layout with fixed column widths causes horizontal overflow and content gets clipped beyond the viewport edge

1.2 WHEN viewport width is between 640px and 900px (tablet) THEN the table columns are compressed to illegible widths where text overlaps or wraps awkwardly within cells

1.3 WHEN the table overflows horizontally on mobile THEN there is no scrollable container to access the hidden columns, making the rightmost columns (Document Type, Manuscript Title, Actions) completely inaccessible

1.4 WHEN long IP addresses or timestamps appear in table cells THEN they force minimum column widths that prevent the table from fitting narrow viewports

#### 2. Filter Controls Breakage

1.5 WHEN viewport width is less than 768px THEN the filter bar layout (`.audit-toolbar-card`) stacks controls vertically BUT the category filter select remains at min-width 160px and can overflow its container

1.6 WHEN viewport width is less than 640px THEN the date range and filter controls do not wrap properly and may clip or overlap with adjacent elements

#### 3. Content Truncation Issues

1.7 WHEN long action strings or manuscript titles exceed their column width THEN they cause cell overflow rather than truncating with ellipsis, breaking the table layout

1.8 WHEN viewing the table on mobile in card view (< 900px) THEN long manuscript titles remain constrained with `white-space: nowrap` causing text clipping instead of wrapping to multiple lines

#### 4. Pagination Overflow

1.9 WHEN viewport width is less than 480px THEN pagination controls may overflow horizontally because page number buttons have fixed min-width of 36px (reduced to 32px at 480px) and don't adapt to very narrow screens

---

### Expected Behavior (Correct)

#### 1. Horizontal Scroll for Table on Mobile

2.1 WHEN viewport width is less than 900px THEN the table SHALL be wrapped in a horizontally scrollable container with `overflow-x: auto` to allow users to scroll and access all columns

2.2 WHEN the table is in horizontal scroll mode THEN the table itself SHALL have a minimum width (e.g., 800px) to prevent columns from being crushed into illegibly narrow widths

2.3 WHEN scrolling horizontally through the table on mobile THEN the scroll behavior SHALL be smooth with `-webkit-overflow-scrolling: touch` for iOS devices

#### 2. Condensed Mobile View (Alternative/Progressive Enhancement)

2.4 WHEN viewport width is less than 640px THEN the table MAY display only the most critical columns (Action, User, Timestamp) by default with a mechanism (expandable row or "details" button) to reveal additional information (IP address, full details)

2.5 WHEN a user taps an expand/details control on a table row THEN additional columns (Document Type, Manuscript Title metadata) SHALL be revealed within that row without navigating away from the page

#### 3. Filter Controls Responsive Layout

2.6 WHEN viewport width is less than 768px THEN the filter bar (`.audit-toolbar-card`) SHALL stack controls vertically with each control taking full width of its container

2.7 WHEN viewport width is less than 640px THEN the search input, category filter dropdown, and sort dropdown SHALL each render at 100% width without horizontal overflow

2.8 WHEN filter controls stack vertically on mobile THEN labels and dropdown options SHALL remain fully visible and tappable without clipping or overlapping

#### 4. Text Truncation with Tooltips

2.9 WHEN action strings or manuscript titles exceed their allocated column width THEN the text SHALL truncate with ellipsis (`text-overflow: ellipsis`) and provide a tooltip or expand option to view the full text

2.10 WHEN viewing the table on mobile in card view (< 900px) THEN long manuscript titles SHALL wrap to multiple lines (`white-space: normal`) instead of being clipped

#### 5. Pagination Controls Responsive Sizing

2.11 WHEN viewport width is less than 480px THEN pagination controls SHALL remain fully visible and functional with appropriately sized buttons (min 32px touch targets) that do not cause horizontal overflow

2.12 WHEN pagination is displayed on mobile THEN the pagination controls SHALL be centered and button gaps SHALL be reduced if necessary to fit narrow viewports

#### 6. Desktop Layout Preservation

2.13 WHEN viewport width is 1024px or greater (desktop) THEN the table SHALL display in full grid layout with all columns visible without horizontal scrolling

2.14 WHEN viewport width is 1024px or greater THEN filter controls SHALL remain in their original horizontal layout without stacking

#### 7. Minimum Viewport Support

2.15 WHEN viewport width is 375px (iPhone SE, minimum supported width) THEN the audit log table SHALL be readable and scrollable without clipped content or broken layout

2.16 WHEN viewport width is 375px THEN all filter controls, pagination, and status cards SHALL render correctly without horizontal overflow

---

### Unchanged Behavior (Regression Prevention)

#### 1. Desktop Layout and Functionality

3.1 WHEN viewport width is 1024px or greater THEN the table layout SHALL CONTINUE TO display in the existing 5-column grid format with all columns visible

3.2 WHEN hovering over table rows on desktop THEN the hover effects (border highlight, shadow, transform) SHALL CONTINUE TO function as they currently do

3.3 WHEN interacting with filter controls on desktop THEN the search, category filter, and sort dropdown SHALL CONTINUE TO function identically to the current implementation

#### 2. Table Content and Data Display

3.4 WHEN the page loads THEN the table SHALL CONTINUE TO fetch and display audit log entries from the API endpoint `/posts` with the same data mapping logic

3.5 WHEN displaying event entries (category === "events") THEN the timeline window SHALL CONTINUE TO show START/END badges with date/time formatting

3.6 WHEN displaying non-event entries THEN the timeline window SHALL CONTINUE TO show calendar and clock icons with date and time on separate rows

3.7 WHEN displaying manuscript titles, authors, document types, and action buttons THEN the existing icons, styling, and visual hierarchy SHALL CONTINUE TO be preserved

#### 3. Edit and Delete Functionality

3.8 WHEN clicking the "Edit" button on any audit log entry THEN the edit modal wizard SHALL CONTINUE TO open with the same 3-step workflow (Metadata, Manuscript, Verification)

3.9 WHEN clicking the "Delete" button on any audit log entry THEN the confirmation dialog SHALL CONTINUE TO appear and deletion SHALL proceed via the API endpoint `/posts/{id}`

3.10 WHEN saving changes in the edit modal THEN the API PUT request to `/posts/{id}` SHALL CONTINUE TO update the database and refresh the displayed data

#### 4. Status Cards and Statistics

3.11 WHEN the page loads THEN the status cards (Total Records, Instant Published, Moderated, Revisions) SHALL CONTINUE TO display accurate counts based on the fetched logs

3.12 WHEN viewport width is greater than 768px THEN the status cards SHALL CONTINUE TO display in a grid with the existing accent colors and hover effects

#### 5. Pagination Behavior

3.13 WHEN navigating between pages using pagination controls THEN the page navigation logic SHALL CONTINUE TO display 5 entries per page and update the visible page range

3.14 WHEN the total number of filtered entries changes THEN the pagination SHALL CONTINUE TO recalculate total pages and reset to page 1 when filters change

#### 6. Tabs and Filtering

3.15 WHEN switching between "Instant Publications" and "Moderated Submissions" tabs THEN the filtering logic SHALL CONTINUE TO filter logs by `logCategory` ("instant" vs "approval")

3.16 WHEN entering a search query THEN the table SHALL CONTINUE TO filter by manuscript title or admin name in real-time

3.17 WHEN selecting a document type filter (article, events, journal, news, research) THEN the table SHALL CONTINUE TO filter by the `postData.category` field

#### 7. Modal and Wizard Functionality

3.18 WHEN the edit modal is open THEN the stepper progress bar, step validation, and navigation (Back/Continue buttons) SHALL CONTINUE TO function as currently implemented

3.19 WHEN uploading images in the modal THEN the file preview and image modal overlay SHALL CONTINUE TO function identically

3.20 WHEN closing the edit modal (via close button or after save) THEN the modal SHALL CONTINUE TO reset all form state and dismiss correctly

#### 8. Accessibility and Keyboard Navigation

3.21 WHEN using keyboard navigation (Tab, Enter, Escape) THEN all interactive elements (buttons, inputs, dropdowns) SHALL CONTINUE TO be accessible via keyboard

3.22 WHEN screen readers are used THEN the existing ARIA labels and roles SHALL CONTINUE TO be announced correctly
