import API_BASE_URL from "./config.js";

const dayContainer = document.getElementById("dayContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let globalCurrentMonth = 1;

const userId = localStorage.getItem("user_id");
let categoryId = null;
let level = "level1";

if (!userId) {
    alert("Please login first");
    window.location.href = "../sign_in.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchActiveState();
    loadProgress();
    setCategoryName();
    typeEffect();
});

async function fetchActiveState() {
    try {
        const res = await fetch(`${API_BASE_URL}/user-state/${userId}`);
        const state = await res.json();
        categoryId = state.active_category_id;
        level = state.active_level || "level1";
        console.log("Active State Loaded:", { categoryId, level });
    } catch (err) {
        console.error("Fetch State Error:", err);
        categoryId = 1; // fallback
    }
}

async function loadProgress() {

    try {
        if (!userId || !level || !categoryId) {
            console.error("Missing required data for progress fetch");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/progress/${userId}/${level}/${categoryId}`
        );

        if (!response.ok) {
            console.error("Progress not found");
            renderDays(1);
            updateMonthTitles(1);
            handleLevels(1);
            handleWeeks(1, 1);
            return;
        }

        const data = await response.json();

        const currentDay = data.current_day || 1;
        const currentMonth = data.current_month || 1;
        const currentWeek = data.current_week || 1;

        globalCurrentMonth = currentMonth;

        updateMonthTitles(currentMonth);
        handleLevels(currentMonth);
        handleWeeks(currentMonth, currentWeek);
        renderDays(currentDay);

    } catch (error) {
        console.error("Progress fetch error:", error);
        renderDays(1);
        updateMonthTitles(1);
        handleLevels(1);
        handleWeeks(1, 1);
    }
}


/* ================= MONTH TITLE LOGIC ================= */

function updateMonthTitles(currentMonth) {

    const monthTitle1 = document.getElementById("monthTitle1");
    const monthTitle2 = document.getElementById("monthTitle2");

    if (!monthTitle1 || !monthTitle2) return;

    let startMonth;

    if (currentMonth <= 2) startMonth = 1;
    else if (currentMonth <= 4) startMonth = 3;
    else if (currentMonth <= 6) startMonth = 5;
    else startMonth = 7;

    monthTitle1.innerText = "Month " + startMonth;
    monthTitle2.innerText = "Month " + (startMonth + 1);
}

/* ================= HANDLE LEVEL LOGIC ================= */

function handleLevels(currentMonth) {

    const beginner = document.getElementById("beginnerCard");
    const intermediate = document.getElementById("intermediateCard");
    const advanced = document.getElementById("advancedCard");
    const expert = document.getElementById("expertCard");

    document.querySelectorAll(".foundation_week").forEach(card => {
        card.classList.remove("active-level", "completed-level", "unlocked");
        card.classList.add("locked");
        card.style.pointerEvents = "none";
    });

    if (currentMonth <= 2) {
        beginner.classList.remove("locked");
        beginner.classList.add("active-level", "unlocked");
        beginner.style.pointerEvents = "auto";
    }

    if (currentMonth >= 3 && currentMonth <= 4) {
        intermediate.classList.remove("locked");
        intermediate.classList.add("active-level", "unlocked");
        intermediate.style.pointerEvents = "auto";
    }

    if (currentMonth >= 5 && currentMonth <= 6) {
        advanced.classList.remove("locked");
        advanced.classList.add("active-level", "unlocked");
        advanced.style.pointerEvents = "auto";
    }

    if (currentMonth >= 7) {
        expert.classList.remove("locked");
        expert.classList.add("active-level", "unlocked");
        expert.style.pointerEvents = "auto";
    }
}

/* ================= HANDLE WEEKS ================= */

function handleWeeks(currentMonth, currentWeek) {

    const levelMonth = ((currentMonth - 1) % 2) + 1;
    const totalWeek = ((levelMonth - 1) * 4) + currentWeek;

    const weeks = [
        "m1w1", "m1w2", "m1w3", "m1w4",
        "m2w1", "m2w2", "m2w3", "m2w4"
    ];

    weeks.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.classList.remove("completed", "active");

        if (index < totalWeek - 1) {
            el.classList.add("completed");
        } else if (index === totalWeek - 1) {
            el.classList.add("active");
        }
    });
}

/* ================= DAY BUTTONS ================= */

function renderDays(currentDay) {

    dayContainer.innerHTML = "";

    for (let i = 1; i <= 7; i++) {

        const btn = document.createElement("button");
        btn.classList.add("day-btn");
        btn.innerText = "Day " + i;

        if (i < currentDay) {
            btn.classList.add("day-completed");
        }

        btn.addEventListener("click", async () => {
            try {
                // Update selected day in database before moving
                await fetch(`${API_BASE_URL}/user-state/update/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ selected_day: i })
                });
                window.location.href = `../levels/${level}.html`;
            } catch (err) {
                console.error("Update State Error:", err);
                window.location.href = `../levels/${level}.html`; // fallback redirect
            }
        });

        dayContainer.appendChild(btn);
    }
}

