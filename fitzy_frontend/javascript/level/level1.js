import API_BASE_URL from "../config.js";

/* =====================================================
   🔥 BASIC DATA
===================================================== */

const userId = localStorage.getItem("user_id");
let categoryId = null;
let level = "level1";
let selectedDay = 1;

const headerDay = document.getElementById("currentDayHeader");

if (!userId) {
  alert("Login required");
  window.location.href = "../../html/sign_in.html";
}

const container = document.getElementById("exerciseContainer");
const detailContainer = document.getElementById("exerciseDetail");
const completeBtn = document.getElementById("completeDayBtn");

let progressData = null;
let currentExercise = null;


/* =====================================================
   🔥 LOAD OR CREATE PROGRESS
===================================================== */

async function loadProgress() {
  console.log("🚀 Initializing level1.js");

  try {
    // 1. Fetch Active State from DB first
    const stateRes = await fetch(`${API_BASE_URL}/user-state/${userId}`);
    const state = await stateRes.json();

    categoryId = state.active_category_id || 1;
    level = state.active_level || "level1";
    selectedDay = state.selected_day || 1;

    console.log("Active State Loaded:", { categoryId, level, selectedDay });
    console.log("Current API URL:", API_BASE_URL);

    container.innerHTML = "<p>Loading progress...</p>";

    try {
      const res = await fetch(`${API_BASE_URL}/progress/${userId}/${level}/${categoryId}`);

      if (!res.ok) {
        console.warn(`Progress not found (Status: ${res.status}). Attempting to create...`);
        if (res.status === 405) {
          container.innerHTML = `<p style="color:red">Error: Method Not Allowed (405). You are likely using the stale Vercel backend. Please switch config.js to 127.0.0.1:8000 and use Live Server.</p>`;
          return;
        }
        await createProgress();
        return;
      }

      progressData = await res.json();
      console.log("Progress Data Loaded ✅", progressData);

      headerDay.textContent = `Your current day: Day ${selectedDay} 🔥`;
      loadExercisesForDay();

    } catch (err) {
      console.error("Load Progress Error:", err);
      container.innerHTML = `<p style="color:red">Fetch Error: ${err.message}. Ensure your backend server is running locally.</p>`;
    }
  } catch (err) {
    console.error("Outer Load Progress Error:", err);
    container.innerHTML = `<p style="color:red">Failed to initialize session: ${err.message}</p>`;
  }
}

async function createProgress() {
  try {
    const res = await fetch(`${API_BASE_URL}/progress/complete-day`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        level: level,
        category_id: Number(categoryId)
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Create Progress Failed:", res.status, errText);
      container.innerHTML = `<p style="color:red">Create Progress Failed: ${res.status}. Check your backend console.</p>`;
      return;
    }

    progressData = await res.json();
    console.log("New Progress Created ✅", progressData);

    headerDay.textContent = `Your current day: Day ${selectedDay} 🔥`;
    loadExercisesForDay();

  } catch (err) {
    console.error("Create Progress Error:", err);
    container.innerHTML = `<p style="color:red">Network Error while creating progress. Is the backend running?</p>`;
  }
}


/* =====================================================
   🔥 LOAD EXERCISES
===================================================== */



