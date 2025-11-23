# Color Guide - Green Buttons

## Your Theme's Primary Color (Recommended)

Your app uses a **custom emerald green** defined in `globals.css`:
- **Primary Color**: `hsl(152, 63%, 43%)` - Emerald Green
- **CSS Variable**: `--primary`
- **Usage**: `bg-primary` (automatically uses the theme color)

### Benefits:
✅ Theme-aware (works with dark mode)
✅ Consistent across the app
✅ Easy to change globally
✅ Already used by Button component's default variant

## Current Green Usage

### Buttons (Primary Actions)
- **Current**: `bg-green-600 hover:bg-green-700`
- **Recommended**: Use Button component's `default` variant (uses `bg-primary`)
- **Tailwind Equivalent**: `green-600` = `#16a34a`, `green-700` = `#15803d`

### Badges/Labels
- **Current**: `bg-green-500` 
- **Tailwind**: `green-500` = `#22c55e`

### Borders/Accents
- **Current**: `border-green-300`, `text-green-600`
- **Tailwind**: `green-300` = `#86efac`, `green-600` = `#16a34a`

### Light Backgrounds
- **Current**: `bg-green-50`, `bg-green-100`
- **Tailwind**: `green-50` = `#f0fdf4`, `green-100` = `#dcfce7`

## Recommendation

**Use the theme's primary color** (`bg-primary`) for all primary action buttons. This ensures:
- Consistency
- Theme support (dark mode)
- Easy global changes

Remove hardcoded `bg-green-600` classes and use Button's default variant.

