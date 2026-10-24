---
name: TryOutKu
description: Try out ujian online dengan timer, skor otomatis, dan papan peringkat, dalam gaya Apple: beranda dan momen skor gelap sinematik, halaman kerja terang.
colors:
  action-blue: "#0071e3"
  action-blue-hover: "#0077ed"
  link-blue: "#0066cc"
  link-blue-on-dark: "#2997ff"
  page-gray: "#f5f5f7"
  surface-white: "#ffffff"
  ink: "#1d1d1f"
  ink-secondary: "#6e6e73"
  ink-tertiary: "#86868b"
  control-gray: "#e8e8ed"
  control-gray-pressed: "#dcdce1"
  fill-translucent: "rgb(120 120 128 / 0.12)"
  hairline: "rgb(0 0 0 / 0.08)"
  rule-gray: "#d2d2d7"
  answered-green: "#34c759"
  answered-green-ink: "#1f7a35"
  time-orange: "#ff9500"
  time-orange-ink: "#b33900"
  alert-red: "#ff3b30"
  alert-red-ink: "#d70015"
  medal-gold: "#e3a500"
  medal-silver: "#98989d"
  medal-bronze: "#c2733a"
  black-panel: "#000000"
  night-ground: "#000000"
  night-surface: "#1c1c1e"
  night-control: "#2c2c2e"
  night-ink: "#f5f5f7"
  night-ink-secondary: "#a1a1a6"
  night-ink-tertiary: "#6e6e73"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.6rem + 5.2vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.45rem + 2.4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.07
    letterSpacing: "-0.032em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.25rem + 1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.026em"
  title-small:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.014em"
  callout:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  2xl: "22px"
  3xl: "28px"
  4xl: "36px"
  pill: "9999px"
spacing:
  gutter-phone: "20px"
  gutter-wide: "32px"
  stack: "12px"
  card-padding: "20px"
  section: "96px"
  section-wide: "128px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-hover}"
  button-secondary:
    backgroundColor: "{colors.control-gray}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.control-gray-pressed}"
  button-tinted:
    textColor: "{colors.link-blue}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.3xl}"
    padding: "{spacing.card-padding}"
  option-row:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "14px 16px"
  timer-pill:
    backgroundColor: "{colors.fill-translucent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "36px"
  segmented-control:
    backgroundColor: "{colors.fill-translucent}"
    rounded: "{rounded.md}"
    height: "36px"
---

# Design System: TryOutKu

## Overview

**Creative North Star: "The Quiet Exam Hall"**

TryOutKu looks and behaves like a first-party Apple product, in two worlds. The landing page and the score moment are dark and cinematic: a black ground, iOS dark surfaces, and app screens glowing inside device frames. The working pages (catalog, exam, leaderboard, admin) are light: pale gray and white grounds, near-black ink. One action blue carries every primary action in both. The exam interface is treated as the product: the landing shows it the way Apple shows hardware, on a laptop whose lid opens as you scroll and whose screen runs a playable exam, flanked by a tablet (the catalog) and a phone (the score). The app screens borrow iOS and macOS structure (large titles, grouped inset lists, sheets, segmented controls, a source-list sidebar) so a visitor knows where everything is before noticing the style.

Density is low on public pages and moderate in the app. Color is reserved for state: green for answered and correct, orange for remaining time and "ragu-ragu" (unsure), red for the last minute and destructive actions, gold, silver and bronze for the top three ranks. Each known subject's cover is a real photograph of its world (Raja Ampat for TKA Geografi, Bromo for Geografi, Borobudur for Sejarah, and so on), bundled under public/covers from Wikimedia Commons with credits on the catalog page; the subject's iOS hue shows while it loads, and an unknown subject keeps the hue with a cropped monogram.

The old look (cream paper, Lora serif, gold underline, emoji icons) is retired and should not come back.

**Key Characteristics:**
- SF Pro on Apple devices, Inter elsewhere, set big and tight with tabular numerals for time and scores.
- Pill buttons; text links with a chevron for secondary actions.
- White rounded surfaces on a #f5f5f7 ground, separated by soft long shadows, not borders.
- A frosted 52px bar over scrolling content; an iOS tab bar on phones.
- One authored motion moment per surface: the slab tilting flat, words lighting up on scroll, the timer ring turning into a pill, the score ring filling.

## Colors

A restrained Apple palette: neutral grounds, one action blue, and system colors that appear only when they mean something.

### Primary
- **Action Blue** (action-blue): every primary button, selected answer, answered navigator cell, active tab-bar item, and focus ring. Hover deepens slightly (action-blue-hover).
- **Link Blue** (link-blue): inline text links and "›" chevron links. On the black panel use **Link Blue on Dark** (link-blue-on-dark).

