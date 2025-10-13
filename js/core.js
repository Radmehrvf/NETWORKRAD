// ================================
// CORE.JS - Essential Site Functions
// ================================

console.log("✅ Core module loaded");

// ================================
// HEADER & NAVIGATION
// ================================
function initHeader() {
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      mainHeader?.classList.add('scrolled');
    } else {
      mainHeader?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const headerHeight = mainHeader?.offsetHeight || 0;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ================================
// SCROLL BUTTONS
// ================================
function initScrollButtons() {
  const scrollUpBtn = document.getElementById('scrollUpBtn');
  const scrollDownBtn = document.getElementById('scrollDownBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      scrollUpBtn?.classList.add('show-scroll-btn');
      scrollDownBtn?.classList.add('show-scroll-btn');
    } else {
      scrollUpBtn?.classList.remove('show-scroll-btn');
      scrollDownBtn?.classList.remove('show-scroll-btn');
    }
  });

  scrollUpBtn?.addEventListener('click', () => {
    window.scrollBy({ top: -600, behavior: 'smooth' });
  });

  scrollDownBtn?.addEventListener('click', () => {
    window.scrollBy({ top: 600, behavior: 'smooth' });
  });
}

// ================================
// COLLAPSIBLE SECTIONS
// ================================
function initCollapsibleSections() {
  document.querySelectorAll(".reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      const isExpanded = target?.classList.contains("expanded");

      // Collapse all
      document.querySelectorAll(".collapsible-content").forEach((el) => {
        el.classList.remove("expanded");
      });
      document.querySelectorAll(".reveal-btn").forEach((el) => {
        el.classList.remove("active");
        const arrow = el.querySelector(".arrow");
        if (arrow) arrow.textContent = "▶";
      });

      // Toggle current
      if (!isExpanded && target) {
        target.classList.add("expanded");
        btn.classList.add("active");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.textContent = "▼";
      }
    });
  });
}

// ================================
// INITIALIZE CORE
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initScrollButtons();
  initCollapsibleSections();
});