/* ================= SCROLL ================= */

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        dayContainer.scrollBy({ left: 100, behavior: "smooth" });
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        dayContainer.scrollBy({ left: -100, behavior: "smooth" });
    });
}

/* ================= CATEGORY NAME ================= */

function setCategoryName() {
    const categorySpan = document.getElementById("categoryName");

    if (!categorySpan) return;

    if (categoryId === 1) categorySpan.innerText = "Underweight";
    else if (categoryId === 2) categorySpan.innerText = "Normal weight";
    else if (categoryId === 3) categorySpan.innerText = "Overweight";
    else categorySpan.innerText = "Unknown";
}

/* ================= TYPING EFFECT ================= */

const quotes = [
    "Stronger Every Day",
    "Lift. Sweat. Repeat.",
    "Progress Not Perfection",
    "Push Past Limits",
    "Discipline Beats Motivation"
];

let quoteIndex = 0;
let charIndex = 0;
const speed = 80;
const quoteElement = document.getElementById("quote");

function typeEffect() {
    if (!quoteElement) return;

    if (charIndex < quotes[quoteIndex].length) {
        quoteElement.innerHTML += quotes[quoteIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, speed);
    } else {
        setTimeout(eraseEffect, 1500);
    }
}

function eraseEffect() {
    if (charIndex > 0) {
        quoteElement.innerHTML =
            quotes[quoteIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 40);
    } else {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        setTimeout(typeEffect, 500);
    }
}


// // Create 7 buttons

// const currentDayText = document.getElementById("currentDay");

// const dayContainer = document.getElementById("dayContainer");
// const totalDays = 7;

// for (let i = 1; i <= totalDays; i++) {

//     const btn = document.createElement("button");
//     btn.classList.add("day-btn");
//     btn.textContent = "Day " + i;

//     btn.addEventListener("click", () => {

//         // Remove active class
//         document.querySelectorAll(".day-btn")
//             .forEach(b => b.classList.remove("active"));

//         btn.classList.add("active");

//         // 🔥 SAVE SELECTED DAY
//         localStorage.setItem("selected_day", i);

//         // 🔥 Navigate
//         window.location.href = "../levels/level1.html";
//     });

//     dayContainer.appendChild(btn);
// }



// const userId = localStorage.getItem("user_id")
// const level = "Beginner"

// async function loadProgress() {

//     const userId = localStorage.getItem("user_id")
//     const level = "Beginner"

//     if (!userId) return

//     try {

//         const response = await fetch(
//             `http://localhost:8000/progress/${userId}/${level}`
//         )

//         if (!response.ok) return

//         const data = await response.json()
//         const completedDays = data.completed_days || 0

//         const container = document.getElementById("dayContainer")
//         container.innerHTML = ""

//         for (let i = 1; i <= 7; i++) {

//             const btn = document.createElement("button")
//             btn.classList.add("day-btn")
//             btn.innerText = "Day " + i

//             // ✅ Completed days
//             if (i <= completedDays) {
//                 btn.classList.add("day-completed")
//             }

//             // 🔒 Lock future days
//             if (i > completedDays + 1) {
//                 btn.disabled = true
//                 btn.classList.add("day-disabled")
//             }

//             // 🔥 Click event
//             btn.addEventListener("click", () => {
//                 localStorage.setItem("selected_day", i)
//                 window.location.href = "../levels/level1.html"
//             })

//             container.appendChild(btn)
//         }

//     } catch (error) {
//         console.error("Progress fetch error:", error)
//     }

//     const completedDays = data.completed_days || 0;
//     updateWeekProgress(completedDays);


// }

// loadProgress()


// function updateWeekProgress(completedDays) {

