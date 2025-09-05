/* ===== Game Setup ===== */
// Educational Note: These are GLOBAL VARIABLES - they store the game's "state"
// The game state tells us what's happening in the game at any moment
const TOTAL_DOORS = 10;  // const means this value never changes
let keys = 0;             // let means this value can change
let currentQ = -1;        // Start at -1 because we increment before showing
let timerStarted = false; // Boolean flag to prevent multiple timers
let timeLeft = 240;       // 4 minutes = 240 seconds
let timerId = null;       // Will store the timer ID so we can stop it later

// New: Track which questions have been solved (array of true/false)
let solvedQuestions = new Array(TOTAL_DOORS).fill(false);

/* ===== DOM references ===== */
// Educational Note: DOM means Document Object Model - it's how JavaScript talks to HTML
// This $ function is a shortcut for document.querySelector
// It finds HTML elements by their ID or class
const $ = (sel) => document.querySelector(sel);
const doorImg = $("#door-image");        // The door image element
const msg = $("#message");              // Where we show correct/incorrect messages
const timerEl = $("#timer");            // The countdown timer display
const questionEl = $("#question");      // Where questions appear
const answerEl = $("#answer");          // The input box for answers
const keysContainer = $("#keys-container"); // Where key icons appear

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
  { question: "If log10(x) = 2, what is x?", answer: "100" },
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
  { question: "What is cos(60°)?", answer: "0.5" },
  // Math Solution: Pipe A fills 1/6 per hour, Pipe B fills 1/4 per hour
  // Together they fill 1/6 + 1/4 = 5/12 per hour
  // Leak empties 1/3 per hour, so net fill = 5/12 - 1/3 = 5/12 - 4/12 = 1/12 per hour
  // Time to fill = 1 ÷ (1/12) = 12 hours
  { question: "Two pipes can fill a tank. Pipe A can fill it in 6 hours, and Pipe B can fill it in 4 hours. The tank has a leak that empties 1/3 of the tank per hour. If both pipes are open, how long does it take to fill?", answer: "12" },
  { question: "A bag has 5 red, 4 blue, and 3 green balls. Two balls are drawn without replacement. What's the probability that they are different colors?. Answer in fraction form.", answer: "47/66" },
  // Math Solution: Combined speed = 60 + 40 = 100 km/h (approaching each other)
  // Time to meet = 300 km ÷ 100 km/h = 3 hours
  // Bird flies for 3 hours at 90 km/h = 270 km
  { question: "Two trains are 300 km apart, moving toward each other. One moves at 60 km/h, the other at 40 km/h. A bird flies back and forth between them at 90 km/h until they meet. How far does the bird travel?", answer: "270" }
];

/* ===== Randomize questions ===== */
// Educational Note: This uses the Fisher-Yates shuffle algorithm
// It's like shuffling a deck of cards - swap random positions many times
function shufflePick(arr, n) {
  const a = [...arr];  // Make a copy so we don't change the original
  // Start from the end and work backwards
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Pick random position
    [a[i], a[j]] = [a[j], a[i]];  // Swap elements (ES6 destructuring)
  }
  return a.slice(0, n);  // Return first n elements
}
const questions = shufflePick(questionBank, TOTAL_DOORS);

/* ===== Start Game ===== */
function startGame() {
  $("#start-container").style.display = "none";
  $("#game-container").style.display = "block";
  hideMonster();
  startTimerOnce();
  
  // Start with the first question
  currentQ = 0;
  showQuestion();
}

