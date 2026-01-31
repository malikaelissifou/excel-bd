# UNIX + Excel Design System

## Visual Language

A minimalist, professional interface blending UNIX command-line aesthetics with modern Excel dashboard styling.

## Typography

**Font Family:** IBM Plex Mono (monospace)
- Imported via Google Fonts
- Fallback: 'Courier New', monospace
- Letter-spacing: -0.01em (tight)

**Style Conventions:**
- Lowercase with underscores for actions: `add_row`, `import_excel`, `save_changes`
- Command-line prefixes: `#`, `>`, `$`
- Example: `add_row > Name` or `$dataset: DS-2025-001`

## Color Palette

### Neutrals (Base)
```
Background:      #f5f6f7  (soft gray, replaces flat white)
Light BG:        #f9fafb  (zebra rows, inputs)
Border:          #d1d5db  (dividers, borders)
Border Light:    #e5e7eb  (table row separators)
Muted Text:      #9ca3af  (secondary labels)
Medium Text:     #6b7280  (tertiary content)
Primary Text:    #374151  (main content)
```

### Green Accents
```
Dark Green:      #1b5e20  (primary buttons, headers)
Bright Green:    #00c853  (highlights, required markers)
Medium Green:    #4caf50  (success states)
Hover Green:     #2e7d32  (button hover)
Table Header:    #e0f2f1  (greenish header background)
Row Hover:       #e8f5e9  (soft green tint)
Light Green:     #f0fdf4  (edit button hover)
```

### Functional
```
Error:           #dc2626  (red)
Warning:         #f59e0b  (amber)
```

## Components

### TopHeader
- Background: `#f9fafb` with subtle border
- Metadata labels: UNIX-style (lowercase with colons)
- Dataset ID: prefixed with `$` symbol in green
- "Import Excel" button: dark green with hover state
- Shadow: subtle `shadow-sm`

### DataTable
- Container: white background, rounded corners (4-6px), `shadow-md`
- Header row: `#e0f2f1` background, dark green text
- Zebra rows: alternate white / `#f9fafb`
- Row hover: `#e8f5e9` (green tint) with smooth transition
- Borders: horizontal only, no vertical dividers
- Separator color: `#e5e7eb` (very light gray)
- Required fields: green asterisk (`#00c853`)
- Edit button: gray text → green on hover, with green background tint

### AddSequenceModal
- Title: `add_row > [ColumnName]`
- Field labels: prefixed with `>` or `#`
- Step indicator: `step 1 / 6` (lowercase)
- Progress bar: green (`#00c853`) for completed, light gray for remaining
- Input backgrounds: `#f9fafb`
- Buttons:
  - Back: gray (`#d1d5db`)
  - Next: dark green (`#1b5e20`)
  - Finish: bright green (`#00c853`)
- Placeholder: simply "value"

### EditModal
- Title: `edit_record > [row_id]`
- Two-column responsive grid
- Inputs: same styling as AddSequenceModal
- Buttons: gray cancel, dark green save
- Required field indicator: green asterisk

### ImportModal
- Title: `import_excel`
- Upload area: dashed border with hover effect (border turns green)
- Status messages: UNIX-style lowercase
- Warning alert: amber icon with `#fff9e6` background
- Success: green check with `import_complete` message
- Error: red with `#fee` background
- Results display: styled in `#f9fafb` box with green/gray text

### Floating Add Button
- Size: 56px × 56px (14 Tailwind units)
- Background: gradient from `#00c853` to `#4caf50`
- Hover: brighter gradient with shadow increase
- Icon: Plus with rotation animation (90deg) on hover
- Shadow: `shadow-lg` → `shadow-xl` on hover
- Position: fixed bottom-right (32px from edges)
- Hidden when in error state

### EmptyStateCard
- Displays when no data is available or on error
- Container: rounded corners (12px), medium shadow, centered
- Three states with different backgrounds:
  - **Default** (`#e8f5e9`): Database icon in `#4caf50`, "No Data Available"
  - **Warning** (`#fffde7`): AlertTriangle icon in `#f59e0b`, connection prompt
  - **Error** (`#ffebee`): WifiOff icon in `#dc2626`, connection error message
- Icon: 64px × 64px (16 Tailwind units), centered above text
- Typography: title in `#374151`, subtitle in `#6b7280`
- Animation: fade-in (500ms) when shown
- Max width: medium (~448px)
- Padding: 32px (8 Tailwind units)

## Interactive States

### Hover Effects
- Tables: row background → `#e8f5e9`
- Buttons: smooth color transitions (200ms-300ms)
- Upload area: border → green
- Edit button: text → green, background → `#f0fdf4`

### Focus States
- Input borders: green (`#4caf50`)
- Ring color: green (`#4caf50`)

### Disabled States
- Opacity: 40%
- Cursor: not-allowed
- No hover effects

## Spacing & Layout

- Container max-width: 1280px
- Main content padding: 24px (6 units)
- Inter-component spacing: 16px-24px
- Input padding: comfortable, following shadcn defaults
- Line height: generous for readability (py-3 to py-3.5 in table cells)

## Shadows

- Subtle: `shadow-sm` (header)
- Medium: `shadow-md` (table container)
- Large: `shadow-lg` (floating button)
- Extra large: `shadow-xl` (floating button hover)

## Border Radius

- Inputs/Buttons: 4px (`rounded`)
- Modals/Cards: 6px (`rounded-md`)
- Floating button: Full circle (`rounded-full`)

## Animations

- Duration: 200ms-300ms for most transitions
- Easing: default Tailwind (ease-in-out)
- Special: floating button rotate animation (90deg)
- Progress bars: 300ms transition

## Accessibility

- Stroke width: 1.5 for most icons (thinner, more technical feel)
- Color contrast: meets WCAG AA standards
- Semantic HTML maintained
- ARIA labels on icon-only buttons
- Keyboard navigation supported through shadcn components

## Design Principles

1. **Minimalism**: Avoid visual clutter, use subtle contrasts
2. **Technical**: Monospace font, command-line inspired microcopy
3. **Professional**: Clean, organized, data-focused
4. **Functional**: Green accents guide user actions
5. **Consistent**: Unified color palette and spacing system
