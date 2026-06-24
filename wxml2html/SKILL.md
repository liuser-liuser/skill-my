---
name: wxml2html
description: Batch convert WeChat Mini Program (微信小程序) pages to static HTML, producing two output sets — high-fidelity UI and wireframe/skeleton views. Handles WXML templates, WXSS styles, rpx conversion, wx:* directive stripping, and mini-program component resolution. Use whenever the user mentions converting 小程序 to HTML, WXML to HTML, 微信小程序页面转换, batch HTML generation from mini-program source, or wants high-fidelity + wireframe outputs from a WeChat mini-program codebase. Also trigger for "知晓登" or "知小灯" style conversions.
---

# 微信小程序 → Static HTML Batch Converter

Convert a WeChat Mini Program project into standalone static HTML files — two complete sets:

| Output | Purpose |
|--------|---------|
| `high-fidelity/` | Full UI with original styles, images, 375px phone frame |
| `wireframe/` | Skeleton/placeholder view showing layout structure only |

## How to use

### Step 0: Confirm output format — DO THIS FIRST

Ask the user:
> 需要哪种输出？
> 1. 📱 **手机端 375px** — 和真机一致的手机框（默认）
> 2. 🖥 **浏览器自适应** — 填满浏览器窗口

Normally WeChat mini-programs are mobile-first, so default to option 1.

### Step 1: Understand the project structure

Explore and confirm:
1. **Pages directory** — usually `pages/` at project root, containing subdirectories like `pages/index/`, `pages/article/`, etc.
2. **File format per page** — each page typically has 4 files: `.wxml` (template), `.wxss` (styles), `.js` (logic), `.json` (config)
3. **Global styles** — `app.wxss` at project root
4. **Static assets** — `images/` or `assets/` directory
5. **TabBar pages** — listed in `app.json` under `tabBar.list`

### Step 2: Map all pages

Read `app.json` to get the complete page list:
```json
{
  "pages": [
    "pages/index/index",
    "pages/article/article",
    "pages/mine/mine"
  ]
}
```

Also check for pages organized by business module (e.g., `city/`, `course/`, `consult/`, `school/`).

### Step 3: Write and run the conversion script

Copy `scripts/convert.js` to the mini-program project root. The script does NOT need route definitions like the Vue version — it auto-discovers pages from the filesystem.

```bash
node convert.js
```

By default it generates mobile phone output (375px frame). For browser mode:
```bash
node convert.js --mode browser
```

### Step 4: Verify output

Open `high-fidelity/index.html` to browse all pages. Common issues:

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Styles missing | `.wxss` not found or empty | Check global `app.wxss` is picked up |
| `wx:if` content always hidden | Directive stripped, content visible | Should show all branches |
| Images broken | `src` paths not fixed | Check image path resolution |
| TabBar missing | `app.json` not parsed | Add manually if needed |
| `<import>` templates empty | Template references not resolved | Check import path resolution |

## Conversion pipeline

```
Mini-program source
  │
  ├─ Read app.json          → page list + tabBar config
  ├─ For each page:
  │   ├─ Read .wxml         → extract template
  │   ├─ Read .wxss         → extract page styles
  │   ├─ Read .js           → extract data defaults (as placeholder values)
  │   ├─ Resolve <import>   → inline referenced templates
  │   ├─ Resolve <include>  → inline referenced markup
  │   └─ Merge global app.wxss styles
  │
  ├─ Strip directives       → wx:if, wx:for, wx:key, bindtap, catchtap, data-*
  ├─ Replace {{ }}          → static placeholder from data{} defaults
  ├─ Convert rpx → px       → @375px width: px = rpx / 2
  ├─ Fix image paths        → relative paths to assets/
  │
  ├─ buildHighFidelity()    → <style> + phone frame + <div id="app">
  ├─ buildWireframe()       → skeleton CSS + dashed placeholders
  └─ Copy assets/           → images to output dirs
```

## WXML → HTML directive mapping

| WXML | Action | Output |
|------|--------|--------|
| `wx:if="{{cond}}"` | Strip, keep content | All branches visible |
| `wx:for="{{list}}"` | Strip, keep first iteration | One item shown |
| `wx:key="id"` | Strip | Removed |
| `bindtap="handler"` | Strip | Removed |
| `catchtap="handler"` | Strip | Removed |
| `bindinput="handler"` | Strip | Removed |
| `data-xxx="{{val}}"` | Strip dynamic, keep static | `data-xxx=""` |
| `{{ expression }}` | Replace with data default | Static text |
| `<import src="./tpl.wxml"/>` | Read and inline `<template>` | Expanded |
| `<include src="./part.wxml"/>` | Read and inline content | Expanded |
| `<template is="name" data="{{...}}"/>` | Replace with named template | Expanded |
| `<block>` | Unwrap | Contents only |

## rpx conversion

WeChat's rpx unit: `750rpx = screen width`. At standard 375px phone width:
- `rpx / 2 = px` (e.g., `24rpx` → `12px`)
- Applied to: `width`, `height`, `margin`, `padding`, `font-size`, `border-radius`, `top`, `left`, `right`, `bottom`, `line-height`, `gap`, `transform`

## Key design decisions

1. **No JavaScript runtime**: Unlike the Vue converter which may optionally include Vue.js, mini-program pages are always pure static HTML. The JS logic is not needed for visual display.

2. **Mobile-first by default**: Mini-programs run on phones (375px–414px width). The default output uses a 375px phone frame centered on dark background, matching the 知小灯 project format.

3. **`<import>` vs `<include>`**: `<import>` brings in `<template>` definitions; `<include>` inlines the entire content. The converter must handle both — `<import>` requires template name resolution (`<template is="...">`), while `<include>` is a simple replace.

4. **TabBar generation**: A floating bottom tab bar matching the `app.json` configuration is added to index pages, making navigation visible in the static output.

5. **Global style inheritance**: `app.wxss` styles apply to all pages. The converter prepends them to each page's output, similar to how `common.css` works in the Vue converter.
