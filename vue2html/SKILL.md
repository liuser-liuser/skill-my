---
name: vue2html
description: Batch convert Vue SFC projects to static HTML, producing two output sets — high-fidelity UI and wireframe/skeleton views. Use whenever the user mentions converting Vue to HTML, batch HTML generation from Vue, creating static HTML from Vue components, generating wireframes from Vue, or wants two parallel HTML outputs (high-fidelity + wireframe) from a Vue codebase. Also trigger when the user says "像之前那样转换" or references a "标准版前端" conversion workflow.
---

# Vue SFC → Static HTML Batch Converter

Convert an entire Vue 2/3 SFC project into standalone static HTML files — two complete sets:

| Output | Purpose |
|--------|---------|
| `high-fidelity/` | Full UI with original styles, images, and layout |
| `wireframe/` | Skeleton/placeholder view showing layout structure only |

## When this skill applies

- The user has a Vue project (Vue 2 or 3 with `.vue` single-file components)
- They want static HTML output (no build step, no dev server needed)
- They want BOTH high-fidelity and wireframe versions
- The project may use SCSS and/or LESS in `<style>` blocks
- UI is for kiosk/terminal/desktop (not mobile-first; adapts to browser window)

## What the skill does NOT handle

- Vue 3 `<script setup>` Composition API components with complex reactive logic
- Nuxt/Next or SSR projects
- TypeScript in `<script>` blocks (plain JS only)
- Dynamic data that requires API calls at runtime

## How to use

### Step 1: Understand the project structure

Ask the user or explore:
1. Where is the Vue source? (typically `src/views/` with `.vue` files)
2. Where are global CSS files? (`src/assets/css/common.css`, icon fonts)
3. Where are static assets? (`src/assets/images/`)
4. What's the screen/target size? (terminal kiosk = 1920×1080, mobile = 375×812, or browser-adaptive)

### Step 2: Map the routes

The conversion script needs a route definition table. There are two kinds of pages:

**Flow pages** (box/layout + steps): A shared layout wraps multiple step pages via `<router-view>`.
**Standalone pages**: Single-component pages with no layout nesting.

Explore the project's `views/` directory and the router config (usually `router/index.js` or `App.vue`) to build the route map. Group related pages logically.

### Step 3: Copy and configure the script

Copy `scripts/convert.js` to the project root. Then edit the route definitions at the top of the script:

```javascript
// Flow: shared box/layout + N steps
flow('查档(旧版)', 'views/chaDang/box.vue', [
  'views/chaDang/choose.vue', 'views/chaDang/step1.vue', ...
]);

// Standalone
const STANDALONE = [
  { group:'首页', name:'index', vue:'views/index.vue', desc:'主入口' },
  ...
];
```

Key settings to adjust:
- `SRC` — path to `src/` directory
- `COMMON_CSS` / `ICON_CSS` — paths to global stylesheets (set to empty string if none)
- `EL_CSS` — Element UI CDN link (remove if project doesn't use Element UI)
- `BASE_STYLE` — CSS for `#app` container (adjust dimensions for target screen size)
- `VUE_CDN` / `EL_JS` — remove both for pure static output (recommended for kiosk/terminal)

### Step 4: Run the conversion

```bash
node convert.js
```

This produces:
```
project/
├── high-fidelity/
│   ├── index.html          # Navigation index with links to all pages
│   ├── assets/             # Copied images, fonts, CSS
│   ├── 首页/               # Grouped by category
│   ├── 查档(旧版)/         # Flow pages with nav bar
│   └── ...
└── wireframe/
    ├── index.html
    └── ...                 # Same structure, skeleton styles
```

### Step 5: Verify and fix

Open `high-fidelity/index.html` in a browser. Spot-check a few pages. Common issues:

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Page is black/empty | `#app` CSS doesn't match original | Check `BASE_STYLE` dimensions |
| Content flashes then disappears | Vue runtime is included and re-initializes DOM | Remove `VUE_CDN` and `EL_JS`, set `new Vue(...)` to empty |
| Step pages show no content | `router-view` deleted before merge | Make sure `readVueRaw` preserves router-view for merge step |
| Images broken | `src` paths not fixed | Check `fixCssUrls` and img `src` regex in `simplifyTemplate` |
| Header/footer missing on some pages | Layout uses Vue sub-components (`<header-bar>`) | Check `resolveSubComponents` handles all import paths |
| SCSS compile errors | Complex SCSS features | Add fallback stripping in `compileScss` catch block |

## Conversion pipeline (what the script does)

```
Vue SFC files
    │
    ├─ 1. parseVueSFC()      → extract template + style blocks
    ├─ 2. resolveSubComponents() → inline <header-bar> etc. from imports
    ├─ 3. compile SCSS/LESS  → plain CSS via sass/less packages
    ├─ 4. box+step merge      → replace <router-view> with step template (raw, not simplified)
    ├─ 5. simplifyTemplate()  → strip v-if, v-for, {{ }}, @click, :bind, etc.
    ├─ 6. fixCssUrls()        → rewrite url('../images/...') to correct relative paths
    ├─ 7. buildHighFidelity() / buildWireframe() → wrap in HTML document
    └─ 8. Copy assets         → images, fonts to output dirs
```

## Key design decisions embedded in the script

1. **Merge before simplify**: `readVueRaw` preserves `<router-view>` tags. Merge box+step templates FIRST, then call `simplifyTemplate` on the result. Doing it backwards is the #1 cause of empty step pages.

2. **No Vue runtime by default**: The v4 template omits Vue.js and Element UI JS. These cause DOM re-initialization that wipes static content. Only include them if the project has interactive `<el-*>` components that need them.

3. **Browser-adaptive sizing**: `#app { width: 100vw; height: 100vh; }` — fills any browser window. For fixed-size kiosk displays, change to `width: 1920px; height: 1080px;`.

4. **Sub-component resolution**: Layouts often use `<header-bar>` / `<footer-bar>` imported from sibling `.vue` files. The `resolveSubComponents` function parses `import` statements, reads the component files, and inlines their templates. This is limited to one level of nesting.

5. **SCSS/LESS fallback**: If compilation fails, the catch block strips SCSS-only syntax (`//` comments, `$variables`, `&` nesting) as a best-effort fallback. Complex mixins or functions will be lost.
