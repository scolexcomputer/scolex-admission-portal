const scriptURL = "https://script.google.com/macros/s/AKfycbyKgyA_rv3EzX9ni3qhTeiazz49MqCtRiMWFD129ofQJn9xXZWniTsSQZsyT68Ej7UJFw/exec";

let questions = [];
let current = 0;
let answers = [];
let time = 1800; // 30 minutes in seconds
let timer = null;

// Retrieve Student Data
const userData = JSON.parse(sessionStorage.getItem("scolex_user") || localStorage.getItem("scolex_user") || "{}");
const studentName = userData.name || localStorage.getItem("studentName") || "Student";
const studentId = userData.id || localStorage.getItem("studentId") || "GUEST";
const studentCourse = userData.course || localStorage.getItem("course") || "";

document.getElementById("studentName").innerText = studentName;

// Fetch Questions from Google Sheet
fetch(scriptURL, {
  method: "POST",
  body: JSON.stringify({ action: "questions" })
})
  .then(response => response.json())
  .then(data => {
    // Optionally filter questions by student's course if needed
    if (studentCourse !== "") {
      const filtered = data.filter(q => q.course.toLowerCase() === studentCourse.toLowerCase());
      questions = filtered.length > 0 ? filtered : data;
    } else {
      questions = data;
    }

    if (questions.length > 0) {
      loadQuestion();
      createPalette();
      startTimer();
    } else {
      alert("No questions available for this course.");
    }
  })
  .catch(error => {
    console.error("Error fetching questions:", error);
    alert("Unable to load questions.");
  });

function loadQuestion() {
  let q = questions[current];

  document.getElementById("questionNumber").innerText =
    "Question " + (current + 1) + " / " + questions.length;

  document.getElementById("questionText").innerText = q.question;

  let options = [q.optionA, q.optionB, q.optionC, q.optionD];
  let optionHTML = "";

  options.forEach((option, index) => {
    let checked = answers[current] === index ? "checked" : "";

    optionHTML += `
      <label class="option" style="display: block; margin: 8px 0; cursor: pointer;">
        <input 
          type="radio" 
          name="answer" 
          ${checked} 
          onclick="saveAnswer(${index})">
        <strong>${String.fromCharCode(65 + index)}.</strong> ${option || ''}
      </label>
    `;
  });

  document.getElementById("options").innerHTML = optionHTML;
  updatePalette();
}

function saveAnswer(index) {
  answers[current] = index;
  updatePalette();
}

function nextQuestion() {
  if (current < questions.length - 1) {
    current++;
    loadQuestion();
  }
}

function previousQuestion() {
  if (current > 0) {
    current--;
    loadQuestion();
  }
}

function goQuestion(index) {
  current = index;
  loadQuestion();
}

function createPalette() {
  let html = "";
  for (let i = 0; i < questions.length; i++) {
    html += `
      <button id="pbtn-${i}" onclick="goQuestion(${i})">
        ${i + 1}
      </button>
    `;
  }
  document.getElementById("questionPalette").innerHTML = html;
  updatePalette();
}

function updatePalette() {
  for (let i = 0; i < questions.length; i++) {
    const btn = document.getElementById(`pbtn-${i}`);
    if (!btn) continue;

    btn.className = "";
    if (answers[i] !== undefined) {
      btn.classList.add("answered");
    }
    if (i === current) {
      btn.classList.add("active");
    }
  }
}

function startTimer() {
  timer = setInterval(function () {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    document.getElementById("timer").innerText =
      (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    time--;

    if (time < 0) {
      clearInterval(timer);
      alert("Time Over!");
      submitTest();
    }
  }, 1000);
}

function confirmSubmit() {
  if (confirm("Are you sure you want to submit your test?")) {
    submitTest();
  }
}

function submitTest() {
  if (timer) clearInterval(timer);

  let score = 0;
  let summary = [];

  questions.forEach((q, index) => {
    let selectedIndex = answers[index];
    let selectedLetter = selectedIndex !== undefined ? String.fromCharCode(65 + selectedIndex) : "Not Answered";
    
    if (selectedLetter === q.answer) {
      score++;
    }

    summary.push({
      number: index + 1,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      userAnswerLetter: selectedLetter,
      userAnswerText: selectedIndex !== undefined ? [q.optionA, q.optionB, q.optionC, q.optionD][selectedIndex] : "Not Answered",
      correctAnswerLetter: q.answer
    });
  });

  localStorage.setItem("score", score);
  localStorage.setItem("totalQuestions", questions.length);
  localStorage.setItem("testSummary", JSON.stringify(summary));

  window.location.href = "result.html";
}