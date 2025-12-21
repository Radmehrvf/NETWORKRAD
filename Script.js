// ================================
// NETWORKRAD OPTIMIZED SCRIPT
// All duplicates removed, proper lazy loading
// ================================

console.log("Welcome to NetworkRad Portfolio!");

const MOBILE_NAV_MEDIA = window.matchMedia('(max-width: 768px)');
const NAV_FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let releaseNavFocusTrap = null;
const BACKEND_BASE_URL = "";
const buildBackendUrl = (path = '') => `${BACKEND_BASE_URL}${path}`;

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

// ================================
// SINGLE UNIFIED INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("NetworkRad Site Loaded");

  // Initialize core features
  initHeader();
  initImprovedNavigation();
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
    console.warn('⚠️ Intersection Observer not supported');
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
  console.log('📊 Animating business counters');

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
        console.log("🎮 Loading Network Builder...");
        
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
        console.log("🌌 Loading Mindspace Explorer...");
        
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

  // RadBot Quiz - Load ONLY on button click
  const radbotBtn = document.getElementById('radbot-btn');
  if (radbotBtn) {
    radbotBtn.addEventListener('click', () => {
      if (!radbotLoaded) {
        console.log("🤖 Loading RadBot Quiz...");
        initRadBotQuiz();
        radbotLoaded = true;
      }
    }, { once: true });
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
  const heroChatBtn = document.querySelector('.hero-section .hero-btn.primary'); // More specific selector
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');
  const exploreBtn = document.getElementById('exploreBtn');
  const chatSuggestions = document.getElementById('chatSuggestions');
  
  // Debug logging
  console.log('Chatbox:', chatbox);
  console.log('Hero Chat Button:', heroChatBtn);
  
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
  
  // Hero section chat button
  if (heroChatBtn) {
    console.log('Adding click listener to hero button');
    heroChatBtn.addEventListener('click', (e) => {
      console.log('Hero button clicked!');
      toggleChat(e);
    });
  } else {
    console.error('Hero chat button NOT found!');
  }
  
  // Close chat button
  if (closeChat) {
    closeChat.addEventListener('click', toggleChat);
  }
  
  // Explore button (scroll to projects)
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
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
        const aiReply = data.reply || "🤖 (No response from AI)";
        addMessage(aiReply, "bot");
      })
      .catch((err) => {
        removeThinking();
        console.error("AI connection error:", err);
        addMessage("⚠️ AI connection failed. Please try again later.", "bot");
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

  businessForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const formData = {
      industry: document.getElementById('industry')?.value,
      teamSize: document.getElementById('teamSize')?.value,
      bottlenecks: document.getElementById('bottlenecks')?.value,
      goals: document.getElementById('goals')?.value,
      consent: document.getElementById('consentCheckbox')?.checked
    };
    
    console.log('Business Analysis Request:', formData);
    alert('✅ Thank you! We\'ll analyze your workflow and get back to you within 24 hours.');
    
    businessForm.reset();
    aiFormSection?.classList.remove('visible');
    document.getElementById('ai-optimizer-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Support & Hire Sections
  const supportBtn = document.getElementById('supportBtn');
  const hireBtn = document.getElementById('hireBtn');
  const supportSection = document.getElementById('supportSection');
  const hireSection = document.getElementById('hireSection');
  const hireForm = document.getElementById('hireForm');

  supportBtn?.addEventListener('click', () => {
    supportSection?.classList.add('visible');
    hireSection?.classList.remove('visible');
    setTimeout(() => {
      supportSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  hireBtn?.addEventListener('click', () => {
    hireSection?.classList.add('visible');
    supportSection?.classList.remove('visible');
    setTimeout(() => {
      hireSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  document.querySelectorAll('.close-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.closest('button').getAttribute('data-target');
      const section = document.getElementById(target);
      section?.classList.remove('visible');
      document.getElementById('support-hire')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-close');
      const section = document.getElementById(target);
      section?.classList.remove('visible');
      document.getElementById('support-hire')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  hireForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('clientName')?.value,
      email: document.getElementById('clientEmail')?.value,
      description: document.getElementById('projectDescription')?.value
    };
    
    console.log('Project Inquiry:', formData);
    alert('✅ Thank you for your inquiry! I\'ll review your project details and get back to you within 24 hours.');
    
    hireForm.reset();
    hireSection?.classList.remove('visible');
    document.getElementById('support-hire')?.scrollIntoView({ behavior: 'smooth' });
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
        if (arrow) arrow.textContent = "▼";
      } else if (target) {
        target.classList.remove("expanded");
        btn.classList.remove("active");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.textContent = "▶";
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
      messageBox.textContent = "You've built a 7-node network — welcome to the Network!";
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
function initRadBotQuiz() {
  const btn = document.getElementById('radbot-btn');
  const quiz = document.getElementById('radbot-quiz');
  const qElem = document.getElementById('radbot-question');
  const oElem = document.getElementById('radbot-options');
  const fElem = document.getElementById('radbot-feedback');
  const logo = document.querySelector('.logo');
  if (!btn || !quiz) return;

  const quizData = [
    { question: "Which technology powers the core of artificial intelligence?", options: ["Blockchain", "Machine Learning", "Quantum Physics", "3D Printing"], correct: "Machine Learning" },
    { question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"], correct: "HyperText Markup Language" },
    { question: "Which of these is a programming language used for web development?", options: ["Python", "C++", "JavaScript", "Rust"], correct: "JavaScript" },
    { question: "What is the purpose of a CSS file?", options: ["Store data", "Style web pages", "Manage databases", "Secure passwords"], correct: "Style web pages" },
    { question: "Which one represents the luxury aesthetic of NetworkRad?", options: ["Neon Blue & Silver", "Bright Red & Yellow", "Black & Green Matrix", "Brown & Beige"], correct: "Neon Blue & Silver" }
  ];

  let index = 0, score = 0, active = false;

  btn.addEventListener('click', () => {
    active = !active;
    quiz.style.display = active ? 'block' : 'none';
    if (active) { index = 0; score = 0; showQ(); } else fElem.textContent = "";
  });

  function showQ() {
    const q = quizData[index];
    qElem.textContent = q.question;
    oElem.innerHTML = "";
    fElem.textContent = "";
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.classList.add('quiz-option-btn');
      b.onclick = () => selectA(opt);
      oElem.appendChild(b);
    });
  }

  function selectA(selected) {
    const correct = quizData[index].correct;
    const right = selected === correct;
    fElem.classList.add('show');
    if (right) {
      score++;
      fElem.textContent = "✅ Correct!";
      fElem.style.color = "#00ffb3";
      powerUpLogo();
    } else {
      fElem.textContent = "❌ Not quite. Try the next one!";
      fElem.style.color = "#ff6b6b";
    }
    setTimeout(() => {
      fElem.classList.remove('show');
      index++;
      if (index < quizData.length) showQ();
      else endQuiz();
    }, 1500);
  }

  function endQuiz() {
    oElem.innerHTML = "";
    qElem.textContent = "Quiz Complete!";
    const total = quizData.length;
    const scorePercent = (score / total) * 100;
    if (scorePercent >= 70) {
      fElem.textContent = "🎉 You outsmarted RadBot! Stellar performance!";
      fElem.style.color = "#00ffb3";
      powerUpLogo(true);
    } else {
      fElem.textContent = "💡 Not bad! Try again to reach perfection!";
      fElem.style.color = "#00c3ff";
    }
  }

  function powerUpLogo(final = false) {
    if (!logo) return;
    logo.style.transition = "all 0.6s ease";
    logo.style.filter = "drop-shadow(0 0 15px rgba(0,195,255,0.9)) brightness(1.3)";
    setTimeout(() => logo.style.filter = "none", final ? 2500 : 1200);
  }
}

function initPageSwitchToggle() {
  const switchWrapper = document.getElementById('pageSwitch');
  const homeButton = document.getElementById('pageSwitchHome');
  const dashboardButton = document.getElementById('pageSwitchDashboard');

  if (!switchWrapper || !homeButton || !dashboardButton) {
    return;
  }

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
  };

  const hideSwitch = () => {
    switchWrapper.hidden = true;
    switchWrapper.setAttribute('aria-hidden', 'true');
    homeButton.classList.remove('active');
    dashboardButton.classList.remove('active');
    homeButton.setAttribute('aria-selected', 'false');
    dashboardButton.setAttribute('aria-selected', 'false');
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

  const verifySession = async () => {
    try {
      const response = await fetch(buildBackendUrl('/api/me'), {
        credentials: 'include',
        headers: {
          Accept: 'application/json'
        }
      });
      if (!response.ok) {
        hideSwitch();
        return;
      }
      showSwitch();
    } catch (error) {
      console.warn('Page switch unavailable:', error.message);
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
      console.log('🍀 Easter egg unlocked!');
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
  
  // Also handle RadBot - make sure it shows the quiz when clicked
  const radbotLinks = document.querySelectorAll('a[href="#radbot-section"]');
  radbotLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById('radbot-section');
      const btn = document.getElementById('radbot-btn');
      
      if (section && btn) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-click the button to start the quiz
        setTimeout(() => {
          const quiz = document.getElementById('radbot-quiz');
          if (quiz && quiz.style.display === 'none') {
            btn.click();
          }
        }, 600);
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

