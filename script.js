/* ===== Game Setup ===== */
const TOTAL_DOORS = 10;
let keys = 0;
let currentQ = -1;
let timerStarted = false;
let timeLeft = 240; // 4 minutes
let timerId = null;

/* ===== DOM references ===== */
const $ = (sel) => document.querySelector(sel);
const doorImg = $("#door-image");
const msg = $("#message");
const timerEl = $("#timer");
const questionEl = $("#question");
const answerEl = $("#answer");
const keysContainer = $("#keys-container");

/* ===== Question bank ===== */
const questionBank = [
  { question: "A movie ticket costs $12. If you buy x tickets and spend $60, how many tickets did you buy?", answer: "5" },
  { question: "Sara has 3 more than twice the number of apples than Tom. If Sara has 11 apples, how many does Tom have?", answer: "4" },
  { question: "If f(x) = 2x + 5, what is f(3)?", answer: "11" },
  { question: "The function g(x) = -x + 4. Find g(7).", answer: "-3" },
  { question: "A ball is thrown up with height h(t) = -5t^2 + 20t + 15. What is the height at t = 2 seconds?", answer: "35" },
  { question: "Solve for x: x^2 - 9 = 0", answer: "3,-3" },
  { question: "Solve the system: 2x + y = 7, x - y = 1", answer: "2,3" },
  { question: "A store sells pencils and pens. 3 pencils and 2 pens cost $4. 5 pencils and 3 pens cost $7. Find the price of each.", answer: "1,1" },
  { question: "Solve for x: log2(x) = 3", answer: "8" },
  { question: "If log10(x) = 2, what is x?", answer: "100" }
  { question: "Solve: √(x + 5) = 4", answer: "11" },
  { question: "Solve: √(3x) = 9", answer: "27" },
  { question: "Solve: 1/(x+2) = 1/4", answer: "2" },
  { question: "Solve: 2/x = 6", answer: "1/3" },
  { question: "Simplify: (3 + 2i) + (5 - i)", answer: "8+i" },
  { question: "Simplify: (2 + 3i) - (1 + 5i)", answer: "1-2i" },
  { question: "Simplify: (x^2 + 3x) + (2x^2 - x)", answer: "3x^2+2x" },
  { question: "Multiply: (x + 2)(x - 3)", answer: "x^2-x-6" },
  { question: "The equation x^2 + y^2 = 25 represents what shape?", answer: "circle" },
  { question: "The parabola y = x^2 opens in which direction?", answer: "up" },
  { question: "What is sin(30°)?", answer: "0.5" },
  { question: "What is cos(60°)?", answer: "0.5" }
  { question: "Two pipes can fill a tank. Pope A can fill it in 6 hours, and Pipe B can fill it in 4 hours. The tank has a leak that empties 1/3 of the tank per hour. If both pipes are open, how long would it take to fill the tank completely in hours?", answer: "12" }
  { question: "A bag has 5 red, 4 blue, and 3 green balls. Two balls are drawn without replacement. What's the probability that they are different colors?. Answer in fraction form.", answer: "47/66" }
  { question: "Two trains are 300 km apart, moving toward each other. One moves at 60 km/h, the other at 40 km/h. A bird flies back and forth between them at 90 km/h until they meet. How far does the bird travel?", answer: "270" }
];

/* ===== Randomize questions ===== */
function shufflePick(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
const questions = shufflePick(questionBank, TOTAL_DOORS);

/* ===== Start Game ===== */
function startGame() {
  $("#start-container").style.display = "none";
  $("#game-container").style.display = "block";
  hideMonster();
  startTimerOnce();
  nextQuestion();
}

/* ===== Timer ===== */
function updateTimer() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerEl.textContent = `Time Left: ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function startTimerOnce() {
  if (timerStarted) return;
  timerStarted = true;
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      showMonster();
    }
  }, 1000);
}

/* ===== Monster Overlay ===== */
function showMonster() {
  disableInputs();
  const overlay = $("#monster-overlay");
  overlay.hidden = false;
}
function hideMonster() {
  const overlay = $("#monster-overlay");
  overlay.hidden = true;
}

/* ===== Disable Inputs ===== */
function disableInputs() {
  $("#submitBtn").disabled = true;
  $("#nextBtn").disabled = true;
  answerEl.disabled = true;
}

/* ===== Update door image ===== */
function showNextDoor() {
  const nextIndex = Math.min(keys + 1, TOTAL_DOORS);
  doorImg.src = `door${nextIndex}.png`;
}

/* ===== Add Key Icon ===== */
function addKeyIcon() {
  const img = document.createElement("img");
  img.src = "key.png";
  img.classList.add("key-icon");
  keysContainer.appendChild(img);
}

/* ===== Questions ===== */
function nextQuestion() {
  currentQ++;
  if (currentQ < questions.length) {
    questionEl.textContent = questions[currentQ].question;
    answerEl.value = "";
    msg.textContent = "";
  } else {
    questionEl.textContent = "No more questions!";
  }
}

/* ===== Answer Check ===== */
function sanitize(str) {
  return str.replace(/\s+/g, "").toLowerCase();
}
function isCorrect(user, correct) {
  return sanitize(user) === sanitize(correct);
}
function checkAnswer() {
  if (currentQ < 0 || currentQ >= questions.length) return;
  const user = answerEl.value.trim();
  if (!user) return;

  const correct = questions[currentQ].answer;
  if (isCorrect(user, correct)) {
    keys++;
    addKeyIcon();
    msg.textContent = "✅ Correct! You got a key.";

    if (keys < TOTAL_DOORS) {
      showNextDoor();
      nextQuestion();
    } else {
      clearInterval(timerId);
      disableInputs();
      doorImg.src = "backgroundimage.png";
      questionEl.textContent = "🎉 You unlocked all doors and escaped!";
      msg.textContent = "";
    }
  } else {
    msg.textContent = "❌ No....It's getting closer....";
  }
}

/* ===== Init ===== */
updateTimer();
doorImg.src = "door1.png";

/* Enter key submits answer */
answerEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});






