/* ===== Question bank (exactly as you sent) ===== */
const questionBank = [
  // Linear Equations
  { question: "A movie ticket costs $12. If you buy x tickets and spend $60, how many tickets did you buy?", answer: "5" },
  { question: "Sara has 3 more than twice the number of apples than Tom. If Sara has 11 apples, how many does Tom have?", answer: "4" },

  // Functions
  { question: "If f(x) = 2x + 5, what is f(3)?", answer: "11" },
  { question: "The function g(x) = -x + 4. Find g(7).", answer: "-3" },

  // Quadratic Equations
  { question: "A ball is thrown up with height h(t) = -5t^2 + 20t + 15. What is the height at t = 2 seconds?", answer: "35" },
  { question: "Solve for x: x^2 - 9 = 0", answer: "3,-3" },

  // Systems of Equations
  { question: "Solve the system: 2x + y = 7, x - y = 1", answer: "2,3" },
  { question: "A store sells pencils and pens. 3 pencils and 2 pens cost $4. 5 pencils and 3 pens cost $7. Find the price of each.", answer: "1,1" },

  // Logarithms
  { question: "Solve for x: log2(x) = 3", answer: "8" },
  { question: "If log10(x) = 2, what is x?", answer: "100" },

  // Radical Functions
  { question: "Solve: √(x + 5) = 4", answer: "11" },
  { question: "Solve: √(3x) = 9", answer: "27" },

  // Rational Functions
  { question: "Solve: 1/(x+2) = 1/4", answer: "2" },
  { question: "Solve: 2/x = 6", answer: "1/3" },

  // Complex Numbers
  { question: "Simplify: (3 + 2i) + (5 - i)", answer: "8+i" },
  { question: "Simplify: (2 + 3i) - (1 + 5i)", answer: "1-2i" },

  // Polynomials
  { question: "Simplify: (x^2 + 3x) + (2x^2 - x)", answer: "3x^2+2x" },
  { question: "Multiply: (x + 2)(x - 3)", answer: "x^2-x-6" },

  // Conic Sections
  { question: "The equation x^2 + y^2 = 25 represents what shape?", answer: "circle" },
  { question: "The parabola y = x^2 opens in which direction?", answer: "up" },

  // Trigonometry
  { question: "What is sin(30°)?", answer: "0.5" },
  { question: "What is cos(60°)?", answer: "0.5" }
];

/* ===== Game state ===== */
const TOTAL_DOORS = 10;
let keys = 0;
let currentQ = -1;
let timerStarted = false;
let timeLeft = 240; // 4 minutes (seconds)
let timerId = null;

// Pick 10 random unique questions each run
function shufflePick(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
const questions = shufflePick(questionBank, TOTAL_DOORS);

/* ===== DOM helpers ===== */
const $ = (sel) => document.querySelector(sel);
const doorImg = $("#door-image");
const msg = $("#message");

function updateTimer() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  $("#timer").textContent = `Time Left: ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function startTimerOnce() {
  if (timerStarted) return;
  timerStarted = true;
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      // If not all doors unlocked: monster!
      if (keys < TOTAL_DOORS) showMonster();
    }
  }, 1000);
}

function showMonster() {
  disableInputs();
  $("#monster-overlay").hidden = false;
}

function disableInputs() {
  $("#submitBtn").disabled = true;
  $("#nextBtn").disabled = true;
  $("#answer").disabled = true;
}

/* ===== Door + key visuals ===== */
function showNextDoor() {
  const nextIndex = Math.min(keys + 1, TOTAL_DOORS); // door images are 1..10
  doorImg.src = `door${nextIndex}.png`;
}

function animateUnlock() {
  doorImg.classList.add("unlock-anim");
  setTimeout(() => doorImg.classList.remove("unlock-anim"), 450);
}

function addKeyIcon() {
  const img = document.createElement("img");
  img.src = "key.png";
  $("#keys-container").appendChild(img);
}

/* ===== Question flow ===== */
function nextQuestion() {
  startTimerOnce();
  currentQ++;
  if (currentQ < questions.length) {
    $("#question").textContent = questions[currentQ].question;
    $("#answer").value = "";
    msg.textContent = "";
  } else {
    $("#question").textContent = "No more questions!";
  }
}

// Normalize + compare answers carefully
function sanitize(str) {
  return str.replace(/\s+/g, "").toLowerCase();
}
function parseNumberish(str) {
  // decimal
  if (/^-?\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  // fraction a/b
  const m = str.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) {
    const num = parseFloat(m[1]), den = parseFloat(m[2]);
    if (den !== 0) return num / den;
  }
  return null;
}
function isCorrect(userRaw, correctRaw) {
  const u = sanitize(userRaw);
  const c = sanitize(correctRaw);

  // Exact text match first
  if (u === c) return true;

  // Handle numeric equivalence (e.g., 0.5 == 1/2)
  const un = parseNumberish(u);
  const cn = parseNumberish(c);
  if (un !== null && cn !== null && Math.abs(un - cn) < 1e-9) return true;

  // Handle two-solution cases like "3,-3" (accept either order ONLY if they're opposites)
  if (c.includes(",")) {
    const parts = c.split(",");
    if (parts.length === 2) {
      const p0 = parseNumberish(parts[0]);
      const p1 = parseNumberish(parts[1]);
      // opposites (e.g., 3 and -3)
      if (p0 !== null && p1 !== null && Math.abs(p0 + p1) < 1e-12) {
        const reversed = `${parts[1]},${parts[0]}`;
        if (u === reversed) return true;
      }
    }
  }

  return false;
}

function checkAnswer() {
  if (currentQ < 0 || currentQ >= questions.length) return;
  const user = $("#answer").value.trim();
  if (!user) return;

  const correct = questions[currentQ].answer;

  if (isCorrect(user, correct)) {
    keys++;
    addKeyIcon();
    animateUnlock();

    msg.textContent = "✅ Correct! You got a key.";
    // Advance to the next door image immediately
    if (keys < TOTAL_DOORS) {
      showNextDoor();
    }

    // Win condition
    if (keys === TOTAL_DOORS) {
      clearInterval(timerId);
      disableInputs();
      $("#question").textContent = "🎉 You unlocked all 10 doors and escaped!";
      msg.textContent = "";
    } else {
      // Move straight to next question
      nextQuestion();
    }
  } else {
    msg.textContent = "❌ No....It's getting closer....";
  }
}

/* ===== Init ===== */
updateTimer();
showNextDoor();

// Allow Enter key to submit
$("#answer").addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});
