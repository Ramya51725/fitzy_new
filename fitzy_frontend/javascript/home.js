import API_BASE_URL from "./config.js";

const dayContainer = document.getElementById("dayContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let progressState = {
    currentMonth: 1,
    currentWeek: 1,
    currentDay: 1,
    completedMonths: 0,
    completedDays: 0
};

document.addEventListener("DOMContentLoaded", async () => {
    await initProgress();
    setCategoryName();
    updateMonthTitles(progressState.currentMonth);
    handleLevels(progressState.currentMonth);
    handleWeeks(progressState.currentMonth, progressState.currentWeek);
    renderDays(progressState.currentDay);
    typeEffect();
});

async function initProgress() {
    const userId = localStorage.getItem("user_id");
    const categoryId = localStorage.getItem("category_id");

    if (!userId || !categoryId) {
        alert("Please login again.");
        window.location.href = "sign_in.html";
        return;
    }

    // 🔥 Sync with Backend
    try {
        const res = await fetch(`${API_BASE_URL}/progress/${userId}/fitzy/${categoryId}`);
        if (res.ok) {
            const pData = await res.json();
            progressState = {
                currentMonth: pData.current_month || 1,
                currentWeek: pData.current_week || 1,
                currentDay: pData.current_day || 1,
                completedMonths: pData.completed_months || 0,
                completedDays: pData.completed_days || 0,
                lastCompletedDate: pData.last_completed_date || null
            };
            localStorage.setItem("fitzy_progress", JSON.stringify(progressState));
            console.log("Dashboard synced with Supabase ✅");
        } else if (res.status === 404) {
            // No progress found, ensure localStorage has defaults
            const stored = localStorage.getItem("fitzy_progress");
            if (stored) {
                progressState = JSON.parse(stored);
            } else {
                localStorage.setItem("fitzy_progress", JSON.stringify(progressState));
            }
        }
    } catch (err) {
        console.error("Dashboard Sync Error:", err);
        const stored = localStorage.getItem("fitzy_progress");
        if (stored) {
            progressState = JSON.parse(stored);
            alert("Unable to sync with cloud. Using locally saved progress.");
        } else {
            alert("Unable to load progress. Please check your internet connection and make sure the server is running.");
        }
    }

    console.log("Progress State Loaded ✅", progressState);
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
    // Ensure currentMonth is a number
    currentMonth = Number(currentMonth) || 1;
    console.log("handleLevels called for currentMonth:", currentMonth);

    const beginner = document.getElementById("beginnerCard");
    const intermediate = document.getElementById("intermediateCard");
    const advanced = document.getElementById("advancedCard");
    const expert = document.getElementById("expertCard");

    const cards = [
        { el: beginner, start: 1, end: 2, name: "Beginner" },
        { el: intermediate, start: 3, end: 4, name: "Intermediate" },
        { el: advanced, start: 5, end: 6, name: "Advanced" },
        { el: expert, start: 7, end: 8, name: "Expert" }
    ];

    cards.forEach(card => {
        if (!card.el) return;
        const startBtn = card.el.querySelector(".week1") || card.el.querySelector(".start-btn");

        card.el.classList.remove("active-level", "completed-level", "unlocked", "locked");
        card.el.style.pointerEvents = "none";

        const statusEl = card.el.querySelector(".status");

        if (currentMonth >= card.start) {
            // UNLOCKED (Either Active or Completed)
            card.el.classList.add("unlocked");
            card.el.style.pointerEvents = "auto";

            // Remove lock icon
            const lockIcon = card.el.querySelector(".lock-overlay");
            if (lockIcon) lockIcon.style.display = "none";

            if (currentMonth >= card.start && currentMonth <= card.end) {
                // ACTIVE
                card.el.classList.add("active-level");
                if (statusEl) statusEl.textContent = "🔥 In Progress";
                if (startBtn) {
                    startBtn.innerText = "Start";
                    startBtn.onclick = () => {
                        window.location.href = `../levels/workout.html`;
                    };
                }
            } else if (currentMonth > card.end) {
                // COMPLETED
                card.el.classList.add("completed-level");
                if (statusEl) statusEl.textContent = "✅ Completed";
                if (startBtn) {
                    startBtn.innerText = "Finished";
                    startBtn.classList.add("finished-btn");
                    startBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    };
                }
                // Disable navigation on the entire card for completed levels
                card.el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                };
                card.el.style.cursor = "default";
            }
        } else {
            // LOCKED
            card.el.classList.add("locked");
            if (statusEl) statusEl.textContent = "🔒 Locked";

            // Add lock icon overlay if missing
            let lockIcon = card.el.querySelector(".lock-overlay");
            if (!lockIcon) {
                lockIcon = document.createElement("div");
                lockIcon.className = "lock-overlay";
                lockIcon.innerHTML = '<i class="fa-solid fa-lock"></i>';
                card.el.appendChild(lockIcon);
            } else {
                lockIcon.style.display = "block";
            }
        }
    });
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
    if (!dayContainer) return;
    dayContainer.innerHTML = "";

    const today = new Date().toISOString().split('T')[0];
    const lastDone = progressState.lastCompletedDate ? new Date(progressState.lastCompletedDate).toISOString().split('T')[0] : null;
    const finishedToday = (lastDone === today);

    for (let i = 1; i <= 7; i++) {
        // Wrap each day in a container for the arrow marker
        const dayWrap = document.createElement("div");
        dayWrap.className = "day-wrap";

        // Arrow marker for current day
        if (i === Number(currentDay)) {
            const arrow = document.createElement("div");
            arrow.className = "day-arrow";
            arrow.innerHTML = "▼";
            dayWrap.appendChild(arrow);
        }

        const btn = document.createElement("button");
        btn.classList.add("day-btn");

        if (i < currentDay) {
            btn.classList.add("day-completed");
            btn.innerHTML = `<span class="day-check">✓</span> Day ${i}`;
        } else if (i === Number(currentDay)) {
            if (finishedToday) {
                btn.classList.add("disabled", "wait-tomorrow");
                btn.innerHTML = `Day ${i} (Locked)`;
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    alert(`Exercise completed for today. Day ${i} will unlock tomorrow.`);
                });
            } else {
                btn.classList.add("active");
                btn.innerHTML = `<span class="day-fire">🔥</span> Day ${i}`;
                btn.addEventListener("click", () => {
                    localStorage.setItem("selected_day", i);
                    window.location.href = `../levels/workout.html`;
                });
            }
        } else {
            btn.classList.add("disabled");
            btn.disabled = true;
            btn.innerHTML = `Day ${i}`;
        }

        dayWrap.appendChild(btn);
        dayContainer.appendChild(dayWrap);
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
    const categoryId = Number(localStorage.getItem("category_id"));
    const categorySpan = document.getElementById("categoryName");
    const categoryDisplay = document.getElementById("categoryDisplay");
    const levelDisplay = document.getElementById("levelDisplay");

    let categoryText = "Unknown";
    if (categoryId === 1) categoryText = "Underweight";
    else if (categoryId === 2) categoryText = "Normal weight";
    else if (categoryId === 3) categoryText = "Overweight";

    if (categorySpan) categorySpan.innerText = categoryText;
    if (categoryDisplay) categoryDisplay.innerText = categoryText;

    // 🔥 Dynamic Level Name
    if (levelDisplay) {
        let levelText = "Beginner";
        const m = Number(progressState.currentMonth) || 1;
        if (m >= 7) levelText = "Expert";
        else if (m >= 5) levelText = "Advanced";
        else if (m >= 3) levelText = "Intermediate";
        levelDisplay.innerText = levelText;
    }
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
        quoteElement.innerHTML = quotes[quoteIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 40);
    } else {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        setTimeout(typeEffect, 500);
    }
}
