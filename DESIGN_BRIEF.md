# GreenStep Design Brief — Paper & Ink

A restrained, opinionated design system for GreenStep. Built on the premise: *"Sometimes walking beats everything, sometimes delivery beats driving."*

---

## 1. Concept: Paper and Ink

Shopping and carbon accounting are rooted in the physical receipt. We avoid dark cyberpunk dashboards and generic neon glows in favor of warm, tactile paper, dense black ink, and printed ticket details.

* **Default Mode:** Warm Light (Paper).
* **Atmosphere:** Editorial, dry, honest, non-gamified.

---

## 2. Color Palette (Strict 3-Color Constraint)

No gradients, no neon halos, no arbitrary palette expansion.

| Token | CSS Variable | Hex | Role |
| :--- | :--- | :--- | :--- |
| **Paper Canvas** | `--color-paper` | `#F4F0E6` | App background, map tint |
| **Paper Surface** | `--color-surface`| `#FBF9F3` | Cards, popovers, receipt body |
| **Ink** | `--color-ink` | `#17211C` | Primary text, major lines, solid pins |
| **Muted Ink** | `--color-ink-muted` | `#5E6A63` | Subtitles, labels, secondary metadata |
| **Hairline Rule**| `--color-hairline` | `rgba(23, 33, 28, 0.14)` | 1px dividers, borders (no box shadows) |
| **Deep Forest** | `--color-forest` | `#1E4D3B` | **Low-carbon indicator**, lowest route marker |
| **Vermilion** | `--color-vermilion` | `#D8452A` | **High-carbon warning**, solo petrol car penalty |
| **Highlighter** | `--color-highlighter` | `#F6E05E` | Selected store active row tint only |

---

## 3. Typography System

Sentence case strictly. Remove Outfit and Plus Jakarta Sans. No screaming uppercase tracked micro-labels.

| Role | Font Family | Weights | Usage |
| :--- | :--- | :--- | :--- |
| **Serif Headline** | `'Fraunces', serif` | `600, 700` | Wordmark, section titles, receipt hero totals |
| **Interface Body** | `'Hanken Grotesk', sans-serif` | `400, 500, 600` | Store names, directions, descriptions, tabs |
| **Scientific Mono** | `'IBM Plex Mono', monospace` | `400, 500, 600` | All numbers (`g CO₂e`, `min`, `km`), tabular nums |

---

## 4. Spacing, Shapes, and Elevation

* **Radii:** 4px to 8px maximum (`rounded-sm` / `rounded-md`). Banned: `rounded-2xl`, `rounded-3xl`.
* **Elevation:** Flat. No box-shadow glows, no colored halos.
* **Separators:** 1px hairline rules (`border-ink/15`) and intentional whitespace.
* **Containers:** No cards inside cards. Dense rows divided by horizontal rules.

---

## 5. Signature Motif: The Perforated Receipt

A single physical signature motif used in exactly two places:
1. **Trip Receipt:** Choosing a shop expands the row into a printed-style receipt with mode-by-mode lines and `"vs. solo car: -457 g CO₂e"`.
2. **Monthly Summary Receipt:** The shareable card in Eco Tracker summarizing net carbon banked.

*Edge detail:* Sawtooth perforated bottom edge (`receipt-sawtooth` via SVG / CSS mask).

---

## 6. Tone of Voice & Copy Rules

* **Plain and specific:** "4 shops within a 15-minute walk. Nearest: Decathlon, 12 min on foot, 0 g CO₂e."
* **No cheerleading:** No exclamation marks, no emoji, no "greenest hero" badges.
* **Units strictly mono:** Always format with explicit units: `457 g CO₂e`, `2.2 km`, `18 min`.
* **Disclosed demo data:** A single humble footnote: *"Demo data — Retry live scan"*.
