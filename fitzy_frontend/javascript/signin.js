import API_BASE_URL from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("signinForm");
  const messageEl = document.getElementById("message");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    messageEl.innerText = "";

    const formData = new FormData(form);

    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password");

    if (!email || !password) {
      messageEl.innerText = "Email and password are required";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
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
        if (Array.isArray(data.detail)) {
          const errorMsg = data.detail.map(err => err.msg).join(", ");
          throw new Error(errorMsg);
        }
        throw new Error(data.detail || "Invalid email or password");
      }

      localStorage.clear();

      const userId = data.user_id;
      const categoryId = data.category_id;
      localStorage.setItem("user_id", userId);
      localStorage.setItem("category_id", categoryId);
      localStorage.setItem("name", data.name || "");
      localStorage.setItem("level", "level1");

      try {
        const progressRes = await fetch(`${API_BASE_URL}/exercise-progress/${userId}/fitzy/${categoryId}`);
        if (progressRes.ok) {
          const pData = await progressRes.json();
          const progressState = {
            currentMonth: pData.current_month,
            currentWeek: pData.current_week,
            currentDay: pData.current_day,
            completedMonths: pData.completed_months,
            completedDays: pData.completed_days
          };
          localStorage.setItem("fitzy_progress", JSON.stringify(progressState));
        } else if (progressRes.status === 404) {

          await fetch(`${API_BASE_URL}/exercise-progress/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: Number(userId),
              level: "fitzy",
              category_id: Number(categoryId)
            })
          });

          const freshProgress = {
            currentMonth: 1,
            currentWeek: 1,
            currentDay: 1,
            completedMonths: 0,
            completedDays: 0
          };
          localStorage.setItem("fitzy_progress", JSON.stringify(freshProgress));
        }
      } catch (pErr) {
        console.error("Progress Sync Error:", pErr);
        alert("Login successful, but was unable to sync your progress from the cloud. You can still proceed.");
      }


      if (email === "admin@gmail.com") {
        console.log("Redirecting to Admin Dashboard...");
        window.location.href = "admin.html";
      } else {
        console.log("Redirecting to Beginner Landing...");
        window.location.href = "landing/beginner.html";
      }

    } catch (err) {
      console.error("Login Error Details:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        messageEl.innerText = "Cannot connect to server. Please check your internet connection.";
      } else {
        messageEl.innerText = err.message || "Invalid email or password";
      }
    }
  });

});