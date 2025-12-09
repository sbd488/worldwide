// Simple hamburger toggle for small screens
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector("nav ul");

  if (!navToggle || !navList) return;

  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    const nextState = !isExpanded;

    navToggle.setAttribute("aria-expanded", String(nextState));

    // Toggle class that controls display in CSS
    navList.classList.toggle("nav-open", nextState);
  });
});
