// -------------------------------
// NetworkRad Portfolio — All That Mathers
// -------------------------------

console.log("Welcome to NetworkRad Portfolio (All That Mathers)!");

// ================================
// Unified Initialization
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ NetworkRad Site Loaded Successfully");

  // Initialize each feature
  initMainInterface();
  initNetworkBuilder();
  initMindspaceExplorer();
  initRadBotQuiz();
  initSupportUnlockEasterEgg();
});

// ================================
// MAIN INTERFACE LOGIC (Chat, Modals, Scroll, etc.)
// ================================
function initMainInterface() {
  const chatButton = document.getElementById('chatButton');
  const chatbox = document.getElementById('chatbox');
  const closeChat = document.getElementById('closeChat');
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');

  const exploreBtn = document.getElementById('exploreBtn');
  const supportQuickBtn = document.getElementById('supportQuickBtn');
  const supportBtn = document.getElementById('supportBtn');
  const hireBtn = document.getElementById('hireBtn');
  const supportModal = document.getElementById('supportModal');
  const hireModal = document.getElementById('hireModal');
  const modalCloseBtns = document.querySelectorAll('.modal-close');
  const projectFilters = document.querySelectorAll('.project-filter');
  const projectCards = document.querySelectorAll('.project-card');
  const discussBtns = document.querySelectorAll('.discuss-btn');
  const chatSuggestions = document.querySelectorAll('.chat-suggestion');
  const supportButtons = document.querySelectorAll('.support-btn');
  const scrollUpBtn = document.getElementById('scrollUpBtn');
  const scrollDownBtn = document.getElementById('scrollDownBtn');



  
// -------------------------------
// CHAT SYSTEM (AI Connected)
// -------------------------------
function addMessage(text, sender = "user") {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "user-message" : "bot-message";
  msgDiv.textContent = text;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Open chat window
chatButton.addEventListener("click", () => {
  chatbox.classList.add("active");
  chatInput.focus();
  if (chatBody.children.length === 0) {
    addMessage("Hello! 👋 How can I help you today?", "bot");
  }
});

// Close chat window
closeChat.addEventListener("click", () => {
  chatbox.classList.remove("active");
});

// Send button + Enter key
sendBtn.addEventListener("click", sendLocalMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendLocalMessage();
  }
});

// Core message sender (now connected to Cloudflare Worker)
function sendLocalMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  chatInput.value = "";

  // Send to AI backend
  sendMessageToAI(message);
}

// Quick suggestion buttons
chatSuggestions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = btn.getAttribute("data-msg");
    chatInput.value = msg;
    sendLocalMessage();
  });
});

/* ==========================
  AI button for job creation
   ========================== */
// Show the AI workflow modal when the button is clicked
const optimizeBtn = document.getElementById('optimizeBtn');
const aiModal = document.getElementById('ai-modal');
const closeModalBtn = document.querySelector('.modal-close');

// Show the modal
optimizeBtn.addEventListener('click', () => {
  aiModal.style.display = 'flex'; // Show modal
});

// Close the modal when the close button is clicked
closeModalBtn.addEventListener('click', () => {
  aiModal.style.display = 'none'; // Hide modal
});

// Handle form submission
const businessForm = document.getElementById('businessForm');

businessForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form from submitting the traditional way

  // Capture form data
  const industry = document.getElementById('industry').value;
  const teamSize = document.getElementById('teamSize').value;
  const bottlenecks = document.getElementById('bottlenecks').value;
  const goals = document.getElementById('goals').value;

  // For now, you can just log the data (can be replaced with API call or further processing)
  console.log('Business Details Submitted:', { industry, teamSize, bottlenecks, goals });

  // Optionally, you can hide the modal after submission
  aiModal.style.display = 'none';

  // Here, you can send the data to your backend or process it further
});

/* ==========================
   NETWORKRAD CHAT AI CONNECTOR
   (Cloudflare Worker)
   ========================== */
const workerURL = "https://bold-field-e8ab.radmehrvf.workers.dev/"; // <-- your Cloudflare Worker URL

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

  // -------------------------------
  // DISCUSS BUTTONS (Mindspace)
  // -------------------------------
  discussBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-discuss');
      chatbox.classList.add('active');
      addMessage(msg, "user");
      setTimeout(() => {
        addMessage("Let's talk about that! (Chat demo active locally.)", "bot");
      }, 600);
    });
  });

  // -------------------------------
  // NAVIGATION
  // -------------------------------
  exploreBtn.addEventListener('click', () => {
    document.getElementById('universe').scrollIntoView({ behavior: 'smooth' });
  });

  // -------------------------------
  // MODALS (Support / Hire)
  // -------------------------------
  function openModal(modal) {
    modal.style.display = 'flex';
  }
  function closeModal(modal) {
    modal.style.display = 'none';
  }

  supportBtn.addEventListener('click', () => openModal(supportModal));
  supportQuickBtn.addEventListener('click', () => openModal(supportModal));
  hireBtn.addEventListener('click', () => openModal(hireModal));

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      if (target === 'supportModal') closeModal(supportModal);
      if (target === 'hireModal') closeModal(hireModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === supportModal) closeModal(supportModal);
    if (e.target === hireModal) closeModal(hireModal);
  });

  // -------------------------------
  // PROJECT FILTERING
  // -------------------------------
  projectFilters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      const category = filterBtn.getAttribute('data-category');
      projectFilters.forEach(btn => btn.classList.remove('active'));
      filterBtn.classList.add('active');
      projectCards.forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category)
          ? 'block' : 'none';
      });
    });
  });

  // -------------------------------
  // SUPPORT BUTTON ACTIONS
  // -------------------------------
  supportButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const supportText = e.target.textContent;
      alert(`You clicked on ${supportText}. Redirecting to payment platform... (Demo)`);
    });
  });

  // -------------------------------
  // CUSTOM SCROLL BUTTONS
  // -------------------------------
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      scrollUpBtn.classList.add('show-scroll-btn');
      scrollDownBtn.classList.add('show-scroll-btn');
    } else {
      scrollUpBtn.classList.remove('show-scroll-btn');
      scrollDownBtn.classList.remove('show-scroll-btn');
    }
  });

  scrollUpBtn.addEventListener('click', () => {
    window.scrollBy({ top: -600, behavior: 'smooth' });
  });
  scrollDownBtn.addEventListener('click', () => {
    window.scrollBy({ top: 600, behavior: 'smooth' });
  });
}

