---
name: Academic Excellence Portal
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444651'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#757683'
  outline-variant: '#c5c5d3'
  surface-tint: '#4159ac'
  primary: '#284194'
  on-primary: '#ffffff'
  primary-container: '#425aad'
  on-primary-container: '#d1d8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#106e18'
  on-secondary: '#ffffff'
  secondary-container: '#9af58e'
  on-secondary-container: '#17721c'
  tertiary: '#6b3c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d5100'
  on-tertiary-container: '#ffd2aa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#274093'
  secondary-fixed: '#9df891'
  secondary-fixed-dim: '#82db77'
  on-secondary-fixed: '#002202'
  on-secondary-fixed-variant: '#00530b'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb872'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3c00'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  accent-magenta: '#D81B60'
  accent-sky: '#00B0FF'
  accent-yellow: '#FFD600'
  accent-coral: '#FF7043'
  status-draft: '#9E9E9E'
  status-announced: '#425AAD'
  status-scheduled: '#008080'
  status-progress: '#FFBF00'
  status-completed: '#30872F'
  status-certified: '#D4AF37'
  status-cancelled: '#D32F2F'
  surface-gray: '#F5F5F5'
typography:
  headline-xl:
    fontFamily: IBM Plex Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 48px
---

## Brand & Style

The design system is engineered for the CTDHR Training Portal at Dhofar University, prioritizing a balance between academic prestige and modern digital efficiency. The aesthetic is **Corporate / Modern**, leaning heavily on structured layouts, purposeful whitespace, and a high-trust color palette. 

The target audience includes university staff, external professionals, and students, requiring a UI that feels both authoritative and accessible. The visual language utilizes "Academic Rigor" as a core pillar—represented through precise alignment, clear typographic hierarchies, and a restrained use of the vibrant "rainbow" accents to signify progress and diversity without undermining the institutional professionalism.

## Colors

The palette is anchored by **Dhofar Blue** (#425AAD), representing institutional stability, and **Tree Green** (#30872F), used specifically for primary actions and "success" states to evoke growth. 

A sophisticated **Status System** is employed to manage training lifecycles, using distinct hues that maintain enough contrast for accessibility. The "Rainbow Accents" (Magenta, Sky Blue, Yellow, Coral) are never used for primary UI elements; instead, they appear as 2px decorative underlines or thin left-border "indicators" on cards to provide a subtle nod to the university's vibrant community. Backgrounds remain predominantly white (#FFFFFF) with Light Gray (#F5F5F5) used to define regional boundaries like sidebars or secondary content blocks.

## Typography

This design system uses a dual-font strategy to ensure seamless bilingual (English/Arabic) support. **Inter** is utilized for English body text and functional labels due to its exceptional legibility in data-dense admin screens. **IBM Plex Sans** (including the Arabic variant) is used for headings to provide a structured, technical, yet friendly presence.

The typographic scale is optimized for high information density. In LTR layouts, text is left-aligned; in RTL layouts, all alignment and logical flow (including icons) must be mirrored. Weight is used strategically to denote hierarchy—heavier weights for titles and interactive labels, regular weights for long-form instructional content.

## Layout & Spacing

The system employs a **12-column Fluid Grid** for the public site to ensure an expansive, welcoming feel, while the Admin Dashboard utilizes a **Fixed Sidebar + Fluid Content** model to maximize the horizontal space for data tables.

- **Admin Layout:** 260px fixed sidebar, 24px gutter between widgets, 32px padding for main containers.
- **Public Site:** Max-width container of 1280px, centered, with 40px side margins on desktop.
- **Spacing Rhythm:** Based on an 8px base unit. Component internal padding should strictly follow `unit-sm` (8px) for compact elements and `unit-md` (16px) for standard cards.
- **Bilingual Reflow:** Entire grid structures must flip horizontally for RTL support, ensuring that "Primary Action" positions (e.g., top-right in LTR) move to the top-left in RTL.

## Elevation & Depth

To maintain a "Professional & Academic" feel, depth is created through **Tonal Layering** and **Minimal Ambient Shadows**. 

1.  **Level 0 (Surface):** The main background uses `#FFFFFF`.
2.  **Level 1 (Sub-surface):** Toolbars, sidebars, and section headers use `#F5F5F5`.
3.  **Level 2 (Raised):** Cards and floating menus use a subtle shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`. This provides just enough lift to separate content without appearing overly "app-like."
4.  **Level 3 (Overlay):** Modals and dropdowns use a more pronounced shadow: `0px 8px 24px rgba(0, 0, 0, 0.12)`.

Interactive elements like buttons should not use shadows; instead, they use solid color fills or 1px strokes to remain grounded and "printed" in appearance.

## Shapes

The design system adopts a **Rounded** shape language, specifically standardized at an **8px (0.5rem) radius**. This choice strikes the perfect chord between the approachability of a training portal and the geometric precision of an academic institution.

- **Standard Elements:** Buttons, Input Fields, and Cards use the 8px radius.
- **Small Elements:** Checkboxes and small tags use a 4px radius.
- **Large Elements:** Featured banners or modal containers may scale up to a 12px radius to soften the visual impact of large surfaces.

## Components

### Buttons
- **Primary:** Solid "Tree Green" (#30872F) with white text. High contrast, used for the main conversion (e.g., "Register Now").
- **Secondary:** Solid "Dhofar Blue" (#425AAD). Used for navigational actions.
- **Outline:** 1px stroke of #425AAD. Used for secondary dashboard actions.

### Course Cards
- Professional cards with a top-heavy image ratio (16:9).
- A 4px "Rainbow Accent" line at the very top of the card helps categorize the training type visually.
- Bottom-aligned metadata (Duration, Instructor) in `body-sm`.

### Admin Data Tables
- **Compactness:** 40px row heights. 
- **Typography:** `body-sm` for all cell data.
- **Status Tags:** Pills with 4px radius, using the status colors defined in Section 2 (light background with dark text of the same hue).

### Forms
- **Bilingual State:** Labels must remain above the input to ensure vertical alignment doesn't break when switching languages. 
- **Validation:** 2px left-border (LTR) or right-border (RTL) color indicators for error (Red) or success (Green).

### Navigation
- **Public:** Top-nav with a white background, sticky on scroll, using "Dhofar Blue" for the active state underline.
- **Admin:** Dark-themed sidebar using `#333333` with active states highlighted in "Dhofar Blue."