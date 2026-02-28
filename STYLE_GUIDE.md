# My Future Me - Style Guide

This guide defines the visual direction for `my future me` so future UI changes stay consistent.

## Design Direction

- **Style**: Modern minimalist
- **Theme**: VS Code Dark Modern-inspired
- **Personality**: Calm, focused, intentional
- **Layout approach**: Spacious, clear hierarchy, low visual noise

## Core Principles

1. **Content first**: Prioritize clarity over decoration.
2. **One primary accent**: Use blue for primary actions; avoid random accent colors.
3. **Low-contrast surfaces**: Build depth with subtle surface steps, not heavy shadows.
4. **Meaningful color use**: Reserve green/orange for status and supportive highlights.
5. **Consistent rhythm**: Keep spacing and radii predictable.

## Color Tokens

Use these as baseline tokens:

| Token | Hex | Usage |
|---|---|---|
| `bg.base` | `#1e1e1e` | Main app/page background |
| `bg.surface` | `#252526` | Cards, panels, elevated blocks |
| `bg.surfaceAlt` | `#2d2d30` | Hover states and active surfaces |
| `border.default` | `#3c3c3c` | Borders/dividers |
| `text.primary` | `#d4d4d4` | Main text |
| `text.heading` | `#f3f3f3` | Headings and emphasized text |
| `text.muted` | `#9da1a6` | Supporting text |
| `accent.primary` | `#007acc` | Primary buttons/links |
| `accent.primaryHover` | `#0e639c` | Primary hover |
| `accent.info` | `#9cdcfe` | Informational highlight |
| `accent.success` | `#4ec9b0` | Positive/supportive markers |
| `accent.warm` | `#ce9178` | Secondary warm highlight |

## Typography

- **Heading font**: `Space Grotesk`
- **Body font**: `Inter`
- **Heading feel**: Tight, confident, short lines
- **Body feel**: Clean, readable, medium line-height

Suggested scale:

- `h1`: 48-64px, line-height near `1.05`
- `h2`: 32-40px
- `h3`: 24-32px
- body large: 18px
- body: 14-16px
- caption/meta: 12px

## Spacing and Radius

- Use a 4px spacing rhythm (`4, 8, 12, 16, 24, 32, 40, 56...`).
- Default card radius: `12px`.
- Large section container radius: `16px` to `24px`.
- Keep section vertical spacing generous (`64px+`) for breathing room.

## Components

### Buttons

- Primary: filled `accent.primary` with white text.
- Secondary: outline with `border.default`, surface background.
- Height target: `40-44px`.
- Corners: rounded-md (`~6px`) for minimalist tone.

### Cards and Panels

- Surface: `bg.surface`
- Border: `border.default`
- Hover: subtle surface shift to `bg.surfaceAlt`
- Avoid heavy glow; use minimal transitions.

### Links

- Standard link color: `accent.info`
- Hover: slightly brighter tint
- Underlines optional; prioritize clarity and affordance

## Motion

- Keep motion subtle and sparse.
- Use short transitions (`150-250ms`) for hover/focus.
- Avoid continuous decorative animations unless they add meaning.

## Homepage Pattern

The homepage should retain this structure:

1. **Minimal top nav** with app name and one primary CTA
2. **Hero** with concise promise and two clear actions
3. **Feature grid** (3 cards): Daily Log, Job Hunting Tracker, My Journal
4. **Closing CTA** reinforcing daily consistency
5. **Compact footer** with one-line brand statement

## Do / Don't

### Do

- Use dark neutral surfaces with careful contrast.
- Keep copy short, practical, and motivating.
- Keep pages responsive from mobile first.

### Don't

- Don't introduce bright gradients across core surfaces.
- Don't mix many accent colors for primary actions.
- Don't use oversized shadows, glassy blur-heavy layers, or visual clutter.

## Accessibility

- Aim for WCAG AA contrast for text and controls.
- Preserve visible focus states for keyboard users.
- Keep touch targets at least `40x40px`.

## Implementation Notes

- For new pages, start from these tokens and only extend if needed.
- If the design direction changes later, update this document first before broad UI refactors.
