// ================================
// RADILINKS OPTIMIZED SCRIPT
// All duplicates removed, proper lazy loading
// ================================

console.log("Welcome to RadiLinks Portfolio!");

const MOBILE_NAV_MEDIA = window.matchMedia('(max-width: 768px)');
const NAV_FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let releaseNavFocusTrap = null;
const getBackendBaseUrl = () => {
  const metaBase = document.querySelector('meta[name="backend-base-url"]')?.getAttribute('content');
  const globalBase = window.RADILINKS_BACKEND_BASE;
  const candidate = (metaBase || globalBase || '').trim();
  return candidate ? candidate.replace(/\/+$/, '') : '';
};
const BACKEND_BASE_URL = getBackendBaseUrl();
const buildBackendUrl = (path = '') => `${BACKEND_BASE_URL}${path}`;
let sessionUserCache = null;
let sessionFetchInFlight = null;

// Reusable session fetcher so multiple features (CTA, page switch) share the same call
async function fetchSessionUser() {
  if (sessionUserCache) return sessionUserCache;
  if (sessionFetchInFlight) return sessionFetchInFlight;
  sessionFetchInFlight = fetch(buildBackendUrl('/api/me'), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      sessionUserCache = data?.user || null;
      return sessionUserCache;
    })
    .catch(() => null)
    .finally(() => {
      sessionFetchInFlight = null;
    });
  return sessionFetchInFlight;
}

function toggleNavFocusTrap(container, shouldTrap) {
  if (!container) return;
  if (!shouldTrap) {
    if (typeof releaseNavFocusTrap === 'function') {
      releaseNavFocusTrap();
    }
    return;
  }

  const focusableEls = Array.from(container.querySelectorAll(NAV_FOCUSABLE_SELECTOR))
    .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null);

  if (!focusableEls.length) return;

  const first = focusableEls[0];
  const last = focusableEls[focusableEls.length - 1];
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  function handleKeydown(event) {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  releaseNavFocusTrap = () => {
    document.removeEventListener('keydown', handleKeydown);
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus({ preventScroll: true });
    }
    releaseNavFocusTrap = null;
  };

  requestAnimationFrame(() => {
    first.focus();
  });
}

function handleMobileNavMediaChange(event) {
  const mainNav = document.getElementById('mainNav');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navBackdrop = document.getElementById('navBackdrop');

  if (!mainNav || !mobileMenuToggle) return;

  if (!event.matches) {
    toggleNavFocusTrap(mainNav, false);
    mainNav.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    navBackdrop?.classList.remove('active');
    navBackdrop?.setAttribute('aria-hidden', 'true');
    mainNav.removeAttribute('role');
    mainNav.removeAttribute('aria-modal');
    mainNav.removeAttribute('aria-hidden');
  } else {
    mainNav.setAttribute('aria-hidden', mainNav.classList.contains('active') ? 'false' : 'true');
  }
}

if (typeof MOBILE_NAV_MEDIA.addEventListener === 'function') {
  MOBILE_NAV_MEDIA.addEventListener('change', handleMobileNavMediaChange);
} else if (typeof MOBILE_NAV_MEDIA.addListener === 'function') {
  MOBILE_NAV_MEDIA.addListener(handleMobileNavMediaChange);
}

const isOnDashboardPage = () => {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  return normalizedPath === '/dashboard' || normalizedPath === '/dashboard.html';
};

// Swap the nav CTA between signup, dashboard, and home depending on session and page
function updateNavAuthCta(sessionUser) {
  const cta = document.querySelector('.nav-cta.nav-signup');
  if (!cta) return;

  const label = cta.querySelector('span');
  const subtext = cta.querySelector('.nav-subtext');
  const onDashboard = isOnDashboardPage();
  const signedIn = !!sessionUser;

  if (signedIn) {
    const target = onDashboard ? '/' : '/dashboard';
    if (label) label.textContent = onDashboard ? 'Home' : 'Dashboard';
    if (subtext) subtext.textContent = onDashboard ? 'Back to portfolio' : 'Go to your workspace';
    cta.href = buildBackendUrl(target);
    cta.dataset.authState = 'signed-in';
    cta.onclick = (event) => {
      event.preventDefault();
      document.body.classList.add('page-switching');
      setTimeout(() => {
        window.location.href = buildBackendUrl(target);
      }, 150);
    };
  } else {
    if (label) label.textContent = 'Create an Account';
    if (subtext) subtext.textContent = 'or Log In';
    cta.href = buildBackendUrl('/signup.html');
    cta.dataset.authState = 'signed-out';
    cta.onclick = null;
  }
}

function initAuthAwareNavCta() {
  // Default state before session check resolves
  updateNavAuthCta(null);
  fetchSessionUser()
    .then((user) => updateNavAuthCta(user))
    .catch(() => updateNavAuthCta(null));
}

// ================================
// SINGLE UNIFIED INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("RadiLinks Site Loaded");

  // Initialize core features
  initHeader();
  initImprovedNavigation();
  initAuthAwareNavCta();
  initPageSwitchToggle();
  initMainInterface();
  initAuthAccessSection();
  initSupportUnlockEasterEgg();
  initGameNavigationFix();
  
  // Setup lazy loading for sections and games
  setupIntersectionObserver();
  setupLazyGameLoading();
});

