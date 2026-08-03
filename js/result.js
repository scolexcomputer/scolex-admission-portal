// Replace this with your deployed Google Apps Script Web App URL
const scriptURL = "https://script.google.com/macros/s/AKfycbx2daYgFezkVnyfqs_7Ymzsib11E15JzZ7OlXO_qCxKSAdj4V_6TS7pq9XXX-lUvYIArA/exec";

// 1. Retrieve data from LocalStorage / SessionStorage
const userData = JSON.parse(sessionStorage.getItem("scolex_user") || localStorage.getItem("scolex_user") || "{}");

const name = userData.name || localStorage.getItem("studentName") || "Student";
const course = userData.course || localStorage.getItem("course") || "Computer Course";
const studentId = userData.id || "GUEST";

// Retrieve scores calculated during test submit
const score = parseInt(localStorage.getItem("score") || "0");
const total = parseInt(localStorage.getItem("totalQuestions") || "50");

// 2. Display data in your HTML elements
document.getElementById("message").innerText = "Congratulations " + name + "! Test Completed.";
document.getElementById("total").innerText = total;
document.getElementById("correct").innerText = score;
document.getElementById("score").innerText = score;

// 3. Send result data to Google Sheet
const data = {
  action: "submitResult",
  studentId: studentId,
  studentName: name,
  course: course,
  score: score,
  totalQuestions: total
};

fetch(scriptURL, {
  method: "POST",
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(result => {
    console.log("Result saved successfully to Google Sheet:", result);
  })
  .catch(error => {
    console.error("Error saving result:", error);
  });