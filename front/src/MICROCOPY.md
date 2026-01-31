# UI Microcopy Reference - UNIX + Excel Style

## Buttons

### Primary Actions
- **Add Record**: "+" (floating action button with green gradient)
- **Import Excel**: "import_excel"
- **Save Changes**: "save_changes"
- **Finish**: "finish"
- **Choose File**: "choose_file"

### Secondary Actions
- **Edit**: "edit"
- **Cancel**: "cancel"
- **Back**: "back"
- **Next**: "next"
- **Close**: "close"

## Modal Titles
- **Add Sequence**: `add_row > [Column Name]` (e.g., "add_row > Name", "add_row > Email")
- **Edit Record**: `edit_record > [row_id]`
- **Import Excel**: `import_excel`

## Labels & Hints

### Add Sequence Modal
- Step indicator: "step {current} / {total}"
- Field labels: "> {column name lowercase}" or "# input: {column name lowercase}" (for longtext)
- Required field indicator: "*" (green asterisk)
- Placeholder: "value"

### Edit Modal
- Column labels display with required indicator: "{Column Name}*" (if required, green asterisk)
- Placeholder: "value"

### Import Modal
- Upload area: "# select file to import"
- File types: "supports: .xlsx .xls .csv"
- Import warning: "**warning:** file must match current dataset schema"

## Toast Messages (maintains standard format for clarity)

### Success
- "Record added successfully"
- "Record updated successfully"
- "Successfully imported {count} records"

### Error
- "Failed to load data"
- "Failed to add record"
- "Failed to update record"
- "Failed to import file"
- "Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file."
- "Import completed with {count} errors"

### Import Results
- "import_complete"
- "records_added: {count}"
- "records_skipped: {count}"
- "**error:** {error message}"
- "**errors_encountered:**" (followed by bulleted list)

## Header Metadata Labels
- "$dataset:"
- "region:"
- "assembly:"
- "constituency:"
- "modified: {date}"

## Empty States

### EmptyStateCard
**Default State:**
- Title: "No Data Available"
- Subtitle: "Please import an Excel file or add a new record to get started."
- Icon: Database (green `#4caf50`)

**Warning State:**
- Title: "No Data Available"
- Subtitle: "Please import an Excel file or check your connection."
- Icon: AlertTriangle (amber `#f59e0b`)

**Error State:**
- Title: "Connection Error"
- Subtitle: "Failed to load data. Please check your connection and try again."
- Icon: WifiOff (red `#dc2626`)

### Loading
- Loading: "# loading..."

## Accessibility Labels
- Floating add button: `aria-label="Add new record"`
- Edit button: `aria-label="Edit row {id}"`

## Progress Indicators
- Visual progress bar in Add Sequence Modal (horizontal bar segments that fill as user progresses)
- Step counter: "Step {current} of {total}"

## Field Placeholders
- Text fields: "Enter {column name lowercase}"
- Number fields: "Enter {column name lowercase}"
- Email fields: "Enter {column name lowercase}"
- Date fields: (uses native date picker, no placeholder)
- Long text fields: "Enter {column name lowercase}"

## Color Scheme (UNIX + Excel Aesthetic)

### Base Palette
- Background: `#f5f6f7` (soft neutral gray)
- Light gray: `#f9fafb` (zebra rows, input backgrounds)
- Medium gray: `#d1d5db` (borders)
- Dark gray: `#9ca3af` (secondary text)
- Text: `#374151` (primary text)
- Muted text: `#6b7280`

### Green Accents
- Primary green: `#1b5e20` (dark green for buttons, headers)
- Bright green: `#00c853` (accent, highlights, required indicators)
- Medium green: `#4caf50` (hover states, success)
- Hover green: `#2e7d32` (button hover)
- Light green tint: `#e8f5e9` (row hover)
- Header green: `#e0f2f1` (table header background)

### Functional Colors
- Error/Destructive: `#dc2626` (red for errors)
- Warning: `#f59e0b` (amber for warnings)
- Success: Green shades above

## Component States

### Buttons
- Primary: Dark green (`#1b5e20`) background, white text, hover → brighter green (`#2e7d32`)
- Secondary: Neutral gray (`#d1d5db`) background, green text
- Disabled: 40% opacity, no hover effects
- Loading state: "importing..." text with disabled state
- Floating button: Green gradient with rotation animation on hover

### Modal Behaviors
- Add Sequence: "back" disabled on first step
- Add Sequence: "next" disabled if required field is empty
- Add Sequence: "finish" button appears on last step (bright green `#00c853`)
- Edit Modal: Closes on "cancel" or background click
- Import Modal: Shows different content based on state (upload, result, error)

### Table
- Zebra rows: alternating white and `#f9fafb`
- Row hover: soft green tint (`#e8f5e9`)
- Header: bold dark green text on light greenish background (`#e0f2f1`)
- No vertical borders, only horizontal separators
- Rounded corners: 4-6px
- Drop shadow on container

## Validation Messages
All validation is inline:
- Required fields prevent progression in Add Sequence
- Required fields indicated with green asterisk (*) in `#00c853`
- Field-specific validation (email format, number format) handled by input type

## Typography
- Font: IBM Plex Mono (monospace)
- Letter-spacing: Tight (-0.01em)
- UNIX-style microcopy: lowercase with underscores (e.g., "add_row", "import_excel")
- Command-line style hints: prefixed with "#" or ">" or "$"