// ================================
// HEADER & NAVIGATION
// ================================
function setMobileNavState(isOpen) {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const navBackdrop = document.getElementById('navBackdrop');

  if (!mobileMenuToggle || !mainNav) return;

  const isMobileOverlay = MOBILE_NAV_MEDIA.matches;

  mobileMenuToggle.classList.toggle('active', isOpen);
  mainNav.classList.toggle('active', isOpen);
  mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  document.body.style.overflow = isOpen && isMobileOverlay ? 'hidden' : '';

  if (isMobileOverlay) {
    mainNav.setAttribute('role', 'dialog');
    mainNav.setAttribute('aria-modal', 'true');
    mainNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  } else {
    mainNav.removeAttribute('role');
    mainNav.removeAttribute('aria-modal');
    mainNav.removeAttribute('aria-hidden');
  }

  toggleNavFocusTrap(mainNav, isOpen && isMobileOverlay);

  if (navBackdrop) {
    navBackdrop.classList.toggle('active', isOpen && isMobileOverlay);
    navBackdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

}

function initHeader() {
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const navBackdrop = document.getElementById('navBackdrop');
  let lastScroll = 0;

  // Scroll effect
  const handleHeaderScroll = () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      mainHeader?.classList.add('scrolled');
    } else {
      mainHeader?.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  };

  let headerScrollTicking = false;
  handleHeaderScroll();
  window.addEventListener(
    'scroll',
    () => {
      if (headerScrollTicking) return;
      headerScrollTicking = true;
      requestAnimationFrame(() => {
        handleHeaderScroll();
        headerScrollTicking = false;
      });
    },
    { passive: true }
  );

  // Mobile menu toggle + accessibility helpers
  if (mobileMenuToggle && mainNav) {
    setMobileNavState(false);
    navBackdrop?.addEventListener('click', () => setMobileNavState(false));
    
    mobileMenuToggle.addEventListener('click', () => {
      const shouldOpen = !mainNav.classList.contains('active');
      setMobileNavState(shouldOpen);
    });
    
    // Close menu when clicking nav links
    document.querySelectorAll('a.nav-link').forEach(link => {
      link.addEventListener('click', () => setMobileNavState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mainNav.classList.contains('active')) {
        setMobileNavState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
        setMobileNavState(false);
      }
    });

    if (MOBILE_NAV_MEDIA.matches) {
      mainNav.setAttribute('role', 'dialog');
      mainNav.setAttribute('aria-modal', 'true');
      mainNav.setAttribute('aria-hidden', 'true');
    } else {
      mainNav.removeAttribute('role');
      mainNav.removeAttribute('aria-modal');
      mainNav.removeAttribute('aria-hidden');
    }
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('a.nav-link');

  const updateActiveLink = () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  let navScrollTicking = false;
  updateActiveLink();
  window.addEventListener(
    'scroll',
    () => {
      if (navScrollTicking) return;
      navScrollTicking = true;
      requestAnimationFrame(() => {
        updateActiveLink();
        navScrollTicking = false;
      });
    },
    { passive: true }
  );

  // Smooth scroll
  document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
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
// INTERSECTION OBSERVER FOR LAZY SECTIONS
// ================================
function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) {
    console.warn('âš ï¸ Intersection Observer not supported');
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.01
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        section.classList.add('lazy-loaded');
        sectionObserver.unobserve(section);
        
        // Trigger business counters if it's that section
        if (section.id === 'business-growth') {
          initBusinessCounters();
        }
      }
    });
  }, observerOptions);

  // Observe all lazy sections
  document.querySelectorAll('.lazy-section').forEach(section => {
    sectionObserver.observe(section);
  });
}

// ================================
// BUSINESS COUNTERS (SINGLE VERSION)
// ================================
// ================================
// SMOOTH COUNTER ANIMATION (NO LAG)
// Replace the initBusinessCounters function in Script.js
// ================================

let countersInitialized = false;

function initBusinessCounters() {
  if (countersInitialized) return;
  
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;

  countersInitialized = true;
  console.log('ðŸ“Š Animating business counters');

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();
    
    // Easing function for smooth animation
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
    
    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const current = Math.floor(easedProgress * target);
      counter.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target; // Ensure final value is exact
      }
    }
    
    requestAnimationFrame(updateCount);
  });
}

// Make sure it triggers when scrolling to the section
// Add this AFTER the setupIntersectionObserver function
window.addEventListener('scroll', function checkBusinessSection() {
  const section = document.getElementById('business-growth');
  if (!section || countersInitialized) return;
  
  const rect = section.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
  
  if (isVisible) {
    initBusinessCounters();
    // Remove listener once triggered
    window.removeEventListener('scroll', checkBusinessSection);
  }
}, { passive: true });
// ================================
// LAZY GAME LOADING (CLICK ONLY)
// ================================
function setupLazyGameLoading() {
  let networkBuilderLoaded = false;
  let mindspaceLoaded = false;
  let radbotLoaded = false;

  // Network Builder - Load ONLY on button click
  const networkRevealBtn = document.querySelector('[data-target="network-builder-section"]');
  if (networkRevealBtn) {
    networkRevealBtn.addEventListener('click', () => {
      if (!networkBuilderLoaded) {
        console.log("ðŸŽ® Loading Network Builder...");
        
        const loadingIndicator = networkRevealBtn.querySelector('.loading-indicator');
        if (loadingIndicator) loadingIndicator.style.display = 'inline';
        
        setTimeout(() => {
          initNetworkBuilder();
          networkBuilderLoaded = true;
          if (loadingIndicator) loadingIndicator.style.display = 'none';
        }, 300);
      }
    });
  }

  // Mindspace Explorer - Load ONLY on button click
  const mindspaceRevealBtn = document.querySelector('[data-target="mindspace-explorer-section"]');
  if (mindspaceRevealBtn) {
    mindspaceRevealBtn.addEventListener('click', () => {
      if (!mindspaceLoaded) {
        console.log("ðŸŒŒ Loading Mindspace Explorer...");
        
        const loadingIndicator = mindspaceRevealBtn.querySelector('.loading-indicator');
        if (loadingIndicator) loadingIndicator.style.display = 'inline';
        
        setTimeout(() => {
          initMindspaceExplorer();
          mindspaceLoaded = true;
          if (loadingIndicator) loadingIndicator.style.display = 'none';
        }, 300);
      }
    });
  }

  // RadBot Quiz - Load ONLY on category selection
  const radbotGrid = document.querySelector('#radbot-section .category-grid');
  if (radbotGrid) {
    const handleRadbotGridClick = (event) => {
      const button = event.target.closest('.category-btn');
      if (!button) return;
      if (!radbotLoaded) {
        console.log("dY- Loading RadBot Quiz...");
        initRadBotQuiz(button.dataset.category);
        radbotLoaded = true;
        radbotGrid.removeEventListener('click', handleRadbotGridClick);
      }
    };
    radbotGrid.addEventListener('click', handleRadbotGridClick);
  }

}