/* ===== Timer ===== */
// Educational Note: This converts seconds to MM:SS format
function updateTimer() {
  const m = Math.floor(timeLeft / 60);  // Get minutes by dividing by 60
  const s = timeLeft % 60;              // Get remaining seconds with modulo
  // padStart adds zeros: 5 becomes "05"
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
// Educational Note: We use style.display to show/hide elements
// "block" makes it visible, "none" hides it completely
// The hidden attribute doesn't work when CSS has display:none
function showMonster() {
  disableInputs();
  const overlay = $("#monster-overlay");
  overlay.style.display = "flex"; // Use flex to center content
}
function hideMonster() {
  const overlay = $("#monster-overlay");
  overlay.style.display = "none"; // Hide the overlay
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
// Educational Note: This shows the current question and handles navigation
function showQuestion() {
  if (currentQ >= 0 && currentQ < questions.length) {
    // Show question number and if it's already solved
    const questionNum = currentQ + 1; // Add 1 because arrays start at 0
    const solvedText = solvedQuestions[currentQ] ? " ✅" : "";
    
    // Display the question with its number
    questionEl.innerHTML = `<strong>Question ${questionNum} of ${TOTAL_DOORS}${solvedText}</strong><br>` + 
                          questions[currentQ].question;
    
    // Clear the answer box if this question isn't solved yet
    if (!solvedQuestions[currentQ]) {
      answerEl.value = "";
      answerEl.disabled = false;
      $("#submitBtn").disabled = false;
    } else {
      // If already solved, show the answer and disable input
      answerEl.value = "Already solved!";
      answerEl.disabled = true;
      $("#submitBtn").disabled = true;
    }
    
    msg.textContent = "";
    
    // Hide/show navigation buttons at boundaries
    // Educational Note: Better UX to hide buttons that can't be used
    if (currentQ === 0) {
      $("#prevBtn").style.display = "none";  // Hide on first question
    } else {
      $("#prevBtn").style.display = "inline-block";  // Show for other questions
    }
    
    if (currentQ === questions.length - 1) {
      $("#nextBtn").style.display = "none";  // Hide on last question
    } else {
      $("#nextBtn").style.display = "inline-block";  // Show for other questions
    }
  }
}

function nextQuestion() {
  // Move to next question if not at the end
  if (currentQ < questions.length - 1) {
    currentQ++;
    showQuestion();
  }
}

// New function: Go to previous question
function prevQuestion() {
  // Move to previous question if not at the beginning
  if (currentQ > 0) {
    currentQ--;
    showQuestion();
  }
}

/* ===== Answer Check ===== */
// Educational Note: Sanitizing means cleaning up the input
// This makes "3, -3" the same as "3,-3" and "CIRCLE" same as "circle"
function sanitize(str) {
  // Regular expression: /\s+/g finds all spaces, g means "global" (all occurrences)
  return str.replace(/\s+/g, "").toLowerCase();
}
function isCorrect(user, correct) {
  // Compare sanitized versions so small differences don't matter
  return sanitize(user) === sanitize(correct);
}
function checkAnswer() {
  if (currentQ < 0 || currentQ >= questions.length) return;
  
  // Don't check if already solved
  if (solvedQuestions[currentQ]) {
    msg.textContent = "You already solved this one!";
    return;
  }
  
  const user = answerEl.value.trim();
  if (!user) return;

  const correct = questions[currentQ].answer;
  if (isCorrect(user, correct)) {
    // Mark this question as solved
    solvedQuestions[currentQ] = true;
    
    keys++;
    addKeyIcon();
    msg.textContent = "✅ Correct! You got a key.";
    
    // Update the display to show the checkmark
    showQuestion();

    if (keys < TOTAL_DOORS) {
      showNextDoor();
      // Automatically move to next unsolved question
      setTimeout(() => {
        // Find next unsolved question
        for (let i = currentQ + 1; i < questions.length; i++) {
          if (!solvedQuestions[i]) {
            currentQ = i;
            showQuestion();
            return;
          }
        }
        // If no unsolved questions after current, look from beginning
        for (let i = 0; i < currentQ; i++) {
          if (!solvedQuestions[i]) {
            currentQ = i;
            showQuestion();
            return;
          }
        }
      }, 1000); // Wait 1 second before moving to next question
    } else {
      // Victory! Player has escaped!
      clearInterval(timerId); // Stop the timer
      
      // Hide the input and buttons for a cleaner victory screen
      answerEl.style.display = "none";
      $("#submitBtn").style.display = "none"; 
      $("#prevBtn").style.display = "none";
      $("#nextBtn").style.display = "none";
      
      // Show the victory background
      doorImg.src = "backgroundimage.png";
      
      // Display victory message with bigger text
      questionEl.innerHTML = "<h2 style='color: #ffcc00; font-size: 2.5rem;'>🎉 You unlocked all doors and escaped! 🎉</h2>";
      msg.textContent = "";
      
      // Trigger confetti animation
      createConfetti();
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

/* ===== Confetti Animation ===== */
// Educational Note: This creates a fun particle effect for winning!
// We create many small colored divs that fall and fade away
function createConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
  const confettiCount = 150; // Number of confetti pieces
  
  for (let i = 0; i < confettiCount; i++) {
    // Create each confetti piece with a small delay
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random color from our array
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Random starting position across the screen width
      confetti.style.left = Math.random() * 100 + '%';
      
      // Random animation duration (2-5 seconds)
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      
      // Random delay before starting to fall
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      
      // Add to the page
      document.body.appendChild(confetti);
      
      // Remove after animation completes
      setTimeout(() => confetti.remove(), 5000);
    }, i * 10); // Stagger the creation for a burst effect
  }
}