### Neutral
- **Page Gray** (page-gray): page background, alternating section ground, bento tiles on white sections.
- **Surface White** (surface-white): cards, sheets, dialogs, the exam slab, grouped lists.
- **Ink** (ink): text and active controls. **Ink Secondary** (ink-secondary): supporting text, at least 4.5:1 on both grounds. **Ink Tertiary** (ink-tertiary): large text only, such as the gray second line of the hero and inactive step headings (3:1 or better at that size).
- **Control Gray** (control-gray): secondary buttons, with **Control Gray Pressed** on hover. **Fill Translucent** (fill-translucent): iOS fill behind segmented controls, search fields, the resting timer pill, empty navigator cells and skeletons.
- **Hairline** (hairline) for dividers inside grouped lists and under bars; **Rule Gray** (rule-gray) for input strokes.
- **Black Panel** (black-panel): the single dark bento tile and phone bezels.

### State
- **Answered Green** (answered-green) marks correct keys and strong scores (80% and up); text uses **Answered Green Ink**.
- **Time Orange** (time-orange) marks under five minutes left and "ragu-ragu" flags; text uses **Time Orange Ink**.
- **Alert Red** (alert-red) marks the final minute and destructive actions; text uses **Alert Red Ink**.
- **Medal Gold / Silver / Bronze** appear only as rank rings and badges on the podium, always with ink-colored numerals on top.

### Night (landing and score moment)
- **Night Ground** (night-ground) is the page; **Night Surface** (night-surface) holds tiles, cards and the stats row; **Night Control** (night-control) fills secondary buttons and inner chips. Text is **Night Ink** with **Night Ink Secondary** for supporting copy and **Night Ink Tertiary** for large text only. Links use Link Blue on Dark.

### Named Rules
**The Two Worlds Rule.** Dark is for looking (the landing, the score moment); light is for working (catalog, exam, leaderboard, admin). App screens shown on the dark landing stay light, as a light island inside the dark page.

**The State-Only Color Rule.** Green, orange, red and the medal colors appear only where they carry meaning. A decorative use of them is a bug.

**The Ink-On-Tint Rule.** Small text on a colored fill uses the matching `-ink` color or plain ink, never white on orange, gold or green.

## Typography

**Display Font:** SF Pro Display (with Inter, then system-ui)
**Body Font:** SF Pro Text (with Inter, then system-ui)

**Character:** One grotesque family in Apple's register: heavy, tightly tracked headlines over calm 17px body text. Numbers that change (the clock, scores, counts) always use tabular figures.

### Hierarchy
- **Display** (700, clamp 44–88px, 1.04): the landing hero only. The second line may be set in Ink Tertiary.
- **Headline** (700, clamp 32–52px, 1.07): page large titles ("Katalog", "Peringkat"), section openers, exam titles.
- **Title** (700, clamp 24–32px, 1.12): sub-sections, the result headline, admin "Soal". **Title Small** (600, 20px): dialog and sheet titles, empty-state titles.
- **Body** (400, 17px, 1.5): reading text, answer options, lead paragraphs (up to 21px as "lead"), kept to about 65ch.
- **Callout** (400, 15px): descriptions in cards and dialogs.
- **Label** (600, 13px, tabular): metadata, legends, small section labels inside panels.

### Named Rules
**The No-Eyebrow Rule.** Nothing sits above a heading: no kicker, no "Langkah 1", no "Soal 3". If the information matters, it belongs in the bar, the heading itself, or below it.

**The Tabular Clock Rule.** Anything that ticks or ranks uses tabular numerals so digits do not jump.

## Layout

Centered single columns with generous air on public pages (max 1080px; hero copy max 980px), and a 1152px app container with a 20px phone gutter and 32px wide gutter. Sections alternate Page Gray and Surface White grounds with 96–128px vertical padding. The landing story: hero with the exam slab over a tilted wall of the subject photographs drifting row against row (held still under reduced motion, darkened behind the type), the subject rail that the hero's main button scrolls to, a pinned paragraph lit word by word (a 260vh track), a three-step sequence where one sticky phone changes its screen, a bento of uneven tiles (4+2, 2+2+2, 6), then a quiet closing call to action.

App screens put a large title and its one-line context at the top, then content. The exam opens on a dark, full-bleed intro: the subject photo settling in from a slight zoom, the title large at the left, and a dark-glass panel holding the timer ring, the name field and Mulai. Running, it is focus mode with no app chrome: a frosted bar (close, subject thumbnail, title, timer), the question on a white sheet (max 768px) floating over the same photo blurred to a wash of colour, and on wide screens a sticky navigator panel (288px). A short question is set as the column's headline; a question with a reading passage (TKA style) reads passage (Body, 1.6 leading), then figure, then the question in 19–21px semibold, with numbered statements "(1) …" as a hanging list in body weight. Phones swap the panel for a bottom toolbar and a sheet. Admin is a split view (336px catalog source list plus detail) that becomes a push-navigation stack below 1024px.

## Elevation & Depth

