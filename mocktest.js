// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5gdbAKIv5HB791LdlGKxE0R4ON2gokAHvHolmI6bQJS63jiJXfDbMSD38hyw170uaxA/exec";

let mockQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let markedForReview = [];
let timeInSeconds = 60 * 60; // 60 Minutes
let timerInterval = null;

// Get Test ID from localStorage
const currentTestId = localStorage.getItem("testId") || "FUND01"; 

// DOM Load Event
document.addEventListener("DOMContentLoaded", () => {
  const title = localStorage.getItem("testTitle") || localStorage.getItem("selectedTestTitle");
  document.getElementById("testTitleDisplay").innerText = title || "Mock Test";
  fetchQuestionsFromSheet();
});

// Fetch questions from Apps Script
function fetchQuestionsFromSheet() {
  const questionTextElem = document.getElementById("questionText");
  questionTextElem.innerText = `⏳ Loading questions for ${currentTestId}...`;

  fetch(`${SCRIPT_URL}?action=getQuestions&testId=${currentTestId}`)
    .then(response => response.json())
    .then(data => {
      if (data.status === "success" && data.questions && data.questions.length > 0) {
        mockQuestions = data.questions;
        selectedAnswers = new Array(mockQuestions.length).fill(null);
        markedForReview = new Array(mockQuestions.length).fill(false);
        
        document.getElementById("totalQNum").innerText = mockQuestions.length;
        
        renderQuestionPalette();
        loadQuestion();
        startTimer();
      } else {
        questionTextElem.innerText = `❌ No questions found for Test ID: ${currentTestId} in Google Sheet!`;
      }
    })
    .catch(error => {
      console.error("Error fetching questions:", error);
      questionTextElem.innerText = "❌ Error loading questions. Please check your network or script URL.";
    });
}

// Load current question details
function loadQuestion() {
  if (mockQuestions.length === 0) return;

  const q = mockQuestions[currentQuestionIndex];
  
  document.getElementById("currentQNum").innerText = currentQuestionIndex + 1;
  document.getElementById("questionText").innerText = `${q.qno || (currentQuestionIndex + 1)}. ${q.question}`;
  
  for (let i = 0; i < 4; i++) {
    document.getElementById(`opt${i}`).innerText = q.options[i];
  }

  const radioButtons = document.getElementsByName("quizOption");
  const cards = document.querySelectorAll(".option-card");
  
  radioButtons.forEach((radio, idx) => {
    radio.checked = (selectedAnswers[currentQuestionIndex] === idx);
    if (selectedAnswers[currentQuestionIndex] === idx) {
      cards[idx].classList.add("selected");
    } else {
      cards[idx].classList.remove("selected");
    }
  });

  // Toggle review button text
  const reviewBtn = document.getElementById("reviewBtn");
  if (markedForReview[currentQuestionIndex]) {
    reviewBtn.innerText = "🔖 Unmark Review";
    reviewBtn.style.background = "#e65100";
  } else {
    reviewBtn.innerText = "🔖 Mark for Review";
    reviewBtn.style.background = "#ff9800";
  }

  document.getElementById("prevBtn").disabled = (currentQuestionIndex === 0);
  
  if (currentQuestionIndex === mockQuestions.length - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-block";
  } else {
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
  }

  const progressPercent = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;
  document.getElementById("progressBar").style.width = `${progressPercent}%`;

  updatePaletteUI();
}

// Option Handler
function selectOption(index) {
  selectedAnswers[currentQuestionIndex] = index;
  
  const cards = document.querySelectorAll(".option-card");
  const radioButtons = document.getElementsByName("quizOption");
  
  cards.forEach((card, idx) => {
    if (idx === index) {
      card.classList.add("selected");
      radioButtons[idx].checked = true;
    } else {
      card.classList.remove("selected");
    }
  });

  updatePaletteUI();
}

// Mark/Unmark current question for review
function toggleMarkForReview() {
  markedForReview[currentQuestionIndex] = !markedForReview[currentQuestionIndex];
  loadQuestion();
}

// Render Question Palette grid buttons
function renderQuestionPalette() {
  const grid = document.getElementById("questionGrid");
  grid.innerHTML = "";

  mockQuestions.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.className = "palette-btn";
    btn.innerText = idx + 1;
    btn.onclick = () => jumpToQuestion(idx);
    btn.id = `palette-btn-${idx}`;
    grid.appendChild(btn);
  });
}

// Jump to specific question
function jumpToQuestion(index) {
  currentQuestionIndex = index;
  loadQuestion();
}

// Update Question Palette colors
function updatePaletteUI() {
  mockQuestions.forEach((_, idx) => {
    const btn = document.getElementById(`palette-btn-${idx}`);
    if (!btn) return;

    btn.className = "palette-btn";

    if (selectedAnswers[idx] !== null) {
      btn.classList.add("answered");
    }
    if (markedForReview[idx]) {
      btn.classList.add("marked");
    }
    if (idx === currentQuestionIndex) {
      btn.classList.add("current");
    }
  });
}

// Navigation Handlers
function nextQuestion() {
  if (currentQuestionIndex < mockQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

// Timer Handler
function startTimer() {
  timerInterval = setInterval(() => {
    timeInSeconds--;
    
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;

    document.getElementById("timer").innerText = 
      `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    if (timeInSeconds <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Time is up! Test is submitting automatically.");
      submitTest();
    }
  }, 1000);
}

// Submit Test & Send Payload to Apps Script
// Updated Submit Test Handler
function submitTest() {
  if (confirm("Are you sure you want to submit the test?")) {
    clearInterval(timerInterval);

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let score = 0;

    mockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === null) {
        unattemptedCount++;
      } else if (selectedAnswers[idx] === q.answer) {
        correctCount++;
        score += 2;
      } else {
        wrongCount++;
      }
    });

    // Extract student details safely across nested or flat object structures
    const rawData = JSON.parse(localStorage.getItem("studentData")) || {};
    const student = rawData.student || rawData; // Handles both { student: {...} } and direct {...}

    const payload = {
      action: "saveResult",
      studentName: student.name || student.studentName || "Guest Student",
      mobile: student.mobile || "N/A",
      course: student.course || "N/A",
      testId: currentTestId,
      total: mockQuestions.length,
      correct: correctCount,
      wrong: wrongCount,
      unattempted: unattemptedCount,
      score: score
    };

    // UI Feedback
    const container = document.querySelector(".quiz-container");
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>🎉 Test Completed Successfully!</h2>
        <h3 style="margin: 20px 0; color: #004aad;">Your Score: ${score}</h3>
        <p><strong>Correct:</strong> ${correctCount} | <strong>Wrong:</strong> ${wrongCount} | <strong>Unattempted:</strong> ${unattemptedCount}</p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.location.href='dashboard.html'">Back to Dashboard</button>
      </div>
    `;

    // Send payload using text/plain to avoid CORS preflight stripping
    fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Response from server:", data);
    })
    .catch(err => console.error("Error saving result:", err));
  }
}