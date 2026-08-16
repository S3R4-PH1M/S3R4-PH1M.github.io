var accordions = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < accordions.length; i++) {
  accordions[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}

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