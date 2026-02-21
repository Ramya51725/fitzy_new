import API_BASE_URL from "../config.js";

/* =====================================================
   🔥 BASIC DATA
===================================================== */

const userId = localStorage.getItem("user_id");
const categoryId = localStorage.getItem("category_id");
const headerDay = document.getElementById("currentDayHeader");

if (!userId) {
    alert("Login required");
    window.location.href = "../../html/sign_in.html";
}

const container = document.getElementById("exerciseContainer");
const detailContainer = document.getElementById("exerciseDetail");
const completeBtn = document.getElementById("completeDayBtn");

let progressState = {
    currentMonth: 1,
    currentWeek: 1,
    currentDay: 1,
    completedMonths: 0,
    completedDays: 0
};
let currentExercise = null;
let completedCount = 0;
let level = "level1"; // Default, will be updated dynamically

/* =====================================================
   🔥 PROGRESS MANAGEMENT (Sync with Supabase)
===================================================== */

async function loadProgress() {
    try {
        // 🔥 1. Try fetching progress from the backend first
        const res = await fetch(`${API_BASE_URL}/exercise-progress/${userId}/fitzy/${categoryId}`);

        if (res.ok) {
            const data = await res.json();
            // Map backend field names → frontend progressState
            progressState = {
                currentMonth: Number(data.current_month) || 1,
                currentWeek: Number(data.current_week) || 1,
                currentDay: Number(data.current_day) || 1,
                completedMonths: Number(data.completed_months) || 0,
                completedDays: Number(data.completed_days) || 0
            };
            // Keep localStorage in sync
            localStorage.setItem("fitzy_progress", JSON.stringify(progressState));
            console.log("Progress loaded from backend ✅", progressState);

        } else if (res.status === 404) {
            // 🔥 2. No backend record → check localStorage
            console.warn("No backend progress found (404). Checking localStorage...");
            const stored = localStorage.getItem("fitzy_progress");

            if (stored) {
                progressState = JSON.parse(stored);
                console.log("Progress loaded from localStorage 📦", progressState);
            } else {
                // 🔥 3. Brand-new user → init a fresh record on the backend
                console.log("No local progress either → initialising new backend record...");
                await fetch(`${API_BASE_URL}/exercise-progress/init`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: Number(userId),
                        level: "fitzy",
                        category_id: Number(categoryId)
                    })
                });
                // progressState stays at default (Month 1, Week 1, Day 1)
            }
        } else {
            console.error("Unexpected response while fetching progress:", res.status);
        }
    } catch (err) {
        // Network error → fall back to localStorage silently
        console.error("Cloud fetch error, falling back to localStorage:", err);
        const stored = localStorage.getItem("fitzy_progress");
        if (stored) progressState = JSON.parse(stored);
    }

    // 🔥 DYNAMIC LEVEL MAPPING: Month 1 -> Level 1, Month 2 -> Level 2, etc.
    level = "level" + progressState.currentMonth;

    console.log(`Current ${level} Progress:`, progressState);
    if (headerDay) headerDay.textContent = `Your current day: Day ${progressState.currentDay} 🔥`;

    initWarmup();
    loadExercisesForDay();
}