// ================================
// CHAT FUNCTIONALITY (MERGED & COMPLETE)
// ================================
function initMainInterface() {
  // Get all elements
  const chatbox = document.getElementById('chatbox');
  const chatButton = document.getElementById('chatButton');
  const floatingChatBtn = document.getElementById('floatingChatBtn');
  const closeChat = document.getElementById('closeChat');
  const heroMessageBtn = document.getElementById('heroMessageBtn');
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');
  const exploreBtn = document.getElementById('exploreBtn');
  const chatSuggestions = document.getElementById('chatSuggestions');
  
  // Debug logging
  console.log('Chatbox:', chatbox);
  console.log('Hero Message Button:', heroMessageBtn);
  
  // Function to toggle chatbox
  function toggleChat(e) {
    if (e) e.preventDefault();
    console.log('Toggle chat called, current state:', chatbox.classList.contains('active'));
    chatbox.classList.toggle('active');
    if (chatbox.classList.contains('active')) {
      setTimeout(() => chatInput?.focus(), 300);
    }
  }
  
  // Header chat button
  if (chatButton) {
    chatButton.addEventListener('click', toggleChat);
  }
  
  // Floating chat button
  if (floatingChatBtn) {
    floatingChatBtn.addEventListener('click', toggleChat);
  }
  
  if (!heroMessageBtn) {
    console.error('Hero message button NOT found!');
  }
  
  // Close chat button
  if (closeChat) {
    closeChat.addEventListener('click', toggleChat);
  }
  
  // Explore button (scroll to contact)
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Add message with animations
  function addMessage(text, sender = "user") {
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-message" : "bot-message";
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  
  // Show thinking indicator
  function showThinking() {
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-indicator";
    thinkingDiv.id = "thinkingIndicator";
    thinkingDiv.innerHTML = `
      <div class="thinking-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatBody.appendChild(thinkingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  
  // Remove thinking indicator
  function removeThinking() {
    const thinking = document.getElementById("thinkingIndicator");
    if (thinking) {
      thinking.remove();
    }
  }
  
  // Hide welcome message
  function hideWelcome() {
    const welcome = document.querySelector(".chat-welcome");
    if (welcome) {
      welcome.style.display = "none";
    }
  }
  
  // Send message function
  function sendLocalMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";
    sendMessageToAI(message);
  }

  // Send button click
  if (sendBtn) {
    sendBtn.addEventListener('click', sendLocalMessage);
  }
  
  // Enter key to send
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendLocalMessage();
      }
    });
  }
  
  // Chat suggestions
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const message = btn.getAttribute('data-msg');
      chatInput.value = message;
      sendLocalMessage();
    });
  });
  
  // AI Chat Connection
  const workerURL = "https://bold-field-e8ab.radmehrvf.workers.dev/";

  function sendMessageToAI(userMessage) {
    // Hide welcome and suggestions on first message
    hideWelcome();
    if (chatSuggestions && chatBody.children.length > 2) {
      chatSuggestions.style.display = "none";
    }
    
    // Show thinking indicator
    showThinking();
    
    fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }]
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        removeThinking();
        const aiReply = data.reply || "ðŸ¤– (No response from AI)";
        addMessage(aiReply, "bot");
      })
      .catch((err) => {
        removeThinking();
        console.error("AI connection error:", err);
        addMessage("âš ï¸ AI connection failed. Please try again later.", "bot");
      });
  }

  // Discuss buttons
  document.querySelectorAll('.discuss-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-discuss');
      chatbox.classList.add('active');
      addMessage(msg, "user");
      setTimeout(() => {
        addMessage("Let's talk about that! (Chat demo active.)", "bot");
      }, 600);
    });
  });

  // AI Optimizer Form
  const optimizeBtn = document.getElementById('optimizeBtn');
  const aiFormSection = document.getElementById('ai-form-section');
  const businessForm = document.getElementById('businessForm');
  const cancelFormBtn = document.getElementById('cancelForm');

  optimizeBtn?.addEventListener('click', () => {
    aiFormSection?.classList.add('visible');
    setTimeout(() => {
      aiFormSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  cancelFormBtn?.addEventListener('click', () => {
    aiFormSection?.classList.remove('visible');
    document.getElementById('ai-optimizer-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  businessForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = businessForm.querySelector('.btn-submit');
    const submitText = submitBtn?.querySelector('span');
    const originalText = submitText?.textContent || 'Analyze My Workflow';

    const formData = new FormData(businessForm);
    const rawEntries = {};
    formData.forEach((value, key) => {
      rawEntries[key] = typeof value === 'string' ? value.trim() : value;
    });

    const payload = {
      ...rawEntries,
      challenges: rawEntries.bottlenecks || rawEntries.challenges || '',
      tools: rawEntries.tools || rawEntries.currentTools || '',
      teamSize: rawEntries.teamSize || rawEntries['team-size'] || '',
      goal: rawEntries.goals || rawEntries.goal || '',
      email: rawEntries.email || '',
      phone: rawEntries.phone || '',
      consent: document.getElementById('consentCheckbox')?.checked ?? false
    };

    try {
      if (submitText) submitText.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      const response = await fetch('/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Thank you! Your workflow analysis request has been sent successfully.');
        businessForm.reset();
      } else {
        alert('Failed to send request. Please try again.');
      }
    } catch (error) {
      alert('Failed to send request. Please try again.');
    } finally {
      if (submitText) submitText.textContent = originalText;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
  // Support & Hire Sections
  const supportBtn = document.getElementById('supportBtn');
  const hireBtn = document.getElementById('hireBtn');
  const supportSection = document.getElementById('supportSection');
  const hireSection = document.getElementById('hireSection');
  const hireForm = document.getElementById('hireForm');

  const getHeaderHeight = () => {
    const header = document.querySelector('header');
    if (header) return header.offsetHeight;
    const rootStyles = getComputedStyle(document.documentElement);
    const cssValue = parseFloat(rootStyles.getPropertyValue('--header-height'));
    return Number.isFinite(cssValue) ? cssValue : 72;
  };

  const calculateScrollOffset = () => {
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const headerHeight = getHeaderHeight();
    let viewportOffset;

    if (viewportWidth < 768) {
      viewportOffset = viewportHeight < 700 ? 80 : 95;
    } else if (viewportWidth < 1024) {
      viewportOffset = viewportHeight < 800 ? 105 : 115;
    } else {
      viewportOffset = viewportHeight < 800 ? 120 : 140;
    }

    return headerHeight + viewportOffset;
  };

  const scrollToSection = (element, offset) => {
    if (!element) return;
    const dynamicOffset = typeof offset === 'number' ? offset : calculateScrollOffset();
    const top = element.getBoundingClientRect().top + window.scrollY - dynamicOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };

  const scrollToSectionStable = (element) => {
    if (!element) return;
    const doScroll = () => scrollToSection(element);
    doScroll();
    const fallbackTimer = setTimeout(doScroll, 180);

    if (!window.ResizeObserver) return;
    let settled = false;
    const observer = new ResizeObserver(() => {
      if (settled) return;
      settled = true;
      requestAnimationFrame(() => {
        doScroll();
        observer.disconnect();
        clearTimeout(fallbackTimer);
      });
    });
    observer.observe(element);
    setTimeout(() => observer.disconnect(), 800);
  };

  const ensureHireHintOverlay = () => {
    if (!hireSection) return null;
    const descriptionField = hireSection.querySelector('#projectDescription');
    const group = descriptionField?.closest('.form-group');
    if (!group) return null;
    group.classList.add('hint-target');
    let overlay = group.querySelector('.hire-hint-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'hire-hint-overlay';
      overlay.textContent = 'Send your message here';
      group.appendChild(overlay);
    }
    return overlay;
  };

  const triggerHireHint = () => {
    if (!hireSection) return;
    const overlay = ensureHireHintOverlay();
    hireSection.classList.remove('hint-active');
    void hireSection.offsetWidth;
    hireSection.classList.add('hint-active');
    if (overlay) {
      overlay.classList.remove('is-active');
      void overlay.offsetWidth;
      overlay.classList.add('is-active');
    }
    setTimeout(() => {
      hireSection.classList.remove('hint-active');
      overlay?.classList.remove('is-active');
    }, 3600);
  };

  const openHireSection = (withHint = false) => {
    hireSection?.classList.add('visible');
    supportSection?.classList.remove('visible');
    setTimeout(() => {
      scrollToSectionStable(hireSection);
      if (withHint) {
        setTimeout(() => {
          triggerHireHint();
        }, 150);
      }
    }, 520);
  };

  supportBtn?.addEventListener('click', () => {
    supportSection?.classList.add('visible');
    hireSection?.classList.remove('visible');
    setTimeout(() => {
      scrollToSection(supportSection || document.getElementById('support-hire'));
    }, 520);
  });

  hireBtn?.addEventListener('click', () => openHireSection());
  heroMessageBtn?.addEventListener('click', (e) => {
    if (e) e.preventDefault();
    openHireSection(true);
  });

  document.querySelectorAll('.close-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.closest('button').getAttribute('data-target');
      const section = document.getElementById(target);
      section?.classList.remove('visible');
      scrollToSection(document.getElementById('support-hire'));
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-close');
      const section = document.getElementById(target);
      section?.classList.remove('visible');
      scrollToSection(document.getElementById('support-hire'));
    });
  });

  hireForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = e.target.querySelector('input[placeholder*="John"]').value;
    const email = e.target.querySelector('input[placeholder*="john@example"]').value;
    const description = e.target.querySelector('textarea[placeholder*="Tell me about"]').value;

    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Sending...';
    button.disabled = true;

    try {
      const response = await fetch('/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, description })
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you! Your inquiry has been sent successfully.');
        e.target.reset();
      } else {
        alert('Failed to send inquiry. Please try again.');
      }
    } catch (error) {
      alert('Error sending inquiry. Please try again.');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });

  // Grow Business Button
  const growBtn = document.getElementById('growBizBtn');
  growBtn?.addEventListener('click', () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });

       // Collapsible sections - IMPROVED
  document.querySelectorAll(".reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      
      if (target && !target.classList.contains("expanded")) {
        target.classList.add("expanded");
        btn.classList.add("active");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.textContent = "â–¼";
      } else if (target) {
        target.classList.remove("expanded");
        btn.classList.remove("active");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.textContent = "â–¶";
      }
    });
  });
}

// ================================
// NETWORK BUILDER GAME
// ================================
function initNetworkBuilder() {
  const canvas = document.getElementById("networkCanvas");
  const messageBox = document.getElementById("network-message");
  if (!canvas || !messageBox) return;

  canvas.style.display = 'block'; // Show canvas
  const ctx = canvas.getContext("2d");
  const MAX_NODES = 7;
  let nodes = [];
  let connections = [];
  let selectedNode = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = 400;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function createNodes() {
    nodes = [];
    for (let i = 0; i < MAX_NODES; i++) {
      nodes.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1,
        radius: 10,
        active: false,
      });
    }
  }

  function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.active ? "#00ffff" : "#007b9e";
    ctx.shadowColor = "rgba(0, 188, 212, 0.8)";
    ctx.shadowBlur = node.active ? 20 : 8;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }

  function drawLine(n1, n2) {
    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.strokeStyle = "rgba(0, 188, 212, 0.7)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 188, 212, 0.6)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(([a, b]) => drawLine(a, b));
    nodes.forEach(drawNode);
  }

  function checkCompleteNetwork() {
    const activeCount = nodes.filter(n => n.active).length;
    if (activeCount === MAX_NODES && connections.length >= MAX_NODES - 1) {
      messageBox.textContent = "You've built a 7-node network â€” welcome to the Network!";
      messageBox.style.color = "#00e0ff";
    }
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const node of nodes) {
      if (Math.hypot(mouseX - node.x, mouseY - node.y) <= node.radius + 5) {
        if (!selectedNode) {
          node.active = true;
          selectedNode = node;
        } else if (selectedNode !== node) {
          node.active = true;
          connections.push([selectedNode, node]);
          selectedNode = null;
        }
        drawNetwork();
        checkCompleteNetwork();
        break;
      }
    }
  });

  createNodes();
  function animate() {
    drawNetwork();
    requestAnimationFrame(animate);
  }
  animate();
}

// ================================
// MINDSPACE EXPLORER GAME
// ================================
function initMindspaceExplorer() {
  const canvas = document.getElementById('mindspaceCanvas');
  const details = document.getElementById('mindspace-details');
  if (!canvas) return;

  canvas.style.display = 'block'; // Show canvas
  const ctx = canvas.getContext('2d');
  const stars = [];
  const colors = ['#00bcd4', '#9cdbff', '#57d3ff', '#8ae0ff', '#b9f0ff'];
  const ideas = [
    "Dreams shape the universe.",
    "AI is the new canvas of creation.",
    "Code with purpose, not pressure.",
    "Elegance in design reflects clarity of thought.",
    "Every node connects a story.",
    "Innovation begins in stillness.",
    "Creativity is structured chaos.",
    "Ideas orbit persistence.",
    "The network expands with curiosity."
  ];

  function resizeCanvas() {
    canvas.width = canvas.clientWidth || 600;
    canvas.height = 500;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < ideas.length; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 6 + 4,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * Math.PI * 2,
      o: Math.random() * 30 + 10,
      s: 0.002 + Math.random() * 0.003,
      t: ideas[i]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width / 1.3);
    g.addColorStop(0, '#001428');
    g.addColorStop(1, '#000814');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
      star.a += star.s;
      const x = star.x + Math.cos(star.a) * star.o;
      const y = star.y + Math.sin(star.a) * star.o;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, star.r * 3);
      glow.addColorStop(0, star.c);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    for (const s of stars) {
      const x = s.x + Math.cos(s.a) * s.o;
      const y = s.y + Math.sin(s.a) * s.o;
      if (Math.hypot(mx - x, my - y) < s.r * 2.5) {
        details.textContent = s.t;
        details.classList.add('active');
      }
    }
  });
}

// ================================
// RADBOT QUIZ GAME
// ================================
function initRadBotQuiz(initialCategory) {
  const quiz = document.getElementById('radbot-quiz');
  const qElem = document.getElementById('radbot-question');
  const oElem = document.getElementById('radbot-options');
  const fElem = document.getElementById('radbot-feedback');
  const grid = document.querySelector('#radbot-section .category-grid');
  const logo = document.querySelector('.logo');
  if (!quiz || !qElem || !oElem || !fElem || !grid) return;

  // Lightweight result graph UI (self-contained styles)
  const resultWrapper = document.createElement('div');
  resultWrapper.style.display = 'none';
  resultWrapper.style.marginTop = '1.5rem';
  resultWrapper.style.padding = '1rem';
  resultWrapper.style.background = 'linear-gradient(135deg, rgba(0,195,255,0.08), rgba(0,195,255,0.02))';
  resultWrapper.style.border = '1px solid rgba(0,195,255,0.35)';
  resultWrapper.style.borderRadius = '12px';
  resultWrapper.style.boxShadow = '0 0 18px rgba(0,195,255,0.25)';
  resultWrapper.style.transition = 'all 0.6s ease';

  const resultLabel = document.createElement('div');
  resultLabel.style.color = '#cceaff';
  resultLabel.style.fontWeight = '700';
  resultLabel.style.marginBottom = '0.75rem';
  resultLabel.style.letterSpacing = '0.3px';
  resultWrapper.appendChild(resultLabel);

  const resultBar = document.createElement('div');
  resultBar.style.width = '100%';
  resultBar.style.height = '14px';
  resultBar.style.background = 'rgba(0,195,255,0.12)';
  resultBar.style.border = '1px solid rgba(0,195,255,0.35)';
  resultBar.style.borderRadius = '999px';
  resultBar.style.overflow = 'hidden';
  resultBar.setAttribute('role', 'progressbar');
  resultBar.setAttribute('aria-valuemin', '0');
  resultBar.setAttribute('aria-valuemax', '100');

  const resultFill = document.createElement('div');
  resultFill.style.height = '100%';
  resultFill.style.width = '0%';
  resultFill.style.background = 'linear-gradient(90deg, #00c3ff, #00ffb3)';
  resultFill.style.boxShadow = '0 0 12px rgba(0,255,179,0.6)';
  resultFill.style.transition = 'width 0.8s ease, filter 0.6s ease';
  resultBar.appendChild(resultFill);

  resultWrapper.appendChild(resultBar);
  quiz.appendChild(resultWrapper);

  const resetResultGraph = () => {
    resultWrapper.style.display = 'none';
    resultFill.style.width = '0%';
    resultBar.setAttribute('aria-valuenow', '0');
    resultLabel.textContent = '';
  };

  const renderResultGraph = (percent, scoreOutOfTen, correct, total) => {
    resultWrapper.style.display = 'block';
    const clamped = Math.min(100, Math.max(0, percent));
    resultFill.style.width = `${clamped}%`;
    resultBar.setAttribute('aria-valuenow', clamped.toString());
    resultLabel.textContent = `${clamped}% (${scoreOutOfTen}/10) - ${correct}/${total} correct`;
  };

  // Category-based RadQuiz bank
  const quizCategories = {
    technology: [
      { question: 'Which language runs in a web browser?', options: ['Python', 'Java', 'C++', 'JavaScript'], correct: 'D' },
      { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Control Process Unit', 'Compute Power Unit', 'Central Performance Utility'], correct: 'A' },
      { question: 'Who created the React library?', options: ['Google', 'Facebook', 'Microsoft', 'Amazon'], correct: 'B' },
      { question: 'Binary search on a sorted array has time complexity...', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 'B' },
      { question: 'Which of these is a NoSQL database?', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'], correct: 'C' },
      { question: 'HTML is primarily used to structure content on the web.', options: ['Style pages', 'Structure content', 'Manage servers', 'Secure passwords'], correct: 'B' }
    ],
    cars: [
      { question: 'What does ABS stand for?', options: ['Automatic Braking System', 'Anti-lock Braking System', 'Advanced Brake Safety', 'Auto Balance System'], correct: 'B' },
      { question: 'Who makes the Mustang?', options: ['Ford', 'Chevrolet', 'Dodge', 'Toyota'], correct: 'A' },
      { question: 'A hybrid typically uses...', options: ['Diesel only', 'Electric only', 'Gasoline + Electric', 'Hydrogen only'], correct: 'C' },
      { question: 'RPM measures...', options: ['Road Position Meter', 'Rotations Per Minute', 'Relative Power Module', 'Radial Pressure Metric'], correct: 'B' },
      { question: 'Lamborghini is from...', options: ['Germany', 'Italy', 'France', 'USA'], correct: 'B' },
      { question: 'A turbocharger is for...', options: ['Cooling brakes', 'Increasing air intake for power', 'Saving fuel only', 'Reducing tire wear'], correct: 'B' }
    ],
    general: [
      { question: 'Capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correct: 'C' },
      { question: 'The Red Planet is...', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], correct: 'B' },
      { question: 'Who wrote "1984"?', options: ['George Orwell', 'Mark Twain', 'J.K. Rowling', 'Ernest Hemingway'], correct: 'A' },
      { question: 'How many continents?', options: ['5', '6', '7', '8'], correct: 'C' },
      { question: 'H2O is the chemical formula for what?', options: ['Salt', 'Water', 'Hydrogen', 'Oxygen'], correct: 'B' },
      { question: 'Largest ocean?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], correct: 'B' }
    ],
    english: [
      { question: 'Correct spelling:', options: ['Recieve', 'Receive', 'Recive', 'Receeve'], correct: 'B' },
      { question: 'Synonym for "happy":', options: ['Morose', 'Elated', 'Irate', 'Weary'], correct: 'B' },
      { question: 'Identify the adverb: "She sang beautifully."', options: ['She', 'Sang', 'Beautifully', 'None'], correct: 'C' },
      { question: 'Passive voice:', options: ['The chef cooked the meal.', 'The meal was cooked by the chef.', 'The chef will cook the meal.', 'The chef is cooking the meal.'], correct: 'B' },
      { question: 'Correct past tense: "They ___ to the concert."', options: ['go', 'goes', 'went', 'gone'], correct: 'C' },
      { question: 'Which is a conjunction?', options: ['Quickly', 'Because', 'Joyful', 'Sing'], correct: 'B' }
    ]
  };

  const categoryLabels = {
    technology: 'Technology',
    cars: 'Cars',
    general: 'General Knowledge',
    english: 'English Language'
  };

  let index = 0;
  let score = 0;
  let currentCategory = null;
  let currentQuestions = [];

  const pickQuestions = (key, count = 5) => {
    const pool = [...(quizCategories[key] || [])];
    const picked = [];
    while (picked.length < count && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  };

  const clearFeedback = () => {
    fElem.textContent = '';
    fElem.classList.remove('show');
  };

  const showQ = () => {
    const q = currentQuestions[index];
    if (!q) return;
    const label = categoryLabels[currentCategory] || currentCategory || '';
    qElem.textContent = `${label ? `${label} ` : ''}Q${index + 1}: ${q.question}`;
    oElem.innerHTML = '';
    clearFeedback();
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${labels[idx]}) ${opt}`;
      b.classList.add('quiz-option-btn');
      b.onclick = () => selectA(labels[idx]);
      oElem.appendChild(b);
    });
  };

  const selectA = (selected) => {
    const current = currentQuestions[index];
    if (!current) return;
    const correct = current.correct;
    const right = selected === correct;
    fElem.classList.add('show');
    if (right) {
      score++;
      fElem.textContent = 'Correct!';
      fElem.style.color = '#00ffb3';
      powerUpLogo();
    } else {
      fElem.textContent = `Not quite. Correct answer: ${correct}.`;
      fElem.style.color = '#ff6b6b';
    }
    setTimeout(() => {
      fElem.classList.remove('show');
      index++;
      if (index < currentQuestions.length) showQ();
      else endQuiz();
    }, 1500);
  };

  const endQuiz = () => {
    oElem.innerHTML = '';
    const total = currentQuestions.length;
    const incorrect = total - score;
    const percent = Math.round((score / total) * 100);
    const scoreOutOfTen = Math.round((score / total) * 10);
    const label = categoryLabels[currentCategory] || currentCategory || '';
    qElem.textContent = `Quiz Complete - ${label}`;
    fElem.textContent = `Score: ${score}/${total} (${percent}% | ${scoreOutOfTen}/10) | Correct: ${score} | Incorrect: ${incorrect}`;
    fElem.style.color = '#00c3ff';
    fElem.classList.add('show');
    renderResultGraph(percent, scoreOutOfTen, score, total);
    powerUpLogo(true);
  };

  const powerUpLogo = (final = false) => {
    if (!logo) return;
    logo.style.transition = 'all 0.6s ease';
    logo.style.filter = 'drop-shadow(0 0 15px rgba(0,195,255,0.9)) brightness(1.3)';
    setTimeout(() => (logo.style.filter = 'none'), final ? 2500 : 1200);
  };

  const updateActiveButton = (activeButton) => {
    grid.querySelectorAll('.category-btn').forEach((btn) => {
      const isActive = btn === activeButton;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const startQuiz = (categoryKey) => {
    const resolvedKey = typeof categoryKey === 'string' ? categoryKey.toLowerCase() : '';
    if (!quizCategories[resolvedKey]) return;

    currentCategory = resolvedKey;
    currentQuestions = pickQuestions(resolvedKey, 5);

    if (!currentQuestions.length) {
      qElem.textContent = 'No questions available for this category right now.';
      oElem.innerHTML = '';
      clearFeedback();
      resetResultGraph();
      quiz.hidden = false;
      return;
    }

    index = 0;
    score = 0;
    quiz.hidden = false;
    clearFeedback();
    resetResultGraph();
    showQ();
  };

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('.category-btn');
    if (!button) return;
    const category = button.dataset.category;
    if (!category) return;
    updateActiveButton(button);
    startQuiz(category);
  });

  if (initialCategory) {
    const initialButton = grid.querySelector(`.category-btn[data-category="${initialCategory}"]`);
    if (initialButton) {
      updateActiveButton(initialButton);
    }
    startQuiz(initialCategory);
  }
}

