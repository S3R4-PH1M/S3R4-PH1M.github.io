# Animated Hamburger Menu — Proposed Changes

> Reviewed: 2026-08-16
> Scope: `index.html`, `Resources/CSS/index.css`, `Resources/Scripts/main.js`
> (`about.html`/`contact.html` have no hamburger menu today — out of scope.)

## 1. Current behaviour

The hamburger **icon** already animates correctly: `.change .bar1/.bar2/.bar3`
(`index.css:118-130`) rotate/fade the three bars into an "X" over `0.4s`
because `.bar1, .bar2, .bar3` carries `transition: 0.4s;` (`index.css:112`).

The **menu panel** does not animate. It's toggled purely with inline styles:

```js
// Resources/Scripts/main.js:16-24
function myFunction() {
  var x = document.getElementById("mobileNav");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
    x.style.height = "8rem";
  }
}
```

Two things break the animation:

1. **`display: none` ↔ `display: flex` cannot be transitioned.** The panel
   pops in/out instantly regardless of the `transition: all 0.3s ease-in-out;`
   already declared on `.mobile-nav-container` (`index.css:148`) — that
   transition currently never has a chance to run.
2. **The `height` is hardcoded to `"8rem"` in JS** (`main.js:22`), disconnected
   from the CSS default of `height: 0rem` (`index.css:138`) and from the
   actual content height. It's a magic number that will silently clip or
   under-fill the menu if a link is added/removed later.

The codebase already solves this exact problem correctly for the project
accordions using `scrollHeight` (`main.js:1-14`) — the fix below reuses that
same pattern for consistency.

*Aside, unrelated to the animation but worth flagging:* `.icon` has no rule
hiding it above the `768px` breakpoint (`index.css:102-105`), so the
hamburger icon currently renders on desktop too, next to the full nav links.

## 2. Approach

Replace the `display` + inline-`height` toggle with a **class toggle**
(`.open`) driven by CSS transitions on `max-height`, `opacity`, and a small
`translateY`, with the target `max-height` computed from `scrollHeight` in
JS (same technique as the existing accordion code). This keeps the element
always in the layout (`display: flex`) so the transition can actually run,
and keeps the "how tall should this be" answer driven by real content
instead of a hardcoded value.

Also wires up the accessibility attributes the icon/menu are currently
missing (`aria-expanded`, `aria-hidden`), closes the menu on link click,
outside click, and `Escape`, and respects `prefers-reduced-motion`.

## 3. CSS changes — `Resources/CSS/index.css`

### 3a. Replace `.mobile-nav-container` (lines 132–149)

```css
/* Current */
.mobile-nav-container {
    display: none;
    flex-direction: column;
    justify-content:space-between;
    align-items: end;
    gap: 1rem;
    height: 0rem;
    width: 8rem;;
    margin-top: 1.3125rem;
    margin-bottom: 1.3125rem;
    padding: 0.5rem;
    background-color: #000000;
    position: absolute;
    top: 6rem;
    right: 0;
    z-index: 1;
    transition: all 0.3s ease-in-out;
}
```

```css
/* Proposed */
.mobile-nav-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: end;
    gap: 1rem;
    max-height: 0;
    overflow: hidden;
    width: 8rem;
    margin-top: 1.3125rem;
    margin-bottom: 1.3125rem;
    padding: 0 0.5rem;
    background-color: #000000;
    position: absolute;
    top: 6rem;
    right: 0;
    z-index: 1;
    opacity: 0;
    transform: translateY(-0.5rem);
    pointer-events: none;
    transition: max-height 0.35s ease-in-out,
                opacity 0.25s ease-in-out,
                transform 0.3s ease-in-out;
}

.mobile-nav-container.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}
```

Notes:
- `padding`/`margin` are deliberately **not** animated and stay constant —
  animating them alongside `max-height` makes the JS `scrollHeight`
  measurement (step 4) order-dependent and fragile. Only `max-height`,
  `opacity`, and `transform` change between states.
- `pointer-events: none` while closed stops the (invisible, zero-height)
  menu from intercepting clicks/taps behind it; `overflow: hidden` keeps
  content clipped until it's expanded.

### 3b. Respect reduced-motion preference (add near the bottom of the file)

```css
@media (prefers-reduced-motion: reduce) {
    .mobile-nav-container,
    .bar1, .bar2, .bar3 {
        transition: none;
    }
}
```