async function saveProgress() {
    // 1. Save Locally
    localStorage.setItem("fitzy_progress", JSON.stringify(progressState));
    console.log("Progress Saved to localStorage ✅");

    // 2. 🔥 Sync with Backend
    try {
        const payload = {
            current_month: Number(progressState.currentMonth),
            current_week: Number(progressState.currentWeek),
            current_day: Number(progressState.currentDay),
            completed_months: Number(progressState.completedMonths),
            completed_days: Number(progressState.completedDays)
        };

        // Try to UPDATE existing record
        let res = await fetch(`${API_BASE_URL}/exercise-progress/update/${userId}/fitzy/${categoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 🔥 If no record (404) → Create fresh record first, then update
        if (res.status === 404) {
            console.log("No progress record found → Initialising new record...");

            // Create initial Beginner record using /init (safe upsert — won't skip Day 1)
            await fetch(`${API_BASE_URL}/exercise-progress/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: Number(userId),
                    level: "fitzy",
                    category_id: Number(categoryId)
                })
            });

            // Now update with the correct progress values
            res = await fetch(`${API_BASE_URL}/exercise-progress/update/${userId}/fitzy/${categoryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Server Error");
        }

        console.log("Progress synced with backend ✅");
    } catch (err) {
        console.error("Cloud Sync Error:", err);
        alert(err.message);
        console.warn("Progress saved locally only. Cloud sync failed:", err.message);
    }
}

/* =====================================================
   🔥 LOAD EXERCISES
===================================================== */

async function loadExercisesForDay() {
    try {
        const catId = Number(localStorage.getItem("category_id")) || 1;
        const month = progressState.currentMonth;

        console.log(`Loading Exercises for Level: ${level}, Category: ${catId}, Month: ${month}`);

        const res = await fetch(
            `${API_BASE_URL}/exercise/by-category-level?category_id=${catId}&level=${level}`
        );

        const data = await res.json();

        if (!data || !data.length) {
            container.innerHTML = "<p>No exercises found</p>";
            return;
        }

        const shuffled = stableShuffle(data, month);
        let monthlyExercises = shuffled.slice(0, 6);

        renderExercises(monthlyExercises);

    } catch (err) {
        console.error("Exercise Load Error:", err);
        container.innerHTML = "<p>Error loading exercises. Check console.</p>";
    }
}

/* =====================================================
   🔥 STABLE SHUFFLE
===================================================== */

function stableShuffle(array, seed) {
    let shuffled = [...array];
    function seededRandom(seed) {
        let x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    }
    for (let i = shuffled.length - 1; i > 0; i--) {
        const random = seededRandom(seed + i * 7);
        const j = Math.floor(random * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* =====================================================
   🔥 RENDER EXERCISES
===================================================== */

function renderExercises(exercises) {
    if (!container) return;
    container.innerHTML = "";
    exercises.forEach(ex => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        card.innerHTML = `
      <img src="${ex.exercise_image || '/Assets/default.png'}">
      <p>${ex.title}</p>
    `;
        card.onclick = () => showExerciseDetail(ex);
        container.appendChild(card);
    });
}

/* =====================================================
   🔥 SHOW DETAIL
===================================================== */

function showExerciseDetail(ex) {
    if (!detailContainer) return;
    detailContainer.innerHTML = `
    <h2>${ex.title}</h2>
    <div class="exercise-top-section">
      <div class="video-box">
        <video src="${ex.exercise_video || ""}" muted autoplay loop></video>
      </div>
      <div class="exercise-timer-section">
        <h1 id="exerciseTimer">02:00</h1>
        <button id="exerciseStartBtn">Start</button>
      </div>
    </div>
    <div class="exercise-info">
      <h3>Instructions</h3>
      <p>${ex.instruction || "No instructions"}</p>
      <h3>Breathing Tip</h3>
      <p>${ex.breathing_tip || "No breathing tip available"}</p>
      <h3>Focus Area</h3>
      <div class="focus-areas">
        ${formatFocusAreas(ex.focus_area)}
      </div>
    </div>
  `;
    if (window.exerciseInterval) clearInterval(window.exerciseInterval);
    currentExercise = ex;
    initExerciseTimer();
}

function initExerciseTimer() {
    const timerDisplay = document.getElementById("exerciseTimer");
    const startBtn = document.getElementById("exerciseStartBtn");
    let timeLeft = 120;
    function updateTimer() {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        timerDisplay.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    }
    startBtn.onclick = () => {
        if (window.exerciseInterval) return;
        startBtn.disabled = true;
        window.exerciseInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(window.exerciseInterval);
                window.exerciseInterval = null;
                timerDisplay.textContent = "Completed ✔";
                timerDisplay.style.color = "green";
                startBtn.style.display = "none";
                updateProgressAfterExercise();
            }
        }, 1000);
    };
    updateTimer();
}

function formatFocusAreas(focusArea) {
    if (!focusArea) return `<div class="focus-pill">Not specified</div>`;
    let areas = Array.isArray(focusArea) ? focusArea : focusArea.split(",");
    return areas.map(area => `<div class="focus-pill">${area.trim()}</div>`).join("");
}

/* =====================================================
   🔥 PROGRESS UPDATE
===================================================== */

async function updateProgressAfterExercise() {
    completedCount++;
    if (currentExercise) await logExerciseToHistory(currentExercise);
    if (completedCount >= 6) {
        setTimeout(() => { moveToNextDay(); }, 1500);
    }
}

if (completeBtn) completeBtn.addEventListener("click", () => { moveToNextDay(); });

async function moveToNextDay() {
    progressState.currentDay = Number(progressState.currentDay) + 1;
    progressState.completedDays = Number(progressState.completedDays || 0) + 1;

    if (progressState.currentDay > 7) {
        progressState.currentDay = 1;
        progressState.currentWeek = Number(progressState.currentWeek) + 1;
    }
    if (progressState.currentWeek > 4) {
        progressState.currentWeek = 1;
        progressState.currentMonth = Number(progressState.currentMonth) + 1;
        progressState.completedMonths = Number(progressState.completedMonths || 0) + 1;
    }
    await saveProgress();
    alert("Day Completed Successfully! 🔥");
    window.location.href = "../landing/beginner.html";
}

async function logExerciseToHistory(ex) {
    try {
        await fetch(`${API_BASE_URL}/exercise-log/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: Number(userId),
                exercise_id: ex.exercise_id || null,
                title: ex.title,
                level: level,
                day: Number(progressState.currentDay)
            })
        });
    } catch (err) { console.error("Log Exercise Error:", err); }
}

/* =====================================================
   🔥 WARMUP SYSTEM
===================================================== */

let warmupExercises = [];
let warmupIndex = 0;
let warmupTimer = null;
let isBreak = false;