function initPageSwitchToggle() {
  const switchWrapper = document.getElementById('pageSwitch');
  const homeButton = document.getElementById('pageSwitchHome');
  const dashboardButton = document.getElementById('pageSwitchDashboard');
  const isDashboardPage = document.body.classList.contains('dashboard-page');

  if (!switchWrapper || !homeButton || !dashboardButton) {
    return;
  }

  let scrollDebounce = null;
  let autoCollapseTimer = null;
  let lastScrollY = window.scrollY;

  const clearAutoCollapse = () => {
    if (!autoCollapseTimer) return;
    clearTimeout(autoCollapseTimer);
    autoCollapseTimer = null;
  };

  const collapseSwitch = () => {
    switchWrapper.classList.remove('page-switch--expanded');
    clearAutoCollapse();
  };

  const expandSwitch = (autoCollapse = false) => {
    switchWrapper.classList.add('page-switch--expanded');
    if (!autoCollapse) return;
    clearAutoCollapse();
    autoCollapseTimer = setTimeout(() => {
      collapseSwitch();
    }, 3000);
  };

  const updateCollapsedState = () => {
    if (!isDashboardPage || switchWrapper.hidden) return;
    const scrolled = window.scrollY > 150;
    if (scrolled) {
      switchWrapper.classList.add('page-switch--collapsed');
      if (switchWrapper.classList.contains('page-switch--expanded') && window.scrollY !== lastScrollY) {
        collapseSwitch();
      }
    } else {
      switchWrapper.classList.remove('page-switch--collapsed');
      collapseSwitch();
    }
    lastScrollY = window.scrollY;
  };

  const updateActiveState = () => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const isDashboard =
      normalizedPath === '/dashboard' || normalizedPath === '/dashboard.html';

    dashboardButton.classList.toggle('active', isDashboard);
    dashboardButton.setAttribute('aria-selected', isDashboard ? 'true' : 'false');
    homeButton.classList.toggle('active', !isDashboard);
    homeButton.setAttribute('aria-selected', !isDashboard ? 'true' : 'false');
  };

  const showSwitch = () => {
    switchWrapper.hidden = false;
    switchWrapper.setAttribute('aria-hidden', 'false');
    updateActiveState();
    updateCollapsedState();
  };

  const hideSwitch = () => {
    switchWrapper.hidden = true;
    switchWrapper.setAttribute('aria-hidden', 'true');
    homeButton.classList.remove('active');
    dashboardButton.classList.remove('active');
    homeButton.setAttribute('aria-selected', 'false');
    dashboardButton.setAttribute('aria-selected', 'false');
    switchWrapper.classList.remove('page-switch--collapsed', 'page-switch--expanded');
    clearAutoCollapse();
  };

  const handleNavigation = (targetPath) => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const isDashboardTarget = targetPath === '/dashboard';
    const alreadyOnTarget =
      (isDashboardTarget &&
        (normalizedPath === '/dashboard' || normalizedPath === '/dashboard.html')) ||
      (!isDashboardTarget && normalizedPath === '/');

    if (alreadyOnTarget) {
      return;
    }

    document.body.classList.add('page-switching');
    setTimeout(() => {
      window.location.href = buildBackendUrl(targetPath);
    }, 250);
  };

  homeButton.addEventListener('click', () => handleNavigation('/'));
  dashboardButton.addEventListener('click', () => handleNavigation('/dashboard'));

  if (isDashboardPage) {
    switchWrapper.addEventListener('mouseenter', () => {
      if (!switchWrapper.classList.contains('page-switch--collapsed')) return;
      expandSwitch();
    });

    switchWrapper.addEventListener('mouseleave', () => {
      if (!switchWrapper.classList.contains('page-switch--collapsed')) return;
      collapseSwitch();
    });

    switchWrapper.addEventListener('click', (event) => {
      if (!switchWrapper.classList.contains('page-switch--collapsed')) return;
      if (!switchWrapper.classList.contains('page-switch--expanded')) {
        event.preventDefault();
        event.stopPropagation();
        expandSwitch(true);
        return;
      }
      expandSwitch(true);
    });

    document.addEventListener('click', (event) => {
      if (!switchWrapper.classList.contains('page-switch--collapsed')) return;
      if (!switchWrapper.classList.contains('page-switch--expanded')) return;
      if (switchWrapper.contains(event.target)) return;
      collapseSwitch();
    });

    window.addEventListener('scroll', () => {
      if (scrollDebounce) return;
      scrollDebounce = setTimeout(() => {
        scrollDebounce = null;
        updateCollapsedState();
      }, 100);
    });
  }

  const verifySession = async () => {
    try {
      const user = await fetchSessionUser();
      updateNavAuthCta(user);
      if (!user) {
        hideSwitch();
        return;
      }
      showSwitch();
    } catch (error) {
      console.warn('Page switch unavailable:', error.message);
      updateNavAuthCta(null);
      hideSwitch();
    }
  };

  verifySession();
}

