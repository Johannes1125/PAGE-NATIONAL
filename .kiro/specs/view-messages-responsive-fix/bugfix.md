# Bugfix Requirements Document

## Introduction

The dashboard messaging client currently has responsive layout failures that make conversations and message threads unusable on mobile (< 768px) and tablet (768px - 1024px) devices. The bug stems from a two-pane layout (conversation list + active thread) that attempts to render both panes simultaneously on narrow screens, causing the thread to be squeezed, horizontal overflow, and poor usability. This bugfix ensures the messaging interface works correctly across all device sizes using single-pane navigation on mobile with proper back-navigation, correct text wrapping, and a fixed composer that remains accessible.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN viewport width is below 760px THEN the system attempts to render both the conversation list pane and the chat thread pane simultaneously in a single-column grid, causing one pane to be hidden or inaccessible without proper navigation

1.2 WHEN message text or attachment file names are very long THEN the system allows horizontal overflow beyond the message bubble container, causing horizontal page scroll

1.3 WHEN the compose/reply input box is displayed on mobile viewports with the on-screen keyboard active THEN the system may obscure the input field or send button behind the keyboard or navigation bar

1.4 WHEN attachment previews/download links are rendered in message bubbles THEN the system does not enforce width constraints, allowing file names to overflow their bubble container

1.5 WHEN unread/status indicators are rendered on narrow viewports THEN the system may misalign or hide these indicators due to insufficient responsive positioning rules

1.6 WHEN viewport width is between 760px and 768px (tablet range) THEN the system uses the mobile single-pane layout but may have insufficient touch targets or spacing for tablet interaction patterns

### Expected Behavior (Correct)

2.1 WHEN viewport width is below 768px (mobile) THEN the system SHALL display only one pane at a time: either the conversation list view OR the active thread view, with a visible back button in the thread view to return to the list

2.2 WHEN message text or attachment file names are rendered in message bubbles THEN the system SHALL apply break-words wrapping and constrain content to prevent horizontal overflow beyond the bubble container

2.3 WHEN the compose/reply input box and send button are rendered on mobile viewports THEN the system SHALL remain fixed and fully visible at the bottom of the viewport without being obscured by the on-screen keyboard or navigation bar

2.4 WHEN attachment previews/download links are rendered in message bubbles THEN the system SHALL enforce max-width constraints and text truncation to prevent overflow beyond the bubble container

2.5 WHEN unread/status indicators are rendered at any viewport width THEN the system SHALL maintain correct positioning and visibility at all breakpoints using responsive positioning rules

2.6 WHEN viewport width is between 768px and 1024px (tablet) THEN the system SHALL render the two-pane layout correctly with adequate spacing, touch targets, and proper pane width distribution

### Unchanged Behavior (Regression Prevention)

3.1 WHEN viewport width is 768px or greater (tablet/desktop) THEN the system SHALL CONTINUE TO display the two-pane layout with conversation list on the left and active thread on the right

3.2 WHEN a user sends a message using the compose input THEN the system SHALL CONTINUE TO use the existing message send/receive logic, polling/websocket behavior, and app/lib/api-client.ts usage without modification

3.3 WHEN a new message is received THEN the system SHALL CONTINUE TO show toast notification alerts using the existing notification behavior

3.4 WHEN a user clicks on a conversation in the list THEN the system SHALL CONTINUE TO mark incoming messages as read and fetch message history using the existing fetchMessagesForThread logic

3.5 WHEN the conversation list is filtered by search query or tag THEN the system SHALL CONTINUE TO display filtered results using the existing filteredConversations logic without modification

3.6 WHEN message status indicators (sent, seen, read, unread) are displayed THEN the system SHALL CONTINUE TO use the existing StatusIndicator component logic for determining which icon to show