async function loadExercisesForDay() {

  if (!progressData) return;

  try {

    // Fallback for category_id if missing in progressData
    const catId = Number(progressData.category_id) || Number(localStorage.getItem("category_id")) || 1;

    let month = Number(progressData.current_month);
    if (!month || month < 1) month = 1;

    const levelMap = {
      1: [1, 2], // Category 1: Month 1 -> Level 1, Month 2 -> Level 2
      2: [3, 4], // Category 2: Month 1 -> Level 3, Month 2 -> Level 4
      3: [5, 6],
      4: [7, 8]
    };

    const categoryLevels = levelMap[catId];

    if (!categoryLevels) {
      console.error("Invalid Category ID:", catId);
      container.innerHTML = "<p>Invalid category. Please select a workout plan again.</p>";
      return;
    }

    // Ensure we don't exceed the defined months (max 2 levels per category here)
    const levelIdx = (month - 1) % categoryLevels.length;
    const levelNumber = categoryLevels[levelIdx];
    const dynamicLevel = "level" + levelNumber;

    console.log("Category ID:", catId);
    console.log("User Month:", month);
    console.log("Mapped Level:", dynamicLevel);

    const res = await fetch(
      `${API_BASE_URL}/exercise/by-category-level?category_id=${catId}&level=${dynamicLevel}`
    );

    const data = await res.json();

    if (!data || !data.length) {
      container.innerHTML = "<p>No exercises found</p>";
      return;
    }

    const shuffled = stableShuffle(data, month); // Seed by month for a stable monthly shuffle

    // Improved rotation: Shift the starting index based on the day
    // This ensures different exercises appear each day
    const groups = Math.ceil(shuffled.length / 6);
    const rotationIdx = ((selectedDay - 1) % groups) * 6;

    // Handle wrap-around for the last group if it's smaller than 6
    let todayExercises = shuffled.slice(rotationIdx, rotationIdx + 6);

    // If we have fewer than 6 left at the end, grab from the beginning to fill
    if (todayExercises.length < 6 && shuffled.length > 6) {
      todayExercises = todayExercises.concat(shuffled.slice(0, 6 - todayExercises.length));
    }

    renderExercises(todayExercises);

  } catch (err) {
    console.error("Exercise Load Error:", err);
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

  // Clear any existing interval to prevent leaks
  if (window.exerciseInterval) {
    clearInterval(window.exerciseInterval);
    window.exerciseInterval = null;
  }

  currentExercise = ex;
  initExerciseTimer();
}

function updateMonthTitles(currentMonth) {
  const monthTitle1 = document.getElementById("monthTitle1");
  const monthTitle2 = document.getElementById("monthTitle2");

  if (!monthTitle1 || !monthTitle2) return;

  let startMonth;
  if (currentMonth <= 2) startMonth = 1;          // Beginner
  else if (currentMonth <= 4) startMonth = 3;     // Intermediate
  else if (currentMonth <= 6) startMonth = 5;     // Advanced
  else startMonth = 7;                            // Expert

  monthTitle1.innerText = "Month " + startMonth;
  monthTitle2.innerText = "Month " + (startMonth + 1);
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
    console.log("Exercise Timer Started 🕒");

    window.exerciseInterval = setInterval(() => {

      timeLeft--;
      updateTimer();

      if (timeLeft <= 0) {

        clearInterval(window.exerciseInterval);
        window.exerciseInterval = null;
        timerDisplay.textContent = "Completed ✔";
        timerDisplay.style.color = "green";
        startBtn.style.display = "none";
        console.log("Exercise Completed! Updating progress...");
        updateProgressAfterExercise();
      }

    }, 1000);
  };

  updateTimer();
}


/* =====================================================
   🔥 FORMAT FOCUS AREA
===================================================== */

function formatFocusAreas(focusArea) {

  if (!focusArea) {
    return `<div class="focus-pill">Not specified</div>`;
  }

  let areas = Array.isArray(focusArea)
    ? focusArea
    : focusArea.split(",");

  return areas.map(area =>
    `<div class="focus-pill">${area.trim()}</div>`
  ).join("");
}


/* =====================================================
   🔥 TIMER SYSTEM
===================================================== */

// This function is now part of initExerciseTimer, so it's removed here.


/* =====================================================
   🔥 PROGRESS UPDATE
===================================================== */

async function updateProgressAfterExercise() {
  if (!progressData) {
    console.warn("No progressData loaded, cannot update.");
    return;
  }

  // Ensure it's a number to prevent string concatenation bugs
  progressData.completed_exercises = Number(progressData.completed_exercises) + 1;
  console.log(`Exercise Count: ${progressData.completed_exercises}/6`);

  if (currentExercise) {
    await logExerciseToHistory(currentExercise);
  }

  if (progressData.completed_exercises >= 6) {
    console.log("Limit reached! Moving to next day...");
    await moveToNextDay();
  } else {
    await saveProgress();
  }
}


completeBtn.addEventListener("click", async () => {
  console.log("Mark Day Complete button clicked!");
  await moveToNextDay();
});


async function moveToNextDay() {
  if (!progressData) return;

  console.log("Moving to next day logic started...");
  progressData.completed_exercises = 0;
  progressData.current_day = Number(progressData.current_day) + 1;
  progressData.completed_days = Number(progressData.completed_days) + 1;

  if (progressData.current_day > 7) {
    progressData.current_day = 1;
    progressData.current_week = Number(progressData.current_week) + 1;
  }

  if (progressData.current_week > 4) {
    progressData.current_week = 1;
    progressData.current_month = Number(progressData.current_month) + 1;
  }

  console.table({
    Message: "Resetting state for next day",
    Day: progressData.current_day,
    Week: progressData.current_week,
    Month: progressData.current_month,
    ExercisesCompleted: progressData.completed_exercises
  });

  await saveProgress();

  alert("Day Completed Successfully! 🔥");
  window.location.href = "../landing/beginner.html";
}