// ================================
// NETWORK BUILDER MINI-GAME
// ================================
function initNetworkBuilder() {
  const canvas = document.getElementById("networkCanvas");
  const messageBox = document.getElementById("network-message");
  if (!canvas || !messageBox) return;

  const ctx = canvas.getContext("2d");
  const MAX_NODES = 7;
  let nodes = [];
  let connections = [];
  let selectedNode = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
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
      messageBox.textContent = "You’ve built a 7-node network — welcome to the Network!";
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
// MINDSPACE EXPLORER
// ================================
function initMindspaceExplorer() {
  const canvas = document.getElementById('mindspaceCanvas');
  const details = document.getElementById('mindspace-details');
  if (!canvas) return;

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
    canvas.width = canvas.clientWidth;
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
    { question: "Which one of these represents the luxury aesthetic of NetworkRad?", options: ["Neon Blue & Silver", "Bright Red & Yellow", "Black & Green Matrix", "Brown & Beige"], correct: "Neon Blue & Silver" }
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
  const msg = document.getElementById('support-unlock-message');
  const modal = document.getElementById('supportModal');
  let hoverCount = 0, unlocked = false;

  if (!logo || !msg) return;

  logo.addEventListener('mouseenter', () => {
    if (unlocked) return;
    hoverCount++;
    logo.style.transition = 'box-shadow 0.3s ease';
    logo.style.boxShadow = `0 0 ${5 + hoverCount * 2}px rgba(0,255,180,0.6)`;

    if (hoverCount === 5) {
      unlocked = true;
      msg.classList.add('revealed');
      msg.innerHTML = `☘️ <strong>Secret Unlocked!</strong><br>Did you know Ireland has more sheep than people in some counties? 🐑`;
      logo.classList.add('logo-unlocked');
      logo.style.animation = 'logoGlowMagic 2.5s ease-in-out infinite alternate';

      if (modal && modal.style.display !== 'flex') {
        modal.style.display = 'flex';
      }
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes logoGlowMagic {
      0% { box-shadow: 0 0 8px rgba(0,255,180,0.4), 0 0 14px rgba(0,195,255,0.3); transform: scale(1); }
      50% { box-shadow: 0 0 20px rgba(0,255,150,0.6), 0 0 30px rgba(0,220,255,0.4); transform: scale(1.05); }
      100% { box-shadow: 0 0 10px rgba(0,255,180,0.4), 0 0 20px rgba(0,200,255,0.3); transform: scale(1.02); }
    }
  `;
  document.head.appendChild(style);
}


// ================================
// BUSINESS GROWTH SECTION INTERACTIVITY
// ================================
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');
  let started = false;

  function animateCounters() {
    if (started) return;
    const section = document.getElementById('business-growth');
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      started = true;
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 80; // control speed

        const updateCount = () => {
          if (count < target) {
            count += speed;
            counter.textContent = Math.floor(count);
            requestAnimationFrame(updateCount);
          } else {
            counter.textContent = target;
          }
        };
        updateCount();
      });
    }
  }

  window.addEventListener('scroll', animateCounters);

  // "Grow Business" button scrolls to Contact section
  const growBtn = document.getElementById('growBizBtn');
  if (growBtn) {
    growBtn.addEventListener('click', () => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  }
});
/* ==========================
   COLLAPSIBLE SECTION LOGIC
   ========================== */
document.querySelectorAll(".reveal-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const target = document.getElementById(targetId);
    const isExpanded = target.classList.contains("expanded");

    // Collapse all first (optional)
    document.querySelectorAll(".collapsible-content").forEach((el) => {
      el.classList.remove("expanded");
    });
    document.querySelectorAll(".reveal-btn").forEach((el) => {
      el.classList.remove("active");
      el.querySelector(".arrow").textContent = "▶";
    });

    // Toggle current
    if (!isExpanded) {
      target.classList.add("expanded");
      btn.classList.add("active");
      btn.querySelector(".arrow").textContent = "▼";
    }
  });
});


fetch(workerURL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: userMessage }]
  }),
})