// ================================
// AUTH SECTION INTERACTIONS
// ================================
function initAuthAccessSection() {
  const authSection = document.getElementById('auth-access');
  if (!authSection) return;

  const emailWrapper = document.getElementById('emailAuthWrapper');
  const emailButton = authSection.querySelector('.auth-btn.email');
  const closeButton = authSection.querySelector('[data-close-email]');
  const providerButtons = authSection.querySelectorAll('.auth-btn[data-provider]');
  const authNote = authSection.querySelector('.auth-note');
  const emailToggleButtons = authSection.querySelectorAll('[data-email-view]');
  const loginForm = document.getElementById('emailLoginForm');
  const signupForm = document.getElementById('emailSignupForm');
  const loginError = document.getElementById('emailLoginError');
  const signupError = document.getElementById('emailSignupError');
  const loginSubmit = document.getElementById('emailLoginSubmit');
  const signupSubmit = document.getElementById('emailSignupSubmit');
  const defaultNote = authNote ? authNote.textContent : '';
  let noteTimeout = null;

  const resetNote = () => {
    if (!authNote) return;
    if (noteTimeout) {
      clearTimeout(noteTimeout);
      noteTimeout = null;
    }
    authNote.textContent = defaultNote;
  };

  const setNote = (message, duration = 0) => {
    if (!authNote) return;
    if (noteTimeout) {
      clearTimeout(noteTimeout);
      noteTimeout = null;
    }
    authNote.textContent = message;
    if (duration) {
      noteTimeout = setTimeout(() => {
        authNote.textContent = defaultNote;
        noteTimeout = null;
      }, duration);
    }
  };

  const showEmailView = (view) => {
    emailToggleButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-email-view') === view;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    const showLogin = view === 'login';
    if (loginForm) {
      loginForm.hidden = !showLogin;
      loginForm.classList.toggle('is-hidden', !showLogin);
    }
    if (signupForm) {
      signupForm.hidden = showLogin;
      signupForm.classList.toggle('is-hidden', showLogin);
    }
    loginError && (loginError.hidden = true);
    signupError && (signupError.hidden = true);
  };

  const openEmailForm = () => {
    if (!emailWrapper) return;
    emailWrapper.hidden = false;
    emailWrapper.setAttribute('aria-hidden', 'false');
    emailButton?.setAttribute('aria-expanded', 'true');
    showEmailView('login');
  };

  const closeEmailForm = () => {
    if (!emailWrapper) return;
    emailWrapper.hidden = true;
    emailWrapper.setAttribute('aria-hidden', 'true');
    emailButton?.setAttribute('aria-expanded', 'false');
    loginForm?.reset();
    signupForm?.reset();
    resetNote();
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());

  const handleRequest = async ({ url, body, submitBtn, errorEl, successMessage }) => {
    if (!submitBtn || !errorEl) return;
    try {
      submitBtn.disabled = true;
      errorEl.hidden = true;
      const originalText = submitBtn.textContent;
      submitBtn.dataset.originalText = originalText;
      submitBtn.textContent = 'Please wait...';
      setNote(successMessage || 'Processing your request...');

      const response = await fetch(buildBackendUrl(url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }

      window.location.href = buildBackendUrl('/dashboard');
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.hidden = false;
    } finally {
      if (submitBtn.dataset.originalText) {
        submitBtn.textContent = submitBtn.dataset.originalText;
        delete submitBtn.dataset.originalText;
      }
      submitBtn.disabled = false;
    }
  };

  emailToggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-email-view');
      showEmailView(view);
    });
  });

  providerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      if (provider === 'email') {
        if (emailWrapper && !emailWrapper.hidden) {
          closeEmailForm();
        } else {
          openEmailForm();
          setNote('Enter your email credentials to continue securely.');
        }
        return;
      }

      if (provider === 'google') {
        setNote('Redirecting you to Google for secure sign in...');
        window.location.href = buildBackendUrl('/auth/google');
        return;
      }

      if (provider === 'github' || provider === 'facebook') {
        setNote(`${btn.textContent.trim()} is not available yet. Please use Google or Email.`);
        return;
      }
    });
  });

  closeButton?.addEventListener('click', () => closeEmailForm());

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailField = document.getElementById('emailLoginAddress');
    const passwordField = document.getElementById('emailLoginPassword');
    if (!emailField || !passwordField) return;

    const email = emailField.value.trim();
    const password = passwordField.value.trim();
    if (!validateEmail(email)) {
      loginError.textContent = 'Please enter a valid email address.';
      loginError.hidden = false;
      emailField.focus();
      return;
    }
    if (!password) {
      loginError.textContent = 'Please enter your password.';
      loginError.hidden = false;
      passwordField.focus();
      return;
    }

    handleRequest({
      url: '/login',
      body: { email, password },
      submitBtn: loginSubmit,
      errorEl: loginError,
      successMessage: 'Signing you in...'
    });
  });

  signupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameField = document.getElementById('emailSignupName');
    const emailField = document.getElementById('emailSignupAddress');
    const passwordField = document.getElementById('emailSignupPassword');
    const confirmField = document.getElementById('emailSignupConfirm');
    if (!emailField || !passwordField || !confirmField) return;

    const name = nameField?.value?.trim();
    const email = emailField.value.trim();
    const password = passwordField.value.trim();
    const confirmPassword = confirmField.value.trim();

    if (!validateEmail(email)) {
      signupError.textContent = 'Please enter a valid email address.';
      signupError.hidden = false;
      emailField.focus();
      return;
    }
    if (password.length < 6) {
      signupError.textContent = 'Password must be at least 6 characters.';
      signupError.hidden = false;
      passwordField.focus();
      return;
    }
    if (password !== confirmPassword) {
      signupError.textContent = 'Passwords do not match.';
      signupError.hidden = false;
      confirmField.focus();
      return;
    }

    handleRequest({
      url: '/signup',
      body: { email, password, confirmPassword, name },
      submitBtn: signupSubmit,
      errorEl: signupError,
      successMessage: 'Creating your account...'
    });
  });

  // Open email form by default when landing on the page
  openEmailForm();
}

