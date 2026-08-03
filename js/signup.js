const scriptURL = "https://script.google.com/macros/s/AKfycbyhqPSVCfAJCUQ1eSs_fNVbA7A7WmduEMTpPGZel-KOEvzfWbMH6IzLfpTlKnfBSVJvkA/exec";

function signup() {
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  const data = {
    name: document.getElementById("name").value.trim(),
    father: document.getElementById("father").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    email: document.getElementById("email").value.trim(),
    course: document.getElementById("course").value,
    password: password
  };

  if (
    !data.name ||
    !data.father ||
    !data.mobile ||
    !data.email ||
    !data.course ||
    !data.password
  ) {
    alert("Please fill all fields");
    return;
  }

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(data)
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Server response was not OK");
      }
      return response.json();
    })
    .then((result) => {
      console.log(result);

      if (result.status === "success") {
        alert("Registration Successful");
        window.location.href = "login.html";
      } else if (result.status === "exists") {
        alert("Mobile Number Already Registered");
      } else {
        alert("Registration Failed: " + (result.message || "Unknown error"));
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Connection Error or Invalid Response from Google Apps Script");
    });
}