const warmupOverlay = document.getElementById("warmupOverlay");
const warmupTitle = document.getElementById("exerciseName");
const warmupVideo = document.getElementById("warmupVideo");
const warmupTimerEl = document.getElementById("timer");
const warmupStartBtn = document.getElementById("startWarmup");
const warmupSkipBtn = document.getElementById("skipBtn");
const warmupPrevBtn = document.getElementById("prevExercise");
const warmupNextBtn = document.getElementById("nextExercise");
const breakScreen = document.getElementById("breakScreen");

async function initWarmup() {
    if (!warmupOverlay) return;
    warmupOverlay.style.display = "flex";

    try {
        // 🔥 WARMUP LEVEL MAPPING:
        // Month 1 → Level 1, Month 2 → Level 1, Month 3 → Level 2,
        // Month 4 → Level 3, ... Month 8 → Level 7
        const currentMonth = Number(progressState.currentMonth);
        const warmupLevel = currentMonth <= 1 ? "level1" : "level" + (currentMonth - 1);
        const catId = Number(localStorage.getItem("category_id")) || 1;

        console.log(`Warmup: Using ${warmupLevel} exercises (current month: ${currentMonth})`);

        const res = await fetch(
            `${API_BASE_URL}/exercise/by-category-level?category_id=${catId}&level=${warmupLevel}`
        );
        const data = await res.json();

        if (!data || !data.length) {
            warmupOverlay.style.display = "none";
            return;
        }

        // Shuffle the previous level's exercises for warmup
        warmupExercises = stableShuffle(data, currentMonth + 100).slice(0, 6);
        warmupIndex = 0;

        showWarmupExercise();

    } catch (err) {
        console.error("Warmup Load Error:", err);
        warmupOverlay.style.display = "none";
    }
}

function showWarmupExercise() {
    const ex = warmupExercises[warmupIndex];
    if (!ex) return;

    warmupTitle.innerText = ex.title;
    warmupVideo.src = ex.exercise_video || "";
    warmupTimerEl.innerText = "01:00";
    breakScreen.style.display = "none";
}

if (warmupStartBtn) {
    warmupStartBtn.onclick = () => {
        if (warmupTimer) return;
        warmupStartBtn.disabled = true;
        startWarmupCountdown(60);
    };
}

if (warmupSkipBtn) {
    warmupSkipBtn.onclick = () => {
        clearInterval(warmupTimer);
        warmupTimer = null;
        if (isBreak) {
            // During break time → skip to main workout
            isBreak = false;
            breakScreen.style.display = "none";
            warmupOverlay.style.display = "none";
        } else {
            // During warmup exercise → skip to next warmup
            if (warmupStartBtn) warmupStartBtn.disabled = false;
            handleWarmupNext();
        }
    };
}

if (warmupPrevBtn) {
    warmupPrevBtn.onclick = () => {
        if (warmupIndex > 0) {
            warmupIndex--;
            clearInterval(warmupTimer);
            warmupTimer = null;
            warmupStartBtn.disabled = false;
            showWarmupExercise();
        }
    };
}

if (warmupNextBtn) {
    warmupNextBtn.onclick = () => {
        handleWarmupNext();
    };
}

function handleWarmupNext() {
    if (warmupIndex < warmupExercises.length - 1) {
        // More warmup exercises → go to next (no break)
        warmupIndex++;
        clearInterval(warmupTimer);
        warmupTimer = null;
        if (warmupStartBtn) warmupStartBtn.disabled = false;
        showWarmupExercise();
    } else {
        // All warmups done → show break screen, let user choose time
        clearInterval(warmupTimer);
        warmupTimer = null;
        isBreak = true;
        breakScreen.style.display = "flex";
        if (warmupStartBtn) warmupStartBtn.disabled = true;

        // Default 2 min display
        warmupTimerEl.innerText = "02:00";

        // Wait for user to click "Start Break"
        const startBreakBtn = document.getElementById("startBreakBtn");
        const breakMinInput = document.getElementById("breakMinutes");
        if (startBreakBtn) {
            startBreakBtn.onclick = () => {
                const mins = Number(breakMinInput?.value) || 2;
                const breakSeconds = mins * 60;
                const m = Math.floor(breakSeconds / 60);
                const s = breakSeconds % 60;
                warmupTimerEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
                startBreakBtn.disabled = true;
                if (breakMinInput) breakMinInput.disabled = true;
                startWarmupCountdown(breakSeconds);
            };
        }
    }
}

function startWarmupCountdown(seconds) {
    let timeLeft = seconds;
    warmupTimer = setInterval(() => {
        timeLeft--;
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        warmupTimerEl.innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;

        if (timeLeft <= 0) {
            clearInterval(warmupTimer);
            warmupTimer = null;
            if (isBreak) {
                // Final break finished → close warmup, go to main workout
                isBreak = false;
                breakScreen.style.display = "none";
                warmupOverlay.style.display = "none";
            } else {
                // Exercise timer finished → go to next warmup exercise
                handleWarmupNext();
            }
        }
    }, 1000);
}

/* =====================================================
   🔥 INITIAL START
===================================================== */
loadProgress();
