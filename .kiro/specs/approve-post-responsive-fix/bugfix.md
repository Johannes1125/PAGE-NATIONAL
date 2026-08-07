# Bugfix Requirements Document

## Introduction

The Approve Post moderation view enables admins and reviewers to review, approve, reject, and provide feedback on posts submitted by organizations. The current implementation has several responsive layout issues that prevent the interface from being usable on mobile and tablet devices (screen widths below 1024px). This bug affects the core moderation workflow, making it impossible for reviewers to effectively perform their duties on smaller screens.

**Impact:** Reviewers cannot perform post moderation tasks on mobile devices or tablets, limiting moderation capabilities to desktop-only workflows.

**Root Cause:** The two-column layout (post list + detail panel) uses a fixed grid that doesn't adapt properly below the `lg:` breakpoint (1024px), causing horizontal overflow, content truncation, and hidden action buttons.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Layout Stacking Issues

1.1 WHEN viewport width is below 1024px THEN the system maintains a two-column grid layout that causes horizontal overflow and content truncation

1.2 WHEN viewport width is below 768px THEN the detail panel remains in a sticky position causing layout conflicts and overlapping content

1.3 WHEN viewport width is at 1080px breakpoint THEN the layout switches to single column but the detail panel loses its sticky positioning abruptly

#### 2. Content Overflow Issues

1.4 WHEN post content preview (content_html) is rendered on screens below 640px THEN the HTML content overflows horizontally without proper text wrapping or max-width constraints

1.5 WHEN long post titles or abstracts are displayed on mobile devices THEN the text extends beyond the container boundaries causing horizontal scroll

1.6 WHEN attachment previews are displayed on mobile THEN thumbnails use a fixed grid that doesn't reflow responsively

#### 3. Button and Action Panel Visibility

1.7 WHEN feedback textarea and approve/reject buttons are displayed on screens below 640px THEN the action buttons are partially hidden or overlapped by fixed-position elements

1.8 WHEN reviewer attempts to interact with approve/reject buttons on mobile (375px width) THEN buttons are not fully visible or clickable due to insufficient viewport space

1.9 WHEN feedback textarea is focused on mobile THEN the virtual keyboard covers action buttons making them inaccessible

#### 4. Status Badge and UI Element Wrapping

1.10 WHEN status badges (pending/approved/rejected) are displayed on narrow containers below 480px THEN the badges wrap awkwardly or overflow their parent container

1.11 WHEN pagination controls are rendered on mobile THEN pagination buttons may overlap or become too small for touch interaction

#### 5. Filter and Toolbar Issues

1.12 WHEN toolbar filters are displayed on screens below 768px THEN filter dropdowns stack but don't utilize full width, creating wasted whitespace and poor visual hierarchy

### Expected Behavior (Correct)

#### 2. Layout Stacking Requirements

2.1 WHEN viewport width is at or below 1024px (lg: breakpoint) THEN the system SHALL stack the two-column layout (post list + detail panel) into a single-column vertical layout with the detail panel appearing below the post list

2.2 WHEN viewport width is below 1024px THEN the detail panel SHALL use static positioning instead of sticky positioning to ensure proper content flow

2.3 WHEN layout transitions from two-column to single-column THEN the system SHALL maintain all functionality without horizontal overflow

#### 3. Content Wrapping Requirements

2.4 WHEN post content preview (content_html) is rendered on any screen size THEN the system SHALL apply proper text wrapping with word-break handling and max-width constraints to prevent horizontal overflow

2.5 WHEN long post titles or abstracts are displayed THEN the system SHALL wrap text properly within container boundaries without causing horizontal scroll

2.6 WHEN attachment previews are displayed THEN the system SHALL use a responsive grid that reflows from multiple columns on desktop to single column on mobile (below 640px)

#### 4. Button and Action Panel Accessibility

2.7 WHEN feedback textarea and action buttons are displayed on screens at or below 640px THEN all buttons SHALL be fully visible, accessible, and positioned to avoid overlap with fixed elements

2.8 WHEN reviewer interacts with approve/reject buttons on mobile (375px width minimum) THEN buttons SHALL be fully clickable with adequate touch target size (minimum 44px height) and no content obstruction

2.9 WHEN feedback textarea is focused on mobile THEN action buttons SHALL remain accessible either through proper scrolling behavior or repositioning to avoid virtual keyboard overlap

#### 5. Status Badge and UI Element Formatting

2.10 WHEN status badges are displayed on any screen size THEN badges SHALL fit within their containers without wrapping or overflowing, using appropriate font scaling if necessary

2.11 WHEN pagination controls are rendered on mobile THEN pagination buttons SHALL maintain adequate touch target size (minimum 44px) and proper spacing to prevent mis-taps