// ================================
// SUPPORT UNLOCK EASTER EGG
// ================================
function initSupportUnlockEasterEgg() {
  const logo = document.querySelector('.logo');
  let hoverCount = 0;
  let unlocked = false;

  if (!logo) return;

  logo.addEventListener('mouseenter', () => {
    if (unlocked) return;
    hoverCount++;
    logo.style.transition = 'box-shadow 0.3s ease';
    logo.style.boxShadow = `0 0 ${5 + hoverCount * 2}px rgba(0,255,180,0.6)`;

    if (hoverCount === 5) {
      unlocked = true;
      logo.classList.add('logo-unlocked');
      logo.style.animation = 'logoGlowMagic 2.5s ease-in-out infinite alternate';
      console.log('ðŸ€ Easter egg unlocked!');
    }
  });
}
// ================================
// FIX GAME SECTION NAVIGATION
// Auto-expand games when clicked from nav
// ================================
function initGameNavigationFix() {
  // Map of wrapper IDs to their reveal buttons
  const gameWrappers = {
    'mindspace-explorer-wrapper': 'mindspace-explorer-section',
    'network-builder-wrapper': 'network-builder-section'
  };
  
  // Handle all nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      
      // Check if this is a game wrapper
      if (gameWrappers[targetId]) {
        e.preventDefault();
        
        const wrapper = document.getElementById(targetId);
        const revealBtn = wrapper?.querySelector('.reveal-btn');
        const targetSection = document.getElementById(gameWrappers[targetId]);
        
        if (wrapper && revealBtn && targetSection) {
          // Scroll to wrapper first
          wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Wait a bit then click the reveal button if not already expanded
          setTimeout(() => {
            if (!targetSection.classList.contains('expanded')) {
              revealBtn.click();
            }
            
            // Scroll again to show the expanded content
            setTimeout(() => {
              targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
          }, 500);
        }
      }
    });
  });
  
  // Also handle RadBot - bring the category grid into focus
  const radbotLinks = document.querySelectorAll('a[href="#radbot-section"]');
  radbotLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById('radbot-section');
      const firstCategory = section ? section.querySelector('.category-btn') : null;
      
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (firstCategory) {
          setTimeout(() => {
            firstCategory.focus({ preventScroll: true });
          }, 600);
        }
      }
    });
  });
}

