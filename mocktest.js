// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxq0Z8M-BMplN1DneyJayE6F6imrTxzm_e92aP_wTulXq_sSZWXvPcZcfqlUoZdAU6F9w/exec";

let mockQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let timeInSeconds = 60 * 60; // 60 Minutes
let timerInterval = null;

// Get Test ID and Title from localStorage (saved when user clicks a test)
const currentTestId = localStorage.getItem("testId") || "FUND01"; 

// Page Load Event - Fetch questions specific to the Test ID
window.onload = function() {
  fetchQuestionsFromSheet();
};

// Fetch dynamic questions filtered by Test ID
function fetchQuestionsFromSheet() {
  const questionTextElem = document.getElementById('questionText');
  questionTextElem.innerText = `⏳ Loading questions for ${currentTestId}...`;

  fetch(`${SCRIPT_URL}?action=getQuestions&testId=${currentTestId}`)
    .then(response => response.json())
    .then(data => {
      if (data.status === "success" && data.questions && data.questions.length > 0) {
        mockQuestions = data.questions;
        selectedAnswers = new Array(mockQuestions.length).fill(null);
        document.getElementById('totalQNum').innerText = mockQuestions.length;
        
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

// Question Load Function
function loadQuestion() {
  if (mockQuestions.length === 0) return;

  const q = mockQuestions[currentQuestionIndex];
  
  document.getElementById('currentQNum').innerText = currentQuestionIndex + 1;
  document.getElementById('questionText').innerText = `${q.qno || (currentQuestionIndex + 1)}. ${q.question}`;
  
  for (let i = 0; i < 4; i++) {
    document.getElementById(`opt${i}`).innerText = q.options[i];
  }

  const radioButtons = document.getElementsByName('quizOption');
  const cards = document.querySelectorAll('.option-card');
  
  radioButtons.forEach((radio, idx) => {
    radio.checked = (selectedAnswers[currentQuestionIndex] === idx);
    if (selectedAnswers[currentQuestionIndex] === idx) {
      cards[idx].classList.add('selected');
    } else {
      cards[idx].classList.remove('selected');
    }
  });

  document.getElementById('prevBtn').disabled = (currentQuestionIndex === 0);
  
  if (currentQuestionIndex === mockQuestions.length - 1) {
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'inline-block';
  } else {
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('submitBtn').style.display = 'none';
  }

  const progressPercent = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;
  document.getElementById('progressBar').style.width = `${progressPercent}%`;
}

// Option Select Handler
function selectOption(index) {
  selectedAnswers[currentQuestionIndex] = index;
  
  const cards = document.querySelectorAll('.option-card');
  const radioButtons = document.getElementsByName('quizOption');
  
  cards.forEach((card, idx) => {
    if (idx === index) {
      card.classList.add('selected');
      radioButtons[idx].checked = true;
    } else {
      card.classList.remove('selected');
    }
  });
}

// Next Button Handler
function nextQuestion() {
  if (currentQuestionIndex < mockQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

// Previous Button Handler
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

    document.getElementById('timer').innerText = 
      `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

    if (timeInSeconds <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Time is up! Test is submitting automatically.");
      submitTest();
    }
  }, 1000);
}

// Submit Test & Send Data to Google Apps Script Backend
function submitTest() {
  if (confirm("Kya aap sach mein Test submit karna chahte hain?")) {
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
        score += 2; // Adjust marks per question if needed
      } else {
        wrongCount++;
      }
    });

    const totalQuestions = mockQuestions.length;

    // Retrieve logged-in student info from localStorage if available
    const studentData = JSON.parse(localStorage.getItem("studentData")) || {
      name: "Guest Student",
      mobile: "N/A",
      course: "N/A"
    };

    // UI Result View Container (make sure element with class/id exists or target quiz-container)
    const container = document.querySelector('.quiz-container');
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>🎉 Test Completed Successfully!</h2>
        <h3 style="margin: 20px 0; color: #004aad;">Your Score: ${score}</h3>
        <p><strong>Correct:</strong> ${correctCount} | <strong>Wrong:</strong> ${wrongCount} | <strong>Unattempted:</strong> ${unattemptedCount}</p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.location.href='dashboard.html'">Back to Dashboard</button>
      </div>
    `;

    // Match exact keys required by your Apps Script `saveResult(data)` function[cite: 2]
    const payload = {
      action: "saveResult",
      studentName: studentData.name,
      mobile: studentData.mobile,
      course: studentData.course,
      testId: currentTestId,
      total: totalQuestions,
      correct: correctCount,
      wrong: wrongCount,
      unattempted: unattemptedCount,
      score: score
    };

    // Send Results to Google Sheet via POST
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(() => console.log("Result saved to Google Sheet successfully!"))
    .catch(err => console.error("Error saving result:", err));
  }
}