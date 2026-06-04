---
name: "Morningstar: The Crimson Wolf Reader"
description: "A restrained literary e-reader for an atmospheric dark-fantasy novel."
---

<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Morningstar: The Crimson Wolf Reader

## 1. Overview

**Creative North Star: "The Quiet Chapter House"**

The interface should feel like a private reading room built for a dangerous, intimate story: quiet, precise, low-lit when needed, and never theatrical. Morningstar is not a fantasy costume interface. It is a modern reader that lets the manuscript carry the atmosphere.

The visual system is product-first. It should use familiar reader controls, predictable drawers, clear focus states, and compact settings. Beauty comes from typography, rhythm, restraint, and a rare crimson signal, not decoration.

**Key Characteristics:**

- Reader-first and low-clutter.
- Literary without looking antique.
- Dark-fantasy atmosphere without game UI.
- Responsive on desktop and mobile.
- Calm controls, precise state feedback, and strong accessibility.

## 2. Colors

The palette should use a restrained strategy: tinted neutrals plus one muted crimson accent used on no more than a small portion of any screen.

### Primary

- **Crimson Signal** ([to be resolved during implementation]): Used for current progress, active chapter, selected controls, focus emphasis where appropriate, and rare brand moments. It must not flood the interface.

### Neutral

- **Reader Light** ([to be resolved during implementation]): A true low-chroma off-white for light mode, not parchment, cream, sand, or beige.
- **Reader Dark** ([to be resolved during implementation]): A deep low-chroma neutral for dark mode, tuned for long reading without pure black.
- **Ink** ([to be resolved during implementation]): Main prose and UI text color. It must meet WCAG AA contrast in every theme.
- **Quiet Line** ([to be resolved during implementation]): Borders, dividers, and progress-track surfaces.
- **Panel Ground** ([to be resolved during implementation]): Sidebar, drawer, settings, and encyclopedia surfaces, separated by tonal contrast rather than heavy shadows.

### Named Rules

**The Crimson Restraint Rule.** Crimson is a signal, not a background theme. If the screen starts to feel red, the system has failed.

**The No Parchment Costume Rule.** Do not use scroll textures, faux old paper, ornate borders, or beige fantasy nostalgia.

## 3. Typography

**Display Font:** EB Garamond or a closely related literary serif, with Georgia as fallback.

**Body Font:** EB Garamond for prose, with Georgia as fallback.

**Label/UI Font:** Inter or the platform system sans stack.

**Character:** Prose typography should feel published and literary. UI typography should feel modern, quiet, and reliable. Do not use decorative fantasy fonts in labels, buttons, navigation, or dense controls.

### Hierarchy

- **Display** (serif, controlled weight, generous line height): Part titles, chapter openers, and the title lockup.
- **Headline** (serif or UI sans depending on context): Chapter names, encyclopedia entry titles, and major reader surfaces.
- **Title** (UI sans, medium weight): Drawer headings, settings groups, and navigation labels.
- **Body** (serif, readable size, 65-75ch max line length): Novel prose.
- **Label** (UI sans, compact, no wide tracking): Buttons, tooltips, tabs, settings labels, metadata, and progress text.

### Named Rules

**The Prose Leads Rule.** Every typography decision must improve reading comfort before it improves brand expression.

**The UI Stays Sans Rule.** Reader controls, labels, and settings use clean sans typography so they do not compete with the prose.

## 4. Elevation

The system should be flat by default and layered through tone, spacing, and fixed-position structure. Shadows are allowed only for active overlays, drawers, popovers, and focused floating controls where the user needs depth feedback.

### Shadow Vocabulary

- **Overlay Lift** ([to be resolved during implementation]): Used only for mobile sheets, popovers, and temporarily elevated reader controls.
- **Focus Ring** ([to be resolved during implementation]): A visible keyboard focus treatment with strong contrast in both themes.

### Named Rules

**The Still Surface Rule.** Static content surfaces do not need decorative shadows. If a panel is not moving, selected, focused, or layered above content, it should stay visually quiet.

## 5. Components

No implemented components exist yet. The following planned component vocabulary should guide the first build and should be replaced with extracted tokens after implementation.

### Reader Shell

- **Shape:** Full-screen app surface with a centered reading column.
- **Desktop:** Collapsible table of contents on the left, optional encyclopedia drawer on the right.
- **Mobile:** Reading-first surface with bottom toolbar and slide-up sheets.

### Reader Toolbar

- **Style:** Icon-first controls with clear tooltips and labels where space allows.
- **States:** Default, hover, focus-visible, active, disabled.
- **Behavior:** Controls may fade or collapse while reading, but must remain easy to summon.

### Table of Contents

- **Style:** Part groups, chapter rows, and slim progress bars.
- **State:** Current chapter, unread chapter, in-progress chapter, completed chapter.
- **Behavior:** Must support fast Part and chapter switching without feeling like a dashboard.

### Settings Panel

- **Controls:** Font size, font family, text alignment, line spacing, content width, theme, and reduced-motion preference.
- **Behavior:** Changes apply immediately and persist locally.

### Encyclopedia Drawer

- **Style:** Searchable character and region entries with full open summaries.
- **Behavior:** All entries are visible from the start in their section. The encyclopedia is a novel companion, not a locked progression system.

## 6. Do's and Don'ts

### Do:

- **Do** keep the reader surface quiet enough for long sessions.
- **Do** preserve a 65-75ch reading line length on desktop.
- **Do** make settings, bookmarks, Last Read, and TOC controls easy to reach on mobile.
- **Do** use crimson sparingly for active state, progress, and brand moments.
- **Do** test light and dark themes for WCAG AA contrast.
- **Do** treat mature-content support with restraint and clear reader respect.

### Don't:

- **Don't** make the app look Wattpad-like, social-feed-like, or badge-heavy.
- **Don't** make the app look like a game HUD, RPG codex, inventory screen, or fantasy menu.
- **Don't** make chapters feel like blog posts.
- **Don't** use parchment textures, scroll motifs, ornate frames, decorative fantasy fonts, or faux medieval styling.
- **Don't** use gradient text, decorative glassmorphism, side-stripe card accents, or card-heavy SaaS layouts.
- **Don't** turn lore into game-like hidden entries, quest gates, or locked progression states.
