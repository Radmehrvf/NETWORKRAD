// ================================
// NETWORKRAD OPTIMIZED SCRIPT
// All duplicates removed, proper lazy loading
// ================================

console.log("Welcome to NetworkRad Portfolio!");

// ================================
// SINGLE UNIFIED INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ NetworkRad Site Loaded");

  // Initialize core features
  initHeader();
  initMainInterface();
  initSupportUnlockEasterEgg();
  
  // Setup lazy loading for sections and games
  setupIntersectionObserver();
  setupLazyGameLoading();
});

// ================================
// HEADER & NAVIGATION
// ================================
function initHeader() {
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  let lastScroll = 0;

  // Scroll effect
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      mainHeader?.classList.add('scrolled');
    } else {
      mainHeader?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });

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
      const sectionHeight = section.clientHeight;
      
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
  }, { passive: true });

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
// MAIN INTERFACE (CHAT, FORMS, ETC)
// ================================
function initMainInterface() {
  const chatButton = document.getElementById('chatButton');
  const chatbox = document.getElementById('chatbox');
  const closeChat = document.getElementById('closeChat');
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');
  const exploreBtn = document.getElementById('exploreBtn');
  const scrollUpBtn = document.getElementById('scrollUpBtn');
  const scrollDownBtn = document.getElementById('scrollDownBtn');

  // Chat system
  function addMessage(text, sender = "user") {
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-message" : "bot-message";
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  chatButton?.addEventListener("click", () => {
    chatbox.classList.add("active");
    chatInput.focus();
    if (chatBody.children.length === 0) {
      addMessage("Hello! 👋 How can I help you today?", "bot");
    }
  });

  closeChat?.addEventListener("click", () => {
    chatbox.classList.remove("active");
  });

  function sendLocalMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";
    sendMessageToAI(message);
  }

  sendBtn?.addEventListener("click", sendLocalMessage);
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendLocalMessage();
    }
  });

  // Chat suggestions
  document.querySelectorAll('.chat-suggestion').forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = btn.getAttribute("data-msg");
      chatInput.value = msg;
      sendLocalMessage();
    });
  });

  // AI Chat Connection
  const workerURL = "https://bold-field-e8ab.radmehrvf.workers.dev/";

  function sendMessageToAI(userMessage) {
    fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }]
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const aiReply = data.reply || "🤖 (No response from AI)";
        addMessage(aiReply, "bot");
      })
      .catch((err) => {
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

  // Navigate to projects
  exploreBtn?.addEventListener('click', () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
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

  // Scroll Buttons
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      scrollUpBtn?.classList.add('show-scroll-btn');
      scrollDownBtn?.classList.add('show-scroll-btn');
    } else {
      scrollUpBtn?.classList.remove('show-scroll-btn');
      scrollDownBtn?.classList.remove('show-scroll-btn');
    }
  }, { passive: true });

  scrollUpBtn?.addEventListener('click', () => {
    window.scrollBy({ top: -600, behavior: 'smooth' });
  });

  scrollDownBtn?.addEventListener('click', () => {
    window.scrollBy({ top: 600, behavior: 'smooth' });
  });

  // Collapsible sections
  document.querySelectorAll(".reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      const isExpanded = target?.classList.contains("expanded");

      document.querySelectorAll(".collapsible-content").forEach((el) => {
        el.classList.remove("expanded");
      });
      document.querySelectorAll(".reveal-btn").forEach((el) => {
        el.classList.remove("active");
        const arrow = el.querySelector(".arrow");
        if (arrow) arrow.textContent = "▶";
      });

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