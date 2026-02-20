import API_BASE_URL from "./config.js";

const form = document.getElementById("signupForm");

function clearErrors() {
  document.querySelectorAll(".error").forEach(el => el.innerText = "");
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors();

  const formData = new FormData(form);

  const userData = {
    name: formData.get("name")?.trim(),
    age: Number(formData.get("age")),
    height: Number(formData.get("height")),
    weight: Number(formData.get("weight")),
    email: formData.get("email")?.trim().toLowerCase(),
    password: formData.get("password"),
    gender: formData.get("gender")
  };

  let isValid = true;

  if (!userData.name) {
    document.getElementById("name_error").innerText = "Name is required";
    isValid = false;
  }

  if (!userData.age || userData.age <= 0) {
    document.getElementById("age_error").innerText = "Enter valid age";
    isValid = false;
  }

  if (!userData.height || userData.height <= 0) {
    document.getElementById("height_error").innerText = "Enter valid height";
    isValid = false;
  }

  if (!userData.weight || userData.weight <= 0 || userData.weight > 300) {
    document.getElementById("weight_error").innerText = "Enter valid weight";
    isValid = false;
  }

  if (!userData.email) {
    document.getElementById("mail_error").innerText = "Email is required";
    isValid = false;
  }

  if (!userData.password || userData.password.length < 8) {
    document.getElementById("pass_error").innerText =
      "Password must be at least 8 characters";
    isValid = false;
  }

  if (!formData.get("confirm") || formData.get("confirm") !== userData.password) {
    document.getElementById("confirm_error").innerText = "Passwords do not match";
    isValid = false;
  }

  if (!userData.gender) {
    alert("Please select gender");
    isValid = false;
  }

  if (!isValid) return;

  try {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Server returned non-JSON response: ${text || res.statusText}`);
    }

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    // ✅ Clear any old user data
    localStorage.clear();

    window.location.href = "sign_in.html";

  } catch (err) {
    console.error(err);

    if (err.message.includes("Email")) {
      document.getElementById("mail_error").innerText = "Email already exists";
    } else {
      alert("Signup failed: " + err.message);
    }
  }
});