async function logExerciseToHistory(ex) {
  console.log("Attempting to log exercise:", ex.title);
  try {
    const res = await fetch(`${API_BASE_URL}/exercise-log/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        exercise_id: ex.exercise_id || null,
        title: ex.title,
        level: level,
        day: Number(selectedDay)
      })
    });

    if (res.ok) {
      console.log("Exercise logged to history ✅");
    } else {
      const err = await res.json();
      console.error("Log History Error:", err);
      // alert(`Log History Failed: ${res.status}`);
    }
  } catch (err) {
    console.error("Log Exercise Fetch Error:", err);
  }
}


async function saveProgress() {
  if (!progressData) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/progress/update/${userId}/${level}/${categoryId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_month: progressData.current_month,
          current_week: progressData.current_week,
          current_day: progressData.current_day,
          completed_days: progressData.completed_days,
          completed_exercises: progressData.completed_exercises,
          is_month_completed: progressData.is_month_completed,
          is_level_completed: progressData.is_level_completed,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Save Error Detail:", errData);
      alert(`Save Failed: ${response.status} - ${JSON.stringify(errData)}`);
      return;
    }

    console.log("Progress Saved ✅");

  } catch (err) {
    console.error("Save Progress Error:", err);
    alert("Network Error: Could not save progress. Check if backend is running.");
  }
}


/* =====================================================
   🔥 INITIAL START
===================================================== */

// Initial load moved to bottom

/* =====================================================
   🔥 WARMUP SYSTEM (UNCHANGED)
===================================================== */

const overlay = document.getElementById("warmupOverlay");
const warmupStartBtn = document.getElementById("startWarmup");
const skipBtn = document.getElementById("skipBtn");
const timerDisplay = document.getElementById("timer");
const exerciseName = document.getElementById("exerciseName");
const warmupVideo = document.getElementById("warmupVideo");
const breakScreen = document.getElementById("breakScreen");
const prevBtn = document.getElementById("prevExercise");
const nextBtn = document.getElementById("nextExercise");

let exercises = [];
let index = 0;
let timeLeft = 60;
let interval = null;
let completedExercises = 0;
let isBreak = false;

setTimeout(() => {
  overlay.style.display = "flex";
  loadWarmup();
}, 2000);

async function loadWarmup() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/exercise/warmup/${level}/${categoryId}`
    );

    const data = await response.json();

    if (!data || !data.length) {
      console.log("No warmup exercises found");
      return;
    }

    // 🔥 Fetch active state for day
    const stateRes = await fetch(`${API_BASE_URL}/user-state/${userId}`);
    const state = await stateRes.json();
    const activeDay = state.selected_day || 1;

    // 🔥 Shuffle safely using activeDay
    const shuffled = stableShuffle(data, activeDay);

    exercises = shuffled.slice(0, 10);

    if (!exercises.length) {
      console.log("No exercises after shuffle");
      return;
    }

    showExercise(0);

  } catch (error) {
    console.error("Warmup Load Error:", error);
  }
}


function showExercise(i) {

  index = i;
  isBreak = false;

  breakScreen.style.display = "none";
  warmupVideo.style.display = "block";

  exerciseName.textContent = exercises[index].title;
  warmupVideo.src = exercises[index].exercise_video || "";

  timeLeft = 60;
  updateTimer();

  clearInterval(interval);
  interval = null;

  warmupStartBtn.disabled = false;
}

function updateTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerDisplay.textContent =
    `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function startWarmupTimer() {

  if (interval) return;

  warmupStartBtn.disabled = true;

  interval = setInterval(() => {

    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {

      clearInterval(interval);

      if (isBreak) {
        showExercise(index);
      } else {
        moveNext();
      }
    }

  }, 1000);
}

function moveNext() {

  completedExercises++;

  if (completedExercises === 5) {
    isBreak = true;
    warmupVideo.style.display = "none";
    breakScreen.style.display = "flex";
    timeLeft = 120;
    updateTimer();
    return;
  }

  index++;

  if (index < exercises.length) {
    showExercise(index);
  } else {
    overlay.style.display = "none";
  }
}

warmupStartBtn.addEventListener("click", startWarmupTimer);
skipBtn.addEventListener("click", moveNext);


/* =====================================================
   🔥 INITIAL START
===================================================== */

// Ensure only one initial load
loadProgress();