Depth comes from soft long shadows on white surfaces over a gray ground, plus frosted material for bars. Shadows are offset downward and widely blurred; no hard or zero-offset glows.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgb(0 0 0 / 0.04), 0 8px 28px -12px rgb(0 0 0 / 0.12)`): every resting surface: cards, grouped lists, panels.
- **Lift** (`0 2px 4px rgb(0 0 0 / 0.04), 0 22px 48px -18px rgb(0 0 0 / 0.22)`): catalog cards on hover, paired with a 2px rise.
- **Float** (`0 12px 30px -10px rgb(0 0 0 / 0.14), 0 40px 100px -30px rgb(0 0 0 / 0.3)`): the exam slab, phone frames, dialogs, sheets, menus, toasts.

### Named Rules
**The Material-Has-A-Job Rule.** Frosted blur (`saturate(180%) blur(20px)` on 78% white) is used only for bars and overlays that float over moving content, never as decoration on a static card.

## Shapes

Continuous, generous rounding in Apple proportions: 14px base, 18px inputs, 22px option rows and grouped lists, 28px cards and bento tiles, 32–36px for the exam slab and result panel, full pills for buttons, chips and the timer. Avatars and answer letters are circles. The app icon is a 22.37% squircle. Borders are rare: inputs use a 1px gray stroke, and grouped lists separate rows with inset hairlines.

## Components

### Buttons
- **Shape:** full pill. Heights 32 / 40 / 48px.
- **Primary:** Action Blue fill, white 15px medium text; pressing scales to 0.97.
- **Secondary:** Control Gray fill with ink text. **Tinted:** 10% blue fill with Link Blue text. **Ghost:** text only, translucent fill on hover. **Destructive:** red fill, or red text on a ghost for in-list deletes.
- **Text link:** Link Blue with a trailing chevron, underline on hover. Used for every "next step" that is not the primary action.

### Chips
- **Cover chips:** 40% black, blurred, white 12px text, sitting on catalog covers.
- **Catalog picker (Peringkat):** pills; selected is solid ink with a white label, unselected is white with a card shadow.

### Cards / Containers
- **Corner Style:** 28px (cards), 22px (grouped lists).
- **Background:** Surface White on Page Gray; bento tiles invert this (Page Gray tiles on a white section), plus one Black Panel tile.
- **Shadow Strategy:** Card at rest, Lift on hover (see Elevation & Depth).
- **Internal Padding:** 20px in the app, 28–36px in bento tiles.

### Inputs / Fields
- **Style:** 44px white field, 1px Rule Gray stroke, 18px radius, 17px text on phones and 15px on wide screens.
- **Focus:** border turns Action Blue with a 4px 15% blue ring; the caret is blue.
- **Grouped (Apple ID) fields:** stacked 56px fields in one 22px container with floating labels; the last field carries a circular arrow submit button. A wrong code or password shakes the group.

### Navigation
- **Top bar:** 52px frosted bar, app icon plus wordmark, 13px links; the active app tab sits in a translucent pill.
- **Phone tab bar:** frosted, 56px, two icon-plus-label tabs, active in Action Blue.
- **Account menu:** avatar trigger, frosted rounded menu with the name and @username on top.

### Device Stage (landing signature)
CSS-drawn laptop, tablet and phone frames at fixed design sizes, scaled together to the available width. The laptop lid opens and its screen brightens on a scroll timeline; the tablet and phone slide in from the sides. Without scroll-timeline support everything sits open.

### Highlights Gallery
Sideways cards with snap, a phone rising out of each card's bottom edge, a dot pager in a pill, and circular paddles.

### Exam Controls (signature)
- **Option row:** white row, hairline stroke, a lettered circle; selected rows get a blue hairline, 6% blue fill, a filled blue letter and a trailing checkmark.
- **Timer pill:** a draining 18px ring plus a tabular clock; gray at rest, orange under five minutes, red with a pulsing dot in the last minute. On start, the intro's full 236px ring turns into this pill through a view transition.
- **Navigator grid:** rounded squares; blue for answered, orange for ragu-ragu, translucent for empty, with an ink ring on the current question.
- **Score ring:** an activity-ring arc in green, blue or orange by score band, drawn while the number counts up.
- **Podium:** the top three on pedestals ordered 2·1·3 with medal rings and a crown for first; the rest of the ranks as a grouped inset list, with the viewer's row tinted and pinned when it falls outside the top ten.

## Do's and Don'ts

### Do:
- **Do** use exactly one Action Blue primary action per view, and show other actions as text links with a chevron.
- **Do** keep the exam screen chrome-free: a bar with close, title and timer, the question, and the navigator.
- **Do** give every horizontal snap rail the same `scroll-padding-inline` as its padding, so the first card lines up with the heading.
- **Do** label demonstration data as an example ("Contoh", "Tampilan contoh") wherever it could be mistaken for real data.
- **Do** keep content visible without JavaScript or scroll-timeline support; scroll-driven motion is progressive enhancement under `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`.
- **Do** use `overflow-x: clip`, not `overflow: hidden`, on ancestors of scroll-timeline elements, so the timeline still tracks the viewport.

### Don't:
- **Don't** put working pages (catalog, exam, admin) in the dark world, or the landing in the light one.
- **Don't** put a kicker or eyebrow label above any heading.
- **Don't** use emoji or Unicode glyphs as icons; use Lucide icons at a consistent stroke.
- **Don't** reintroduce the retired cream-paper look: Lora or other serif display, gold underlines, warm paper grounds.
- **Don't** use gradient text, colored side stripes on cards, or hard offset shadows.
- **Don't** put white small text on orange, gold or green fills; use the matching `-ink` color.
