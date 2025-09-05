// Full question bank
let questionBank = [
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

// Variables
let currentRoom = 1;
let keys = 0;
let currentQuestion = -1;
let questions = [];

// Function to pick 10 random questions
function pickRandomQuestions() {
  let selected = [];
  while (selected.length < 10) {
    let randIndex = Math.floor(Math.random() * questionBank.length);
    let q = questionBank[randIndex];
    if (!selected.includes(q)) selected.push(q);
  }
  return selected;
}

// Start Room
function startRoom(roomNum) {
  currentRoom = roomNum;
  keys = 0;
  currentQuestion = -1;
  questions = pickRandomQuestions();
  document.getElementById("room-info").innerText = "Room " + roomNum;
  document.getElementById("keys").innerText = "Keys Collected: " + keys;
  document.getElementById("message").innerText = "";
  nextQuestion();
}

// Questions
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    document.getElementById("question").innerText = questions[currentQuestion].question;
    document.getElementById("answer").value = "";
    document.getElementById("message").innerText = "";
  } else {
    document.getElementById("question").innerText = "🎉 No more questions! Use keys to open the door.";
  }
}

function checkAnswer() {
  let userAns = document.getElementById("answer").value.trim().toLowerCase();
  let correctAns = questions[currentQuestion].answer.toLowerCase();
  let correctArr = correctAns.split(",");
  if (correctArr.includes(userAns)) {
    keys++;
    document.getElementById("keys").innerText = "Keys Collected: " + keys;
    document.getElementById("message").innerText = "✅ Correct! You earned a key.";
  } else {
    document.getElementById("message").innerText = "❌ Wrong! The creature is coming...";
  }
}

// Doors
function openDoor(doorNum) {
  if (keys >= doorNum) {
    if (currentRoom === 1) {
      document.getElementById("message").innerText = "🚪 Door opened! Welcome to Room 2!";
      startRoom(2); // Move to next room
    } else {
      document.getElementById("message").innerText = "🎉 You opened the final door! You escaped the Algebra Escape Room!";
      document.getElementById("question").innerText = "";
      document.getElementById("doors").style.display = "none";
    }
  } else {
    document.getElementById("message").innerText = `🔒 Door ${doorNum} is locked. You need ${doorNum} keys.`;
  }
}

// Initialize game
startRoom(1);
