import API_BASE_URL from "./config.js";

function getLevelFromMonth(month) {
  if (month <= 2) return "beginner";
  if (month <= 4) return "intermediate";
  if (month <= 6) return "advanced";
  return "expert";
}

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      localStorage.clear();

      const userId = data.user_id;
      const categoryId = data.category_id;

      localStorage.setItem("user_id", userId);
      localStorage.setItem("category_id", categoryId);
      localStorage.setItem("name", data.name || "");

      let level = "beginner";

      const progressRes = await fetch(
        `${API_BASE_URL}/exercise-progress/${userId}/${level}/${categoryId}`
      );

      if (progressRes.ok) {
        const pData = await progressRes.json();

        const progressState = {
          currentMonth: pData.current_month,
          currentWeek: pData.current_week,
          currentDay: pData.current_day,
          completedMonths: pData.completed_months,
          completedDays: pData.completed_days
        };

        localStorage.setItem("progress_state", JSON.stringify(progressState));

        const correctLevel = getLevelFromMonth(progressState.currentMonth);
        localStorage.setItem("level", correctLevel);

      } else if (progressRes.status === 404) {

        const initRes = await fetch(`${API_BASE_URL}/exercise-progress/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: Number(userId),
            level: "beginner",
            category_id: Number(categoryId)
          })
        });

        const initData = await initRes.json();

        localStorage.setItem("progress_state", JSON.stringify({
          currentMonth: initData.current_month,
          currentWeek: initData.current_week,
          currentDay: initData.current_day,
          completedMonths: initData.completed_months,
          completedDays: initData.completed_days
        }));

        localStorage.setItem("level", "beginner");
      }

      if (email === "admin@gmail.com") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "landing/beginner.html";
      }

    } catch (err) {
      console.error("Login Error:", err);
      messageEl.innerText = err.message || "Login failed";
    }
  });

});