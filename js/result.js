window.onload = function() {
  const resultDataString = sessionStorage.getItem("lastTestResult");

  if (resultDataString) {
    const resultData = JSON.parse(resultDataString);

    document.getElementById("message").innerText = "🎉 Congratulations! Test Completed.";
    document.getElementById("total").innerText = resultData.total;
    document.getElementById("correct").innerText = resultData.correct;
    document.getElementById("score").innerText = resultData.score + " Marks";
  } else {
    document.getElementById("message").innerText = "No recent test result found!";
    document.getElementById("total").innerText = "0";
    document.getElementById("correct").innerText = "0";
    document.getElementById("score").innerText = "0 Marks";
  }
};