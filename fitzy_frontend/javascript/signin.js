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

      const data = await res.json();

      if (!res.ok) {
        // ✅ Handle FastAPI validation errors properly
        if (Array.isArray(data.detail)) {
          const errorMsg = data.detail.map(err => err.msg).join(", ");
          throw new Error(errorMsg);
        }
        throw new Error(data.detail || "Invalid email or password");
      }

      // ✅ Clear old storage
      localStorage.clear();

      // ✅ Store required data (NO TOKEN)
      const userId = data.user_id;
      const categoryId = data.category_id;
      localStorage.setItem("user_id", userId);
      localStorage.setItem("category_id", categoryId);
      localStorage.setItem("name", data.name || "");
      localStorage.setItem("level", "level1");

      // 🔥 FETCH PROGRESS FROM BACKEND
      try {
        const progressRes = await fetch(`${API_BASE_URL}/progress/${userId}/fitzy/${categoryId}`);
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
          console.log("Progress synced from Supabase 🔋");
        } else if (progressRes.status === 404) {
          // New user or no progress found -> create initial record
          console.log("No progress found, initiating backend progress...");
          await fetch(`${API_BASE_URL}/progress/complete-day`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: Number(userId), level: "fitzy", category_id: Number(categoryId) })
          });
        }
      } catch (pErr) {
        console.error("Progress Sync Error:", pErr);
        alert("Login successful, but was unable to sync your progress from the cloud. You can still proceed.");
      }

      // ✅ Redirect
      if (email === "admin@gmail.com") {
        window.location.href = "../html/admin.html";
      } else {
        window.location.href = "../html/landing/beginner.html";
      }

    } catch (err) {
      console.error("Login Error Details:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        messageEl.innerText = "Cannot connect to server. Make sure backend is running on http://127.0.0.1:8000";
      } else {
        messageEl.innerText = err.message || "Login failed. Try again.";
      }
    }
  });

});