//   const totalWeeks = Math.floor(completedDays / 7);
//   const currentWeekIndex = Math.floor(completedDays / 7);

//   const weeks = [
//     "m1w1","m1w2","m1w3","m1w4",
//     "m2w1","m2w2","m2w3","m2w4"
//   ];

//   // Reset all
//   weeks.forEach(id => {
//     const el = document.getElementById(id);
//     if (el) el.classList.remove("completed", "active");
//   });

//   weeks.forEach((id, index) => {
//     const el = document.getElementById(id);
//     if (!el) return;

//     if (index < totalWeeks) {
//       el.classList.add("completed");
//     }
//     else if (index === currentWeekIndex) {
//       el.classList.add("active");
//     }
//   });
// }





// // Scroll only
// nextBtn.addEventListener("click", () => {
//     dayContainer.scrollBy({
//         left: 100,
//         behavior: "smooth"
//     });
// });

// prevBtn.addEventListener("click", () => {
//     dayContainer.scrollBy({
//         left: -100,
//         behavior: "smooth"
//     });
// });

// const quotes = [
//   "Stay strong always.",
//   "Push beyond limits.",
//   "Never skip workouts.",
//   "Consistency builds success.",
//   "Progress over perfection.",
//   "Train with purpose.",
//   "Discipline beats motivation.",
//   "Earn your results.",
//   "Focus. Work. Win.",
//   "Stronger every day."
// ];


// const typingText = document.getElementById("typing-text");

// let quoteIndex = 0;
// let charIndex = 0;

// function typeQuote() {

//   if (charIndex < quotes[quoteIndex].length) {
//     typingText.textContent += quotes[quoteIndex].charAt(charIndex);
//     charIndex++;
//     setTimeout(typeQuote, 120);
//   } 
//   else {
//     // Wait 2 seconds after full quote
//     setTimeout(() => {
//       quoteIndex = (quoteIndex + 1) % quotes.length;
//       typingText.textContent = "";
//       charIndex = 0;
//       typeQuote();
//     }, 1000);
//   }
// }


// function eraseQuote() {

//   if (charIndex > 0) {
//     typingText.textContent = quotes[quoteIndex].substring(0, charIndex - 1);
//     charIndex--;
//     setTimeout(eraseQuote, 30);
//   } else {
//     quoteIndex = (quoteIndex + 1) % quotes.length;
//     setTimeout(typeQuote, 300);
//   }
// }

// typeQuote();


// async function loadHomeProgress() {

//   const userId = localStorage.getItem("user_id");
//   const level = "level1";

//   const res = await fetch(`${API_BASE_URL}/progress/${userId}/${level}`);
//   const progress = await res.json();

//   const completedDays = progress.completed_days;

//   for (let i = 1; i <= completedDays; i++) {
//     const dayBtn = document.getElementById(`day${i}`);
//     if (dayBtn) {
//       dayBtn.classList.add("day-completed");
//     }
//   }
// }

// loadHomeProgress();


document.addEventListener("DOMContentLoaded", () => {

    const categoryId = Number(localStorage.getItem("category_id"));
    const categorySpan = document.getElementById("categoryName");

    if (!categoryId) {
        alert("Please login again.");
        window.location.href = "../sign_in.html";
        return;
    }

    if (!categorySpan) return;

    if (categoryId === 1) {
        categorySpan.innerText = "Underweight";
    } else if (categoryId === 2) {
        categorySpan.innerText = "Normal weight";
    } else if (categoryId === 3) {
        categorySpan.innerText = "Overweight";
    } else {
        categorySpan.innerText = "Unknown";
    }

    loadProgress();
    typeEffect();

});




// document.addEventListener("DOMContentLoaded", () => {

//   const token = localStorage.getItem("token");
//   const categoryId = Number(localStorage.getItem("category_id"));
//   const categorySpan = document.getElementById("categoryName");

//   if (!token || !categoryId) {
//     alert("Session expired. Please login again.");
//     window.location.href = "../sign_in.html";
//     return;
//   }

//   if (!categorySpan) return;

//   if (categoryId === 1) {
//     categorySpan.innerText = "Underweight";
//   } else if (categoryId === 2) {
//     categorySpan.innerText = "Normal weight";
//   } else if (categoryId === 3) {
//     categorySpan.innerText = "Overweight";
//   } else {
//     categorySpan.innerText = "Unknown";
//   }

// });







