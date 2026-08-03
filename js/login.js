// Use the SAME Google Apps Script Web App URL from signup
const scriptURL = "https://script.google.com/macros/s/AKfycby9ybIH09_UxwVm4EGIqgqNti1nV7GuR3202ohQH5TJ43mq8O6HAki0YTS2UUpwIOrFVA/exec";

function login() {
  const loginId = document.getElementById("loginId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!loginId || !password) {
    alert("Please enter both Mobile/ID and Password.");
    return;
  }

  const loginBtn = document.getElementById("loginBtn");
  loginBtn.innerText = "Logging in...";
  loginBtn.disabled = true;

  const payload = {
    action: "login",
    loginId: loginId,
    password: password
  };

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Server error");
      }
      return response.json();
    })
    .then((result) => {
      loginBtn.innerText = "Login";
      loginBtn.disabled = false;

      if (result.status === "success") {
        alert("Login Successful! Welcome " + result.user.name);
        
        // Save user data in browser Session Storage for dashboard/exam access
        sessionStorage.setItem("scolex_user", JSON.stringify(result.user));

        // Redirect to dashboard or exam portal
        window.location.href = "instructions.html";
      } else {
        alert(result.message || "Invalid Mobile/ID or Password.");
      }
    })
    .catch((error) => {
      console.error(error);
      loginBtn.innerText = "Login";
      loginBtn.disabled = false;
      alert("Connection error. Please try again.");
    });
}