// ================================
// IMPROVED NAVIGATION WITH DROPDOWN
// ================================
function initImprovedNavigation() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const closeAllDropdowns = () => {
    document.querySelectorAll('.nav-dropdown').forEach(dd => {
      dd.classList.remove('active');
      const toggle = dd.querySelector('.dropdown-toggle');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  };
  
  // Dropdown functionality
  dropdownToggles.forEach(toggle => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdown = toggle.closest('.nav-dropdown');
      if (!dropdown) return;
      const isActive = dropdown.classList.contains('active');
      
      // Close all other dropdowns
      closeAllDropdowns();
      
      // Toggle current dropdown
      if (!isActive) {
        dropdown.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
  
  // Close dropdown when clicking submenu link
  document.querySelectorAll('.nav-sublink').forEach(link => {
    link.addEventListener('click', () => {
      closeAllDropdowns();
      
      // Close mobile menu if open
      if (mainNav && mainNav.classList.contains('active')) {
        setMobileNavState(false);
      }
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });
  
  // Enhanced mobile menu closing
  if (mobileMenuToggle && mainNav) {
    // Close menu when clicking any nav link (except dropdown toggle)
    document.querySelectorAll('a.nav-link:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
          setMobileNavState(false);
        }
      });
    });
  }
}

// Add to initialization