### 3c. (Optional, separate from this change) — hide `.icon` on desktop

```css
/* index.css:102 */
.icon {
    display: none; /* was: display: block; */
    padding-bottom: 1rem;
}

/* inside the existing @media (max-width: 768px) block, index.css:377 */
.icon {
    display: block;
}
```

## 4. JS changes — `Resources/Scripts/main.js`

```js
/* Current, lines 16-32 */
function myFunction() {
  var x = document.getElementById("mobileNav");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
    x.style.height = "8rem";
  }
}

function toggleHamburger(x) {
  x.classList.toggle("change");
}

document.getElementById("icon").addEventListener("click", function() {
  myFunction();
  toggleHamburger(this);
});
```

```js
/* Proposed */
var icon = document.getElementById("icon");
var mobileNav = document.getElementById("mobileNav");

function openMobileNav() {
  mobileNav.classList.add("open");
  mobileNav.style.maxHeight = mobileNav.scrollHeight + "px";
  icon.classList.add("change");
  icon.setAttribute("aria-expanded", "true");
  mobileNav.setAttribute("aria-hidden", "false");
}

function closeMobileNav() {
  mobileNav.classList.remove("open");
  mobileNav.style.maxHeight = null;
  icon.classList.remove("change");
  icon.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
}

function toggleMobileNav() {
  var isOpen = mobileNav.classList.contains("open");
  if (isOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
}

icon.addEventListener("click", toggleMobileNav);

// Close after choosing a link, so the menu doesn't stay open post-navigation
mobileNav.querySelectorAll(".nav-button").forEach(function(link) {
  link.addEventListener("click", closeMobileNav);
});

// Close on outside click
document.addEventListener("click", function(event) {
  var clickedInsideNav = mobileNav.contains(event.target) || icon.contains(event.target);
  if (!clickedInsideNav && mobileNav.classList.contains("open")) {
    closeMobileNav();
  }
});

// Close on Escape, return focus to the toggle
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape" && mobileNav.classList.contains("open")) {
    closeMobileNav();
    icon.focus();
  }
});
```

Notes:
- `mobileNav.scrollHeight` is measured **after** `.open` is added but
  **before** the transition has visually progressed — the browser still
  reports the fully-expanded content height, so this mirrors the existing
  accordion pattern (`main.js:1-14`) exactly.
- Setting `mobileNav.style.maxHeight = null` on close lets the CSS rule
  (`max-height: 0`) take back over for the reverse transition.
- `toggleHamburger(x)` is folded into `openMobileNav`/`closeMobileNav` so the
  bars-icon and panel states can never drift out of sync with each other.

## 5. HTML changes — `index.html`

Give the toggle and panel the ARIA wiring the JS above expects
(lines 25–29 and 31–35):

```html
<!-- Current -->
<div class="container icon" id="icon">
    <div class="bar1"></div>
    <div class="bar2"></div>
    <div class="bar3"></div>
</div>
...
<div class="mobile-nav-container" id="mobileNav">
```

```html
<!-- Proposed -->
<div class="container icon" id="icon" role="button" tabindex="0"
     aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileNav">
    <div class="bar1"></div>
    <div class="bar2"></div>
    <div class="bar3"></div>
</div>
...
<div class="mobile-nav-container" id="mobileNav" aria-hidden="true">
```

`role="button"`/`tabindex="0"` make the `div` keyboard-focusable in the
meantime; converting it to a real `<button>` (as already recommended in
`IMPROVEMENTS.md`, "Hamburger button missing ARIA label") remains the more
robust long-term fix and would let the `role`/`tabindex` attributes above be
dropped, plus give Enter/Space activation for free.

## 6. Testing checklist

- [ ] Click hamburger below 768px width → bars morph to "X" and panel slides
      down/fades in smoothly (no snap).
- [ ] Click again → panel slides up/fades out, bars revert to hamburger.
- [ ] Click a link inside the open menu → menu closes and page
      navigates/scrolls as expected.
- [ ] Click outside the open menu → menu closes.
- [ ] Open menu, press `Escape` → menu closes and focus returns to the icon.
- [ ] Resize from mobile → desktop while menu is open → menu doesn't stay
      stuck open/hidden incorrectly.
- [ ] With OS "reduce motion" enabled, menu opens/closes instantly (no
      animation) but still functions.
- [ ] Screen reader announces the icon as a toggle button with expanded/
      collapsed state.
