import API_BASE_URL from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  const categoryId = Number(localStorage.getItem("category_id"));
  const userId = Number(localStorage.getItem("user_id"));

  if (!userId || !categoryId) {
    alert("Please login again.");
    window.location.href = "../html/sign_in.html";
    return;
  }

  const API_URL = `${API_BASE_URL}/veg/diet/by-category-day`;
  const PROGRESS_API = `${API_BASE_URL}/progress`;

  // 🔥 Update Header with Current Month
  const progressData = JSON.parse(localStorage.getItem("fitzy_progress"));
  const currentMonth = progressData ? progressData.currentMonth : 1;
  const dietHeader = document.getElementById("dietTypeHeader");
  if (dietHeader) {
    dietHeader.innerText = `Veg - Month ${currentMonth}`;
  }

  const dayContainer = document.getElementById("dayButtons");
  const completedBtn = document.querySelector(".Completed-btn");

  let activeBtn = null;
  let selectedDay = 1;
  let maxCompletedDay = 0;
  let finishedToday = false;
  const dayButtons = [];

  for (let day = 1; day <= 30; day++) {
    const btn = document.createElement("div");
    btn.className = "diet_box1 disabled";
    btn.innerText = `Day ${day}`;

    btn.onclick = () => {
      if (btn.classList.contains("disabled")) {
        if (finishedToday && day === maxCompletedDay + 1) {
          alert(`Diet completed for today. Day ${day} will unlock tomorrow.`);
        }
        return;
      }
      if (activeBtn) activeBtn.classList.remove("active");

      btn.classList.add("active");
      activeBtn = btn;
      selectedDay = day;
      loadDiet(day);
    };

    dayButtons.push(btn);
    dayContainer.appendChild(btn);
  }

  dayButtons[0].classList.remove("disabled");
  dayButtons[0].classList.add("active");
  activeBtn = dayButtons[0];

  function loadDiet(day) {
    fetch(`${API_URL}?category_id=${categoryId}&day=${day}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          setText("No diet available");
          return;
        }

        const diet = data[0];
        document.getElementById("breakfast").innerText = diet.breakfast;
        document.getElementById("lunch").innerText = diet.lunch;
        document.getElementById("dinner").innerText = diet.dinner;
      })
      .catch(() => alert("Error loading diet"));
  }

  function setText(msg) {
    document.getElementById("breakfast").innerText = msg;
    document.getElementById("lunch").innerText = msg;
    document.getElementById("dinner").innerText = msg;
  }

  completedBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${PROGRESS_API}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          day: selectedDay
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Could not save progress");
      }

      markGreen(selectedDay, false); // Don't unlock the next one for today!

      // Check if 30 days are completed
      if (selectedDay === 30) {
        if (confirm("Congratulations! You have completed the 30-day diet plan. Would you like to reset for a new start?")) {
          await resetDietProgress();
          return;
        }
      }

      // 🔥 Block auto-select next day (Wait until tomorrow)
      const nextDayIndex = selectedDay;
      if (dayButtons[nextDayIndex]) {
        dayButtons[nextDayIndex].classList.add("disabled");
        finishedToday = true;
        maxCompletedDay = Math.max(maxCompletedDay, selectedDay);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });

  async function resetDietProgress() {
    try {
      const res = await fetch(`${PROGRESS_API}/reset/${userId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Reset failed");

      // Clear UI
      dayButtons.forEach(btn => {
        btn.classList.remove("completed");
        if (btn.innerText !== "Day 1") {
          btn.classList.add("disabled");
        }
      });

      // Reset to Day 1
      dayButtons[0].click();
      alert("Progress reset. Let's start a fresh cycle! 🔥");

    } catch (err) {
      console.error(err);
      alert("Failed to reset progress. Please try again.");
    }
  }

  async function loadProgress() {
    try {
      const res = await fetch(`${PROGRESS_API}/${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      finishedToday = false;
      maxCompletedDay = 0;
      const today = new Date().toISOString().split('T')[0];

      data.forEach(p => {
        if (p.status === "completed") {
          const isToday = p.updated_at && p.updated_at.split('T')[0] === today;
          markGreen(p.day, !isToday);
          maxCompletedDay = Math.max(maxCompletedDay, p.day);
          if (isToday) finishedToday = true;
        }
      });

      const nextBtn = dayButtons[maxCompletedDay];
      if (nextBtn) {
        if (!finishedToday) {
          nextBtn.classList.remove("disabled");
          nextBtn.click();
        } else {
          nextBtn.classList.add("disabled");
        }
      }

    } catch (err) {
      console.error(err);
    }
  }

  function markGreen(day, unlockNext = true) {
    const btn = dayButtons[day - 1];
    if (!btn) return;

    btn.classList.add("completed");
    btn.classList.remove("disabled");

    if (unlockNext) {
      const nextBtn = dayButtons[day];
      if (nextBtn) nextBtn.classList.remove("disabled");
    }
  }

  loadDiet(1);
  loadProgress();

});





// import API_BASE_URL from "./config.js";

// document.addEventListener("DOMContentLoaded", () => {

//   const token = localStorage.getItem("token");
//   const categoryId = Number(localStorage.getItem("category_id"));
//   const userId = Number(localStorage.getItem("user_id"));

//   if (!token || !userId || !categoryId) {
//     alert("Session expired. Please login again.");
//     window.location.href = "../html/sign_in.html";
//     return;
//   }

//   const API_URL = `${API_BASE_URL}/veg/diet/by-category-day`;
//   const PROGRESS_API = `${API_BASE_URL}/progress`;

//   const dayContainer = document.getElementById("dayButtons");
//   const completedBtn = document.querySelector(".Completed-btn");

//   let activeBtn = null;
//   let selectedDay = 1;
//   const dayButtons = [];

//   for (let day = 1; day <= 30; day++) {
//     const btn = document.createElement("div");
//     btn.className = "diet_box1 disabled";
//     btn.innerText = `Day ${day}`;

//     btn.onclick = () => {
//       if (btn.classList.contains("disabled")) return;
//       if (activeBtn) activeBtn.classList.remove("active");

//       btn.classList.add("active");
//       activeBtn = btn;
//       selectedDay = day;
//       loadDiet(day);
//     };

//     dayButtons.push(btn);
//     dayContainer.appendChild(btn);
//   }

//   dayButtons[0].classList.remove("disabled");
//   dayButtons[0].classList.add("active");
//   activeBtn = dayButtons[0];

//   function loadDiet(day) {
//     fetch(`${API_URL}?category_id=${categoryId}&day=${day}`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (!data || data.length === 0) {
//           setText("No diet available");
//           return;
//         }

//         const diet = data[0];
//         document.getElementById("breakfast").innerText = diet.breakfast;
//         document.getElementById("lunch").innerText = diet.lunch;
//         document.getElementById("dinner").innerText = diet.dinner;
//       })
//       .catch(() => alert("Error loading diet"));
//   }

//   function setText(msg) {
//     document.getElementById("breakfast").innerText = msg;
//     document.getElementById("lunch").innerText = msg;
//     document.getElementById("dinner").innerText = msg;
//   }

//   completedBtn.addEventListener("click", async () => {
//     try {
//       const res = await fetch(`${PROGRESS_API}/complete`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           user_id: userId,
//           day: selectedDay
//         })
//       });

//       if (!res.ok) throw new Error();
//       markGreen(selectedDay);

//     } catch {
//       alert("Could not save progress");
//     }
//   });

//   async function loadProgress() {
//     try {
//       const res = await fetch(`${PROGRESS_API}/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       if (!res.ok) return;

//       const data = await res.json();
//       let maxCompletedDay = 0;

//       data.forEach(p => {
//         if (p.status === "completed") {
//           markGreen(p.day);
//           maxCompletedDay = Math.max(maxCompletedDay, p.day);
//         }
//       });

//       const nextBtn = dayButtons[maxCompletedDay];
//       if (nextBtn) nextBtn.classList.remove("disabled");

//     } catch (err) {
//       console.error(err);
//     }
//   }

//   function markGreen(day) {
//     const btn = dayButtons[day - 1];
//     if (!btn) return;

//     btn.classList.add("completed");
//     btn.classList.remove("disabled");

//     const nextBtn = dayButtons[day];
//     if (nextBtn) nextBtn.classList.remove("disabled");
//   }

//   loadDiet(1);
//   loadProgress();

// });




