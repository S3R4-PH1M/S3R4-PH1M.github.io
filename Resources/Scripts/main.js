var icon = document.getElementById("icon");
var mobileNav = document.getElementById("mobileNav");

function openMobileNav() {
  mobileNav.classList.add("open");
  mobileNav.style.maxHeight = "8rem";
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

// Icon is a focusable div (role="button"), so it needs explicit key handling
icon.addEventListener("keydown", function(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleMobileNav();
  }
});

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

// Reveal each major section once as it scrolls into view (hierarchy / sequence cue).
// Skipped entirely under reduced-motion: sections are visible by default via CSS.
var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var revealTargets = document.querySelectorAll("[data-reveal]");

if (!prefersReducedMotion && "IntersectionObserver" in window && revealTargets.length) {
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealTargets.forEach(function(target) {
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach(function(target) {
    target.classList.add("is-visible");
  });
}