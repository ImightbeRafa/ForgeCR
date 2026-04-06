# Design System: The Forge Standard

## 1. Overview & Creative North Star

**Creative North Star: "Precision Brutalism"**

This design system transforms a medical-adjacent product—the posture corrector—into a high-performance lifestyle icon. We move away from clinical "infomercial" aesthetics toward an editorial, high-end experience that feels like a cross between a luxury automotive configurator and a premium athletic performance brand.

The identity is defined by **intentional void**. Deep monochromatic palette + aggressive spacing = "premium silence." Asymmetric tension: high-contrast typography in unexpected corners, oversized product photography bleeding off-canvas. The goal: the user feels they are not just buying a harness, but "forging" a better version of themselves.

---

## 2. Colors & Tonal Depth — "Dark Mode First"

### The "No-Line" Rule
Do NOT use 1px solid borders to separate sections. Define boundaries through volume:
- Transition from `surface` (#131313) to `surface-low` (#1C1B1B) to define content areas
- Product cards: `surface-highest` (#353534) against `surface` background

### Surface Hierarchy
```css
:root {
  --surface-lowest: #0E0E0E;     /* Deepest recessed areas */
  --surface: #131313;             /* Canvas / page background */
  --surface-low: #1C1B1B;        /* Subtle section dividers */
  --surface-container: #201F1F;   /* Standard content blocks */
  --surface-high: #2A2A2A;       /* Raised / interactive zones */
  --surface-highest: #353534;     /* Card silhouettes */
  --surface-bright: #3A3939;      /* Active states */

  --on-surface: #E5E2E1;
  --on-surface-variant: #C6C6C6;
  --outline: #919191;
  --outline-variant: #474747;
  --on-primary: #1A1C1C;

  --primary: #FFFFFF;             /* White IS the accent */
  --secondary: #C7C6C6;          /* Silver */
  --secondary-dim: #ABABAB;
}
```

### Ghost Borders
Where containment is needed (form fields, size selector), use `outline-variant` (#474747) at **15% opacity**. Felt, not seen.

---

## 3. Typography: The Editorial Voice

Dual-typeface system balancing technical precision with modern athleticism.

### Fonts
- **Display & Headlines**: Space Grotesk — "Engineered" voice. Futuristic, wide, aggressive. Tight letter-spacing (-0.02em).
- **Body & UI**: Manrope — "Humanist" voice. Premium, clean, modern readability.

```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap
```

### The Power Shift
High-contrast sizing: `display-lg` at 5rem paired with `body-sm` labels at 0.625rem. This extreme contrast creates the "expensive editorial" feel.

### Type Scale
- Hero headline: clamp(3rem, 10vw, 8rem) / 700 / -0.03em / 0.9
- Section headline: clamp(2rem, 5vw, 3.75rem) / 700 / -0.02em / 1.1
- Product name: 3rem / 700 / -0.03em
- Body: 1rem / 300–400 / 0 / 1.75
- Label/micro: 0.625rem / 400–700 / 0.15–0.3em / uppercase
- Button: 0.875rem / 700 / 0.15em / uppercase

---

## 4. Elevation & Depth

No traditional shadows. Depth via **Tonal Layering**:
- Raised: move to `surface-high` (#2A2A2A)
- Recessed: move to `surface-lowest` (#0E0E0E)
- Ambient glow: `rgba(255,255,255,0.05)` with 60px blur (ethereal, not muddy)
- Ghost border: `rgba(71,71,71,0.15)` for form fields

---

## 5. Components

### Buttons
- **Primary**: White bg (#FFFFFF), dark text (#1A1C1C). No border. Hover → silver (#C7C6C6)
- **Ghost**: Transparent, ghost border outline-variant

### Size Selection Tiles
- Grid of `surface-high` (#2A2A2A) tiles
- Active: white bg with dark text
- Gap: 12px between tiles

### Input Fields
- Background: `surface-lowest` (#0E0E0E)
- Border: bottom-only ghost border (15% opacity)
- Focus: bottom border → 100% opacity white

### Navigation
- Fixed, glassmorphic: `rgba(19,19,19,0.9)` + `backdrop-blur(24px)`
- Links: Space Grotesk, 11px, uppercase, letter-spacing 0.05em

---

## 6. Do's and Don'ts

### Do:
- Use 2px border-radius for most elements (sharp but sophisticated)
- Prioritize large-scale product photography (grayscale, high contrast)
- Use CRC pricing in Manrope, understated
- Left-align editorial layouts to create movement

### Don't:
- Use pure black (#000000) — kills depth. Use surface (#131313)
- Use standard dividers — add spacing instead
- Use bright colors — only silver, white, charcoal interplay
- Center-align everything — use editorial asymmetric layouts
