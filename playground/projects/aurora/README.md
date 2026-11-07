# Aurora: sample landing page

A dark, glassmorphism landing page for a fictional analytics product. It's written as plain React components and CSS files, so it doubles as a test of what the Elementa compiler and runtime support.

| Feature | Where |
| --- | --- |
| Side-car stylesheets (`import "./x.component.css"`) | every component |
| Component composition and string props | `<FeatureCard eyebrow=… title=… accent=…>` in `views/home` |
| Slots via `children` | each `FeatureCard`'s visual |
| Conditional classes evaluated against props | `className={{ "accent-cyan": accent === "cyan" }}` in `feature-card` |
| Styled, multi-child links | the nav brand, the "New" badge and the CTA buttons |
| CSS custom properties, `color-mix()`, `backdrop-filter`, masks, gradient text | `feature-card.component.css`, `home.component.css` |
| `@keyframes` animations | `drift`, `rise`, `ping` in `home.component.css` |
| `@media` rules kept as conditions (not merged into the base style) | responsive rules at the end of each stylesheet |
| Nested `&:hover` selectors | buttons and cards |

Compile it with `pnpm compile:playground` at the repo root, then open `aurora → views → home` in the studio (`pnpm studio`).