#### 6. Filter and Toolbar Optimization

2.12 WHEN toolbar filters are displayed on screens below 768px THEN filter dropdowns SHALL use a responsive grid layout that utilizes full available width for better visual hierarchy and touch interaction

### Unchanged Behavior (Regression Prevention)

#### 3. Desktop Layout Preservation

3.1 WHEN viewport width is at or above 1024px THEN the system SHALL CONTINUE TO display the two-column layout with post list on the left and detail panel on the right

3.2 WHEN detail panel is displayed on desktop (≥1024px) THEN the system SHALL CONTINUE TO use sticky positioning (position: sticky, top: 100px) for the detail panel

3.3 WHEN spacing and gaps are rendered on desktop THEN the system SHALL CONTINUE TO use the existing 24px gap between columns

#### 4. Functional Behavior Preservation

3.4 WHEN approve button is clicked THEN the system SHALL CONTINUE TO call the existing approval API endpoint without modification to the request structure

3.5 WHEN reject button is clicked THEN the system SHALL CONTINUE TO validate feedback requirement and call the rejection API endpoint without modification

3.6 WHEN user_activities audit logging is triggered THEN the system SHALL CONTINUE TO log moderation actions with the existing audit trail structure

3.7 WHEN gooey-toast notifications are displayed THEN the system SHALL CONTINUE TO use the existing toast behavior and styling

#### 5. Content and Data Display

3.8 WHEN post list items are filtered by category or status THEN the system SHALL CONTINUE TO apply the existing filter logic without modification

3.9 WHEN pagination is applied to post list THEN the system SHALL CONTINUE TO use the existing 4-items-per-page logic and visible page calculation

3.10 WHEN post details are displayed (title, category, date, author, organization, abstract) THEN the system SHALL CONTINUE TO render all data fields with the existing data structure

#### 6. Visual Design and Branding

3.11 WHEN color scheme and theme tokens are applied THEN the system SHALL CONTINUE TO use the existing CSS custom properties (--approve-navy, --approve-blue, --approve-offwhite, etc.)

3.12 WHEN typography and font styles are rendered THEN the system SHALL CONTINUE TO use Poppins font family with existing font weights and sizes on desktop

3.13 WHEN shadows and borders are applied THEN the system SHALL CONTINUE TO use the existing shadow variables (--shadow-sm, --shadow-md, --shadow-float) and border styles

## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(viewport)
  INPUT: viewport of type ViewportDimensions { width: number, height: number }
  OUTPUT: boolean
  
  // Returns true when viewport width triggers responsive layout bugs
  RETURN viewport.width < 1024
END FUNCTION
```

### Fix Checking Property

```pascal
// Property: Fix Checking - Responsive Layout Functionality
FOR ALL viewport WHERE isBugCondition(viewport) DO
  layout ← renderApprovePostLayout'(viewport)
  ASSERT (
    layout.hasNoHorizontalOverflow AND
    layout.isStackedSingleColumn AND
    layout.allButtonsVisible AND
    layout.allButtonsClickable AND
    layout.contentWrapsCorrectly AND
    layout.statusBadgesFitContainer
  )
END FOR
```

**Key Assertions:**
- No horizontal scrolling occurs
- Two-column layout stacks to single column
- All action buttons (approve/reject) are fully visible and clickable
- Content (titles, abstracts, HTML) wraps properly without overflow
- Status badges fit within their containers
- Touch targets meet minimum size requirements (44px+)

### Preservation Checking Property

```pascal
// Property: Preservation Checking - Desktop Layout and Functionality
FOR ALL viewport WHERE NOT isBugCondition(viewport) DO
  ASSERT renderApprovePostLayout(viewport) = renderApprovePostLayout'(viewport)
END FOR
```

This ensures that for all viewports with width ≥ 1024px, the fixed code behaves identically to the original code, preserving:
- Two-column grid layout
- Sticky detail panel positioning
- Existing spacing and gaps
- All API call behavior
- All data display logic
- All visual design tokens

### Concrete Counterexample

**Test Case: Mobile Review Workflow (375px width)**

```typescript
// Before Fix (F)
const result = renderApprovePostLayout({ width: 375, height: 667 });
// Expected failures:
// - result.hasHorizontalOverflow === true (content extends beyond viewport)
// - result.approveButtonVisible === false (button hidden below fold)
// - result.rejectButtonClickable === false (button overlapped by keyboard)

// After Fix (F')
const result = renderApprovePostLayout'({ width: 375, height: 667 });
// Expected success:
// - result.hasNoHorizontalOverflow === true
// - result.approveButtonVisible === true
// - result.rejectButtonClickable === true
// - result.contentWrapsCorrectly === true
```
